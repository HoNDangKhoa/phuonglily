import { AcademySection } from "@/components/home/AcademySection";
import { AppPromoSection } from "@/components/home/AppPromoSection";
import { BlogSection } from "@/components/home/BlogSection";
import { FaqSection } from "@/components/home/FaqSection";
import { FounderSection } from "@/components/home/FounderSection";
import { HeroSection } from "@/components/home/HeroSection";
import { QuoteSection } from "@/components/home/QuoteSection";
import { CatalogSection } from "@/components/home/CatalogSection";
import { getCatalogCourses } from "@/lib/course-queries";
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

  return (
    <>
      <HeroSection hero={settings.hero} slides={settings.slideshow} videoUrl={settings.introVideoUrl} />
      <AcademySection academy={settings.academy} />
      <CatalogSection
        eyebrow={settings.roadmap.eyebrow}
        title={settings.roadmap.title}
        courses={instructorCourses}
        align="left"
      />
      <FounderSection founder={settings.founder} />
      <AppPromoSection promo={settings.appPromo} />
      <CatalogSection title={settings.training.title} courses={onlineCourses} align="center" />
      <QuoteSection quote={settings.quoteCta} />
      <FaqSection faq={settings.faq} />
      <BlogSection title={settings.blogSection.title} posts={posts} />
    </>
  );
}
