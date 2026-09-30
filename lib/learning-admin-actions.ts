"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { invalidateCmsCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function revalidateCourse(postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { slug: true } });
  await invalidateCmsCache(post ? [post.slug] : []);
  revalidatePath("/", "layout");
}

export type PackageInput = {
  id: string;
  name: string;
  badge: string;
  description: string;
  price: number;
  oldPrice: number | null;
};

export type LessonInput = {
  id: string;
  chapter: string;
  title: string;
  videoUrl: string;
  duration: string;
  description: string;
  isPreview: boolean;
};

const isNew = (id: string) => id.startsWith("new_");

export async function saveCoursePackages(postId: string, items: PackageInput[]) {
  await requireAdmin();
  const clean = items
    .map((p) => ({ ...p, name: p.name.trim(), price: Math.max(0, Math.round(Number(p.price) || 0)) }))
    .filter((p) => p.name);
  const keep = clean.filter((p) => !isNew(p.id)).map((p) => p.id);

  await prisma.$transaction([
    prisma.coursePackage.deleteMany({ where: { postId, id: { notIn: keep } } }),
    ...clean.map((p, i) => {
      const data = {
        name: p.name,
        badge: p.badge || "leaf",
        description: p.description.trim() || null,
        price: p.price,
        oldPrice: p.oldPrice && p.oldPrice > 0 ? Math.round(p.oldPrice) : null,
        sortOrder: i,
      };
      return isNew(p.id)
        ? prisma.coursePackage.create({ data: { ...data, postId } })
        : prisma.coursePackage.update({ where: { id: p.id }, data });
    }),
  ]);
  await revalidateCourse(postId);
  return { ok: true as const };
}

export async function saveLessons(postId: string, items: LessonInput[]) {
  await requireAdmin();
  const clean = items.map((l) => ({ ...l, title: l.title.trim() })).filter((l) => l.title);
  const keep = clean.filter((l) => !isNew(l.id)).map((l) => l.id);

  await prisma.$transaction([
    prisma.lesson.deleteMany({ where: { postId, id: { notIn: keep } } }),
    ...clean.map((l, i) => {
      const data = {
        chapter: l.chapter.trim(),
        title: l.title,
        videoUrl: l.videoUrl.trim(),
        duration: l.duration.trim() || null,
        description: l.description.trim() || null,
        isPreview: l.isPreview,
        sortOrder: i,
      };
      return isNew(l.id)
        ? prisma.lesson.create({ data: { ...data, postId } })
        : prisma.lesson.update({ where: { id: l.id }, data });
    }),
  ]);
  await revalidateCourse(postId);
  return { ok: true as const };
}

export async function updateEnrollment(
  id: string,
  input: { status?: string; adminNote?: string },
) {
  await requireAdmin();
  const status =
    input.status && ["PENDING", "ACTIVE", "CANCELLED"].includes(input.status) ? input.status : undefined;
  const current = await prisma.enrollment.findUnique({ where: { id }, select: { activatedAt: true } });
  if (!current) return { ok: false as const, error: "Đơn không tồn tại." };
  await prisma.enrollment.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(status === "ACTIVE" && !current.activatedAt ? { activatedAt: new Date() } : {}),
      ...(input.adminNote !== undefined ? { adminNote: input.adminNote.trim() || null } : {}),
    },
  });
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/students");
  revalidatePath("/tai-khoan", "layout");
  return { ok: true as const };
}

export async function deleteEnrollment(id: string) {
  await requireAdmin();
  await prisma.enrollment.delete({ where: { id } });
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/students");
  return { ok: true as const };
}

export async function deleteStudent(id: string) {
  await requireAdmin();
  await prisma.student.delete({ where: { id } });
  revalidatePath("/admin/students");
  revalidatePath("/admin/enrollments");
  return { ok: true as const };
}
