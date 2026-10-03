"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { RollButton, RollText } from "@/components/site/Buttons";
import { VideoModal } from "@/components/site/VideoModal";
import { isVideoUrl, type MediaListItem } from "@/lib/branding";
import type { HeroContent } from "@/lib/home-content";
import { cn } from "@/lib/utils";

const SLIDE_MS = 6500;

export function HeroSection({
  hero,
  slides,
  videoUrl,
}: {
  hero: HeroContent;
  slides: MediaListItem[];
  videoUrl: string;
}) {
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const count = slides.length;

  const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count]);

  useEffect(() => {
    if (count < 2) return;
    const t = setTimeout(next, SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, count, next]);

  const lines = hero.heading.split("\n").filter(Boolean);

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-forest text-white">
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              active ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
            aria-hidden={!active}
          >
            {isVideoUrl(slide.imageUrl) ? (
              <video
                src={slide.imageUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div key={active ? `on-${index}` : "off"} className={cn("absolute inset-0", active && "kenburns")}>
                <Image
                  src={slide.imageUrl}
                  alt={slide.title || "Phương Lily Academy"}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        );
      })}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/30 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-black/20 to-transparent" />

      <div className="relative z-30 mx-auto flex h-full w-full max-w-[1440px] flex-col justify-end px-5 pb-24 md:px-10 md:pb-28 lg:px-16">
        <h1 className="max-w-[14ch] text-[clamp(2.6rem,4.7vw,4.35rem)] leading-[1.14] font-normal tracking-[-0.02em]">
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-[0.06em]">
              <span
                className="animate-fade-up block"
                style={{ animationDelay: `${150 + i * 120}ms` }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p
          className="animate-fade-up mt-5 max-w-md text-sm leading-relaxed text-white/90 md:text-[15px]"
          style={{ animationDelay: "550ms" }}
        >
          {hero.description}
        </p>
        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "700ms" }}
        >
          <RollButton label={hero.primaryLabel} href={hero.primaryHref || "/khoa-hoc"} />
          <button
            type="button"
            onClick={() => videoUrl && setShowVideo(true)}
            disabled={!videoUrl}
            title={videoUrl ? undefined : "Chưa có video — thêm tại Admin › Video giới thiệu"}
            className="inline-flex h-12 items-center rounded-full border border-white/45 bg-white/15 px-6 text-white backdrop-blur-md transition-colors duration-500 hover:bg-white/25 disabled:cursor-not-allowed"
          >
            <span className="text-sm font-medium md:text-[15px]">
              <RollText>{hero.videoLabel}</RollText>
            </span>
          </button>
        </div>
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-8 z-30 flex justify-center gap-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-[3px] w-12 overflow-hidden rounded-full bg-white/35 md:w-14"
            >
              {i === index && (
                <span
                  key={`bar-${index}`}
                  className="bar-fill absolute inset-0 rounded-full bg-white"
                  style={{ "--slide-duration": `${SLIDE_MS}ms` } as React.CSSProperties}
                />
              )}
              {i < index && <span className="absolute inset-0 rounded-full bg-white/80" />}
            </button>
          ))}
        </div>
      )}

      {showVideo && videoUrl && <VideoModal url={videoUrl} onClose={() => setShowVideo(false)} />}
    </section>
  );
}
