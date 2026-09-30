"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import type { FaqContent } from "@/lib/home-content";
import { cn } from "@/lib/utils";

export function FaqSection({ faq }: { faq: FaqContent }) {
  const [open, setOpen] = useState<string | null>(faq.items[0]?.id ?? null);

  return (
    <section className="bg-sage py-20 md:py-28">
      <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 className="text-[clamp(2rem,3.8vw,2.9rem)] leading-[1.2] font-normal tracking-tight text-forest">
            {faq.title.split("\n").map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-forest/75">{faq.description}</p>
        </Reveal>

        <div className="border-t border-forest/10">
          {faq.items.map((item, i) => {
            const isOpen = open === item.id;
            return (
              <Reveal key={item.id} delay={i * 80} className="border-b border-forest/10">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : item.id)}
                  className="group flex w-full items-start gap-4 py-5 text-left"
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-forest transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105",
                      isOpen && "rotate-45 bg-moss/80",
                    )}
                  >
                    <Plus size={20} strokeWidth={1.8} />
                  </span>
                  <span className="pt-1 text-lg leading-snug font-semibold text-forest md:text-xl">
                    {item.question}
                  </span>
                </button>
                <div className="collapse-grid" data-open={isOpen}>
                  <div>
                    <p className="pr-4 pb-5 pl-[3.25rem] text-sm leading-relaxed text-forest/70">{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
