import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/student-auth";

export async function GET(request: Request) {
  const student = await getStudent();
  if (!student) return NextResponse.json({ status: "unauthorized" }, { status: 401 });

  const code = new URL(request.url).searchParams.get("code") || "";
  const order = await prisma.enrollment.findFirst({
    where: { code, studentId: student.id },
    select: { status: true },
  });
  if (!order) return NextResponse.json({ status: "missing" }, { status: 404 });
  return NextResponse.json({ status: order.status });
}
