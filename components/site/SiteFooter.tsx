import Image from "next/image";
import Link from "next/link";
import { RunningLine } from "@/components/site/RunningLine";
import { resolveMenuHref } from "@/lib/cms";
import type { SiteSettings } from "@/lib/queries";

function ColumnTitle({ children }: { children: string }) {
  return <p className="mb-6 text-[15px] font-medium text-forest">{children}</p>;
}

function SocialGlyph({ name }: { name: string }) {
  const key = name.toLowerCase();
  const common = "h-5 w-5";
  if (key.includes("linkedin")) {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.1c.5-1 1.8-2.1 3.8-2.1 4 0 4.8 2.6 4.8 6V24h-4v-7.7c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4V24h-4V8.5z" />
      </svg>
    );
  }
  if (key.includes("instagram")) {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (key.includes("tiktok")) {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M14 3c.4 2.6 1.8 4.4 4.2 4.7v3c-1.5 0-2.9-.5-4.2-1.4v6.6c0 3.4-2.6 6.1-6.2 6.1S1.6 19.3 1.6 15.9c0-3.3 2.5-6 5.8-6.1v3.1c-1.5.1-2.7 1.4-2.7 3s1.2 2.9 2.8 2.9 2.7-1.3 2.7-2.9V3H14z" />
      </svg>
    );
  }
  if (key.includes("youtube")) {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3-6.2 3.3z" />
      </svg>
    );
  }
  if (key.includes("facebook") || key.includes("fanpage")) {
    return (
      <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
        <path d="M14.5 8.5V6.3c0-.8.2-1.3 1.4-1.3H17V2h-2.3C11.6 2 10.2 3.5 10.2 6.1v2.4H8v3h2.2V22h3.3v-10.5h2.6l.4-3h-3z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z" />
    </svg>
  );
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const f = settings.footer;
  const phone = f.phone || settings.hotline || settings.phone;
  const email = f.email || settings.email;
  const address = f.address || settings.headOffice;
  const pages = [
    ...settings.header.links,
    { id: "footer-cta", label: settings.header.ctaLabel, href: settings.header.ctaHref },
  ].filter((link) => link.label && link.href);
  const programs = settings.training.items.filter((item) => item.isVisible !== false && item.name);
  const running = f.wordmark.trim() || "Phuong Lily Academy";
  const copyright = f.copyright.replace(/\s*\n\s*/g, " ").trim();
  const uploadedSocials = settings.socialFooter
    .filter((item) => item.link || item.imageUrl)
    .map((item) => ({ id: item.id, label: item.title || "Mạng xã hội", href: item.link || "#", imageUrl: item.imageUrl }));
  const socials =
    uploadedSocials.length > 0
      ? uploadedSocials
      : Object.entries(settings.social)
          .filter(([, href]) => Boolean(href?.trim()))
          .map(([key, href]) => ({ id: `social-${key}`, label: key, href, imageUrl: "" }));

  return (
    <footer className="bg-sage px-4 pt-2 pb-0 md:px-6">
      <div className="mx-auto max-w-[1440px] rounded-[28px] bg-white px-7 py-12 text-forest md:px-12 md:py-14 lg:px-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <ColumnTitle>Học viện</ColumnTitle>
            <ul className="space-y-3.5 text-sm text-forest/85">
              {pages.map((link) => (
                <li key={link.id}>
                  <Link href={resolveMenuHref(link.href)} className="transition hover:text-leaf">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>Chương trình</ColumnTitle>
            <ul className="space-y-3.5 text-sm text-forest/85">
              {programs.map((item) => (
                <li key={item.id}>
                  <Link href={item.ctaHref || "/khoa-hoc"} className="transition hover:text-leaf">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <ColumnTitle>Liên hệ</ColumnTitle>
            <div className="space-y-5 text-sm text-forest/85">
              {phone && (
                <div>
                  <p>Điện thoại</p>
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="mt-1 block transition hover:text-leaf">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <p>
                  Email:{" "}
                  <a href={`mailto:${email}`} className="transition hover:text-leaf">
                    {email}
                  </a>
                </p>
              )}
              {settings.workingHours && (
                <div>
                  <p>Giờ làm việc</p>
                  <p className="mt-1">{settings.workingHours}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              {settings.logoUrl && (
                <span className="relative block h-11 w-11 shrink-0 overflow-hidden">
                  <Image src={settings.logoUrl} alt="" fill sizes="44px" className="object-contain" />
                </span>
              )}
              <p className="text-[1.7rem] leading-none font-medium tracking-tight">{settings.name}</p>
            </div>
            {settings.slogan && <p className="mt-4 text-sm text-forest/80">{settings.slogan}</p>}
            {address && <p className="mt-3 max-w-[220px] text-sm leading-relaxed whitespace-pre-line text-forest/80">{address}</p>}
            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-4 text-forest">
                {socials.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="transition hover:text-leaf"
                  >
                    {item.imageUrl ? (
                      <span className="relative block h-5 w-5">
                        <Image src={item.imageUrl} alt="" fill sizes="20px" className="object-contain" />
                      </span>
                    ) : (
                      <SocialGlyph name={item.label} />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 text-sm text-forest/75 md:mt-24 md:flex-row md:items-center md:justify-between">
          <p>{copyright}</p>
          <div className="flex flex-wrap gap-x-10 gap-y-2">
            {f.policies.map((policy) => (
              <Link key={policy.id} href={policy.href || "#"} className="transition hover:text-forest">
                {policy.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <RunningLine text={running} />
    </footer>
  );
}
