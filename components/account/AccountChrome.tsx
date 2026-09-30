"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logoutStudent } from "@/lib/student-actions";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/tai-khoan", label: "Lịch sử đăng ký" },
  { href: "/tai-khoan/khoa-hoc", label: "Khoá học của tôi" },
  { href: "/tai-khoan/ho-so", label: "Hồ sơ của bạn" },
];

export function AccountTabs() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/tai-khoan"
      ? pathname === href || pathname.startsWith("/tai-khoan/don")
      : pathname.startsWith(href);

  return (
    <nav className="container-site flex gap-1 overflow-x-auto">
      {TABS.map((tab, i) => (
        <span key={tab.href} className="flex items-center">
          {i > 0 && <span className="mx-2 h-4 w-px bg-forest/15" />}
          <Link
            href={tab.href}
            className={cn(
              "whitespace-nowrap py-4 text-[15px] transition-colors",
              active(tab.href) ? "text-forest" : "text-forest/35 hover:text-forest/70",
            )}
          >
            {tab.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutStudent();
          router.replace("/");
          router.refresh();
        })
      }
      className="inline-flex items-center gap-2 rounded-full border border-forest/15 bg-white px-4 py-2 text-sm text-forest transition hover:bg-forest hover:text-white disabled:opacity-60"
    >
      <LogOut size={15} />
      Đăng xuất
    </button>
  );
}
