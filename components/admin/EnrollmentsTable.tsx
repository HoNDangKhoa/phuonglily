"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ENROLLMENT_STATUS, enrollmentStatus, formatVnd } from "@/lib/learning";
import { deleteEnrollment, updateEnrollment } from "@/lib/learning-admin-actions";
import { cn } from "@/lib/utils";

export type EnrollmentRow = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  amount: number;
  packageName: string | null;
  fullName: string;
  phone: string;
  address: string | null;
  note: string | null;
  adminNote: string | null;
  studentEmail: string;
  courseTitle: string;
  courseHref: string;
};

export function EnrollmentsTable({ rows, initialFilter = "ALL" }: { rows: EnrollmentRow[]; initialFilter?: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState(initialFilter);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "ALL" || r.status === filter) &&
        (!q ||
          [r.code, r.fullName, r.phone, r.studentEmail, r.courseTitle].some((v) => v.toLowerCase().includes(q))),
    );
  }, [rows, filter, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const run = (task: () => Promise<unknown>) =>
    startTransition(async () => {
      await task();
      router.refresh();
    });

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[["ALL", "Tất cả"], ...Object.entries(ENROLLMENT_STATUS).map(([k, v]) => [k, v.label])].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-semibold",
              filter === key ? "bg-[#3f7d3a] text-white" : "bg-black/5 text-ink/70 hover:bg-black/10",
            )}
          >
            {label} ({counts[key] ?? 0})
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm mã đơn, tên, SĐT, email, khoá học…"
          className="ml-auto h-10 w-full max-w-xs rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-[#3f7d3a]"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead className="bg-[#f3f4f6] text-xs font-semibold text-ink/60 uppercase">
            <tr>
              <th className="px-3 py-3">Mã đơn</th>
              <th className="px-3 py-3">Học viên</th>
              <th className="px-3 py-3">Khoá học</th>
              <th className="px-3 py-3">Học phí</th>
              <th className="px-3 py-3">Ngày đăng ký</th>
              <th className="px-3 py-3">Trạng thái</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const st = enrollmentStatus(r.status);
              const open = openId === r.id;
              return (
                <Fragment key={r.id}>
                  <tr className="border-t border-black/5 align-top">
                    <td className="px-3 py-3">
                      <button type="button" onClick={() => setOpenId(open ? null : r.id)} className="font-semibold text-[#3f7d3a] hover:underline">
                        #{r.code}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold">{r.fullName}</p>
                      <p className="text-xs text-ink/55">{r.phone}</p>
                      <p className="text-xs text-ink/55">{r.studentEmail}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={r.courseHref} target="_blank" className="font-medium hover:text-[#3f7d3a]">
                        {r.courseTitle}
                      </Link>
                      {r.packageName && <p className="text-xs text-ink/55">Gói {r.packageName}</p>}
                    </td>
                    <td className="px-3 py-3 font-semibold">{formatVnd(r.amount)}</td>
                    <td className="px-3 py-3 text-ink/60">{new Date(r.createdAt).toLocaleString("vi-VN")}</td>
                    <td className="px-3 py-3">
                      <select
                        value={r.status}
                        disabled={pending}
                        onChange={(e) => run(() => updateEnrollment(r.id, { status: e.target.value }))}
                        className={cn("rounded-lg border-0 px-2 py-1.5 text-xs font-semibold", st.tone)}
                      >
                        {Object.entries(ENROLLMENT_STATUS).map(([key, v]) => (
                          <option key={key} value={key}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (confirm(`Xoá đơn #${r.code}? Học viên sẽ mất quyền truy cập khoá học.`)) {
                            run(() => deleteEnrollment(r.id));
                          }
                        }}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                        aria-label="Xoá"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr className="bg-[#f9faf7]">
                      <td colSpan={7} className="px-3 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-1 text-sm">
                            <p><b>Địa chỉ:</b> {r.address || "—"}</p>
                            <p className="whitespace-pre-line"><b>Ghi chú của học viên:</b> {r.note || "—"}</p>
                          </div>
                          <div>
                            <p className="mb-1 text-sm font-semibold">Ghi chú nội bộ</p>
                            <textarea
                              rows={3}
                              defaultValue={r.adminNote ?? ""}
                              onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                              className="w-full rounded-xl border border-black/10 p-2 text-sm outline-none focus:border-[#3f7d3a]"
                            />
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => run(() => updateEnrollment(r.id, { adminNote: notes[r.id] ?? r.adminNote ?? "" }))}
                              className="mt-2 rounded-xl bg-[#3f7d3a] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                              Lưu ghi chú
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!visible.length && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center font-semibold text-ink/45">
                  Chưa có đơn đăng ký.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
