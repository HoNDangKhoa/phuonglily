import { prisma } from "@/lib/prisma";
import { resolveMapEmbed } from "@/lib/site-settings";
import { CacheKeys, cacheRemember } from "@/lib/cache";
import { defaultBannerData, parseBannerData } from "@/lib/branding";
import type { PostType } from "@/lib/cms";

export type PublicPost = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  contentHtml: string;
  thumbnail: string | null;
  type: string;
  categoryName: string | null;
  categorySlug: string | null;
  publishedAt: string | null;
  createdAt: string;
  eventDate: string | null;
  location: string | null;
  price: string | null;
  duration: string | null;
  tags: string | null;
  views: number;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
};

type PostRow = Awaited<ReturnType<typeof prisma.post.findFirst>> & {
  category?: { name: string; slug?: string } | null;
};

function toPublic(p: NonNullable<PostRow>): PublicPost {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    contentHtml: p.contentHtml,
    thumbnail: p.thumbnail,
    type: p.type,
    categoryName: p.category?.name ?? null,
    categorySlug: p.category?.slug ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    eventDate: p.eventDate?.toISOString() ?? null,
    location: p.location,
    price: p.price,
    duration: p.duration,
    tags: p.tags,
    views: p.views,
    isFeatured: p.isFeatured,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    seoKeywords: p.seoKeywords,
    canonicalUrl: p.canonicalUrl,
  };
}

export function isKnowledgePost(post: { categoryName?: string | null; categorySlug?: string | null }) {
  const name = (post.categoryName || "").toLowerCase();
  const slug = (post.categorySlug || "").toLowerCase();
  return name.includes("kiến thức yoga") || slug.includes("kien-thuc-yoga");
}

const publishedWhere = (type: PostType) => ({
  type,
  status: "PUBLISHED",
  isVisible: true,
});

export async function getPublishedPosts(type: PostType, limit?: number) {
  try {
    const rows = await cacheRemember(CacheKeys.posts(type), async () => {
      const posts = await prisma.post.findMany({
        where: publishedWhere(type),
        include: { category: { select: { name: true, slug: true } } },
        orderBy:
          type === "EVENT"
            ? [{ eventDate: "asc" }, { sortOrder: "asc" }]
            : [{ sortOrder: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      });
      return posts.map(toPublic);
    });
    return typeof limit === "number" ? rows.slice(0, limit) : rows;
  } catch (error) {
    console.error("[queries:getPublishedPosts]", error);
    return [];
  }
}

export async function getPostBySlug(type: PostType, slug: string) {
  try {
    return await cacheRemember(CacheKeys.post(slug), async () => {
      const post = await prisma.post.findFirst({
        where: { ...publishedWhere(type), slug },
        include: { category: { select: { name: true, slug: true } } },
      });
      return post ? toPublic(post) : null;
    });
  } catch (error) {
    console.error("[queries:getPostBySlug]", error);
    return null;
  }
}

export async function incrementPostViews(id: string) {
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});
}

function buildSettings(
  s: Awaited<ReturnType<typeof prisma.siteSetting.findUnique>>,
) {
  const banner = s ? parseBannerData(s.bannerData) : defaultBannerData();
  const social = s?.socialLinks
    ? (JSON.parse(s.socialLinks) as Record<string, string>)
    : {};
  return {
    name: s?.companyName || "Phương Lily Academy",
    slogan: s?.slogan || "",
    hotline: s?.hotline || "",
    phone: s?.phone || "",
    email: s?.email || "",
    workingHours: s?.workingHours || "",
    headOffice: s?.headOffice || "",
    website: s?.website || "",
    mapsEmbedUrl: resolveMapEmbed(s?.mapsEmbedUrl, s?.mapsCoords),
    metaTitle: s?.metaTitle || "",
    metaDescription: s?.metaDescription || "",
    seoKeywords: s?.seoKeywords || "",
    googleAnalytics: s?.googleAnalytics || "",
    googleWebmaster: s?.googleWebmaster || "",
    headJs: s?.headJs || "",
    bodyJs: s?.bodyJs || "",
    logoUrl: banner.logo.visible ? banner.logo.url : "",
    faviconUrl: banner.favicon.visible ? banner.favicon.url : "",
    introVideoUrl: banner.video.visible ? banner.video.url.trim() : "",
    slideshow: [...banner.slideshow]
      .filter((i) => i.isVisible && i.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    socialFooter: [...banner.socialFooter]
      .filter((i) => i.isVisible)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    pageSeo: banner.pageSeo,
    header: banner.header,
    hero: banner.hero,
    academy: banner.academy,
    roadmap: banner.roadmap,
    founder: banner.founder,
    appPromo: banner.appPromo,
    training: banner.training,
    quoteCta: banner.quoteCta,
    faq: banner.faq,
    blogSection: banner.blogSection,
    footer: banner.footer,
    pageArticles: banner.pageArticles,
    social,
  };
}

export type SiteSettings = ReturnType<typeof buildSettings>;

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    return await cacheRemember(CacheKeys.settings, async () =>
      buildSettings(
        await prisma.siteSetting.findUnique({ where: { id: "site_config" } }),
      ),
    );
  } catch (error) {
    console.error("[queries:getSiteSettings]", error);
    return buildSettings(null);
  }
}
