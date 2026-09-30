import type { Metadata } from "next";
import { AccountTabs, LogoutButton } from "@/components/account/AccountChrome";
import { getStudent } from "@/lib/student-auth";

export const metadata: Metadata = { title: "Tài khoản", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const student = await getStudent();
  return (
    <div className="min-h-dvh bg-sage">
      <section className="pt-32 pb-8 md:pt-40">
        <div className="container-site flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[clamp(2.2rem,4.5vw,3.5rem)] leading-none font-normal tracking-tight text-forest">
              Tài khoản
            </h1>
            <p className="mt-3 text-sm text-forest/60">
              {student ? `Xin chào ${student.name || student.email} · ` : ""}Quản lý đăng ký học, khoá
              học và thông tin cá nhân.
            </p>
          </div>
          {student && <LogoutButton />}
        </div>
      </section>
      <div className="border-y border-forest/10 bg-white/50">
        <AccountTabs />
      </div>
      <div className="container-site py-10 pb-24">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  );
}
