import Image from "next/image";
import { Check } from "lucide-react";
import { RichText } from "@/components/common/RichText";
import { PawButton } from "@/components/site/Buttons";
import { Reveal } from "@/components/site/Reveal";
import type { TrainingContent } from "@/lib/home-content";

export function TrainingSection({ training }: { training: TrainingContent }) {
  const items = training.items.filter((g) => g.isVisible);
  return (
    <section className="bg-sage pb-20 md:pb-28">
      <div className="container-site">
        <Reveal>
          <h2 className="text-center text-[clamp(2rem,3.8vw,2.9rem)] font-normal tracking-tight text-forest">
            {training.title}
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g, i) => (
            <Reveal
              key={g.id}
              delay={(i % 3) * 110}
              as="article"
              className="group flex flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-moss-soft to-moss shadow-[0_18px_40px_-28px_rgba(29,58,31,0.55)] transition-shadow duration-500 hover:shadow-[0_28px_50px_-24px_rgba(29,58,31,0.6)]"
            >
              <div className="relative aspect-[1.7/1] overflow-hidden">
                {g.imageUrl && (
                  <Image
                    src={g.imageUrl}
                    alt={g.name}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col px-5 pt-5 pb-5">
                <h3 className="text-xl font-normal text-forest">{g.name}</h3>
                <RichText text={g.description} className="mt-1 text-sm text-forest/80" />
                <ul className="mt-4 space-y-1.5">
                  {g.features.filter(Boolean).map((f, k) => (
                    <li key={k} className="flex items-center gap-3 text-sm text-forest/85">
                      <Check size={14} className="shrink-0 text-forest/70" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <PawButton label={g.ctaLabel || "Đăng ký ngay"} href={g.ctaHref || "/lien-he"} className="min-w-[150px]" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
