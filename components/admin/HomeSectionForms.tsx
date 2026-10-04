"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminChrome";
import { ImageDropzone, VisibilitySwitch } from "@/components/admin/BrandAssetForm";
import { SiteIcon } from "@/components/common/SiteIcon";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  saveBrandAsset,
  saveHomeSection,
  savePageArticle,
  type HomeSectionKey,
} from "@/lib/actions";
import { TipTapEditor } from "@/components/editor/TipTapEditor";
import { isHtml, toRichHtml } from "@/lib/rich-text";
import {
  PAGE_ARTICLE_CONFIG,
  defaultPageArticle,
  type PageArticle,
  type PageArticleKey,
} from "@/lib/page-articles";
import type { BannerData, BrandAsset } from "@/lib/branding";
import { ICON_OPTIONS, type IconKey } from "@/lib/icon-keys";
import {
  newFaqItem,
  newFounderStat,
  newIconItem,
  newLink,
  newRoadmapItem,
  newTrainingGroup,
} from "@/lib/home-content";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared building blocks                                              */
/* ------------------------------------------------------------------ */

function SaveBar({
  pending,
  message,
  onReset,
}: {
  pending: boolean;
  message: string;
  onReset: () => void;
}) {
  return (
    <div className="sticky top-14 z-30 -mx-4 mb-4 flex flex-wrap items-center gap-2 border-b border-black/5 bg-[#f3f4f6]/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-60"
      >
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
      >
        Làm lại
      </button>
      {message && (
        <span
          className={cn(
            "text-sm font-semibold",
            message.startsWith("Lỗi") ? "text-red-600" : "text-emerald-600",
          )}
        >
          {message}
        </span>
      )}
    </div>
  );
}

function SectionForm<K extends HomeSectionKey>({
  sectionKey,
  title,
  description,
  initial,
  children,
  beforeSave,
  preview,
}: {
  sectionKey: K;
  title: string;
  description?: string;
  initial: BannerData[K];
  children: (
    value: BannerData[K],
    set: (next: BannerData[K]) => void,
  ) => React.ReactNode;
  beforeSave?: () => Promise<void>;
  preview?: string;
}) {
  const router = useRouter();
  const snapshot = useRef(initial);
  const [value, setValue] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <AdminPageHeader
        title={title}
        actions={
          <Link
            href={preview ?? "/"}
            target="_blank"
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5"
          >
            Xem trang chủ ↗
          </Link>
        }
      />
      {description && <p className="mb-4 text-sm text-ink/55">{description}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            setMessage("");
            try {
              await beforeSave?.();
              await saveHomeSection(sectionKey, value);
              snapshot.current = value;
              setMessage("Đã lưu.");
              router.refresh();
            } catch (err) {
              setMessage(`Lỗi: ${err instanceof Error ? err.message : "không lưu được"}`);
            }
          });
        }}
      >
        <SaveBar
          pending={pending}
          message={message}
          onReset={() => {
            setValue(snapshot.current);
            setMessage("");
          }}
        />
        <div className="space-y-4">{children(value, setValue)}</div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  multiline,
  rich,
  rows = 3,
  type,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  multiline?: boolean;
  rich?: boolean;
  rows?: number;
  type?: string;
}) {
  const text = String(value ?? "");
  return (
    <div>
      <Label>{label}</Label>
      {rich ? (
        <div className="mt-1">
          <TipTapEditor
            height={rows > 4 ? 360 : 240}
            value={isHtml(text) ? text : toRichHtml(text)}
            onChange={onChange}
          />
        </div>
      ) : multiline ? (
        <Textarea
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  hint,
  accept,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  accept?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <ImageDropzone value={value} onChange={onChange} hint={hint} accept={accept} />
    </div>
  );
}

function IconPicker({
  icon,
  iconUrl,
  onChange,
}: {
  icon: IconKey;
  iconUrl: string;
  onChange: (next: { icon: IconKey; iconUrl: string }) => void;
}) {
  return (
    <div>
      <Label>Icon</Label>
      <div className="mt-1 flex flex-wrap gap-2">
        {ICON_OPTIONS.map((opt) => {
          const selected = !iconUrl && icon === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              title={opt.label}
              aria-pressed={selected}
              onClick={() => onChange({ icon: opt.key, iconUrl: "" })}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl border transition",
                selected
                  ? "border-[#3f7d3a] bg-[#3f7d3a]/10 text-[#3f7d3a]"
                  : "border-black/10 bg-white text-ink/60 hover:border-[#3f7d3a]/50",
              )}
            >
              <SiteIcon icon={opt.key} size={26} />
            </button>
          );
        })}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-semibold text-[#3f7d3a]">
          Hoặc tải icon riêng (png / svg — ưu tiên hơn icon chọn sẵn)
        </summary>
        <div className="mt-2">
          <ImageDropzone
            value={iconUrl}
            onChange={(url) => onChange({ icon, iconUrl: url })}
            hint="Khuyến nghị 96×96 px, nền trong suốt"
          />
        </div>
      </details>
    </div>
  );
}

function ListEditor<T extends { id: string }>({
  items,
  onChange,
  create,
  itemTitle,
  addLabel = "+ Thêm mục",
  max,
  render,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  create: () => T;
  itemTitle: (item: T, index: number) => string;
  addLabel?: string;
  max?: number;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it!);
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id} className="rounded-xl border border-black/10 bg-[#fafafa] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              {String(index + 1).padStart(2, "0")} · {itemTitle(item, index) || "Mục mới"}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Lên"
                onClick={() => move(index, index - 1)}
                className="rounded-lg p-1.5 text-ink/50 hover:bg-black/5"
              >
                <ArrowUp size={15} />
              </button>
              <button
                type="button"
                aria-label="Xuống"
                onClick={() => move(index, index + 1)}
                className="rounded-lg p-1.5 text-ink/50 hover:bg-black/5"
              >
                <ArrowDown size={15} />
              </button>
              <button
                type="button"
                aria-label="Xóa"
                onClick={() => {
                  if (confirm("Xóa mục này?")) onChange(items.filter((x) => x.id !== item.id));
                }}
                className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          {render(
            item,
            (patch) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...patch } : x))),
            index,
          )}
        </div>
      ))}
      {(!max || items.length < max) && (
        <button
          type="button"
          onClick={() => onChange([...items, create()])}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#3f7d3a]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#3f7d3a] hover:bg-[#f3f8ee]"
        >
          <Plus size={15} /> {addLabel.replace(/^\+\s*/, "")}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section editors                                                     */
/* ------------------------------------------------------------------ */

export function HeaderEditor({ initial }: { initial: BannerData["header"] }) {
  return (
    <SectionForm
      sectionKey="header"
      title="Thanh menu (Header)"
      description="Menu dạng viên thuốc nổi, tự thu gọn khi cuộn (hiệu ứng header Elaria)."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Liên kết menu">
            <ListEditor
              items={v.links}
              onChange={(links) => set({ ...v, links })}
              create={() => newLink("nav")}
              itemTitle={(l) => l.label}
              addLabel="Thêm liên kết"
              render={(l, update) => (
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Tên" value={l.label} onChange={(label) => update({ label })} />
                  <Field label="Link" value={l.href} onChange={(href) => update({ href })} />
                </div>
              )}
            />
          </AdminCard>
          <AdminCard title="Nút liên hệ (bên phải)">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nhãn nút" value={v.ctaLabel} onChange={(ctaLabel) => set({ ...v, ctaLabel })} />
              <Field label="Link" value={v.ctaHref} onChange={(ctaHref) => set({ ...v, ctaHref })} />
            </div>
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function HeroEditor({
  initial,
  initialVideo,
}: {
  initial: BannerData["hero"];
  initialVideo: BrandAsset;
}) {
  const [video, setVideo] = useState(initialVideo);
  return (
    <SectionForm
      sectionKey="hero"
      title="Hero / Tiêu đề chính"
      description="Tiêu đề lớn (mục tô hồng) và 2 nút (mục tô đỏ). Ảnh/video nền lấy từ Slideshow."
      initial={initial}
      beforeSave={() => saveBrandAsset("video", video)}
    >
      {(v, set) => (
        <>
          <AdminCard title="Tiêu đề & mô tả">
            <div className="space-y-3">
              <Field
                label="Tiêu đề (mỗi dòng một hàng)"
                multiline
                rows={3}
                value={v.heading}
                onChange={(heading) => set({ ...v, heading })}
              />
              <Field
                label="Mô tả"
                rich
                value={v.description}
                onChange={(description) => set({ ...v, description })}
              />
            </div>
          </AdminCard>
          <AdminCard title="Nút “Khám phá khoá học”">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nhãn nút" value={v.primaryLabel} onChange={(primaryLabel) => set({ ...v, primaryLabel })} />
              <Field
                label="Link"
                value={v.primaryHref}
                hint="Mặc định trỏ vào trang Khoá Học (/khoa-hoc)"
                onChange={(primaryHref) => set({ ...v, primaryHref })}
              />
            </div>
          </AdminCard>
          <AdminCard title="Nút “Xem video giới thiệu”">
            <div className="space-y-3">
              <Field label="Nhãn nút" value={v.videoLabel} onChange={(videoLabel) => set({ ...v, videoLabel })} />
              <ImageField
                label="Video (tải mp4 hoặc dán link YouTube / Vimeo / mp4)"
                value={video.url}
                accept="video/mp4,video/webm"
                hint="Bấm nút trên trang chủ sẽ mở popup và phát video này"
                onChange={(url) => setVideo({ ...video, url })}
              />
              <VisibilitySwitch checked={video.visible} onChange={(visible) => setVideo({ ...video, visible })} />
            </div>
          </AdminCard>
          <p className="text-sm text-ink/55">
            Ảnh / video trình chiếu nền Hero:{" "}
            <Link href="/admin/branding/slideshow" className="font-semibold text-[#3f7d3a] underline">
              Quản lý Slideshow
            </Link>
          </p>
        </>
      )}
    </SectionForm>
  );
}

export function AcademyEditor({ initial }: { initial: BannerData["academy"] }) {
  return (
    <SectionForm
      sectionKey="academy"
      title="Phương Lily Academy"
      description="Tiêu đề + nội dung và các mục icon - tiêu đề - nội dung. Icon xoay vòng khi rê chuột."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Tiêu đề section">
            <div className="space-y-3">
              <Field label="Tiêu đề" value={v.title} onChange={(title) => set({ ...v, title })} />
              <Field label="Nội dung" rich value={v.description} onChange={(description) => set({ ...v, description })} />
            </div>
          </AdminCard>
          <AdminCard title="Các mục (khuyến nghị 3)">
            <ListEditor
              items={v.features}
              onChange={(features) => set({ ...v, features })}
              create={newIconItem}
              itemTitle={(f) => f.title}
              render={(f, update) => (
                <div className="space-y-3">
                  <IconPicker icon={f.icon} iconUrl={f.iconUrl} onChange={update} />
                  <Field label="Tiêu đề" value={f.title} onChange={(title) => update({ title })} />
                  <Field label="Nội dung" rich value={f.description} onChange={(description) => update({ description })} />
                </div>
              )}
            />
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function RoadmapEditor({ initial }: { initial: BannerData["roadmap"] }) {
  return (
    <SectionForm
      sectionKey="roadmap"
      title="Lộ trình Yoga toàn diện"
      description="Mỗi mục khi bấm sổ ra: tiêu đề - nội dung - nút đăng ký, ảnh bên phải đổi theo mục."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Tiêu đề section">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tiêu đề phụ" value={v.eyebrow} onChange={(eyebrow) => set({ ...v, eyebrow })} />
              <Field label="Tiêu đề chính" value={v.title} onChange={(title) => set({ ...v, title })} />
            </div>
          </AdminCard>
          <AdminCard title="Các chương trình (khuyến nghị 5)">
            <ListEditor
              items={v.items}
              onChange={(items) => set({ ...v, items })}
              create={newRoadmapItem}
              itemTitle={(i) => i.title}
              addLabel="Thêm chương trình"
              render={(i, update) => (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3">
                    <Field label="Tiêu đề" value={i.title} onChange={(title) => update({ title })} />
                    <Field label="Nội dung" rich value={i.description} onChange={(description) => update({ description })} />
                    <Field label="Nhãn nút" value={i.ctaLabel} onChange={(ctaLabel) => update({ ctaLabel })} />
                    <Field label="Link nút đăng ký" value={i.ctaHref} onChange={(ctaHref) => update({ ctaHref })} />
                  </div>
                  <ImageField label="Hình ảnh hiển thị khi mở mục" value={i.imageUrl} onChange={(imageUrl) => update({ imageUrl })} />
                </div>
              )}
            />
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function FounderEditor({ initial }: { initial: BannerData["founder"] }) {
  return (
    <SectionForm
      sectionKey="founder"
      title="Giới thiệu Phương Lily"
      description="Trái: hình ảnh. Phải: tiêu đề - nội dung - các mục tiêu biểu (icon, số năm kinh nghiệm, tiêu đề)."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Hình ảnh (bên trái)">
            <ImageDropzone value={v.imageUrl} onChange={(imageUrl) => set({ ...v, imageUrl })} hint="Khuyến nghị tỉ lệ ~1:1, tối thiểu 1200px" />
          </AdminCard>
          <AdminCard title="Nội dung (bên phải)">
            <div className="space-y-3">
              <Field label="Tiêu đề (xuống dòng để ngắt hàng)" multiline rows={2} value={v.title} onChange={(title) => set({ ...v, title })} />
              <Field label="Nội dung" rich rows={8} value={v.content} onChange={(content) => set({ ...v, content })} />
            </div>
          </AdminCard>
          <AdminCard title="Các mục tiêu biểu">
            <ListEditor
              items={v.stats}
              onChange={(stats) => set({ ...v, stats })}
              create={newFounderStat}
              itemTitle={(s) => `${s.value} ${s.label}`}
              render={(s, update) => (
                <div className="space-y-3">
                  <IconPicker icon={s.icon} iconUrl={s.iconUrl} onChange={update} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Con số (VD: +12)" value={s.value} onChange={(value) => update({ value })} />
                    <Field label="Tiêu đề" value={s.label} onChange={(label) => update({ label })} />
                  </div>
                </div>
              )}
            />
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function AppPromoEditor({ initial }: { initial: BannerData["appPromo"] }) {
  return (
    <SectionForm
      sectionKey="appPromo"
      title="Học Yoga mọi lúc, mọi nơi"
      description="Bên trái nội dung, bên phải ảnh. Dãy avatar học viên dùng hiệu ứng Pawlates."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Nội dung (bên trái)">
            <div className="space-y-3">
              <Field label="Tiêu đề (xuống dòng để ngắt hàng)" multiline rows={5} value={v.title} onChange={(title) => set({ ...v, title })} />
              <Field label="Dòng chữ cạnh avatar" value={v.membersLabel} onChange={(membersLabel) => set({ ...v, membersLabel })} />
              <Field label="Link khi bấm vào khối" value={v.href} onChange={(href) => set({ ...v, href })} />
            </div>
          </AdminCard>
          <AdminCard title="Ảnh (bên phải)">
            <ImageDropzone value={v.imageUrl} onChange={(imageUrl) => set({ ...v, imageUrl })} hint="Ảnh mockup laptop / điện thoại, nền trong suốt càng tốt" />
          </AdminCard>
          <AdminCard title="Avatar học viên">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {v.avatars.map((url, i) => (
                <div key={i} className="rounded-xl border border-black/10 bg-[#fafafa] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold">Avatar {i + 1}</span>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600"
                      onClick={() => set({ ...v, avatars: v.avatars.filter((_, j) => j !== i) })}
                    >
                      Xóa
                    </button>
                  </div>
                  <ImageDropzone
                    value={url}
                    hint="Ảnh vuông"
                    onChange={(next) => set({ ...v, avatars: v.avatars.map((a, j) => (j === i ? next : a)) })}
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => set({ ...v, avatars: [...v.avatars, ""] })}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#3f7d3a]/50 bg-white px-4 py-2.5 text-sm font-semibold text-[#3f7d3a]"
            >
              <Plus size={15} /> Thêm avatar
            </button>
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function TrainingEditor({ initial }: { initial: BannerData["training"] }) {
  return (
    <SectionForm
      sectionKey="training"
      title="Khám phá các nhóm đào tạo"
      description="6 ô: tên, mô tả, 4 mục tiêu chuẩn và nút Đăng ký ngay (hiệu ứng nút Pawlates)."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Tiêu đề section">
            <Field label="Tiêu đề" value={v.title} onChange={(title) => set({ ...v, title })} />
          </AdminCard>
          <AdminCard title="Các nhóm đào tạo">
            <ListEditor
              items={v.items}
              onChange={(items) => set({ ...v, items })}
              create={newTrainingGroup}
              itemTitle={(g) => g.name}
              addLabel="Thêm nhóm"
              render={(g, update) => (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-3">
                    <Field label="Tên" value={g.name} onChange={(name) => update({ name })} />
                    <Field label="Mô tả" rich value={g.description} onChange={(description) => update({ description })} />
                    <div>
                      <Label>4 mục tiêu chuẩn</Label>
                      <div className="space-y-2">
                        {[0, 1, 2, 3].map((k) => (
                          <Input
                            key={k}
                            value={g.features[k] ?? ""}
                            placeholder={`Tiêu chuẩn ${k + 1}`}
                            onChange={(e) => {
                              const features = [...g.features];
                              while (features.length < 4) features.push("");
                              features[k] = e.target.value;
                              update({ features });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Nhãn nút" value={g.ctaLabel} onChange={(ctaLabel) => update({ ctaLabel })} />
                      <Field label="Link nút" value={g.ctaHref} onChange={(ctaHref) => update({ ctaHref })} />
                    </div>
                    <VisibilitySwitch checked={g.isVisible} onChange={(isVisible) => update({ isVisible })} />
                  </div>
                  <ImageField label="Hình ảnh" value={g.imageUrl} onChange={(imageUrl) => update({ imageUrl })} />
                </div>
              )}
            />
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function QuoteEditor({ initial }: { initial: BannerData["quoteCta"] }) {
  return (
    <SectionForm
      sectionKey="quoteCta"
      title="Trích dẫn & CTA"
      description="Ảnh nền, tiêu đề và nút “Bắt đầu hành trình với chúng tôi” (mặc định trỏ tới Lịch sự kiện)."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Ảnh nền">
            <ImageDropzone value={v.imageUrl} onChange={(imageUrl) => set({ ...v, imageUrl })} hint="Khuyến nghị 1920×900" />
          </AdminCard>
          <AdminCard title="Nội dung">
            <div className="space-y-3">
              <Field label="Tiêu đề (xuống dòng để ngắt hàng)" multiline rows={3} value={v.quote} onChange={(quote) => set({ ...v, quote })} />
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Nhãn nút" value={v.ctaLabel} onChange={(ctaLabel) => set({ ...v, ctaLabel })} />
                <Field label="Link nút" value={v.ctaHref} onChange={(ctaHref) => set({ ...v, ctaHref })} />
              </div>
            </div>
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function FaqEditor({ initial }: { initial: BannerData["faq"] }) {
  return (
    <SectionForm
      sectionKey="faq"
      title="Câu hỏi thường gặp (FAQs)"
      description="Bấm dấu + để sổ câu trả lời, biểu tượng chuyển thành dấu X."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Tiêu đề section">
            <div className="space-y-3">
              <Field label="Tiêu đề" multiline rows={2} value={v.title} onChange={(title) => set({ ...v, title })} />
              <Field label="Mô tả" rich value={v.description} onChange={(description) => set({ ...v, description })} />
            </div>
          </AdminCard>
          <AdminCard title="Câu hỏi (khuyến nghị 5)">
            <ListEditor
              items={v.items}
              onChange={(items) => set({ ...v, items })}
              create={newFaqItem}
              itemTitle={(q) => q.question}
              addLabel="Thêm câu hỏi"
              render={(q, update) => (
                <div className="space-y-3">
                  <Field label="Câu hỏi" value={q.question} onChange={(question) => update({ question })} />
                  <Field label="Câu trả lời" multiline value={q.answer} onChange={(answer) => update({ answer })} />
                </div>
              )}
            />
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

export function BlogSectionEditor({ initial }: { initial: BannerData["blogSection"] }) {
  return (
    <SectionForm
      sectionKey="blogSection"
      title="Section Blog"
      description="Hiển thị tối đa 3 bài; nếu nhiều hơn 3 bài, danh sách sẽ chuyển động liên tục. Bài viết quản lý tại Quản lý bài viết → Blog."
      initial={initial}
    >
      {(v, set) => (
        <AdminCard title="Cấu hình">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Tiêu đề" value={v.title} onChange={(title) => set({ ...v, title })} />
            <Field
              label="Số bài lấy tối đa"
              type="number"
              value={v.limit}
              onChange={(limit) => set({ ...v, limit: Math.max(1, Number(limit) || 3) })}
            />
          </div>
        </AdminCard>
      )}
    </SectionForm>
  );
}

export function FooterEditor({ initial }: { initial: BannerData["footer"] }) {
  return (
    <SectionForm
      sectionKey="footer"
      title="Footer"
      description="Footer là thẻ trắng bốn cột: Học viện, Chương trình, Liên hệ, và logo cùng địa chỉ. Dòng phuonglilyacademy chỉ chạy ngang ở đáy. Form nhận tin không hiện trên footer."
      initial={initial}
    >
      {(v, set) => (
        <>
          <AdminCard title="Bản quyền & chữ chạy">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Bản quyền" multiline rows={2} value={v.copyright} onChange={(copyright) => set({ ...v, copyright })} />
              <Field label="Chữ chạy liên tục" value={v.wordmark} onChange={(wordmark) => set({ ...v, wordmark })} />
            </div>
          </AdminCard>
          <AdminCard title="Liên hệ & địa chỉ">
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Tiêu đề cột liên hệ" value={v.contactTitle} onChange={(contactTitle) => set({ ...v, contactTitle })} />
              <Field label="Điện thoại" value={v.phone} onChange={(phone) => set({ ...v, phone })} />
              <Field label="Email" value={v.email} onChange={(email) => set({ ...v, email })} />
              <Field label="Website" value={v.website} onChange={(website) => set({ ...v, website })} />
              <Field label="Tiêu đề địa chỉ" value={v.addressTitle} onChange={(addressTitle) => set({ ...v, addressTitle })} />
              <Field label="Địa chỉ" value={v.address} onChange={(address) => set({ ...v, address })} />
            </div>
          </AdminCard>
          <AdminCard title="Chính sách">
            <div className="mb-3 max-w-md">
              <Field label="Tiêu đề cột" value={v.policyTitle} onChange={(policyTitle) => set({ ...v, policyTitle })} />
            </div>
            <ListEditor
              items={v.policies}
              onChange={(policies) => set({ ...v, policies })}
              create={() => newLink("pl")}
              itemTitle={(l) => l.label}
              addLabel="Thêm liên kết"
              render={(l, update) => (
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Tên" value={l.label} onChange={(label) => update({ label })} />
                  <Field label="Link" value={l.href} onChange={(href) => update({ href })} />
                </div>
              )}
            />
          </AdminCard>
          <AdminCard title="Đăng ký nhận tin">
            <div className="space-y-3">
              <Field label="Tiêu đề" value={v.newsletterTitle} onChange={(newsletterTitle) => set({ ...v, newsletterTitle })} />
              <Field label="Mô tả" rich value={v.newsletterDescription} onChange={(newsletterDescription) => set({ ...v, newsletterDescription })} />
              <Field label="Placeholder ô email" value={v.newsletterPlaceholder} onChange={(newsletterPlaceholder) => set({ ...v, newsletterPlaceholder })} />
            </div>
          </AdminCard>
        </>
      )}
    </SectionForm>
  );
}

/* ------------------------------------------------------------------ */
/* Static page articles                                                */
/* ------------------------------------------------------------------ */

export function PageArticleEditor({
  page,
  initial,
}: {
  page: PageArticleKey;
  initial: PageArticle;
}) {
  const config = PAGE_ARTICLE_CONFIG[page];
  const router = useRouter();
  const [article, setArticle] = useState<PageArticle>(() => ({
    ...initial,
    content: toRichHtml(initial.content),
  }));
  const [editorKey, setEditorKey] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function save(next: PageArticle, done: string) {
    startTransition(async () => {
      setMessage("");
      const result = await savePageArticle(page, next);
      if (!result.ok) {
        setMessage(`Lỗi: ${result.error}`);
        return;
      }
      setMessage(done);
      router.refresh();
    });
  }

  function replace(next: PageArticle) {
    setArticle(next);
    setEditorKey((k) => k + 1);
  }

  return (
    <div>
      <AdminPageHeader
        title={config.label}
        actions={
          <Link
            href={config.path}
            target="_blank"
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
          >
            Xem trang ↗
          </Link>
        }
      />
      <p className="mb-5 text-sm text-ink/55">
        Bài viết hiển thị tại trang{" "}
        <Link href={config.path} target="_blank" className="font-semibold text-[#3f7d3a]">
          {config.path}
        </Link>
        . {config.hint} Có thể dán toàn bộ mã HTML (kèm <code>&lt;style&gt;</code>) qua nút
        “Mã HTML” để hiển thị đúng thiết kế riêng.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(article, `Đã lưu ${config.noun}.`);
        }}
      >
        <SaveBar
          pending={pending}
          message={message}
          onReset={() => {
            replace({ ...initial, content: toRichHtml(initial.content) });
            setMessage("");
          }}
        />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <AdminCard title="Nội dung bài viết">
            <div className="space-y-3">
              <div>
                <Label>Tiêu đề</Label>
                <Input
                  value={article.title}
                  onChange={(e) => setArticle({ ...article, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Nội dung</Label>
                <TipTapEditor
                  key={editorKey}
                  height={640}
                  value={article.content}
                  onChange={(html) => setArticle((prev) => ({ ...prev, content: html }))}
                />
              </div>
              <div className="flex flex-wrap gap-4 pt-1">
                <button
                  type="button"
                  disabled={pending}
                  className="text-xs font-semibold text-red-600 disabled:opacity-50"
                  onClick={() => {
                    if (!window.confirm(`Xóa toàn bộ nội dung ${config.noun}?`)) return;
                    const next = { ...article, content: "" };
                    replace(next);
                    save(next, `Đã xóa nội dung ${config.noun}.`);
                  }}
                >
                  Xóa nội dung
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className="text-xs font-semibold text-ink/60 hover:text-ink disabled:opacity-50"
                  onClick={() => {
                    if (!window.confirm(`Khôi phục nội dung mặc định cho ${config.noun}?`)) return;
                    const next = { ...defaultPageArticle(page), imageUrl: article.imageUrl };
                    replace(next);
                    save(next, "Đã khôi phục nội dung mặc định.");
                  }}
                >
                  Khôi phục mặc định
                </button>
              </div>
            </div>
          </AdminCard>
          <AdminCard title="Hình ảnh">
            <ImageDropzone
              value={article.imageUrl}
              onChange={(url) => setArticle((prev) => ({ ...prev, imageUrl: url }))}
            />
            {article.imageUrl && (
              <button
                type="button"
                className="mt-3 text-xs font-semibold text-red-600"
                onClick={() => setArticle((prev) => ({ ...prev, imageUrl: "" }))}
              >
                Xóa hình
              </button>
            )}
          </AdminCard>
        </div>
      </form>
    </div>
  );
}
