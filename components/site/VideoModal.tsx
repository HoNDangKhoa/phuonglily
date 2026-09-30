"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toEmbedUrl } from "@/lib/branding";

export function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const embed = toEmbedUrl(url);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="animate-fade-up fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm [animation-duration:0.5s]"
      onClick={onClose}
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Đóng video"
        onClick={onClose}
        className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition hover:rotate-90 hover:bg-white/25"
      >
        <X size={22} />
      </button>
      <div
        className="aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {embed ? (
          <iframe
            src={embed}
            title="Video giới thiệu"
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video src={url} controls autoPlay playsInline className="h-full w-full" />
        )}
      </div>
    </div>,
    document.body,
  );
}
