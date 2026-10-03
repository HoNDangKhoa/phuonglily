import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { secretMatches, sepayConfig } from "@/lib/sepay";

type IpnBody = {
  notification_type?: string;
  order?: { order_invoice_number?: string; order_amount?: string; order_status?: string };
  transaction?: { id?: string; transaction_status?: string };
};

export async function POST(request: Request) {
  const { secret, enabled } = sepayConfig();
  if (!enabled || !secretMatches(request.headers.get("x-secret-key"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as IpnBody | null;
  const code = body?.order?.order_invoice_number;
  if (!code) return NextResponse.json({ error: "Missing invoice" }, { status: 400 });

  const order = await prisma.enrollment.findUnique({ where: { code } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const paidAmount = Math.round(Number(body?.order?.order_amount || 0));
  if (body.notification_type === "ORDER_PAID") {
    if (paidAmount !== order.amount) {
      console.error("[sepay] amount mismatch", code, paidAmount, order.amount);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    if (order.status !== "ACTIVE") {
      await prisma.enrollment.update({
        where: { id: order.id },
        data: {
          status: "ACTIVE",
          activatedAt: new Date(),
          adminNote: [order.adminNote, `SePay ${body.transaction?.id || "paid"}`].filter(Boolean).join("\n"),
        },
      });
    }
  }

  if (body.notification_type === "TRANSACTION_VOID" && order.status === "ACTIVE" && order.adminNote?.includes("SePay")) {
    await prisma.enrollment.update({
      where: { id: order.id },
      data: { status: "PENDING", activatedAt: null, adminNote: `${order.adminNote}\nSePay void` },
    });
  }

  return NextResponse.json({ success: true });
}
