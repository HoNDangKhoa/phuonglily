import Image from "next/image";
import { RichText } from "@/components/common/RichText";
import { SiteIcon } from "@/components/common/SiteIcon";
import { Reveal } from "@/components/site/Reveal";
import type { FounderContent } from "@/lib/home-content";

export function FounderSection({ founder }: { founder: FounderContent }) {
  return (
    <section className="grid bg-white lg:grid-cols-2">
      <div className="relative aspect-square overflow-hidden bg-sage-deep lg:aspect-auto lg:min-h-[720px]">
        {founder.imageUrl && (
          <Image
            src={founder.imageUrl}
            alt={founder.title.replace(/\n/g, " ")}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1600ms] ease-out hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="flex items-center px-6 py-14 md:px-12 lg:px-16 lg:py-20">
        <div className="max-w-xl">
          <Reveal>
            <h2 className="text-[clamp(2rem,3.8vw,3rem)] leading-[1.15] font-normal tracking-tight text-forest">
              {founder.title.split("\n").map((l, i) => (
                <span key={i} className="block">
                  {l}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <RichText text={founder.content} className="mt-8 space-y-1 text-[15px] leading-relaxed text-forest/70" />
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-8">
            {founder.stats.map((s, i) => (
              <Reveal
                key={s.id}
                delay={200 + i * 100}
                className="group flex aspect-[1.05/1] flex-col items-center justify-center rounded-2xl bg-sage px-3 text-center shadow-[0_8px_20px_-14px_rgba(29,58,31,0.5)] transition-transform duration-500 hover:-translate-y-1.5"
              >
                <span className="icon-spin text-forest">
                  <SiteIcon icon={s.icon} iconUrl={s.iconUrl} size={34} />
                </span>
                <span className="mt-2 text-base font-medium text-forest">{s.value}</span>
                <span className="mt-1 text-xs leading-snug text-forest/80">{s.label}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
