"use client";

import Image from "next/image";
import { useState } from "react";
import { RichText } from "@/components/common/RichText";
import { CircleArrow, PawButton } from "@/components/site/Buttons";
import { Reveal } from "@/components/site/Reveal";
import type { RoadmapContent } from "@/lib/home-content";
import { cn } from "@/lib/utils";

/** Elaria-style services accordion: one item open at a time, image swaps with a clip reveal. */
export function RoadmapSection({ roadmap }: { roadmap: RoadmapContent }) {
  const [active, setActive] = useState(0);
  const items = roadmap.items;

  return (
    <section className="bg-sage py-16 md:py-24">
      <div className="container-site grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Reveal>
            <p className="text-xl text-forest/85 md:text-2xl">{roadmap.eyebrow}</p>
            <h2 className="mt-1 text-[clamp(2.2rem,4.4vw,3.4rem)] leading-tight font-normal tracking-tight text-forest">
              {roadmap.title}
            </h2>
          </Reveal>

          <ul className="mt-8">
            {items.map((item, i) => {
              const open = i === active;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "border-b border-forest/15 transition-colors duration-500",
                    i === items.length - 1 && "border-b-0",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(open ? -1 : i)}
                    className="group flex w-full items-center gap-6 py-4 text-left md:gap-10"
                  >
                    <span
                      className={cn(
                        "w-8 shrink-0 text-xl font-semibold tabular-nums transition-colors duration-500",
                        open ? "text-forest" : "text-forest/40 group-hover:text-forest/70",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-xl font-normal text-forest transition-transform duration-500 md:text-[1.6rem]",
                        !open && "group-hover:translate-x-1.5",
                      )}
                    >
                      {item.title}
                    </span>
                    <CircleArrow active={open} className={cn(!open && "group-hover:rotate-45")} />
                  </button>

                  <div className="collapse-grid" data-open={open}>
                    <div>
                      <div className="pb-5 pl-14 md:pl-[4.5rem]">
                        <RichText text={item.description} className="text-sm text-forest/75" />
                        <PawButton
                          label={item.ctaLabel || "Đăng ký"}
                          href={item.ctaHref || "/lien-he"}
                          variant="soft"
                          size="sm"
                          className="mt-4 min-w-[96px] [--paw-color:var(--leaf)]"
                        />
                        {item.imageUrl && (
                          <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-2xl lg:hidden">
                            <Image src={item.imageUrl} alt={item.title} fill sizes="100vw" className="object-cover" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <Reveal delay={150} className="relative hidden aspect-[1.12/1] overflow-hidden rounded-[28px] bg-sage-deep lg:block">
          {items.map((item, i) => {
            const shown = i === (active < 0 ? 0 : active);
            return (
              item.imageUrl && (
                <div
                  key={item.id}
                  className={cn(
                    "absolute inset-0 transition-[clip-path,transform] duration-[1100ms] ease-[cubic-bezier(0.65,0,0.35,1)]",
                    shown
                      ? "z-10 scale-100 [clip-path:inset(0_0_0_0_round_28px)]"
                      : "z-0 scale-110 [clip-path:inset(100%_0_0_0_round_28px)] [transition-delay:1100ms]",
                  )}
                >
                  <Image src={item.imageUrl} alt={item.title} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
                </div>
              )
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
