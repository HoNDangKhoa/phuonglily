"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, FileText, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminChrome";
import { deleteMedia, type MediaItem } from "@/lib/media-actions";
import { uploadAsset } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

type Kind = "all" | "image" | "video" | "file";

const kindOf = (name: string): Exclude<Kind, "all"> =>
  /\.(jpe?g|png|webp|gif|svg|ico)$/i.test(name)
    ? "image"
    : /\.(mp4|webm|ogg)$/i.test(name)
      ? "video"
      : "file";

const KIND_LABEL: Record<Kind, string> = {
  all: "Tất cả",
  image: "Hình ảnh",
  video: "Video",
  file: "Tài liệu",
};

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [queue, setQueue] = useState<{ name: string; progress: number }[]>([]);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [pending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (m) =>
        (kind === "all" || kindOf(m.name) === kind) &&
        (!q || m.name.toLowerCase().includes(q)),
    );
  }, [items, kind, query]);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setError("");
    setQueue(files.map((f) => ({ name: f.name, progress: 0 })));
    const failed: string[] = [];
    for (const [i, file] of files.entries()) {
      try {
        await uploadAsset(file, (progress) =>
          setQueue((q) => q.map((x, j) => (j === i ? { ...x, progress } : x))),
        );
        setQueue((q) => q.map((x, j) => (j === i ? { ...x, progress: 100 } : x)));
      } catch (e) {
        failed.push(`${file.name}: ${e instanceof Error ? e.message : "lỗi"}`);
      }
    }
    setQueue([]);
    if (failed.length) setError(failed.join(" · "));
    router.refresh();
  }

  function remove(urls: string[]) {
    if (!confirm(`Xóa ${urls.length} file? Nội dung đang dùng file này sẽ mất ảnh.`)) return;
    startTransition(async () => {
      await deleteMedia(urls);
      setSelected((s) => s.filter((u) => !urls.includes(u)));
      router.refresh();
    });
  }

  async function copy(url: string) {
    const full = url.startsWith("/") ? `${location.origin}${url}` : url;
    await navigator.clipboard.writeText(full).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230]">
          + Tải file lên
          <input
            type="file"
            multiple
            accept="image/*,.ico,video/mp4,video/webm,.pdf,.zip"
            className="hidden"
            onChange={(e) => {
              void uploadFiles(Array.from(e.target.files ?? []));
              e.target.value = "";
            }}
          />
        </label>
        <button
          type="button"
          disabled={!selected.length || pending}
          onClick={() => remove(selected)}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
            !selected.length
              ? "cursor-not-allowed bg-[#f8b4b4]/70"
              : "bg-[#f87171] hover:bg-[#ef4444]",
          )}
        >
          Xóa đã chọn
        </button>
      </div>

      <div
        className="mb-5 rounded-2xl border-2 border-dashed border-[#3f7d3a]/50 bg-[#f3f8ee] px-4 py-8 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void uploadFiles(Array.from(e.dataTransfer.files ?? []));
        }}
      >
        <p className="text-sm font-semibold text-ink/60">
          Kéo và thả nhiều file vào đây để tải lên
        </p>
        <p className="mt-1 text-xs font-semibold text-ink/40">
          Hình ảnh (jpg, png, webp, gif, svg, ico) · Video (mp4, webm) · Tài liệu
          (pdf, zip) — tối đa 200MB/file
        </p>
        {queue.length > 0 && (
          <div className="mx-auto mt-4 max-w-md space-y-2 text-left">
            {queue.map((f) => (
              <div key={f.name}>
                <div className="flex justify-between text-xs font-semibold text-ink/60">
                  <span className="truncate">{f.name}</span>
                  <span>{Math.round(f.progress)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full bg-[#3f7d3a] transition-[width]"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600">{error}</p>
        )}
      </div>

      <AdminCard title={`Thư viện media (${items.length})`}>
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm nhanh"
            className="min-w-[220px] flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#3f7d3a]"
          />
          <div className="flex flex-wrap gap-2">
            {(Object.keys(KIND_LABEL) as Kind[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold",
                  kind === k
                    ? "border-[#3f7d3a] bg-[#3f7d3a] text-white"
                    : "border-black/10 bg-white hover:bg-black/5",
                )}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm font-semibold text-ink/45">
            Chưa có dữ liệu.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {rows.map((m) => {
              const type = kindOf(m.name);
              const checked = selected.includes(m.url);
              return (
                <div
                  key={m.url}
                  className={cn(
                    "group overflow-hidden rounded-xl border bg-white",
                    checked ? "border-[#3f7d3a] ring-2 ring-[#3f7d3a]/30" : "border-black/10",
                  )}
                >
                  <div className="relative aspect-[4/3] bg-[#f3f4f6]">
                    {type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.url}
                        alt={m.name}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : type === "video" ? (
                      <video
                        src={m.url}
                        muted
                        controls
                        preload="metadata"
                        className="h-full w-full bg-black object-contain"
                      />
                    ) : (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-full flex-col items-center justify-center gap-2 text-ink/50"
                      >
                        <FileText size={36} />
                        <span className="text-xs font-semibold uppercase">
                          {m.name.split(".").pop()}
                        </span>
                      </a>
                    )}
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${m.name}`}
                      checked={checked}
                      onChange={(e) =>
                        setSelected((s) =>
                          e.target.checked ? [...s, m.url] : s.filter((u) => u !== m.url),
                        )
                      }
                      className="absolute top-2 left-2 h-4 w-4"
                    />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs font-semibold text-ink" title={m.name}>
                      {m.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-ink/40">
                      {formatSize(m.size)} ·{" "}
                      {new Date(m.uploadedAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy(m.url)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-black/10 px-2 py-1.5 text-xs font-semibold hover:bg-black/5"
                      >
                        {copied === m.url ? <Check size={14} /> : <Copy size={14} />}
                        {copied === m.url ? "Đã chép" : "Chép link"}
                      </button>
                      <button
                        type="button"
                        aria-label="Xóa"
                        disabled={pending}
                        onClick={() => remove([m.url])}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 px-2 py-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
