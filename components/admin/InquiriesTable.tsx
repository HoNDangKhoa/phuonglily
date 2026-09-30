"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge, Input, Select } from "@/components/ui/input";
import { INQUIRY_STATUS_LABEL } from "@/lib/cms";
import { deleteInquiry, updateInquiryStatus } from "@/lib/actions";

type Inquiry = {
  id: string;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string;
  serviceType: string | null;
  message: string;
  attachmentUrl: string | null;
  status: string;
  createdAt: string;
};

export function InquiriesTable({ initial }: { initial: Inquiry[] }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return initial.filter((row) => {
      if (statusFilter !== "ALL" && row.status !== statusFilter) return false;
      const d = new Date(row.createdAt).getTime();
      if (from && d < new Date(from).getTime()) return false;
      if (to && d > new Date(to).getTime() + 86400000) return false;
      return true;
    });
  }, [initial, statusFilter, from, to]);

  function exportCsv() {
    const header = [
      "Ngày",
      "Họ tên",
      "Ghi chú",
      "Email",
      "SĐT",
      "Chương trình",
      "Trạng thái",
      "Nội dung",
    ];
    const lines = filtered.map((r) =>
      [
        new Date(r.createdAt).toISOString(),
        r.fullName,
        r.companyName || "",
        r.email,
        r.phone,
        r.serviceType || "",
        r.status,
        r.message.replace(/\n/g, " "),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `phuonglily-dang-ky-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="mb-1 text-xs text-ink/50">Trạng thái</p>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            {Object.entries(INQUIRY_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="mb-1 text-xs text-ink/50">Từ ngày</p>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <p className="mb-1 text-xs text-ink/50">Đến ngày</p>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button type="button" variant="outline" onClick={exportCsv}>
          Xuất CSV
        </Button>
      </div>

      <div className="overflow-x-auto border border-[var(--line)] bg-paper">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-[var(--line)] bg-mist/50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Ghi chú</th>
              <th className="px-4 py-3">Chương trình</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-[var(--line)] align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{row.fullName}</p>
                  <p className="text-ink/50">{row.email}</p>
                  <p className="text-ink/50">{row.phone}</p>
                  <p className="mt-1 text-xs text-ink/40">
                    {new Date(row.createdAt).toLocaleString("vi-VN")}
                  </p>
                </td>
                <td className="px-4 py-3 text-ink/60">{row.companyName || "—"}</td>
                <td className="px-4 py-3 text-ink/60">{row.serviceType || "—"}</td>
                <td className="px-4 py-3">
                  <Select
                    value={row.status}
                    onChange={async (e) => {
                      await updateInquiryStatus(row.id, e.target.value);
                      router.refresh();
                    }}
                  >
                    {Object.entries(INQUIRY_STATUS_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                  <div className="mt-2">
                    <Badge
                      tone={
                        row.status === "NEW"
                          ? "warn"
                          : row.status === "COMPLETED"
                            ? "success"
                            : "info"
                      }
                    >
                      {INQUIRY_STATUS_LABEL[row.status]}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {row.attachmentUrl ? (
                    <a
                      href={row.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brass underline"
                    >
                      Tải file đính kèm
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <details className="mb-2">
                    <summary className="cursor-pointer text-xs text-ink/60">
                      Xem nội dung
                    </summary>
                    <p className="mt-2 max-w-xs whitespace-pre-wrap text-xs text-ink/70">
                      {row.message}
                    </p>
                  </details>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      if (!confirm("Xoá liên hệ này?")) return;
                      await deleteInquiry(row.id);
                      router.refresh();
                    }}
                  >
                    Xoá
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
