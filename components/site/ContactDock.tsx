import { Phone } from "lucide-react";

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
    <div className="fixed top-1/2 left-3 z-40 flex -translate-y-1/2 flex-col gap-3 md:left-4">
      {zaloHref && (
        <a
          href={zaloHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat Zalo"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-[9px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(0,104,255,0.8)] transition hover:scale-105"
        >
          <span className="text-[11px] leading-none font-bold tracking-tight">Zalo</span>
        </a>
      )}
      {tel && (
        <a
          href={`tel:${tel}`}
          aria-label="Gọi hotline"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5a524] text-white shadow-[0_8px_20px_-8px_rgba(245,165,36,0.9)] transition hover:scale-105"
        >
          <Phone size={20} />
        </a>
      )}
    </div>
  );
}
