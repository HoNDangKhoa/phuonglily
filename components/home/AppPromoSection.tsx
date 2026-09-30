import Image from "next/image";
import Link from "next/link";
import { AvatarStack } from "@/components/site/AvatarStack";
import { Reveal } from "@/components/site/Reveal";
import type { AppPromoContent } from "@/lib/home-content";

export function AppPromoSection({ promo }: { promo: AppPromoContent }) {
  return (
    <section className="bg-sage py-16 md:py-24">
      <div className="container-site">
        <Reveal className="grid items-center gap-10 overflow-hidden rounded-[28px] bg-moss px-7 py-12 md:grid-cols-[1fr_1.15fr] md:px-16 md:py-16">
          <div>
            <h2 className="text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.2] font-normal tracking-tight text-forest">
              <Link href={promo.href || "#"} className="transition-colors hover:text-leaf">
                {promo.title.split("\n").map((l, i) => (
                  <span key={i} className="block">
                    {l}
                  </span>
                ))}
              </Link>
            </h2>
            <div className="mt-7">
              <AvatarStack avatars={promo.avatars} label={promo.membersLabel} />
            </div>
          </div>
          {promo.imageUrl && (
            <div className="float-y relative aspect-[1.68/1] w-full">
              <Image
                src={promo.imageUrl}
                alt="Nền tảng học Yoga online Phương Lily"
                fill
                sizes="(min-width:768px) 50vw, 100vw"
                className="object-contain mix-blend-multiply"
              />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
