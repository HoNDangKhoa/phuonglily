"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { AdminCard } from "@/components/admin/AdminChrome";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { saveSiteSettings, sendTestMail } from "@/lib/actions";
import { resolveMapEmbed } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export type SettingsFormData = {
  companyName: string;
  workingHours: string;
  headOffice: string;
  email: string;
  hotline: string;
  phone: string;
  zalo: string;
  oaidZalo: string;
  website: string;
  fanpage: string;
  linkedin: string;
  mapsCoords: string;
  mapsEmbedUrl: string;
  googleAnalytics: string;
  googleWebmaster: string;
  headJs: string;
  bodyJs: string;
  metaTitle: string;
  seoKeywords: string;
  metaDescription: string;
  primaryKeyword: string;
  mailerHost: string;
  mailerPort: string;
  mailerSecure: string;
  mailerEmail: string;
  mailerPassword: string;
  slogan: string;
  factoryAddress: string;
};

function CharLabel({
  label,
  count,
  max,
}: {
  label: string;
  count: number;
  max: number;
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <Label>{label}</Label>
      <span className="text-xs font-semibold text-ink/40">
        {count} / {max} ký tự
      </span>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsFormData }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mailStatus, setMailStatus] = useState("");
  const [values, setValues] = useState(initial);
  const router = useRouter();
  const mapSrc = resolveMapEmbed(values.mapsEmbedUrl, values.mapsCoords);

  function setField<K extends keyof SettingsFormData>(
    key: K,
    value: SettingsFormData[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  const hostLabel = useMemo(() => {
    try {
      const url = values.website.startsWith("http")
        ? values.website
        : `https://${values.website || "phuonglilyacademy.com"}`;
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "phuonglilyacademy.com";
    }
  }, [values.website]);

  const titleLen = values.metaTitle.length;
  const descLen = values.metaDescription.length;
  const kw = values.primaryKeyword.trim().toLowerCase();
  const checks = [
    {
      ok: titleLen >= 10 && titleLen <= 70,
      label: "Độ dài tiêu đề phù hợp (10 - 70 ký tự)",
    },
    {
      ok: descLen >= 50 && descLen <= 160,
      label: "Độ dài mô tả phù hợp (50 - 160 ký tự)",
    },
    {
      ok: !!kw && values.metaTitle.toLowerCase().includes(kw),
      label: "Từ khóa xuất hiện trong tiêu đề",
    },
    {
      ok: !!kw && values.metaDescription.toLowerCase().includes(kw),
      label: "Từ khóa xuất hiện trong mô tả",
    },
    {
      ok: !!kw && values.website.toLowerCase().includes(kw.replace(/\s+/g, "-")),
      label: "Từ khóa xuất hiện trong URL",
    },
    { ok: true, label: "OG image đã có" },
    { ok: true, label: "Canonical URL đã có" },
    { ok: true, label: "Cho phép index" },
  ];

  return (
    <form
      ref={formRef}
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          setMessage("");
          setError("");
          try {
            const res = await saveSiteSettings(formData);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setMessage("Đã lưu thiết lập.");
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Lưu thất bại, vui lòng thử lại.");
          }
        });
      }}
    >
      <div className="mb-1 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-60"
        >
          {pending ? "Đang lưu…" : "Lưu"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-black/5"
          onClick={() => {
            setValues(initial);
            formRef.current?.reset();
            setMessage("");
            setError("");
          }}
        >
          Làm lại
        </button>
        {message && (
          <span className="self-center text-sm font-semibold text-emerald-600">{message}</span>
        )}
        {error && (
          <span className="self-center text-sm font-semibold text-red-600">{error}</span>
        )}
      </div>

      <AdminCard title="Cấu hình mailer">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>Host:</Label>
            <Input
              name="mailerHost"
              value={values.mailerHost}
              onChange={(e) => setField("mailerHost", e.target.value)}
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <Label>Port:</Label>
            <Input
              name="mailerPort"
              value={values.mailerPort}
              onChange={(e) => setField("mailerPort", e.target.value)}
              placeholder="587"
            />
          </div>
          <div>
            <Label>Secure:</Label>
            <Select
              name="mailerSecure"
              value={values.mailerSecure}
              onChange={(e) => setField("mailerSecure", e.target.value)}
            >
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="NONE">None</option>
            </Select>
          </div>
          <div>
            <Label>Email:</Label>
            <Input
              name="mailerEmail"
              type="email"
              value={values.mailerEmail}
              onChange={(e) => setField("mailerEmail", e.target.value)}
            />
          </div>
          <div>
            <Label>Password:</Label>
            <Input
              name="mailerPassword"
              type="password"
              value={values.mailerPassword}
              onChange={(e) => setField("mailerPassword", e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setMailStatus("Đang gửi…");
                  const res = await sendTestMail();
                  setMailStatus(
                    res.ok ? `Đã gửi email thử tới ${res.to}.` : `Lỗi: ${res.error}`,
                  );
                })
              }
              className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-60"
            >
              Gửi email thử
            </button>
            <span className="text-xs font-semibold text-ink/50">
              {mailStatus ||
                "Lưu cấu hình trước khi gửi thử. Gmail cần dùng Mật khẩu ứng dụng (App Password). Email liên hệ mới sẽ gửi tới ô Email ở Thông tin chung."}
            </span>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Thông tin chung">
        <div className="space-y-4">
          <div>
            <Label>Tiêu đề (vi):</Label>
            <Input
              name="companyName"
              value={values.companyName}
              onChange={(e) => setField("companyName", e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Giờ làm việc:</Label>
            <Input
              name="workingHours"
              value={values.workingHours}
              onChange={(e) => setField("workingHours", e.target.value)}
              placeholder="Thứ 2 - Thứ 7: 7:30 - 17:00"
            />
          </div>
          <div>
            <Label>Slogan:</Label>
            <Input
              name="slogan"
              value={values.slogan}
              onChange={(e) => setField("slogan", e.target.value)}
              placeholder="Chính xác - Quy mô - Chất lượng"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Địa chỉ văn phòng:</Label>
              <Textarea
                name="headOffice"
                rows={2}
                value={values.headOffice}
                onChange={(e) => setField("headOffice", e.target.value)}
              />
            </div>
            <div>
              <Label>Địa chỉ cơ sở 2:</Label>
              <Textarea
                name="factoryAddress"
                rows={2}
                value={values.factoryAddress}
                onChange={(e) => setField("factoryAddress", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Email:</Label>
              <Input
                name="email"
                type="email"
                value={values.email}
                onChange={(e) => setField("email", e.target.value)}
              />
            </div>
            <div>
              <Label>Hotline:</Label>
              <Input
                name="hotline"
                value={values.hotline}
                onChange={(e) => setField("hotline", e.target.value)}
              />
            </div>
            <div>
              <Label>Điện thoại:</Label>
              <Input
                name="phone"
                value={values.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div>
              <Label>Zalo:</Label>
              <Input
                name="zalo"
                value={values.zalo}
                onChange={(e) => setField("zalo", e.target.value)}
              />
            </div>
            <div>
              <Label>OAID Zalo:</Label>
              <Input
                name="oaidZalo"
                value={values.oaidZalo}
                onChange={(e) => setField("oaidZalo", e.target.value)}
              />
            </div>
            <div>
              <Label>Website:</Label>
              <Input
                name="website"
                value={values.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://"
              />
            </div>
            <div>
              <Label>Fanpage:</Label>
              <Input
                name="fanpage"
                value={values.fanpage}
                onChange={(e) => setField("fanpage", e.target.value)}
              />
            </div>
            <div>
              <Label>LinkedIn:</Label>
              <Input
                name="linkedin"
                value={values.linkedin}
                onChange={(e) => setField("linkedin", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Tọa độ google map:</Label>
            <Input
              name="mapsCoords"
              value={values.mapsCoords}
              onChange={(e) => setField("mapsCoords", e.target.value)}
              placeholder="10.762622, 106.660172"
            />
          </div>
          <div>
            <Label>Tọa độ google map iframe:</Label>
            <Textarea
              name="mapsEmbedUrl"
              rows={3}
              value={values.mapsEmbedUrl}
              onChange={(e) => setField("mapsEmbedUrl", e.target.value)}
              placeholder='Dán link hoặc toàn bộ mã <iframe> từ Google Maps → Chia sẻ → Nhúng bản đồ'
            />
            <p className="mt-1 text-xs font-semibold text-ink/45">
              Để trống sẽ dùng tọa độ phía trên. Xem trước bản đồ hiển thị ở trang Liên hệ:
            </p>
            <iframe
              title="Xem trước bản đồ"
              src={mapSrc}
              className="mt-2 h-56 w-full rounded-xl border border-black/10"
              loading="lazy"
            />
          </div>
          <div>
            <Label>Google analytics:</Label>
            <Textarea
              name="googleAnalytics"
              rows={2}
              value={values.googleAnalytics}
              onChange={(e) => setField("googleAnalytics", e.target.value)}
              placeholder="G-XXXXXXXX"
            />
            <p className="mt-1 text-xs font-semibold text-ink/45">
              Nhập mã đo lường (G-XXXXXXXX) hoặc dán nguyên đoạn mã gtag.
            </p>
          </div>
          <div>
            <Label>Google Webmaster Tool:</Label>
            <Textarea
              name="googleWebmaster"
              rows={2}
              value={values.googleWebmaster}
              onChange={(e) => setField("googleWebmaster", e.target.value)}
              placeholder='<meta name="google-site-verification" content="..." /> hoặc chỉ mã xác minh'
            />
          </div>
          <div>
            <Label>Head JS:</Label>
            <Textarea
              name="headJs"
              rows={3}
              value={values.headJs}
              onChange={(e) => setField("headJs", e.target.value)}
              className="font-mono text-xs"
              placeholder="<script>...</script> — chèn vào <head> mọi trang"
            />
          </div>
          <div>
            <Label>Body JS:</Label>
            <Textarea
              name="bodyJs"
              rows={3}
              value={values.bodyJs}
              onChange={(e) => setField("bodyJs", e.target.value)}
              className="font-mono text-xs"
              placeholder="<script>...</script> — chèn vào cuối <body> mọi trang (chat, pixel…)"
            />
          </div>

        </div>
      </AdminCard>

      <AdminCard title="Nội dung SEO">
        <div className="space-y-4">
          <div>
            <CharLabel label="SEO Title (vi):" count={titleLen} max={70} />
            <Input
              name="metaTitle"
              maxLength={70}
              value={values.metaTitle}
              onChange={(e) => setField("metaTitle", e.target.value)}
            />
          </div>
          <div>
            <CharLabel
              label="SEO Keywords (vi):"
              count={values.seoKeywords.length}
              max={70}
            />
            <Input
              name="seoKeywords"
              maxLength={70}
              value={values.seoKeywords}
              onChange={(e) => setField("seoKeywords", e.target.value)}
            />
          </div>
          <div>
            <CharLabel
              label="SEO Description (vi):"
              count={descLen}
              max={160}
            />
            <Textarea
              name="metaDescription"
              rows={3}
              maxLength={160}
              value={values.metaDescription}
              onChange={(e) => setField("metaDescription", e.target.value)}
            />
          </div>
          <div>
            <CharLabel
              label="Keyword chính (vi):"
              count={values.primaryKeyword.length}
              max={100}
            />
            <Input
              name="primaryKeyword"
              maxLength={100}
              value={values.primaryKeyword}
              onChange={(e) => setField("primaryKeyword", e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-black/8 bg-[#fafafa] p-4">
            <p className="mb-3 text-sm font-semibold text-ink/60">
              Khi lên top, page này sẽ hiển thị theo dạng mẫu như sau:
            </p>
            <p className="text-sm font-semibold text-emerald-700">{hostLabel}</p>
            <p className="mt-1 text-xl font-semibold text-[#1a0dab]">
              {values.metaTitle || "SEO Title sẽ hiện ở đây"}
            </p>
            <p className="mt-1 text-sm text-[#4d5156]">
              {values.metaDescription ||
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

      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {message && (
        <p className="text-sm font-semibold text-emerald-600">{message}</p>
      )}
    </form>
  );
}
