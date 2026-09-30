"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Clock3, MessageCircle, PlayCircle } from "lucide-react";
import { badgeClass, formatVnd } from "@/lib/learning";
import { cn } from "@/lib/utils";

type Pkg = {
  id: string;
  name: string;
  badge: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
};

type Status = { status: string; code: string } | null;

export function EnrollCard({
  postId,
  slug,
  title,
  packages,
  priceText,
  lessonCount,
}: {
  postId: string;
  slug: string;
  title: string;
  packages: Pkg[];
  priceText: string | null;
  lessonCount: number;
}) {
  const [selected, setSelected] = useState(packages[0]?.id ?? "");
  const [enrollment, setEnrollment] = useState<Status>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/student/me?postId=${postId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { enrollment: Status }) => alive && setEnrollment(data.enrollment))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [postId]);

  const checkoutHref = `/dang-ky-hoc/${slug}${selected ? `?goi=${selected}` : ""}`;
  const consultHref = `/lien-he?chuong-trinh=${encodeURIComponent(title)}`;

  return (
    <div className="rounded-[24px] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(29,58,31,0.7)] md:p-6">
      <h2 className="text-lg leading-snug font-semibold text-forest uppercase">{title}</h2>

      {packages.length > 0 ? (
        <div className="mt-5 space-y-3" role="radiogroup" aria-label="Chọn gói học">
          {packages.map((pkg) => {
            const active = pkg.id === selected;
            return (
              <button
                key={pkg.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(pkg.id)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-all",
                  active
                    ? "border-leaf bg-leaf/[0.06] ring-1 ring-leaf"
                    : "border-forest/12 hover:border-forest/30",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase", badgeClass(pkg.badge))}>
                    {pkg.name}
                  </span>
                  {pkg.oldPrice && pkg.oldPrice > pkg.price && (
                    <span className="text-sm text-forest/40 line-through">{formatVnd(pkg.oldPrice)}</span>
                  )}
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <span className="text-sm text-forest/70">{pkg.description}</span>
                  <span className={cn("text-xl font-bold whitespace-nowrap", active ? "text-leaf" : "text-forest")}>
                    {formatVnd(pkg.price)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-2xl font-bold text-leaf">{priceText || "Liên hệ"}</p>
      )}

      <div className="mt-5 space-y-3">
        {enrollment?.status === "ACTIVE" ? (
          <Link
            href={`/hoc/${slug}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-leaf text-[15px] font-semibold text-white hover:bg-forest"
          >
            <PlayCircle size={18} /> Vào học ngay
          </Link>
        ) : enrollment?.status === "PENDING" ? (
          <Link
            href={`/tai-khoan/don/${enrollment.code}`}
            className="flex h-12 items-center justify-center gap-2 rounded-full bg-amber-500 text-[15px] font-semibold text-white hover:bg-amber-600"
          >
            <Clock3 size={18} /> Đơn #{enrollment.code} đang chờ xác nhận
          </Link>
        ) : (
          <Link
            href={checkoutHref}
            className="group flex h-12 items-center justify-center gap-2 rounded-full bg-leaf text-[15px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(47,107,44,0.8)] transition hover:bg-forest"
          >
            Đăng ký ngay
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        )}
        <Link
          href={consultHref}
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-forest/15 bg-sage/60 text-[15px] font-medium text-forest hover:bg-sage"
        >
          <MessageCircle size={18} /> Tư vấn
        </Link>
      </div>

      {lessonCount > 0 && (
        <p className="mt-4 text-center text-xs text-forest/50">
          Truy cập {lessonCount} bài học video · Theo dõi tiến độ trong tài khoản
        </p>
      )}
    </div>
  );
}
