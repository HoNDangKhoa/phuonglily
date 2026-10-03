import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeSepayText, sepayConfig, signSepayFields } from "@/lib/sepay";
import { getStudent } from "@/lib/student-auth";

export async function POST(request: Request) {
  const { merchant, secret, enabled, checkoutUrl } = sepayConfig();
  if (!enabled) {
    return NextResponse.json({ error: "SePay chưa được cấu hình" }, { status: 503 });
  }

  const student = await getStudent();
  if (!student) {
    return NextResponse.redirect(new URL("/dang-nhap", request.url), 303);
  }

  const code = String((await request.formData()).get("code") || "");
  const order = await prisma.enrollment.findFirst({
    where: { code, studentId: student.id },
    include: { post: { select: { title: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });
  }
  if (order.amount <= 0 || order.status === "ACTIVE") {
    return NextResponse.redirect(new URL(`/tai-khoan/don/${order.code}`, request.url), 303);
  }

  const origin = new URL(request.url).origin;
  const back = `${origin}/tai-khoan/don/${order.code}`;
  const fields: Record<string, string> = {
    merchant,
    currency: "VND",
    order_amount: String(order.amount),
    operation: "PURCHASE",
    order_description: safeSepayText(`Hoc phi ${order.post.title} ${order.packageName || ""} ${order.code}`),
    order_invoice_number: order.code,
    customer_id: student.id,
    success_url: `${back}?sepay=success`,
    error_url: `${back}?sepay=error`,
    cancel_url: `${back}?sepay=cancel`,
  };
  const signature = signSepayFields(fields, secret);
  const ordered = [
    "merchant",
    "currency",
    "order_amount",
    "operation",
    "order_description",
    "order_invoice_number",
    "customer_id",
    "success_url",
    "error_url",
    "cancel_url",
  ];

  const inputs = [...ordered.map((name) => [name, fields[name]] as const), ["signature", signature] as const]
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${String(value).replace(/"/g, "&quot;")}" />`)
    .join("");

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Chuyển tới SePay…</title></head><body><p>Đang chuyển tới cổng thanh toán…</p><form id="pay" method="POST" action="${checkoutUrl}">${inputs}</form><script>document.getElementById("pay").submit()</script></body></html>`;
  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
