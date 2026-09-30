"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminCard } from "@/components/admin/AdminChrome";
import { deleteSubscribers, toggleSubscriber } from "@/lib/actions";
import { cn } from "@/lib/utils";

type Row = { id: string; email: string; isActive: boolean; createdAt: string };

export function NewsletterTable({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return key ? initial.filter((r) => r.email.includes(key)) : initial;
  }, [initial, q]);

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
      router.refresh();
    });
  }

  function exportCsv() {
    const lines = ["Email,Trạng thái,Ngày đăng ký", ...filtered.map((r) =>
      [r.email, r.isActive ? "active" : "inactive", r.createdAt].join(","),
    )];
    const url = URL.createObjectURL(
      new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!selected.length || pending}
          onClick={() => {
            if (!confirm(`Xóa ${selected.length} email?`)) return;
            run(async () => {
              await deleteSubscribers(selected);
              setSelected([]);
            });
          }}
          className={cn(
            "rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
            selected.length ? "bg-[#f87171] hover:bg-[#ef4444]" : "cursor-not-allowed bg-[#f8b4b4]/70",
          )}
        >
          Xóa tất cả
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-black/5"
        >
          Xuất CSV
        </button>
        <span className="text-sm font-semibold text-ink/50">{initial.length} email</span>
      </div>
      <AdminCard title="Danh sách email">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm nhanh"
          className="mb-4 w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#3f7d3a]"
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[#f3f4f6] text-xs font-semibold text-ink/60 uppercase">
              <tr>
                <th className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selected.length === filtered.length}
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((r) => r.id) : [])}
                  />
                </th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Ngày đăng ký</th>
                <th className="px-3 py-3">Nhận tin</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                        )
                      }
                    />
                  </td>
                  <td className="px-3 py-3 font-semibold">{r.email}</td>
                  <td className="px-3 py-3 text-ink/60">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={r.isActive}
                      onClick={() => run(() => toggleSubscriber(r.id, !r.isActive))}
                      className={cn(
                        "relative h-6 w-11 rounded-full transition",
                        r.isActive ? "bg-[#3f7d3a]" : "bg-black/15",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                          r.isActive && "translate-x-5",
                        )}
                      />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-sm font-semibold text-ink/45">
                    Chưa có email đăng ký.
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
