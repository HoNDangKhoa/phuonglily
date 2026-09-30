"use client";

import { useRef, useState, useTransition } from "react";
import { AdminCard } from "@/components/admin/AdminChrome";
import { Label } from "@/components/ui/input";
import { saveBrandAsset } from "@/lib/actions";
import { uploadAsset } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

export function FormSaveBar({
  saving,
  onReset,
  message,
}: {
  saving?: boolean;
  onReset: () => void;
  message?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-60"
      >
        {saving ? "Đang lưu…" : "Lưu"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
      >
        Làm lại
      </button>
      {message && (
        <span className="text-sm font-semibold text-emerald-600">{message}</span>
      )}
    </div>
  );
}

export function ImageDropzone({
  value,
  onChange,
  hint = "Width: tự động - Height: tự động (jpg, jpeg, png, gif, webp)",
  accept = "image/*,.ico",
}: {
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  accept?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const isVideo = /\.(mp4|webm|ogg)(\?|$)/i.test(value) || accept.includes("video");

  async function upload(file: File) {
    setUploading(true);
    setProgress(0);
    setError("");
    try {
      onChange(await uploadAsset(file, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#3f7d3a]/50 bg-[#f3f8ee] px-4 py-8 text-center",
        value && "border-solid bg-white",
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) await upload(file);
      }}
    >
      {value ? (
        isVideo && !/\.(mp4|webm|ogg)(\?|$)/i.test(value) &&
        !/\.(jpe?g|png|webp|gif|svg|ico)(\?|$)/i.test(value) ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mb-3 max-w-md truncate rounded-lg bg-black/5 px-3 py-2 text-xs font-semibold text-ink/70"
          >
            Link: {value}
          </a>
        ) : isVideo && /\.(mp4|webm|ogg)(\?|$)/i.test(value) ? (
          <video
            src={value}
            controls
            className="mb-3 max-h-40 rounded-lg"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            className="mb-3 max-h-36 rounded-lg object-contain"
          />
        )
      ) : (
        <>
          <p className="text-sm font-semibold text-ink/60">
            Kéo và thả file vào đây
          </p>
          <p className="my-2 text-xs font-semibold text-ink/40">hoặc</p>
        </>
      )}
      <label className="cursor-pointer rounded-xl bg-[#3f7d3a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f6230]">
        {uploading
          ? `Đang tải… ${progress ? `${Math.round(progress)}%` : ""}`
          : "Chọn file"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await upload(file);
          }}
        />
      </label>
      <input
        className="mt-3 w-full max-w-md rounded-xl border border-black/10 px-3 py-2 text-xs font-semibold outline-none focus:border-[#3f7d3a]"
        placeholder="Hoặc dán URL file"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-3 text-xs font-semibold text-ink/40">{hint}</p>
      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      )}
      {value && (
        <button
          type="button"
          className="mt-2 text-xs font-semibold text-red-600"
          onClick={() => onChange("")}
        >
          Xóa
        </button>
      )}
    </div>
  );
}

export function VisibilitySwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="mb-0">Hiển thị</Label>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          "relative h-7 w-12 rounded-full transition",
          checked ? "bg-[#3f7d3a]" : "bg-black/15",
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition",
            checked && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

export function BrandAssetForm({
  kind,
  title,
  initialUrl,
  initialVisible,
  sizeHint,
}: {
  kind: "logo" | "favicon" | "video";
  title: string;
  initialUrl: string;
  initialVisible: boolean;
  sizeHint?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [visible, setVisible] = useState(initialVisible);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const snap = useRef({ url: initialUrl, visible: initialVisible });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setMessage("");
          await saveBrandAsset(kind, { url, visible });
          snap.current = { url, visible };
          setMessage("Đã lưu.");
        });
      }}
    >
      <FormSaveBar
        saving={pending}
        message={message}
        onReset={() => {
          setUrl(snap.current.url);
          setVisible(snap.current.visible);
          setMessage("");
        }}
      />
      <AdminCard title={title}>
        <ImageDropzone
          value={url}
          onChange={setUrl}
          hint={sizeHint}
          accept={kind === "video" ? "video/mp4,video/webm" : "image/*,.ico"}
        />
        <div className="mt-4 flex justify-end">
          <VisibilitySwitch checked={visible} onChange={setVisible} />
        </div>
      </AdminCard>
    </form>
  );
}
