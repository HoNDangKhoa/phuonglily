"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy } from "lucide-react";
import { formatVnd } from "@/lib/learning";

export function SepayQrPay({
  code,
  amount,
  qrUrl,
  bank,
  account,
  holder,
}: {
  code: string;
  amount: number;
  qrUrl: string;
  bank: string;
  account: string;
  holder: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let stopped = false;
    async function tick() {
      try {
        const res = await fetch(`/api/sepay/status?code=${encodeURIComponent(code)}`, { cache: "no-store" });
        const data = (await res.json()) as { status?: string };
        if (!stopped && data.status === "ACTIVE") {
          setPaid(true);
          router.refresh();
          return;
        }
      } catch {
        // Giữ vòng chờ; webhook vẫn kích hoạt đơn khi tiền vào.
      }
      if (!stopped) window.setTimeout(tick, 4000);
    }
    const timer = window.setTimeout(tick, 4000);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [code, router]);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setCopied("");
    }
  }

  if (paid) {
    return (
      <div className="mt-6 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
        <p>Đã nhận thanh toán. Khoá học được kích hoạt, bạn có thể vào học.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-5 border-t border-forest/10 pt-6 sm:grid-cols-[220px_1fr]">
      <img src={qrUrl} alt={`Mã QR thanh toán đơn ${code}`} width={220} height={220} className="mx-auto rounded-2xl bg-white" />
      <div className="text-sm text-forest">
        <p className="font-medium">Quét mã QR để thanh toán {formatVnd(amount)}</p>
        <p className="mt-1 text-forest/65">
          Mở app ngân hàng, quét mã. Số tiền và nội dung chuyển khoản được điền sẵn. Đơn chuyển sang “Đang học” ngay khi SePay nhận tiền.
        </p>
        <dl className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-forest/55">Ngân hàng</dt>
            <dd className="font-medium">{bank}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-forest/55">Số tài khoản</dt>
            <dd className="font-medium">
              <button type="button" className="inline-flex items-center gap-1 hover:text-leaf" onClick={() => copy(account, "stk")}>
                {account} <Copy size={13} />
              </button>
            </dd>
          </div>
          {holder ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-forest/55">Chủ tài khoản</dt>
              <dd className="text-right font-medium">{holder}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <dt className="text-forest/55">Số tiền</dt>
            <dd className="font-medium">{formatVnd(amount)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-forest/55">Nội dung</dt>
            <dd>
              <button type="button" className="inline-flex items-center gap-1 font-semibold text-leaf" onClick={() => copy(code, "code")}>
                {code} <Copy size={13} />
              </button>
            </dd>
          </div>
        </dl>
        {copied ? <p className="mt-2 text-xs text-leaf">Đã sao chép {copied === "stk" ? "số tài khoản" : "nội dung"}.</p> : null}
      </div>
    </div>
  );
}
