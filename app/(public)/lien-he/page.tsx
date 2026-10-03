import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { programNames } from "@/lib/post-pages";
import { getSiteSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const seo = s.pageSeo.contact;
  return {
    title: seo?.title || "Liên hệ",
    description: seo?.description || undefined,
    keywords: seo?.keywords || undefined,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    robots: seo && !seo.indexable ? { index: false } : undefined,
    openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

type Props = { searchParams: Promise<{ "chuong-trinh"?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [s, sp] = await Promise.all([getSiteSettings(), searchParams]);
  const programs = programNames(s);
  const wanted = sp["chuong-trinh"] ?? "";
  const defaultProgram =
    programs.find((p) => p === wanted || p.startsWith(wanted)) || wanted;

  const info = [
    { icon: Phone, label: "Hotline", value: s.hotline || s.footer.phone, href: `tel:${(s.hotline || s.footer.phone).replace(/\s+/g, "")}` },
    { icon: Mail, label: "Email", value: s.email || s.footer.email, href: `mailto:${s.email || s.footer.email}` },
    { icon: MapPin, label: "Địa chỉ", value: s.headOffice || s.footer.address },
    { icon: Clock, label: "Giờ làm việc", value: s.workingHours || "08:00 - 20:00, Thứ 2 - Chủ nhật" },
  ].filter((i) => i.value);

  return (
    <>
      <PageHero
        title="Liên hệ & Đăng ký"
        description="Để lại thông tin, đội ngũ Phương Lily Academy sẽ tư vấn lộ trình phù hợp nhất cho bạn."
        crumbs={[{ label: "Liên hệ" }]}
      />
      <section className="bg-sage pb-20">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Reveal className="space-y-4">
            {info.map((i) => (
              <div key={i.label} className="flex items-start gap-4 rounded-[22px] bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moss text-forest">
                  <i.icon size={18} />
                </span>
                <span>
                  <span className="block text-xs text-forest/50">{i.label}</span>
                  {i.href ? (
                    <a href={i.href} className="text-forest hover:text-leaf">
                      {i.value}
                    </a>
                  ) : (
                    <span className="text-forest">{i.value}</span>
                  )}
                </span>
              </div>
            ))}
          </Reveal>
          <Reveal delay={120} className="rounded-[28px] bg-white p-6 md:p-10">
            <h2 className="mb-6 text-2xl font-normal text-forest md:text-3xl">Gửi đăng ký</h2>
            <ContactForm programs={programs} defaultProgram={defaultProgram} />
          </Reveal>
        </div>
        <div className="container-site mt-8">
          <iframe
            src={s.mapsEmbedUrl}
            title="Bản đồ"
            loading="lazy"
            className="h-[380px] w-full rounded-[28px] border-0 grayscale-[30%]"
          />
        </div>
      </section>
    </>
  );
}
