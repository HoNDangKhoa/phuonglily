import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sepayQrConfig, webhookAuthorized } from "@/lib/sepay";

type WebhookBody = {
  id?: number | string;
  transferType?: string;
  transferAmount?: number | string;
  code?: string | null;
  content?: string | null;
  description?: string | null;
};

function orderCodeFrom(body: WebhookBody) {
  const direct = String(body.code || "").toUpperCase();
  if (/^(?:DH|PL)\d{7}$/.test(direct)) return direct;
  const text = `${body.content || ""} ${body.description || ""}`.toUpperCase();
  return text.match(/(?:DH|PL)\d{7}/)?.[0] || "";
}

export async function POST(request: Request) {
  const { webhookKey } = sepayQrConfig();
  if (!webhookAuthorized(request.headers.get("authorization"), webhookKey)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as WebhookBody | null;
  if (!body || body.transferType !== "in") {
    return NextResponse.json({ success: true });
  }

  const code = orderCodeFrom(body);
  if (!code) return NextResponse.json({ success: true });

  const paid = Math.round(Number(body.transferAmount || 0));
  const order = await prisma.enrollment.findUnique({ where: { code } });
  if (!order || paid < order.amount) {
    return NextResponse.json({ success: true });
  }

  if (order.status !== "ACTIVE") {
    await prisma.enrollment.updateMany({
      where: { id: order.id, status: { not: "ACTIVE" } },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
        adminNote: [order.adminNote, `SePay QR ${body.id || "paid"}`].filter(Boolean).join("\n"),
      },
    });
  }

  return NextResponse.json({ success: true });
}
