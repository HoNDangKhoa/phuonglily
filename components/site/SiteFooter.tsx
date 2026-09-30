import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import type { SiteSettings } from "@/lib/queries";

function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const f = settings.footer;
  const websiteHref = /^https?:\/\//.test(f.website) ? f.website : `https://${f.website}`;
  const words = Array.from({ length: 4 }, () => f.wordmark);

  return (
    <footer className="relative overflow-hidden bg-olive text-forest">
      <div className="container-site grid gap-10 pt-16 pb-10 md:grid-cols-12 md:pt-20">
        <div className="text-[15px] md:col-span-2">
          <Lines text={f.copyright} />
        </div>

        <div className="space-y-8 md:col-span-3">
          <div>
            <p className="mb-4 text-sm tracking-wide">{f.contactTitle}</p>
            <ul className="space-y-3 text-sm text-forest/85">
              {f.phone && (
                <li>
                  <a href={`tel:${f.phone.replace(/\s+/g, "")}`} className="transition hover:text-forest">
                    {f.phone}
                  </a>
                </li>
              )}
              {f.email && (
                <li>
                  <a href={`mailto:${f.email}`} className="transition hover:text-forest">
                    {f.email}
                  </a>
                </li>
              )}
              {f.website && (
                <li>
                  <a href={websiteHref} className="transition hover:text-forest">
                    {f.website}
                  </a>
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-sm tracking-wide">{f.addressTitle}</p>
            <p className="text-sm text-forest/85">{f.address}</p>
          </div>
        </div>

        <div className="md:col-span-3">
          <p className="mb-4 text-sm tracking-wide">{f.policyTitle}</p>
          <ul className="space-y-3 text-sm text-forest/85">
            {f.policies.map((p) => (
              <li key={p.id}>
                <Link href={p.href || "#"} className="group inline-flex items-center gap-1 transition hover:text-forest">
                  <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                    {p.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {settings.socialFooter.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {settings.socialFooter.map((s) => (
                <a
                  key={s.id}
                  href={s.link || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.title}
                  className="relative h-9 w-9 overflow-hidden rounded-full bg-white/40 transition hover:-translate-y-0.5 hover:bg-white/70"
                >
                  {s.imageUrl && <Image src={s.imageUrl} alt={s.title} fill sizes="36px" className="object-contain p-2" />}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-4">
          <div className="rounded-3xl border border-white/30 bg-lime p-6 shadow-[0_20px_50px_-30px_rgba(29,58,31,0.6)] md:p-7">
            <p className="text-[15px] font-medium tracking-wide">{f.newsletterTitle}</p>
            <p className="mt-3 text-sm leading-relaxed text-forest/80">{f.newsletterDescription}</p>
            <NewsletterForm placeholder={f.newsletterPlaceholder} />
          </div>
        </div>
      </div>

      <div className="marquee-pause mt-6 select-none md:mt-12" aria-label={f.wordmark}>
        <div className="marquee [--marquee-duration:38s]" aria-hidden>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {words.map((w, i) => (
                <span
                  key={i}
                  className="bg-gradient-to-b from-olive-deep/90 to-olive-deep/60 bg-clip-text pr-[0.35em] text-[clamp(4rem,13vw,12rem)] leading-[0.95] font-bold tracking-tight whitespace-nowrap text-transparent"
                >
                  {w}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
