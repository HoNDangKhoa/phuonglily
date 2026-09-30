"use client";

import { useMemo, useState, useTransition } from "react";
import { AdminCard } from "@/components/admin/AdminChrome";
import {
  FormSaveBar,
  ImageDropzone,
} from "@/components/admin/BrandAssetForm";
import { Input, Label, Textarea } from "@/components/ui/input";
import { savePageSeo } from "@/lib/actions";
import type { PageSeo } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function SeoPageForm({
  seoKey,
  title,
  hostHint = "phuonglilyacademy.com",
  initial,
}: {
  seoKey: string;
  title: string;
  hostHint?: string;
  initial: PageSeo;
}) {
  const [values, setValues] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function setField<K extends keyof PageSeo>(key: K, value: PageSeo[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const checks = useMemo(() => {
    const kw = values.focusKeyword.trim().toLowerCase();
    return [
      {
        ok: values.title.length >= 10 && values.title.length <= 70,
        label: "Độ dài tiêu đề phù hợp (10 - 70 ký tự)",
      },
      {
        ok: values.description.length >= 50 && values.description.length <= 160,
        label: "Độ dài mô tả phù hợp (50 - 160 ký tự)",
      },
      {
        ok: !!kw && values.title.toLowerCase().includes(kw),
        label: "Từ khóa xuất hiện trong tiêu đề",
      },
      {
        ok: !!kw && values.description.toLowerCase().includes(kw),
        label: "Từ khóa xuất hiện trong mô tả",
      },
      {
        ok:
          !!kw &&
          values.canonical.toLowerCase().includes(kw.replace(/\s+/g, "-")),
        label: "Từ khóa xuất hiện trong URL",
      },
      { ok: !!values.ogImage, label: "OG image đã có" },
      { ok: !!values.canonical, label: "Canonical URL đã có" },
      { ok: values.indexable, label: "Cho phép index" },
    ];
  }, [values]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setMessage("");
          await savePageSeo(seoKey, values);
          setMessage("Đã lưu SEO page.");
        });
      }}
    >
      <FormSaveBar
        saving={pending}
        message={message}
        onReset={() => {
          setValues(initial);
          setMessage("");
        }}
      />

      <AdminCard title={title}>
        <ImageDropzone
          value={values.ogImage}
          onChange={(url) => setField("ogImage", url)}
          hint="Ảnh OG / SEO (jpg, jpeg, png, webp)"
        />
      </AdminCard>

      <AdminCard title="Nội dung SEO">
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between">
              <Label>SEO Title (vi):</Label>
              <span className="text-xs font-semibold text-ink/40">
                {values.title.length} / 70 ký tự
              </span>
            </div>
            <Input
              maxLength={70}
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <Label>SEO Keywords (vi):</Label>
              <span className="text-xs font-semibold text-ink/40">
                {values.keywords.length} / 70 ký tự
              </span>
            </div>
            <Input
              maxLength={70}
              value={values.keywords}
              onChange={(e) => setField("keywords", e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <Label>SEO Description (vi):</Label>
              <span className="text-xs font-semibold text-ink/40">
                {values.description.length} / 160 ký tự
              </span>
            </div>
            <Textarea
              rows={3}
              maxLength={160}
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </div>
          <div>
            <div className="mb-1 flex justify-between">
              <Label>Keyword chính (vi):</Label>
              <span className="text-xs font-semibold text-ink/40">
                {values.focusKeyword.length} / 100 ký tự
              </span>
            </div>
            <Input
              maxLength={100}
              value={values.focusKeyword}
              onChange={(e) => setField("focusKeyword", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Index</Label>
              <div className="mt-2 flex gap-4 text-sm font-semibold">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={values.indexable}
                    onChange={() => setField("indexable", true)}
                  />
                  Index
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!values.indexable}
                    onChange={() => setField("indexable", false)}
                  />
                  No Index
                </label>
              </div>
            </div>
            <div>
              <Label>Canonical</Label>
              <Input
                value={values.canonical}
                onChange={(e) => setField("canonical", e.target.value)}
              />
            </div>
            <div>
              <Label>Og:site_name</Label>
              <Input
                value={values.ogSiteName}
                onChange={(e) => setField("ogSiteName", e.target.value)}
              />
            </div>
            <div>
              <Label>Og:type</Label>
              <Input
                value={values.ogType}
                onChange={(e) => setField("ogType", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Og:url</Label>
              <Input
                value={values.ogUrl}
                onChange={(e) => setField("ogUrl", e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-black/8 bg-[#fafafa] p-4">
            <p className="mb-3 text-sm font-semibold text-ink/60">
              Khi lên top, page này sẽ hiển thị theo dạng mẫu như sau:
            </p>
            <p className="text-sm font-semibold text-emerald-700">{hostHint}</p>
            <p className="mt-1 text-xl font-semibold text-[#1a0dab]">
              {values.title || "SEO Title sẽ hiện ở đây"}
            </p>
            <p className="mt-1 text-sm text-[#4d5156]">
              {values.description ||
                "SEO Description sẽ hiện dưới tiêu đề trên Google."}
            </p>
            <ul className="mt-4 space-y-1.5">
              {checks.map((item) => (
                <li
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold",
                    item.ok ? "text-emerald-600" : "text-ink/40",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white",
                      item.ok ? "bg-emerald-500" : "bg-black/20",
                    )}
                  >
                    {item.ok ? "✓" : "–"}
                  </span>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AdminCard>
    </form>
  );
}
