"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-ink">Thao tác chưa thực hiện được</p>
      <p className="mt-2 text-sm text-ink/60">
        Có thể phiên đăng nhập đã hết hạn hoặc kết nối bị gián đoạn. Dữ liệu chưa
        lưu có thể cần nhập lại.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-[#3f7d3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6230]"
        >
          Thử lại
        </button>
        <a
          href="/login?callbackUrl=/admin"
          className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-ink/70 hover:bg-black/5"
        >
          Đăng nhập lại
        </a>
      </div>
    </div>
  );
}
