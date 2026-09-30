import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

const COOKIE = "pl_student";
const REMEMBER_DAYS = 30;

function secret() {
  const value = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET chưa được cấu hình");
  return value;
}

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

export function signToken(payload: Record<string, unknown>) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T extends { exp: number }>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as T;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export function hashCode(email: string, purpose: string, code: string) {
  return createHash("sha256").update(`${email}:${purpose}:${code}:${secret()}`).digest("hex");
}

export function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function startStudentSession(studentId: string, remember: boolean) {
  const maxAge = remember ? REMEMBER_DAYS * 86400 : 86400;
  const token = signToken({ sid: studentId, exp: Date.now() + maxAge * 1000 });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge } : {}),
  });
}

export async function endStudentSession() {
  (await cookies()).delete(COOKIE);
}

export const getStudent = cache(async () => {
  const session = verifyToken<{ sid: string; exp: number }>((await cookies()).get(COOKIE)?.value);
  if (!session) return null;
  return prisma.student.findUnique({
    where: { id: session.sid },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      province: true,
      ward: true,
      address: true,
      createdAt: true,
    },
  });
});

export async function requireStudent(next: string) {
  const student = await getStudent();
  if (!student) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  return student;
}

export type CurrentStudent = NonNullable<Awaited<ReturnType<typeof getStudent>>>;
