import Image from "next/image";
import { PawButton } from "@/components/site/Buttons";
import { Reveal } from "@/components/site/Reveal";
import type { QuoteCtaContent } from "@/lib/home-content";

export function QuoteSection({ quote }: { quote: QuoteCtaContent }) {
  return (
    <section className="relative flex min-h-[560px] items-center overflow-hidden bg-forest py-24 text-white md:min-h-[640px]">
      {quote.imageUrl && (
        <Image src={quote.imageUrl} alt="" fill sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="container-site relative text-center">
        <Reveal>
          <blockquote className="mx-auto max-w-4xl text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.18] font-normal tracking-tight">
            {quote.quote.split("\n").map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </blockquote>
        </Reveal>
        <Reveal delay={200} className="mt-10 flex justify-center">
          <PawButton
            label={quote.ctaLabel}
            href={quote.ctaHref || "/lich-su-kien"}
            className="min-w-[290px] py-2 pl-8 [--paw-scale:20]"
          />
        </Reveal>
      </div>
    </section>
  );
}
