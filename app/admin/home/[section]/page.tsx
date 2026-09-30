import { notFound } from "next/navigation";
import {
  AcademyEditor,
  AppPromoEditor,
  BlogSectionEditor,
  FaqEditor,
  FooterEditor,
  FounderEditor,
  HeaderEditor,
  HeroEditor,
  QuoteEditor,
  RoadmapEditor,
  TrainingEditor,
} from "@/components/admin/HomeSectionForms";
import { parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ section: string }> };

export default async function HomeSectionPage({ params }: Props) {
  const { section } = await params;
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const b = parseBannerData(settings?.bannerData);

  switch (section) {
    case "header":
      return <HeaderEditor initial={b.header} />;
    case "hero":
      return <HeroEditor initial={b.hero} initialVideo={b.video} />;
    case "academy":
      return <AcademyEditor initial={b.academy} />;
    case "roadmap":
      return <RoadmapEditor initial={b.roadmap} />;
    case "founder":
      return <FounderEditor initial={b.founder} />;
    case "app-promo":
      return <AppPromoEditor initial={b.appPromo} />;
    case "training":
      return <TrainingEditor initial={b.training} />;
    case "quote":
      return <QuoteEditor initial={b.quoteCta} />;
    case "faq":
      return <FaqEditor initial={b.faq} />;
    case "blog":
      return <BlogSectionEditor initial={b.blogSection} />;
    case "footer":
      return <FooterEditor initial={b.footer} />;
    default:
      notFound();
  }
}
