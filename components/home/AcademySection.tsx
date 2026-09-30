import { SiteIcon } from "@/components/common/SiteIcon";
import { Reveal } from "@/components/site/Reveal";
import type { AcademyContent } from "@/lib/home-content";

export function AcademySection({ academy }: { academy: AcademyContent }) {
  return (
    <section className="bg-sage pt-16 pb-10 md:pt-20">
      <div className="container-site">
        <Reveal>
          <h2 className="text-[clamp(2.2rem,4.4vw,3.4rem)] leading-tight font-normal tracking-tight text-forest">
            {academy.title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-forest/65">{academy.description}</p>
        </Reveal>

        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {academy.features.map((f, i) => (
            <Reveal key={f.id} delay={i * 120} className="group cursor-default">
              <div className="icon-spin inline-flex text-forest">
                <SiteIcon icon={f.icon} iconUrl={f.iconUrl} size={56} />
              </div>
              <h3 className="mt-4 text-[1.6rem] leading-snug font-normal text-forest transition-colors duration-500 group-hover:text-leaf">
                {f.title}
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-forest/75">{f.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
