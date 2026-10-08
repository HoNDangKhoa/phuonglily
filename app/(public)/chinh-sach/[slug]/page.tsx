import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageArticleView } from "@/components/site/PageArticleView";
import { PAGE_ARTICLE_CONFIG, isPageArticleKey } from "@/lib/page-articles";
import { getSiteSettings } from "@/lib/queries";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isPageArticleKey(slug) || slug === "about" || slug === "recruitment") return {};
  const s = await getSiteSettings();
  return { title: s.pageArticles[slug].title || PAGE_ARTICLE_CONFIG[slug].label };
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params;
  if (!isPageArticleKey(slug) || slug === "about" || slug === "recruitment") notFound();
  const s = await getSiteSettings();
  const policy = s.footer.policies.find((p) => p.href.endsWith(`/chinh-sach/${slug}`));
  const label = policy?.label || PAGE_ARTICLE_CONFIG[slug].label;

  return (
    <PageArticleView
      article={s.pageArticles[slug]}
      fallbackTitle={label}
      crumbs={[{ label: s.footer.policyTitle }, { label }]}
    />
  );
}
