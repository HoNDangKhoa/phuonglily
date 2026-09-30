"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, Upload } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminChrome";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { PACKAGE_BADGES, badgeClass, formatVnd } from "@/lib/learning";
import {
  type LessonInput,
  type PackageInput,
  saveCoursePackages,
  saveLessons,
} from "@/lib/learning-admin-actions";
import { uploadAsset } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

const uid = () => `new_${Math.random().toString(36).slice(2, 9)}`;

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function SaveRow({
  pending,
  message,
  onSave,
  label,
}: {
  pending: boolean;
  message: string;
  onSave: () => void;
  label: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-black/5 pt-4">
      <button
        type="button"
        disabled={pending}
        onClick={onSave}
        className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-60"
      >
        {pending ? "Đang lưu…" : label}
      </button>
      {message && (
        <span className={cn("text-sm font-semibold", message.startsWith("Lỗi") ? "text-red-600" : "text-emerald-600")}>
          {message}
        </span>
      )}
    </div>
  );
}

function RowActions({
  onUp,
  onDown,
  onRemove,
}: {
  onUp: () => void;
  onDown: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onUp} className="rounded-lg p-1.5 text-ink/50 hover:bg-black/5" aria-label="Lên">
        <ArrowUp size={15} />
      </button>
      <button type="button" onClick={onDown} className="rounded-lg p-1.5 text-ink/50 hover:bg-black/5" aria-label="Xuống">
        <ArrowDown size={15} />
      </button>
      <button type="button" onClick={onRemove} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" aria-label="Xoá">
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function PackagesEditor({ postId, initial }: { postId: string; initial: PackageInput[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<PackageInput>) =>
    setItems((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  return (
    <AdminCard title="Gói học & học phí">
      <p className="mb-4 text-sm text-ink/55">
        Hiển thị ở khung đăng ký bên phải trang chi tiết. Gói có học phí 0đ sẽ được kích hoạt ngay khi học viên đăng ký.
      </p>
      <div className="space-y-3">
        {items.map((pkg, i) => (
          <div key={pkg.id} className="rounded-xl border border-black/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold uppercase", badgeClass(pkg.badge))}>
                {pkg.name || "Gói mới"}
              </span>
              <RowActions
                onUp={() => setItems((l) => move(l, i, i - 1))}
                onDown={() => setItems((l) => move(l, i, i + 1))}
                onRemove={() => setItems((l) => l.filter((_, idx) => idx !== i))}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div>
                <Label>Tên gói</Label>
                <Input value={pkg.name} placeholder="Basic" onChange={(e) => update(i, { name: e.target.value })} />
              </div>
              <div>
                <Label>Màu nhãn</Label>
                <Select value={pkg.badge} onChange={(e) => update(i, { badge: e.target.value })}>
                  {Object.entries(PACKAGE_BADGES).map(([key, b]) => (
                    <option key={key} value={key}>
                      {b.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="xl:col-span-1">
                <Label>Học phí (đ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={pkg.price}
                  onChange={(e) => update(i, { price: Number(e.target.value) })}
                />
                <p className="mt-1 text-xs text-ink/45">{formatVnd(pkg.price)}</p>
              </div>
              <div>
                <Label>Giá gốc (đ)</Label>
                <Input
                  type="number"
                  min={0}
                  value={pkg.oldPrice ?? ""}
                  onChange={(e) => update(i, { oldPrice: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div>
                <Label>Mô tả ngắn</Label>
                <Input value={pkg.description} placeholder="Tặng giáo trình" onChange={(e) => update(i, { description: e.target.value })} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setItems((l) => [...l, { id: uid(), name: "", badge: "leaf", description: "", price: 0, oldPrice: null }])
        }
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-black/20 px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-black/5"
      >
        <Plus size={15} /> Thêm gói
      </button>
      <SaveRow
        pending={pending}
        message={message}
        label="Lưu gói học"
        onSave={() =>
          startTransition(async () => {
            setMessage("");
            try {
              await saveCoursePackages(postId, items);
              setMessage("Đã lưu gói học.");
              router.refresh();
            } catch {
              setMessage("Lỗi: không lưu được gói học.");
            }
          })
        }
      />
    </AdminCard>
  );
}

export function LessonsEditor({ postId, initial }: { postId: string; initial: LessonInput[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<LessonInput>) =>
    setItems((list) => list.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <AdminCard title={`Bài học video (${items.length})`}>
      <p className="mb-4 text-sm text-ink/55">
        Các bài cùng tên chương sẽ được gộp nhóm. Video hỗ trợ link YouTube, Vimeo hoặc file .mp4 (tải lên ở Thư viện media rồi dán link).
        Bài đánh dấu “Học thử” xem được khi chưa đăng ký.
      </p>
      <div className="space-y-2">
        {items.map((lesson, i) => {
          const open = openId === lesson.id;
          return (
            <div key={lesson.id} className="rounded-xl border border-black/10">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-sm font-semibold text-ink/40">{i + 1}</span>
                <button type="button" onClick={() => setOpenId(open ? null : lesson.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold">{lesson.title || "Bài học mới"}</span>
                  <span className="block truncate text-xs text-ink/50">
                    {lesson.chapter || "Chưa có chương"}
                    {lesson.duration ? ` · ${lesson.duration}` : ""}
                    {lesson.isPreview ? " · Học thử" : ""}
                    {!lesson.videoUrl ? " · Chưa có video" : ""}
                  </span>
                </button>
                <RowActions
                  onUp={() => setItems((l) => move(l, i, i - 1))}
                  onDown={() => setItems((l) => move(l, i, i + 1))}
                  onRemove={() => setItems((l) => l.filter((_, idx) => idx !== i))}
                />
              </div>
              {open && (
                <div className="grid gap-3 border-t border-black/5 p-4 md:grid-cols-2">
                  <div>
                    <Label>Tên chương</Label>
                    <Input value={lesson.chapter} placeholder="Chương 1: Nền tảng" onChange={(e) => update(i, { chapter: e.target.value })} />
                  </div>
                  <div>
                    <Label>Tên bài học</Label>
                    <Input value={lesson.title} onChange={(e) => update(i, { title: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Link video</Label>
                    <div className="flex gap-2">
                      <Input value={lesson.videoUrl} placeholder="https://youtu.be/... hoặc https://.../bai-1.mp4" onChange={(e) => update(i, { videoUrl: e.target.value })} />
                      <VideoUploadButton onUploaded={(url) => update(i, { videoUrl: url })} />
                    </div>
                  </div>
                  <div>
                    <Label>Thời lượng</Label>
                    <Input value={lesson.duration} placeholder="12:30" onChange={(e) => update(i, { duration: e.target.value })} />
                  </div>
                  <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-ink/70">
                    <input type="checkbox" checked={lesson.isPreview} onChange={(e) => update(i, { isPreview: e.target.checked })} />
                    Cho phép học thử
                  </label>
                  <div className="md:col-span-2">
                    <Label>Mô tả bài học</Label>
                    <Textarea rows={3} value={lesson.description} onChange={(e) => update(i, { description: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          const id = uid();
          setItems((l) => [
            ...l,
            {
              id,
              chapter: l[l.length - 1]?.chapter ?? "",
              title: "",
              videoUrl: "",
              duration: "",
              description: "",
              isPreview: false,
            },
          ]);
          setOpenId(id);
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-black/20 px-4 py-2 text-sm font-semibold text-ink/70 hover:bg-black/5"
      >
        <Plus size={15} /> Thêm bài học
      </button>
      <SaveRow
        pending={pending}
        message={message}
        label="Lưu bài học"
        onSave={() =>
          startTransition(async () => {
            setMessage("");
            try {
              await saveLessons(postId, items);
              setMessage("Đã lưu bài học.");
              router.refresh();
            } catch {
              setMessage("Lỗi: không lưu được bài học.");
            }
          })
        }
      />
    </AdminCard>
  );
}

function VideoUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="shrink-0">
      <label
        className={cn(
          "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-semibold whitespace-nowrap hover:border-[#3f7d3a]",
          progress !== null && "pointer-events-none opacity-60",
        )}
      >
        <Upload size={15} />
        {progress !== null ? `${Math.round(progress)}%` : "Tải video lên"}
        <input
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setError("");
            setProgress(0);
            try {
              onUploaded(await uploadAsset(file, setProgress));
            } catch (err) {
              setError(err instanceof Error ? err.message : "Tải video thất bại");
            } finally {
              setProgress(null);
            }
          }}
        />
      </label>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
