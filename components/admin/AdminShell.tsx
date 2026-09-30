"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Home,
  Menu,
  Phone,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { adminIconMap, adminNav } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupOpen(pathname: string, children?: { href: string }[]) {
  return !!children?.some((c) => isActivePath(pathname, c.href));
}

export function AdminShell({
  children,
  userName,
  userInitial,
  signOutAction,
  clearCacheAction,
}: {
  children: React.ReactNode;
  userName: string;
  userInitial: string;
  signOutAction: () => Promise<void>;
  clearCacheAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    adminNav.forEach((item) => {
      if (item.children) init[item.label] = groupOpen(pathname, item.children);
    });
    return init;
  });

  const breadcrumb = useMemo(() => {
    const crumbs: string[] = [];
    if (pathname === "/admin") return crumbs;
    for (const item of adminNav) {
      if (item.href && isActivePath(pathname, item.href) && item.href !== "/admin") {
        crumbs.push(item.label);
      }
      if (item.children) {
        const child = item.children.find((c) => isActivePath(pathname, c.href));
        if (child) {
          crumbs.push(item.label, child.label);
          if (pathname.endsWith("/new")) crumbs.push("Thêm mới");
          else if (
            /\/[a-zA-Z0-9_-]+$/.test(pathname) &&
            !item.children.some((c) => pathname === c.href) &&
            pathname !== child.href
          ) {
            crumbs.push("Chỉnh sửa");
          }
        }
      }
    }
    if (pathname.includes("/account/password")) crumbs.push("Đổi mật khẩu");
    else if (pathname.includes("/account")) crumbs.push("Tài khoản");
    return crumbs;
  }, [pathname]);

  const Sidebar = (
    <aside className="flex h-full w-[280px] flex-col bg-white text-ink">
      <div className="border-b border-black/5 px-4 py-4">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#3f7d3a] text-sm font-semibold text-white">
            PL
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Phương Lily</p>
            <p className="text-xs font-semibold text-ink/50">Academy CMS</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {adminNav.map((item) => {
          const Icon =
            adminIconMap[(item.icon as keyof typeof adminIconMap) || "folder"] ||
            adminIconMap.folder;
          const hasChildren = !!item.children?.length;
          const open = openGroups[item.label];
          const activeSelf = isActivePath(pathname, item.href);

          if (!hasChildren) {
            return (
              <Link
                key={item.label}
                href={item.href || "/admin"}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  activeSelf
                    ? "bg-gradient-to-r from-[#3f7d3a] to-[#6a9e4f] text-white shadow-sm"
                    : "text-ink/70 hover:bg-black/5 hover:text-ink",
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          }

          return (
            <div key={item.label}>
              <button
                type="button"
                onClick={() =>
                  setOpenGroups((s) => ({ ...s, [item.label]: !s[item.label] }))
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  open || groupOpen(pathname, item.children)
                    ? "bg-black/[0.04] text-ink"
                    : "text-ink/70 hover:bg-black/5 hover:text-ink",
                )}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {open && (
                <div className="mt-1 ml-4 space-y-1 border-l border-black/10 pl-3">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-semibold transition",
                        isActivePath(pathname, child.href)
                          ? "bg-gradient-to-r from-[#3f7d3a] to-[#6a9e4f] text-white"
                          : "text-ink/65 hover:bg-black/5 hover:text-ink",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-black/5 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-black/5"
        >
          <ExternalLink size={16} />
          Về trang web chính
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-ink">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">{Sidebar}</div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="h-full bg-white shadow-xl">{Sidebar}</div>
            <button
              type="button"
              className="flex-1 bg-black/40"
              aria-label="Đóng menu"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-black/5 bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-black/5 lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Mở menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <p className="text-sm font-semibold text-ink/70">
                Xin chào,{" "}
                <span className="text-[#3f7d3a]">{userName}</span> !
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-ink/60 hover:bg-black/5"
                onClick={() => window.location.reload()}
                aria-label="Refresh"
              >
                <RefreshCw size={18} />
              </button>
              <Link
                href="/admin/contacts"
                className="relative rounded-lg p-2 text-ink/60 hover:bg-black/5"
                aria-label="Thông báo"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
              </Link>
              <Link
                href="/admin/settings"
                className="rounded-lg p-2 text-ink/60 hover:bg-black/5"
                aria-label="Cấu hình"
                title="Cấu hình điện thoại / settings"
              >
                <Phone size={18} />
              </Link>
              <div className="relative ml-1">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#3f7d3a]/40 px-2 py-1.5 md:px-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3f7d3a] text-sm font-semibold text-white">
                      {userInitial}
                    </span>
                    <span className="hidden text-left text-xs font-semibold leading-tight md:block">
                      <span className="block text-ink/45">Nhà quản trị</span>
                      <span className="text-ink">{userName}</span>
                    </span>
                  </summary>
                  <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg">
                    <Link
                      href="/admin/account"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
                    >
                      Thông tin admin
                    </Link>
                    <Link
                      href="/admin/account/password"
                      className="block px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
                    >
                      Đổi mật khẩu
                    </Link>
                    {clearCacheAction && (
                      <form action={clearCacheAction}>
                        <button
                          type="submit"
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-black/5"
                        >
                          <Trash2 size={14} /> Xóa bộ nhớ tạm
                        </button>
                      </form>
                    )}
                    <form action={signOutAction}>
                      <button
                        type="submit"
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Đăng xuất
                      </button>
                    </form>
                  </div>
                </details>
              </div>
            </div>
          </header>

          <div className="border-b border-black/5 bg-white/70 px-4 py-2 md:px-6">
            <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-ink/45">
              <Home size={13} className="text-[#3f7d3a]" />
              <Link href="/admin" className="hover:text-[#3f7d3a]">
                Bảng điều khiển
              </Link>
              {breadcrumb.map((c) => (
                <span key={c} className="flex items-center gap-1.5">
                  <span>›</span>
                  <span>{c}</span>
                </span>
              ))}
            </p>
          </div>

          <main className="flex-1 p-4 md:p-6">{children}</main>

          <footer className="border-t border-black/5 bg-white px-4 py-4 text-center text-xs font-semibold text-ink/40 md:px-6">
            <p>Phương Lily Academy CMS</p>
            <p className="mt-1">
              Hotline hỗ trợ kỹ thuật · Cấu trúc quản trị Diamond CMS
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
