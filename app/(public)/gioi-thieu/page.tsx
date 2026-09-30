import type { Metadata } from "next";
import { QuoteSection } from "@/components/home/QuoteSection";
import { PageArticleView } from "@/components/site/PageArticleView";
import { getSiteSettings } from "@/lib/queries";
import { stripHtml } from "@/lib/rich-text";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const article = s.pageArticles.about;
  return {
    title: article.title || "Giới thiệu",
    description: stripHtml(article.content).slice(0, 160) || undefined,
  };
}

export default async function AboutPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageArticleView
        article={s.pageArticles.about}
        fallbackTitle="Về Phương Lily Academy"
        intro={s.hero.description}
        crumbs={[{ label: "Giới thiệu" }]}
      />
      <QuoteSection quote={s.quoteCta} />
    </>
  );
}
