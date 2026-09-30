import { AcademySection } from "@/components/home/AcademySection";
import { AppPromoSection } from "@/components/home/AppPromoSection";
import { BlogSection } from "@/components/home/BlogSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FounderSection } from "@/components/home/FounderSection";
import { HeroSection } from "@/components/home/HeroSection";
import { QuoteSection } from "@/components/home/QuoteSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TrainingSection } from "@/components/home/TrainingSection";
import { getPublishedPosts, getSiteSettings } from "@/lib/queries";

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getSiteSettings();
  const posts = await getPublishedPosts("BLOG", settings.blogSection.limit);

  return (
    <>
      <HeroSection hero={settings.hero} slides={settings.slideshow} videoUrl={settings.introVideoUrl} />
      <AcademySection academy={settings.academy} />
      <RoadmapSection roadmap={settings.roadmap} />
      <FounderSection founder={settings.founder} />
      <AppPromoSection promo={settings.appPromo} />
      <TrainingSection training={settings.training} />
      <QuoteSection quote={settings.quoteCta} />
      <FaqSection faq={settings.faq} />
      <BlogSection title={settings.blogSection.title} posts={posts} />
    </>
  );
}
