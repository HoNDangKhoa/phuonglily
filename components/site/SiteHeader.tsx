"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { RollText } from "@/components/site/Buttons";
import type { HeaderContent } from "@/lib/home-content";
import { cn } from "@/lib/utils";

export function SiteHeader({
  header,
  logoUrl,
  siteName,
}: {
  header: HeaderContent;
  logoUrl: string;
  siteName: string;
}) {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const lastY = useRef(0);
  const [student, setStudent] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/student/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { student: { name: string; email: string } | null }) => alive && setStudent(data.student))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  const accountHref = student ? "/tai-khoan" : "/dang-nhap";
  const initial = (student?.name || student?.email || "").trim().charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 160 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 160) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero;
  const isActive = (href: string) =>
    href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
          hidden && !open ? "-translate-y-[130%]" : "translate-y-0",
        )}
      >
        <div
          className={cn(
            "relative mx-auto flex w-full max-w-[1440px] items-center px-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-10 lg:px-16",
            solid ? "h-[72px]" : "h-[88px] md:h-[100px]",
          )}
        >
          <Link href="/" aria-label={siteName} className="relative z-10 shrink-0">
            <span
              className={cn(
                "block overflow-hidden rounded-full ring-2 ring-white/70 transition-all duration-700",
                solid ? "h-11 w-11 md:h-12 md:w-12" : "h-14 w-14 md:h-16 md:w-16",
              )}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt={siteName} fill sizes="80px" className="rounded-full object-cover" priority />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-leaf text-sm font-semibold text-white">
                  PL
                </span>
              )}
            </span>
          </Link>

          <nav
            className={cn(
              "absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border p-1.5 pl-5 transition-all duration-700 lg:flex",
              solid
                ? "border-forest/10 bg-white/85 shadow-[0_12px_40px_-18px_rgba(29,58,31,0.45)] backdrop-blur-xl"
                : "border-white/45 bg-white/20 backdrop-blur-md",
            )}
          >
            {header.links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(
                  "roll-host relative px-4 py-2 text-[15px] transition-colors",
                  solid ? "text-forest/80 hover:text-forest" : "text-white/90 hover:text-white",
                )}
              >
                <RollText>{link.label}</RollText>
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
                )}
              </Link>
            ))}
            <Link
              href={header.ctaHref}
              className={cn(
                "roll-host ml-3 inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors duration-500",
                solid ? "bg-forest text-white hover:bg-leaf" : "bg-white text-forest hover:bg-white/90",
              )}
            >
              <RollText>{header.ctaLabel}</RollText>
              <span className={cn("h-1.5 w-1.5 rounded-full", solid ? "bg-lime-bright" : "bg-forest")} />
            </Link>
          </nav>

          <div className="z-10 ml-auto flex items-center gap-2">
            <Link
              href={accountHref}
              aria-label={student ? "Tài khoản của tôi" : "Đăng nhập"}
              title={student ? student.email : "Đăng nhập / Đăng ký"}
              className={cn(
                "hidden h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 hover:scale-105 lg:flex",
                student
                  ? "border-transparent bg-leaf text-base font-semibold text-white"
                  : solid
                    ? "border-forest/10 bg-white/80 text-forest backdrop-blur-xl"
                    : "border-white/30 bg-white/10 text-white backdrop-blur-md",
              )}
            >
              {student ? initial || <UserRound size={20} /> : <UserRound size={20} strokeWidth={1.6} />}
            </Link>
            <button
              type="button"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              onClick={() => setOpenedAt(open ? null : pathname)}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md lg:hidden",
                solid || open ? "border-forest/10 bg-white text-forest" : "border-white/30 bg-white/10 text-white",
              )}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-sage px-6 pt-28 pb-10 transition-[clip-path] duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] lg:hidden",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
        data-lenis-prevent
      >
        <nav className="flex flex-col gap-2">
          {header.links.map((link, i) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(
                "border-b border-forest/10 py-4 text-3xl font-light text-forest transition-all duration-700",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: open ? `${150 + i * 60}ms` : "0ms" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href={accountHref}
          className="mt-8 inline-flex items-center gap-3 text-lg text-forest"
        >
          <UserRound size={20} />
          {student ? `Tài khoản (${student.name || student.email})` : "Đăng nhập / Đăng ký"}
        </Link>
        <Link
          href={header.ctaHref}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest py-4 text-lg text-white"
        >
          {header.ctaLabel}
          <span className="h-1.5 w-1.5 rounded-full bg-lime-bright" />
        </Link>
      </div>
    </>
  );
}
