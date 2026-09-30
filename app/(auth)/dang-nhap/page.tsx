import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/AuthForms";
import { safeNext } from "@/lib/learning";
import { getStudent } from "@/lib/student-auth";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function Page({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getStudent()) redirect(target);
  return <LoginForm next={next ? target : ""} target={target} />;
}
