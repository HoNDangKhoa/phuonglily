"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, UserRound, X } from "lucide-react";
import { RollText } from "@/components/site/Buttons";
import { resolveMenuHref } from "@/lib/cms";
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
  // usePathname() is empty on the first server/client render, so the header
  // would stay in the compact bar until something else caused a re-render.
  const [locationPath, setLocationPath] = useState<string | null>(null);
  const overHero = (locationPath ?? pathname) === "/";
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt !== null && openedAt === pathname;
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
    setLocationPath(window.location.pathname);
  }, [pathname]);

  useEffect(() => {
    if (locationPath === "/") document.getElementById("hero-header-boot-style")?.remove();
  }, [locationPath]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > window.innerHeight * 0.72);
      setHidden(y > 160 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y < 160) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || !overHero;
  const isActive = (href: string) => {
    const path = resolveMenuHref(href);
    return path !== "/" && (pathname === path || pathname.startsWith(`${path}/`));
  };

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
            "site-header-bar relative mx-auto flex w-full max-w-[1440px] items-center px-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-8 lg:px-[clamp(1.25rem,5.76vw,5.2rem)]",
            solid ? "h-[74px] bg-sage/95 shadow-[0_8px_24px_-18px_rgba(29,58,31,0.45)] backdrop-blur-md" : "h-[119px]",
          )}
        >
          <Link href="/" aria-label={siteName} className="relative z-10 shrink-0">
            <span
              className={cn(
                "site-header-logo relative block overflow-hidden rounded-full ring-2 ring-white/70 transition-all duration-700",
                solid ? "size-11" : "size-[95px]",
              )}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt={siteName} fill sizes="95px" className="rounded-full object-cover" priority />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-leaf text-sm font-semibold text-white">
                  PL
                </span>
              )}
            </span>
          </Link>

          <nav
            className={cn(
              "site-header-nav absolute top-1/2 left-[calc(50%+1.75rem)] hidden w-max -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 rounded-full border py-[5px] pr-1 pl-4 whitespace-nowrap transition-all duration-700 lg:flex lg:py-[7px] lg:pr-1.5 lg:pl-5",
              solid
                ? "border-forest/10 bg-white/85 shadow-[0_12px_40px_-18px_rgba(29,58,31,0.45)] backdrop-blur-xl"
                : "border-white/55 bg-white/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)] backdrop-blur-md",
            )}
          >
            {header.links.map((link) => (
              <Link
                key={link.id}
                href={resolveMenuHref(link.href)}
                className={cn(
                  "site-header-link roll-host relative shrink-0 px-3 py-2 text-[15px] whitespace-nowrap transition-colors lg:px-3.5",
                  solid ? "text-forest/80 hover:text-forest" : "py-2 text-white/95 hover:text-white lg:py-2.5",
                )}
              >
                <RollText>{link.label}</RollText>
                {isActive(link.href) && (
                  <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" />
                )}
              </Link>
            ))}
            <Link
              href={resolveMenuHref(header.ctaHref)}
              className={cn(
                "site-header-cta roll-host ml-2 inline-flex h-10 shrink-0 items-center gap-2.5 rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-colors duration-500 lg:ml-3 lg:px-5",
                solid
                  ? "bg-forest text-white hover:bg-leaf"
                  : "bg-white text-forest hover:bg-white/90 lg:h-[clamp(2.15rem,3.4vw,3.15rem)]",
              )}
            >
              <RollText>{header.ctaLabel}</RollText>
              <span className={cn("site-header-dot h-1.5 w-1.5 rounded-full", solid ? "bg-lime-bright" : "bg-forest")} />
            </Link>
          </nav>

          <div className="z-10 ml-auto flex items-center gap-2">
            <Link
              href={accountHref}
              aria-label={student ? "Tài khoản của tôi" : "Đăng nhập"}
              title={student ? student.email : "Đăng nhập / Đăng ký"}
              className={cn(
                "site-header-account hidden items-center justify-center rounded-full border transition-all duration-500 hover:scale-105 lg:flex",
                solid ? "size-11" : "size-12",
                student
                  ? "border-transparent bg-leaf text-base font-semibold text-white"
                  : solid
                    ? "border-forest/10 bg-white/80 text-forest backdrop-blur-xl"
                    : "border-white/30 bg-white/10 text-white backdrop-blur-md",
              )}
            >
              {student ? (
                initial || <UserRound className={solid ? "size-5" : "size-5 lg:size-7"} />
              ) : (
                <UserRound className={solid ? "size-5" : "size-5 lg:size-7"} strokeWidth={1.6} />
              )}
            </Link>
            <button
              type="button"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              onClick={() => setOpenedAt(open ? null : pathname)}
              className={cn(
                "site-header-menu flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md lg:hidden",
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
              href={resolveMenuHref(link.href)}
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
          href={resolveMenuHref(header.ctaHref)}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-forest py-4 text-lg text-white"
        >
          {header.ctaLabel}
          <span className="h-1.5 w-1.5 rounded-full bg-lime-bright" />
        </Link>
      </div>
    </>
  );
}
