import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PageHero({
  title,
  description,
  crumbs = [],
}: {
  title: string;
  description?: string | null;
  crumbs?: { label: string; href?: string }[];
}) {
  return (
    <section className="bg-sage pt-36 pb-12 md:pt-44 md:pb-16">
      <div className="container-site">
        <nav className="animate-fade-up flex flex-wrap items-center gap-1.5 text-sm text-forest/60">
          <Link href="/" className="hover:text-forest">
            Trang chủ
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight size={14} />
              {c.href ? (
                <Link href={c.href} className="hover:text-forest">
                  {c.label}
                </Link>
              ) : (
                <span className="text-forest">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <h1
          className="animate-fade-up mt-4 max-w-4xl text-[clamp(2.3rem,5vw,4rem)] leading-[1.1] font-normal tracking-tight text-forest"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="animate-fade-up mt-4 max-w-2xl text-[15px] leading-relaxed text-forest/70"
            style={{ animationDelay: "240ms" }}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
