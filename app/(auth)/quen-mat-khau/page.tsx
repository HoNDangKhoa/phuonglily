import type { Metadata } from "next";
import { EmailCodeFlow } from "@/components/account/AuthForms";
import { safeNext } from "@/lib/learning";

export const metadata: Metadata = { title: "Quên mật khẩu", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function Page({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);
  return <EmailCodeFlow purpose="RESET" next={next ? target : ""} target={target} />;
}
