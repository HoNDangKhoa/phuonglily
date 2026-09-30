"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AdminCard } from "@/components/admin/AdminChrome";
import { Input } from "@/components/ui/input";
import { deleteCategory, saveCategory } from "@/lib/actions";
import { POST_TYPES, POST_TYPE_LABEL } from "@/lib/cms";

type Row = {
  id: string;
  name: string;
  slug: string;
  type: string;
  postCount: number;
};

const TYPE_OPTIONS = POST_TYPES.map((value) => ({ value, label: POST_TYPE_LABEL[value] }));

const selectClass =
  "h-10 rounded-lg border border-black/10 bg-white px-3 text-sm";

export function CategoryManager({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [draft, setDraft] = useState<{ name: string; type: string }>({ name: "", type: "BLOG" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setRows(initial);
  }

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    startTransition(async () => {
      setMessage("");
      setError("");
      try {
        const res = await task();
        if (!res.ok) {
          setError(res.error || "Không lưu được.");
          return;
        }
        setMessage(done);
        router.refresh();
      } catch {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    });

  const update = (id: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-4">
      <AdminCard title="Thêm danh mục">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const res = await saveCategory(draft);
              if (res.ok) setDraft({ name: "", type: draft.type });
              return res;
            }, "Đã thêm danh mục.");
          }}
        >
          <Input
            className="max-w-sm"
            placeholder="Tên danh mục"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
          <select
            className={selectClass}
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value })}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending || !draft.name.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#3f7d3a] px-4 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-50"
          >
            <Plus size={16} />
            Thêm
          </button>
        </form>
      </AdminCard>

      {(message || error || pending) && (
        <p
          className={
            error
              ? "text-sm font-semibold text-red-600"
              : "text-sm font-semibold text-emerald-600"
          }
        >
          {pending ? "Đang lưu…" : error || message}
        </p>
      )}

      <AdminCard title="Danh sách danh mục">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#f3f4f6] text-xs font-semibold text-ink/60 uppercase">
              <tr>
                <th className="px-3 py-3">STT</th>
                <th className="px-3 py-3">Tên</th>
                <th className="px-3 py-3">Loại</th>
                <th className="px-3 py-3">Số bài</th>
                <th className="px-3 py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className="border-t border-black/5">
                  <td className="px-3 py-3 font-semibold">{i + 1}</td>
                  <td className="px-3 py-3">
                    <Input
                      value={row.name}
                      onChange={(e) => update(row.id, { name: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-ink/45">/{row.slug}</p>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className={selectClass}
                      value={row.type}
                      onChange={(e) => update(row.id, { type: e.target.value })}
                    >
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">{row.postCount}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-2.5 py-1.5 text-xs font-semibold text-ink/70 hover:bg-black/5"
                        onClick={() =>
                          run(
                            () =>
                              saveCategory({
                                id: row.id,
                                name: row.name,
                                type: row.type,
                              }),
                            "Đã lưu danh mục.",
                          )
                        }
                      >
                        <Save size={14} />
                        Lưu
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        onClick={() => {
                          const warn = row.postCount
                            ? ` ${row.postCount} bài viết sẽ được bỏ khỏi danh mục này.`
                            : "";
                          if (!confirm(`Xóa danh mục "${row.name}"?${warn}`)) return;
                          run(() => deleteCategory(row.id), "Đã xóa danh mục.");
                        }}
                      >
                        <Trash2 size={14} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-ink/45">
                    Chưa có danh mục.
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
