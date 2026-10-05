"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { formatVnd, maskEmail } from "@/lib/learning";
import {
  endStudentSession,
  generateCode,
  getStudent,
  hashCode,
  signToken,
  startStudentSession,
  verifyToken,
} from "@/lib/student-auth";

type Purpose = "REGISTER" | "RESET";
type Fail = { ok: false; error: string };

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const emailSchema = z.string().trim().toLowerCase().email();

function fail(error: string): Fail {
  return { ok: false, error };
}

function parseEmail(raw: string) {
  const parsed = emailSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function checkPassword(password: string, confirm: string) {
  if (password.length < 6) return "Mật khẩu tối thiểu 6 ký tự.";
  if (password !== confirm) return "Mật khẩu nhập lại không khớp.";
  return null;
}

export async function requestCode(rawEmail: string, purpose: Purpose) {
  const email = parseEmail(rawEmail);
  if (!email) return fail("Email không hợp lệ.");

  const existing = await prisma.student.findUnique({ where: { email }, select: { id: true } });
  if (purpose === "REGISTER" && existing) {
    return fail("Email này đã có tài khoản. Vui lòng đăng nhập.");
  }
  if (purpose === "RESET" && !existing) {
    return fail("Không tìm thấy tài khoản với email này.");
  }

  const last = await prisma.verificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - last.createdAt.getTime())) / 1000);
    return fail(`Vui lòng đợi ${wait} giây trước khi gửi lại mã.`);
  }

  const code = generateCode();
  await prisma.$transaction([
    prisma.verificationCode.deleteMany({ where: { email, purpose } }),
    prisma.verificationCode.create({
      data: {
        email,
        purpose,
        codeHash: hashCode(email, purpose, code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    }),
  ]);

  let sent = false;
  try {
    const { sendVerificationEmail } = await import("@/lib/mailer");
    sent = await sendVerificationEmail(email, code, purpose);
  } catch (error) {
    console.error("[requestCode:mail]", error);
    return fail("Không gửi được email. Vui lòng thử lại sau.");
  }

  if (!sent) {
    if (process.env.NODE_ENV === "production" && process.env.SHOW_OTP_ON_SCREEN !== "true") {
      return fail("Hệ thống email chưa được cấu hình. Vui lòng liên hệ hỗ trợ.");
    }
    console.info(`[requestCode] ${purpose} ${email}: ${code}`);
  }

  return {
    ok: true as const,
    email,
    masked: maskEmail(email),
    devCode: sent ? undefined : code,
  };
}

export async function verifyCode(rawEmail: string, purpose: Purpose, code: string) {
  const email = parseEmail(rawEmail);
  if (!email || !/^\d{6}$/.test(code)) return fail("Mã xác nhận gồm 6 chữ số.");

  const record = await prisma.verificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (!record || record.expiresAt < new Date()) {
    return fail("Mã đã hết hạn. Vui lòng gửi lại mã mới.");
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return fail("Bạn đã nhập sai quá nhiều lần. Vui lòng gửi lại mã mới.");
  }
  if (record.codeHash !== hashCode(email, purpose, code)) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return fail("Mã xác nhận không đúng.");
  }

  await prisma.verificationCode.delete({ where: { id: record.id } });
  return {
    ok: true as const,
    ticket: signToken({ email, purpose, exp: Date.now() + CODE_TTL_MS }),
  };
}

function readTicket(ticket: string, purpose: Purpose) {
  const data = verifyToken<{ email: string; purpose: Purpose; exp: number }>(ticket);
  return data && data.purpose === purpose ? data.email : null;
}

export async function completeRegistration(ticket: string, password: string, confirm: string) {
  const email = readTicket(ticket, "REGISTER");
  if (!email) return fail("Phiên xác nhận đã hết hạn. Vui lòng đăng ký lại.");
  const invalid = checkPassword(password, confirm);
  if (invalid) return fail(invalid);

  if (await prisma.student.findUnique({ where: { email }, select: { id: true } })) {
    return fail("Email này đã có tài khoản. Vui lòng đăng nhập.");
  }
  const student = await prisma.student.create({
    data: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
      name: email.split("@")[0],
      lastLoginAt: new Date(),
    },
  });
  await startStudentSession(student.id, true);
  return { ok: true as const };
}

export async function resetPassword(ticket: string, password: string, confirm: string) {
  const email = readTicket(ticket, "RESET");
  if (!email) return fail("Phiên xác nhận đã hết hạn. Vui lòng thực hiện lại.");
  const invalid = checkPassword(password, confirm);
  if (invalid) return fail(invalid);

  const student = await prisma.student.update({
    where: { email },
    data: { passwordHash: await bcrypt.hash(password, 10), lastLoginAt: new Date() },
  });
  await startStudentSession(student.id, false);
  return { ok: true as const };
}

export async function loginStudent(rawEmail: string, password: string, remember: boolean) {
  const email = parseEmail(rawEmail);
  if (!email || !password) return fail("Vui lòng nhập email và mật khẩu.");
  const student = await prisma.student.findUnique({ where: { email } });
  if (!student || !(await bcrypt.compare(password, student.passwordHash))) {
    return fail("Email hoặc mật khẩu không đúng.");
  }
  await prisma.student.update({ where: { id: student.id }, data: { lastLoginAt: new Date() } });
  await startStudentSession(student.id, remember);
  return { ok: true as const };
}

export async function logoutStudent() {
  await endStudentSession();
  return { ok: true as const };
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s().-]{8,20}$/, "Số điện thoại không hợp lệ."),
  province: z.string().trim().min(1, "Vui lòng chọn Tỉnh/Thành phố."),
  ward: z.string().trim().min(1, "Vui lòng nhập Phường/Xã."),
  address: z.string().trim().min(3, "Vui lòng nhập địa chỉ chi tiết."),
});

export async function updateStudentProfile(input: z.input<typeof profileSchema>) {
  const student = await getStudent();
  if (!student) return fail("Phiên đăng nhập đã hết hạn.");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  await prisma.student.update({ where: { id: student.id }, data: parsed.data });
  revalidatePath("/tai-khoan", "layout");
  return { ok: true as const };
}

async function nextOrderCode() {
  for (;;) {
    const code = `DH${Math.floor(1_000_000 + Math.random() * 9_000_000)}`;
    if (!(await prisma.enrollment.findUnique({ where: { code }, select: { id: true } }))) {
      return code;
    }
  }
}

const enrollSchema = z.object({
  postId: z.string().min(1),
  packageId: z.string().optional(),
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên."),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d\s().-]{8,20}$/, "Số điện thoại không hợp lệ."),
  address: z.string().trim().max(300).optional(),
  note: z.string().trim().max(2000).optional(),
});

export async function createEnrollment(input: z.input<typeof enrollSchema>) {
  const student = await getStudent();
  if (!student) return fail("Vui lòng đăng nhập để đăng ký học.");
  const parsed = enrollSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
  const data = parsed.data;

  const post = await prisma.post.findFirst({
    where: {
      id: data.postId,
      type: { in: ["COURSE", "ONLINE"] },
      status: "PUBLISHED",
      isVisible: true,
    },
    include: { packages: { orderBy: { sortOrder: "asc" } } },
  });
  if (!post) return fail("Khoá học không tồn tại hoặc đã ngừng mở đăng ký.");

  const pkg = data.packageId
    ? post.packages.find((p) => p.id === data.packageId)
    : post.packages[0];
  if (post.packages.length && !pkg) return fail("Gói học không hợp lệ.");

  const existing = await prisma.enrollment.findFirst({
    where: { studentId: student.id, postId: post.id, status: { in: ["PENDING", "ACTIVE"] } },
  });
  if (existing) {
    return { ok: true as const, code: existing.code, existed: true };
  }

  const amount = pkg?.price ?? 0;
  const isFree = amount === 0;
  const order = await prisma.enrollment.create({
    data: {
      code: await nextOrderCode(),
      studentId: student.id,
      postId: post.id,
      packageId: pkg?.id ?? null,
      packageName: pkg?.name ?? null,
      amount,
      oldAmount: pkg?.oldPrice ?? null,
      status: isFree ? "ACTIVE" : "PENDING",
      activatedAt: isFree ? new Date() : null,
      fullName: data.fullName,
      phone: data.phone,
      address: data.address || null,
      note: data.note || null,
    },
  });

  if (!student.phone || !student.name || student.name === student.email.split("@")[0]) {
    await prisma.student.update({
      where: { id: student.id },
      data: {
        name: data.fullName,
        phone: student.phone || data.phone,
      },
    });
  }

  try {
    const { sendEnrollmentNotice } = await import("@/lib/mailer");
    await sendEnrollmentNotice({
      code: order.code,
      courseTitle: post.title,
      packageName: order.packageName,
      amount: formatVnd(amount),
      fullName: data.fullName,
      phone: data.phone,
      email: student.email,
      note: data.note,
    });
  } catch (error) {
    console.error("[createEnrollment:mail]", error);
  }

  revalidatePath("/tai-khoan", "layout");
  revalidatePath("/admin/enrollments");
  return { ok: true as const, code: order.code, existed: false };
}

async function lessonAccess(lessonId: string) {
  const student = await getStudent();
  if (!student) return null;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, postId: true, isPreview: true },
  });
  if (!lesson) return null;
  const enrolled = await prisma.enrollment.findFirst({
    where: { studentId: student.id, postId: lesson.postId, status: "ACTIVE" },
    select: { id: true },
  });
  if (!enrolled && !lesson.isPreview) return null;
  return { student, lesson };
}

export async function setLessonCompleted(lessonId: string, completed: boolean) {
  const access = await lessonAccess(lessonId);
  if (!access) return fail("Bạn chưa có quyền học bài này.");
  await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: access.student.id, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null, lastViewedAt: new Date() },
    create: {
      studentId: access.student.id,
      lessonId,
      completed,
      completedAt: completed ? new Date() : null,
    },
  });
  revalidatePath("/tai-khoan/khoa-hoc");
  return { ok: true as const };
}

export async function markLessonViewed(lessonId: string) {
  const access = await lessonAccess(lessonId);
  if (!access) return { ok: false as const };
  await prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: access.student.id, lessonId } },
    update: { lastViewedAt: new Date() },
    create: { studentId: access.student.id, lessonId },
  });
  return { ok: true as const };
}
