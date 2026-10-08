"use client";

import { useEffect, useRef } from "react";

export function RunningLine({ text }: { text: string }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let last = "";

    const apply = () => {
      const half = el.scrollWidth / 2;
      if (!half) return;
      const px = String(Math.round(half));
      if (px === last) return;
      last = px;
      const seconds = Math.max(half / 85, 12);
      el.style.setProperty("--marquee-shift", `${px}px`);
      el.style.setProperty("--marquee-duration", `${seconds.toFixed(2)}s`);
    };

    apply();
    const fonts = document.fonts?.ready.then(apply);
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
      void fonts;
    };
  }, [text]);

  const phrase = (
    <span className="inline-flex shrink-0 items-center pr-[0.45em] text-[clamp(1.65rem,7vw,2.4rem)] leading-none font-semibold tracking-[-0.04em] whitespace-nowrap text-forest/25 md:text-[clamp(2.75rem,8vw,6.5rem)] md:leading-[1.05]">
      {text}
    </span>
  );

  return (
    <div
      className="pointer-events-none overflow-hidden pt-1 pb-[max(0.75rem,env(safe-area-inset-bottom))] select-none md:pt-2 md:pb-4"
      aria-hidden
    >
      <div ref={track} className="marquee-run">
        <div className="flex shrink-0">
          {phrase}
          {phrase}
          {phrase}
        </div>
        <div className="flex shrink-0">
          {phrase}
          {phrase}
          {phrase}
        </div>
      </div>
    </div>
  );
}
