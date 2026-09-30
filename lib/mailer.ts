import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

async function getMailer() {
  const s = await prisma.siteSetting.findUnique({ where: { id: "site_config" } });
  const host = s?.mailerHost?.trim();
  const user = s?.mailerEmail?.trim();
  const pass = s?.mailerPassword?.replace(/\s+/g, "");
  if (!host || !user || !pass) return null;
  const secure = s?.mailerSecure === "SSL";
  const port = Number(s?.mailerPort) || (secure ? 465 : 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: s?.mailerSecure === "TLS",
    auth: { user, pass },
  });
  return {
    transport,
    from: `"${s?.companyName || "Phương Lily Academy"}" <${user}>`,
    to: s?.email?.trim() || user,
  };
}

const escape = (v: string) =>
  v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendInquiryEmail(inquiry: {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone: string;
  serviceType?: string | null;
  message: string;
  attachmentUrl?: string | null;
}) {
  const mailer = await getMailer();
  if (!mailer) return;
  const rows: [string, string | null | undefined][] = [
    ["Họ tên", inquiry.fullName],
    ["Ghi chú", inquiry.companyName],
    ["Email", inquiry.email],
    ["Điện thoại", inquiry.phone],
    ["Chương trình", inquiry.serviceType],
    ["File đính kèm", inquiry.attachmentUrl],
  ];
  const html = `
    <h2>Đăng ký / liên hệ mới</h2>
    <table cellpadding="6">${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escape(String(v))}</td></tr>`)
      .join("")}</table>
    <p style="white-space:pre-line">${escape(inquiry.message)}</p>`;
  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    replyTo: inquiry.email,
    subject: `[Liên hệ] ${inquiry.fullName} — ${inquiry.phone}`,
    html,
  });
}

/** Returns false when SMTP is not configured so callers can fall back. */
export async function sendVerificationEmail(to: string, code: string, purpose: "REGISTER" | "RESET") {
  const mailer = await getMailer();
  if (!mailer) return false;
  const title = purpose === "REGISTER" ? "Xác nhận đăng ký tài khoản" : "Khôi phục mật khẩu";
  await mailer.transport.sendMail({
    from: mailer.from,
    to,
    subject: `${code} là mã ${purpose === "REGISTER" ? "xác nhận" : "khôi phục"} của bạn`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1d3a1f">
        <h2>${title}</h2>
        <p>Mã xác nhận của bạn là:</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:bold;background:#dbe3cf;padding:16px;text-align:center;border-radius:12px">${code}</p>
        <p>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      </div>`,
  });
  return true;
}

export async function sendEnrollmentNotice(order: {
  code: string;
  courseTitle: string;
  packageName?: string | null;
  amount: string;
  fullName: string;
  phone: string;
  email: string;
  note?: string | null;
}) {
  const mailer = await getMailer();
  if (!mailer) return;
  const rows: [string, string | null | undefined][] = [
    ["Mã đơn", order.code],
    ["Khoá học", order.courseTitle],
    ["Gói", order.packageName],
    ["Học phí", order.amount],
    ["Học viên", order.fullName],
    ["Điện thoại", order.phone],
    ["Email", order.email],
    ["Ghi chú", order.note],
  ];
  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    replyTo: order.email,
    subject: `[Đăng ký học] ${order.code} — ${order.courseTitle}`,
    html: `<h2>Đơn đăng ký học mới</h2><table cellpadding="6">${rows
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escape(String(v))}</td></tr>`)
      .join("")}</table>`,
  });
}

export async function sendTestEmail() {
  const mailer = await getMailer();
  if (!mailer) {
    throw new Error("Chưa đủ cấu hình mailer (Host, Email, Password).");
  }
  await mailer.transport.verify();
  await mailer.transport.sendMail({
    from: mailer.from,
    to: mailer.to,
    subject: "Email thử từ website Phương Lily Academy",
    html: "<p>Cấu hình mailer hoạt động bình thường.</p>",
  });
  return mailer.to;
}
