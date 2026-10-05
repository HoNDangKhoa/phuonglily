import { AcademySection } from "@/components/home/AcademySection";
import { AppPromoSection } from "@/components/home/AppPromoSection";
import { BlogSection } from "@/components/home/BlogSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FounderSection } from "@/components/home/FounderSection";
import { HeroSection } from "@/components/home/HeroSection";
import { QuoteSection } from "@/components/home/QuoteSection";
import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TrainingSection } from "@/components/home/TrainingSection";
import { getCatalogCourses, withCatalogLinks } from "@/lib/course-queries";
import { getPublishedPosts, getSiteSettings, isKnowledgePost } from "@/lib/queries";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, instructorCourses, onlineCourses, blogPosts] = await Promise.all([
    getSiteSettings(),
    getCatalogCourses("instructor"),
    getCatalogCourses("online"),
    getPublishedPosts("BLOG"),
  ]);
  const knowledge = blogPosts.filter(isKnowledgePost);
  const posts = (knowledge.length ? knowledge : blogPosts).slice(0, settings.blogSection.limit);
  const roadmap = {
    ...settings.roadmap,
    items: withCatalogLinks(settings.roadmap.items, (item) => item.title, instructorCourses),
  };
  const training = {
    ...settings.training,
    items: withCatalogLinks(settings.training.items, (item) => item.name, onlineCourses),
  };

  return (
    <>
      <HeroSection hero={settings.hero} slides={settings.slideshow} videoUrl={settings.introVideoUrl} />
      <AcademySection academy={settings.academy} />
      <RoadmapSection roadmap={roadmap} />
      <FounderSection founder={settings.founder} />
      <AppPromoSection promo={settings.appPromo} />
      <TrainingSection training={training} />
      <QuoteSection quote={settings.quoteCta} />
      <FaqSection faq={settings.faq} />
      <BlogSection title={settings.blogSection.title} posts={posts} />
    </>
  );
}
