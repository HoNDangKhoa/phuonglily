"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { FormMessage } from "@/components/account/AuthUi";
import { badgeClass, discountPercent, formatVnd } from "@/lib/learning";
import { createEnrollment } from "@/lib/student-actions";
import { cn } from "@/lib/utils";

type Pkg = {
  id: string;
  name: string;
  badge: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
};

const fieldClass =
  "h-12 w-full rounded-full border border-forest/15 bg-white px-5 text-[15px] text-forest outline-none focus:border-leaf";

export function CheckoutForm({
  course,
  packages,
  initialPackage,
  profile,
}: {
  course: { id: string; title: string; thumbnail: string | null; priceText: string | null; lessonCount: number };
  packages: Pkg[];
  initialPackage?: string;
  profile: { name: string; phone: string; address: string; email: string };
}) {
  const router = useRouter();
  const [packageId, setPackageId] = useState(
    packages.find((p) => p.id === initialPackage)?.id ?? packages[0]?.id ?? "",
  );
  const [form, setForm] = useState({
    fullName: profile.name,
    phone: profile.phone,
    address: profile.address,
    note: "",
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const pkg = packages.find((p) => p.id === packageId);
  const off = pkg ? discountPercent(pkg.price, pkg.oldPrice) : 0;

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1fr_380px]"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const res = await createEnrollment({ postId: course.id, packageId: packageId || undefined, ...form });
          if (!res.ok) return setError(res.error);
          router.push(`/tai-khoan/don/${res.code}${res.existed ? "" : "?moi=1"}`);
          router.refresh();
        });
      }}
    >
      <div className="space-y-5">
        {packages.length > 0 && (
          <section className="rounded-[24px] bg-white p-6 md:p-7">
            <h2 className="mb-4 text-lg font-medium text-forest">1. Chọn gói học</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((p) => (
                <label
                  key={p.id}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition",
                    p.id === packageId ? "border-leaf bg-leaf/[0.06] ring-1 ring-leaf" : "border-forest/12 hover:border-forest/30",
                  )}
                >
                  <input type="radio" name="package" className="sr-only" checked={p.id === packageId} onChange={() => setPackageId(p.id)} />
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-bold uppercase", badgeClass(p.badge))}>{p.name}</span>
                  {p.description && <span className="mt-2 block text-sm text-forest/65">{p.description}</span>}
                  <span className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-forest">{formatVnd(p.price)}</span>
                    {p.oldPrice && p.oldPrice > p.price && (
                      <span className="text-sm text-forest/40 line-through">{formatVnd(p.oldPrice)}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[24px] bg-white p-6 md:p-7">
          <h2 className="mb-4 text-lg font-medium text-forest">{packages.length ? "2." : "1."} Thông tin học viên</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-forest/70">Họ và tên*</span>
              <input required className={fieldClass} value={form.fullName} onChange={set("fullName")} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-forest/70">Số điện thoại*</span>
              <input required type="tel" className={fieldClass} value={form.phone} onChange={set("phone")} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-forest/70">Email</span>
              <input disabled className={`${fieldClass} bg-sage/40 text-forest/60`} value={profile.email} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-forest/70">Địa chỉ</span>
              <input className={fieldClass} value={form.address} onChange={set("address")} />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm text-forest/70">Ghi chú</span>
              <textarea
                rows={3}
                className="w-full rounded-3xl border border-forest/15 bg-white px-5 py-3 text-[15px] text-forest outline-none focus:border-leaf"
                placeholder="Thời gian thuận tiện để tư vấn, câu hỏi về khoá học…"
                value={form.note}
                onChange={set("note")}
              />
            </label>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[24px] bg-white p-6">
          <div className="flex gap-3">
            <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-sage">
              {course.thumbnail && <Image src={course.thumbnail} alt="" fill sizes="96px" className="object-cover" />}
            </span>
            <div>
              <p className="line-clamp-2 font-medium text-forest">{course.title}</p>
              {course.lessonCount > 0 && <p className="mt-1 text-xs text-forest/55">{course.lessonCount} bài học video</p>}
            </div>
          </div>
          <dl className="mt-5 space-y-3 border-t border-forest/10 pt-5 text-sm">
            <div className="flex justify-between text-forest/70">
              <dt>Gói học</dt>
              <dd className="font-medium text-forest">{pkg?.name || "—"}</dd>
            </div>
            {pkg?.oldPrice && off > 0 && (
              <div className="flex justify-between text-forest/70">
                <dt>Học phí gốc</dt>
                <dd className="line-through">{formatVnd(pkg.oldPrice)}</dd>
              </div>
            )}
            {off > 0 && (
              <div className="flex justify-between text-forest/70">
                <dt>Ưu đãi</dt>
                <dd className="text-leaf">-{off}%</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between border-t border-forest/10 pt-4">
              <dt className="font-medium text-forest">Tổng thanh toán</dt>
              <dd className="text-2xl font-bold text-leaf">{pkg ? formatVnd(pkg.price) : course.priceText || "Liên hệ"}</dd>
            </div>
          </dl>
          <div className="mt-5 space-y-3">
            <FormMessage error={error} />
            <button
              type="submit"
              disabled={pending}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf text-[15px] font-semibold text-white hover:bg-forest disabled:opacity-60"
            >
              {pending && <Loader2 size={18} className="animate-spin" />}
              Xác nhận đăng ký
            </button>
            <p className="flex gap-2 text-xs leading-relaxed text-forest/55">
              <ShieldCheck size={16} className="shrink-0 text-leaf" />
              {pkg && pkg.price === 0
                ? "Khoá học miễn phí sẽ được kích hoạt ngay sau khi đăng ký."
                : "Tư vấn viên sẽ liên hệ xác nhận và hướng dẫn thanh toán. Khoá học được kích hoạt ngay sau khi thanh toán."}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
