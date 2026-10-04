"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminChrome";
import {
  FormSaveBar,
  ImageDropzone,
  VisibilitySwitch,
} from "@/components/admin/BrandAssetForm";
import { Input, Label } from "@/components/ui/input";
import {
  saveSlideshowItems,
  saveSocialFooterItems,
} from "@/lib/actions";
import type { MediaListItem } from "@/lib/branding";
import { newMediaItem } from "@/lib/branding";
import { cn } from "@/lib/utils";

export function MediaListManager({
  title,
  kind,
  initial,
}: {
  title: string;
  kind: "slideshow" | "social";
  initial: MediaListItem[];
}) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<MediaListItem | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    const list = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    if (!key) return list;
    return list.filter(
      (i) =>
        i.title.toLowerCase().includes(key) ||
        i.link.toLowerCase().includes(key),
    );
  }, [items, q]);

  function persist(next: MediaListItem[]) {
    setItems(next);
    startTransition(async () => {
      setMessage("");
      if (kind === "slideshow") await saveSlideshowItems(next);
      else await saveSocialFooterItems(next);
      setMessage("Đã lưu.");
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230]"
          onClick={() =>
            setEditing(
              newMediaItem({ sortOrder: items.length }),
            )
          }
        >
          + Thêm mới
        </button>
        <button
          type="button"
          disabled={!selected.length}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
            selected.length
              ? "bg-[#f87171] hover:bg-[#ef4444]"
              : "cursor-not-allowed bg-[#f8b4b4]/70",
          )}
          onClick={() => {
            if (!confirm(`Xóa ${selected.length} mục?`)) return;
            persist(items.filter((i) => !selected.includes(i.id)));
            setSelected([]);
          }}
        >
          Xóa tất cả
        </button>
        {message && (
          <span className="self-center text-sm font-semibold text-emerald-600">
            {message}
          </span>
        )}
        {pending && (
          <span className="self-center text-sm font-semibold text-ink/40">
            Đang lưu…
          </span>
        )}
      </div>

      {editing && (
        <AdminCard
          title={items.some((i) => i.id === editing.id) ? "Sửa mục" : "Thêm mới"}
          className="mb-4"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editing.imageUrl.trim()) {
                setMessage("Vui lòng thêm ảnh trước khi lưu.");
                return;
              }
              const exists = items.some((i) => i.id === editing.id);
              const next = exists
                ? items.map((i) => (i.id === editing.id ? editing : i))
                : [...items, editing];
              persist(next);
              setEditing(null);
            }}
          >
            <FormSaveBar
              onReset={() => setEditing(null)}
              saving={pending}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tiêu đề</Label>
                <Input
                  value={editing.title}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Link</Label>
                <Input
                  value={editing.link}
                  onChange={(e) =>
                    setEditing({ ...editing, link: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Số thứ tự</Label>
                <Input
                  type="number"
                  value={editing.sortOrder}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      sortOrder: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-end">
                <VisibilitySwitch
                  checked={editing.isVisible}
                  onChange={(v) => setEditing({ ...editing, isVisible: v })}
                />
              </div>
            </div>
            <ImageDropzone
              value={editing.imageUrl}
              onChange={(url) => setEditing({ ...editing, imageUrl: url })}
              {...(kind === "slideshow"
                ? {
                    accept: "image/*,video/mp4,video/webm",
                    hint: "Thiết kế đúng 1920 × 1080 px. Ảnh jpg, png, webp hoặc video mp4, webm.",
                  }
                : { hint: "Thiết kế đúng 64 × 64 px. Ảnh png nền trong suốt." })}
            />
          </form>
        </AdminCard>
      )}

      <AdminCard title={`Danh sách ${title}`}>
        <div className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm nhanh"
            className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#3f7d3a]"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f3f4f6] text-xs font-semibold text-ink/60 uppercase">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selected.length === filtered.length
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? filtered.map((i) => i.id) : [],
                      )
                    }
                  />
                </th>
                <th className="px-3 py-3">STT</th>
                <th className="px-3 py-3">Hình</th>
                <th className="px-3 py-3">Tiêu đề</th>
                <th className="px-3 py-3">Link</th>
                <th className="px-3 py-3">Hiển thị</th>
                <th className="px-3 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-t border-black/5">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, row.id]
                            : prev.filter((id) => id !== row.id),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      className="w-14 rounded-lg border border-black/10 px-2 py-1 text-center font-semibold"
                      defaultValue={row.sortOrder}
                      onBlur={(e) => {
                        const next = Number(e.target.value) || 0;
                        if (next === row.sortOrder) return;
                        persist(
                          items.map((i) =>
                            i.id === row.id ? { ...i, sortOrder: next } : i,
                          ),
                        );
                      }}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-black/5">
                      {/\.(mp4|webm|ogg)(\?|#|$)/i.test(row.imageUrl) ? (
                        <video
                          src={row.imageUrl}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                      ) : row.imageUrl ? (
                        <Image
                          src={row.imageUrl}
                          alt={row.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold">{row.title || "—"}</td>
                  <td className="px-3 py-3 text-xs font-semibold text-ink/50">
                    {row.link || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.isVisible}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition",
                        row.isVisible ? "bg-[#3f7d3a]" : "bg-black/15",
                      )}
                      onClick={() =>
                        persist(
                          items.map((i) =>
                            i.id === row.id
                              ? { ...i, isVisible: !i.isVisible }
                              : i,
                          ),
                        )
                      }
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                          row.isVisible && "translate-x-5",
                        )}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold"
                        onClick={() => setEditing(row)}
                      >
                        <Pencil size={14} /> Sửa
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600"
                        onClick={() => {
                          if (!confirm("Xóa mục này?")) return;
                          persist(items.filter((i) => i.id !== row.id));
                        }}
                      >
                        <Trash2 size={14} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-10 text-center text-sm font-semibold text-ink/45"
                  >
                    Chưa có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
