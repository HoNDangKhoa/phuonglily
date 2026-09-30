import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập Admin | Phương Lily CMS",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl || "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-5">
      <div className="w-full max-w-md rounded-2xl border border-black/8 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#3f7d3a] text-sm font-semibold text-white">
            PL
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">Phương Lily Academy CMS</p>
            <p className="text-xs text-ink/45">Diamond-style Admin</p>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-ink">Chào mừng trở lại</h1>
        <p className="mt-2 text-sm text-ink/55">
          Đăng nhập để quản lý nội dung website
        </p>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
