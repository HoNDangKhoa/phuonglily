import { HtmlContent } from "@/components/common/HtmlContent";
import { PageHero } from "@/components/site/PageHero";
import type { PageArticle } from "@/lib/page-articles";
import { isCustomLayout, toRichHtml } from "@/lib/rich-text";

export function PageArticleView({
  article,
  fallbackTitle,
  intro,
  crumbs,
  flushBottom,
}: {
  article: PageArticle;
  fallbackTitle: string;
  intro?: string;
  crumbs: { label: string; href?: string }[];
  flushBottom?: boolean;
}) {
  const content = toRichHtml(article.content);

  if (isCustomLayout(content)) {
    return (
      <div className="bg-sage pt-28 md:pt-32">
        <HtmlContent html={content} className="cms-layout" />
      </div>
    );
  }

  const title = article.title || fallbackTitle;

  return (
    <>
      <PageHero title={title} description={intro} crumbs={crumbs} />
      <section className={flushBottom ? "bg-sage pb-8" : "bg-sage pb-24"}>
        <div className="container-site">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-[28px] bg-white">
            {article.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.imageUrl} alt={title} className="max-h-[520px] w-full object-cover" />
            )}
            {content ? (
              <HtmlContent as="article" html={content} className="prose-pl p-8 md:p-12" />
            ) : (
              <p className="p-8 text-forest/60 md:p-12">Nội dung đang được cập nhật.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
