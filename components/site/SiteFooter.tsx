import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/components/common/RichText";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import type { SiteSettings } from "@/lib/queries";

function ColumnTitle({ children }: { children: string }) {
  return <p className="mb-4 text-sm font-medium tracking-wide text-forest">{children}</p>;
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const f = settings.footer;
  const phone = f.phone || settings.hotline || settings.phone;
  const email = f.email || settings.email;
  const address = f.address || settings.headOffice;
  const website = f.website || settings.website;
  const websiteHref = website
    ? /^https?:\/\//.test(website)
      ? website
      : `https://${website}`
    : "";
  const pages = [
    ...settings.header.links,
    { id: "footer-cta", label: settings.header.ctaLabel, href: settings.header.ctaHref },
  ].filter((link) => link.label && link.href);
  const programs = settings.training.items.filter((item) => item.isVisible !== false && item.name);
  const running = (f.wordmark || "phuonglilyacademy").replace(/\s+/g, "").toLowerCase() || "phuonglilyacademy";

  return (
    <footer className="relative overflow-hidden bg-olive text-forest">
      <div className="container-site grid gap-12 pt-16 pb-10 md:grid-cols-2 md:pt-20 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <ColumnTitle>Học viện</ColumnTitle>
          <ul className="space-y-3 text-sm text-forest/80">
            {pages.map((link) => (
              <li key={link.id}>
                <Link href={link.href} className="transition hover:text-forest">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <ColumnTitle>Chương trình</ColumnTitle>
          <ul className="space-y-3 text-sm text-forest/80">
            {programs.map((item) => (
              <li key={item.id}>
                <Link href={item.ctaHref || "/khoa-hoc"} className="transition hover:text-forest">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <ColumnTitle>{f.contactTitle || "Liên hệ"}</ColumnTitle>
          <ul className="space-y-2.5 text-sm text-forest/80">
            {phone && (
              <li>
                <span className="block text-xs tracking-wide text-forest/55">Điện thoại</span>
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="transition hover:text-forest">
                  {phone}
                </a>
              </li>
            )}
            {email && (
              <li>
                <span className="block text-xs tracking-wide text-forest/55">Email</span>
                <a href={`mailto:${email}`} className="transition hover:text-forest">
                  {email}
                </a>
              </li>
            )}
            {settings.workingHours && (
              <li>
                <span className="block text-xs tracking-wide text-forest/55">Giờ làm việc</span>
                <span>{settings.workingHours}</span>
              </li>
            )}
            {website && (
              <li>
                <a href={websiteHref} className="transition hover:text-forest">
                  {website}
                </a>
              </li>
            )}
            {address && (
              <li>
                <span className="block text-xs tracking-wide text-forest/55">{f.addressTitle || "Địa chỉ"}</span>
                <span>{address}</span>
              </li>
            )}
          </ul>
          <div className="mt-6 max-w-md">
            <p className="text-sm font-medium">{f.newsletterTitle}</p>
            <RichText text={f.newsletterDescription} className="mt-2 text-sm leading-relaxed text-forest/75" />
            <NewsletterForm placeholder={f.newsletterPlaceholder} />
          </div>
        </div>
      </div>

      <div className="container-site border-t border-forest/15 py-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            {settings.logoUrl && (
              <span className="relative block h-11 w-11 overflow-hidden rounded-full bg-white/50">
                <Image src={settings.logoUrl} alt="" fill sizes="44px" className="object-cover" />
              </span>
            )}
            <div>
              <p className="text-sm font-medium">{settings.name}</p>
              {address && <p className="mt-0.5 max-w-sm text-xs leading-relaxed text-forest/70">{address}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-forest/75">
            <span className="whitespace-pre-line">{f.copyright}</span>
            {f.policies.map((p) => (
              <Link key={p.id} href={p.href || "#"} className="transition hover:text-forest">
                {p.label}
              </Link>
            ))}
            {settings.socialFooter.map((s) => (
              <a
                key={s.id}
                href={s.link || "#"}
                target="_blank"
                rel="noreferrer"
                aria-label={s.title}
                className="relative h-8 w-8 overflow-hidden rounded-full bg-white/40 transition hover:bg-white/70"
              >
                {s.imageUrl && <Image src={s.imageUrl} alt="" fill sizes="32px" className="object-contain p-1.5" />}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none relative mt-2 h-[clamp(3.2rem,8.6vw,7.2rem)] overflow-hidden select-none"
        aria-hidden
      >
        <div className="marquee absolute top-0 left-0 items-start [--marquee-duration:36s]">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className="pr-[0.28em] text-[clamp(4.6rem,13.5vw,11rem)] leading-none font-semibold tracking-[-0.045em] whitespace-nowrap text-olive-deep/55"
                >
                  {running}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
