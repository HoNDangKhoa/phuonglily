import { HtmlContent } from "@/components/common/HtmlContent";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Tag } from "lucide-react";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/PageHero";
import { PostCard, formatDate } from "@/components/site/PostCard";
import { Reveal } from "@/components/site/Reveal";
import { POST_TYPE_LABEL, POST_TYPE_VIEW_PATH, type PostType } from "@/lib/cms";
import {
  getPostBySlug,
  getPublishedPosts,
  getSiteSettings,
  incrementPostViews,
  type SiteSettings,
} from "@/lib/queries";

const SEO_KEY: Record<PostType, string> = {
  COURSE: "courses",
  ONLINE: "online",
  EVENT: "events",
  BLOG: "blog",
};

const INTRO: Record<PostType, string> = {
  COURSE: "Các chương trình đào tạo HLV và Yoga chuyên sâu theo lộ trình toàn diện.",
  ONLINE: "Học Yoga mọi lúc, mọi nơi cùng nền tảng học online của Phương Lily Academy.",
  EVENT: "Workshop, khai giảng và các sự kiện cộng đồng sắp diễn ra.",
  BLOG: "Kiến thức Yoga, sức khoẻ và chữa lành từ đội ngũ Phương Lily Academy.",
};

export function programNames(settings: SiteSettings) {
  return [
    ...settings.roadmap.items.map((i) => i.title),
    ...settings.training.items.map((i) => i.name),
  ].filter(Boolean);
}

export async function listMetadata(type: PostType): Promise<Metadata> {
  const s = await getSiteSettings();
  const seo = s.pageSeo[SEO_KEY[type]];
  return {
    title: seo?.title || POST_TYPE_LABEL[type],
    description: seo?.description || INTRO[type],
    keywords: seo?.keywords || undefined,
    alternates: seo?.canonical ? { canonical: seo.canonical } : undefined,
    robots: seo && !seo.indexable ? { index: false } : undefined,
    openGraph: seo?.ogImage ? { images: [seo.ogImage] } : undefined,
  };
}

export async function PostListPage({ type }: { type: PostType }) {
  const posts = await getPublishedPosts(type);
  const label = POST_TYPE_LABEL[type];

  return (
    <>
      <PageHero title={label} description={INTRO[type]} crumbs={[{ label }]} />
      <section className="bg-sage pb-24">
        <div className="container-site">
          {posts.length === 0 ? (
            <p className="rounded-3xl bg-white/60 p-12 text-center text-forest/60">
              Nội dung đang được cập nhật.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 100}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export async function detailMetadata(type: PostType, slug: string): Promise<Metadata> {
  const post = await getPostBySlug(type, slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.summary || undefined,
    keywords: post.seoKeywords || undefined,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: post.thumbnail ? { images: [post.thumbnail] } : undefined,
  };
}

export async function PostDetailPage({ type, slug }: { type: PostType; slug: string }) {
  const [post, settings, others] = await Promise.all([
    getPostBySlug(type, slug),
    getSiteSettings(),
    getPublishedPosts(type, 4),
  ]);
  if (!post) notFound();
  void incrementPostViews(post.id);

  const label = POST_TYPE_LABEL[type];
  const listHref = POST_TYPE_VIEW_PATH[type];
  const related = others.filter((p) => p.id !== post.id).slice(0, 3);
  const isBlog = type === "BLOG";

  const facts = [
    post.eventDate && { icon: CalendarDays, label: type === "EVENT" ? "Thời gian" : "Khai giảng", value: formatDate(post.eventDate, type === "EVENT") },
    post.location && { icon: MapPin, label: "Địa điểm", value: post.location },
    post.duration && { icon: Clock, label: "Thời lượng", value: post.duration },
    post.price && { icon: Tag, label: "Học phí", value: post.price },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <>
      <PageHero
        title={post.title}
        description={post.summary}
        crumbs={[{ label, href: listHref }, { label: post.title }]}
      />
      <section className="bg-sage pb-20">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_380px]">
          <article className="rounded-[28px] bg-white p-5 md:p-10">
            {post.thumbnail && (
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-2xl">
                <Image src={post.thumbnail} alt={post.title} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="mb-6 flex flex-wrap gap-3 text-sm text-forest/55">
              {post.categoryName && (
                <span className="rounded-full border border-forest/30 px-3 py-0.5 text-forest">{post.categoryName}</span>
              )}
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <HtmlContent className="prose-pl" html={post.contentHtml} />
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {facts.length > 0 && (
              <div className="rounded-[24px] bg-white p-6">
                <ul className="space-y-4">
                  {facts.map((f) => (
                    <li key={f.label} className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-forest">
                        <f.icon size={16} />
                      </span>
                      <span>
                        <span className="block text-xs text-forest/50">{f.label}</span>
                        <span className="text-sm font-medium text-forest">{f.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!isBlog && (
              <div className="rounded-[24px] bg-moss p-6">
                <p className="mb-4 text-xl text-forest">Đăng ký tư vấn</p>
                <ContactForm programs={programNames(settings)} defaultProgram={post.title} compact />
              </div>
            )}
            {isBlog && related.length > 0 && (
              <div className="rounded-[24px] bg-white p-6">
                <p className="mb-4 text-lg text-forest">Bài viết khác</p>
                <ul className="space-y-4">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link href={`${listHref}/${r.slug}`} className="group flex gap-3">
                        <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-sage">
                          {r.thumbnail && <Image src={r.thumbnail} alt="" fill sizes="80px" className="object-cover transition-transform duration-700 group-hover:scale-110" />}
                        </span>
                        <span className="text-sm leading-snug text-forest group-hover:text-leaf">{r.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {!isBlog && related.length > 0 && (
          <div className="container-site mt-16">
            <h2 className="mb-8 text-3xl font-normal text-forest">{label} khác</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
