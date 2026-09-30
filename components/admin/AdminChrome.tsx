import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  icon,
  actions,
}: {
  title: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3f7d3a] text-white">
            {icon}
          </div>
        )}
        <h1 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
      </div>
      {actions}
    </div>
  );
}

export function ContentToolbar({
  createHref,
  createLabel = "Thêm mới",
  searchPlaceholder = "Tìm kiếm nhanh",
  searchValue,
  onSearchChange,
  onDeleteSelected,
  deleteDisabled,
}: {
  createHref?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onDeleteSelected?: () => void;
  deleteDisabled?: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {createHref && (
        <Link
          href={createHref}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230]"
        >
          <Plus size={16} />
          {createLabel}
        </Link>
      )}
      {onDeleteSelected && (
        <button
          type="button"
          disabled={deleteDisabled}
          onClick={onDeleteSelected}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white",
            deleteDisabled
              ? "cursor-not-allowed bg-[#f8b4b4]/70"
              : "bg-[#f87171] hover:bg-[#ef4444]",
          )}
        >
          <Trash2 size={16} />
          Xóa tất cả
        </button>
      )}
      {onSearchChange && (
        <div className="ml-auto min-w-[220px] flex-1 md:max-w-sm">
          <input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#3f7d3a]"
          />
        </div>
      )}
    </div>
  );
}

export function AdminCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/8 bg-white p-4 shadow-sm md:p-5",
        className,
      )}
    >
      {title && (
        <div className="mb-4 flex items-center gap-2 border-b border-black/5 pb-3">
          <span className="flex h-5 w-5 items-center justify-center text-[#3f7d3a]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <rect y="1" width="14" height="2" rx="1" />
              <rect y="6" width="14" height="2" rx="1" />
              <rect y="11" width="14" height="2" rx="1" />
            </svg>
          </span>
          <h2 className="text-sm font-semibold text-ink md:text-base">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
}

export function FormActionBar({
  onSave,
  onSaveStay,
  onReset,
  onExit,
  saving,
}: {
  onSave: () => void;
  onSaveStay: () => void;
  onReset: () => void;
  onExit: () => void;
  saving?: boolean;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230] disabled:opacity-60"
      >
        {saving ? "Đang lưu…" : "Lưu"}
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={onSaveStay}
        className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
      >
        Lưu tại trang
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-black/5"
      >
        Làm lại
      </button>
      <button
        type="button"
        onClick={onExit}
        className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
      >
        Thoát
      </button>
    </div>
  );
}
