import { notFound } from "next/navigation";
import { SeoPageForm } from "@/components/admin/SeoPageForm";
import { PAGE_SEO_KEYS, emptyPageSeo, parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ key: string }> };

export default async function SeoPage({ params }: Props) {
  const { key } = await params;
  const page = PAGE_SEO_KEYS.find((p) => p.key === key);
  if (!page) notFound();

  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const banner = parseBannerData(settings?.bannerData);

  return (
    <SeoPageForm
      key={page.key}
      seoKey={page.key}
      title={`Thông tin SEO page - ${page.label}`}
      hostHint={`phuonglilyacademy.com${page.path}`}
      initial={banner.pageSeo[page.key] ?? emptyPageSeo()}
    />
  );
}
