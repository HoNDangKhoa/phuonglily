import { Phone } from "lucide-react";

function ZaloMark() {
  return (
    <span className="relative flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-[18px] rounded-bl-[5px] bg-[#0068FF] text-[13px] font-extrabold tracking-tight text-white shadow-[0_12px_28px_-12px_rgba(0,104,255,0.95)]">
      Zalo
      <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#22c55e] shadow-sm" />
    </span>
  );
}

export function ContactDock({ phone, zalo }: { phone: string; zalo: string }) {
  const tel = phone.replace(/[^\d+]/g, "");
  const zaloRaw = zalo.trim();
  const zaloHref = !zaloRaw
    ? ""
    : /^https?:\/\//i.test(zaloRaw)
      ? zaloRaw
      : `https://zalo.me/${zaloRaw.replace(/\D/g, "") || tel.replace(/\D/g, "")}`;
  if (!tel && !zaloHref) return null;

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-3 z-40 flex flex-col gap-3 md:top-1/2 md:bottom-auto md:left-4 md:-translate-y-1/2 md:gap-4">
      {zaloHref && (
        <a
          href={zaloHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat Zalo"
          className="dock-btn text-[#0068FF]"
        >
          <span className="dock-ring border-[#0068FF]" />
          <span className="dock-ring dock-ring-delay border-[#0068FF]" />
          <ZaloMark />
        </a>
      )}
      {tel && (
        <a
          href={`tel:${tel}`}
          aria-label="Gọi hotline"
          className="dock-btn bg-[#f5a524] text-white shadow-[0_10px_24px_-10px_rgba(245,165,36,0.95)]"
        >
          <span className="dock-ring border-[#f5a524]" />
          <span className="dock-ring dock-ring-delay border-[#f5a524]" />
          <Phone size={22} className="dock-phone" strokeWidth={2.2} />
        </a>
      )}
    </div>
  );
}
