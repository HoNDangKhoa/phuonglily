import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStudent } from "@/lib/student-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const student = await getStudent();
  const postId = new URL(request.url).searchParams.get("postId");

  const enrollment =
    student && postId
      ? await prisma.enrollment.findFirst({
          where: { studentId: student.id, postId, status: { in: ["PENDING", "ACTIVE"] } },
          select: { status: true, code: true },
          orderBy: { createdAt: "desc" },
        })
      : null;

  return NextResponse.json(
    {
      student: student ? { name: student.name, email: student.email } : null,
      enrollment,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
