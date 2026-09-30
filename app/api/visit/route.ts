import { NextRequest, NextResponse } from "next/server";
import {
  detectBrowser,
  detectDevice,
} from "@/lib/analytics";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { path?: string };
    const ua = req.headers.get("user-agent") || "";
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    await prisma.visitLog.create({
      data: {
        path: body.path || "/",
        ip,
        browser: detectBrowser(ua),
        device: detectDevice(ua),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
