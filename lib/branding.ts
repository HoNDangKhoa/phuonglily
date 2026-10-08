import { defaultPageArticles, type PageArticle, type PageArticleKey } from "@/lib/page-articles";
import {
  type AcademyContent,
  type AppPromoContent,
  type BlogSectionContent,
  type FaqContent,
  type FooterContent,
  type FounderContent,
  type HeaderContent,
  type HeroContent,
  type QuoteCtaContent,
  type RoadmapContent,
  type TrainingContent,
  defaultAcademy,
  defaultAppPromo,
  defaultBlogSection,
  defaultFaq,
  defaultFooter,
  defaultFounder,
  defaultHeader,
  defaultHero,
  defaultQuoteCta,
  defaultRoadmap,
  defaultTraining,
} from "@/lib/home-content";

export type BrandAsset = {
  url: string;
  visible: boolean;
};

export type MediaListItem = {
  id: string;
  title: string;
  link: string;
  imageUrl: string;
  sortOrder: number;
  isVisible: boolean;
};

export type PageSeo = {
  title: string;
  keywords: string;
  description: string;
  focusKeyword: string;
  ogImage: string;
  indexable: boolean;
  canonical: string;
  ogSiteName: string;
  ogType: string;
  ogUrl: string;
};

export type BannerData = {
  logo: BrandAsset;
  favicon: BrandAsset;
  video: BrandAsset;
  slideshow: MediaListItem[];
  socialFooter: MediaListItem[];
  pageSeo: Record<string, PageSeo>;
  header: HeaderContent;
  hero: HeroContent;
  academy: AcademyContent;
  roadmap: RoadmapContent;
  founder: FounderContent;
  appPromo: AppPromoContent;
  training: TrainingContent;
  quoteCta: QuoteCtaContent;
  faq: FaqContent;
  blogSection: BlogSectionContent;
  footer: FooterContent;
  pageArticles: Record<PageArticleKey, PageArticle>;
};

export const PAGE_SEO_KEYS = [
  { key: "courses", label: "Khoá học", href: "/admin/seo/courses", path: "/khoa-hoc" },
  { key: "online", label: "Học online", href: "/admin/seo/online", path: "/hoc-online" },
  { key: "events", label: "Lịch sự kiện", href: "/admin/seo/events", path: "/lich-su-kien" },
  { key: "blog", label: "Blog", href: "/admin/seo/blog", path: "/blog" },
  { key: "about", label: "Giới thiệu", href: "/admin/seo/about", path: "/gioi-thieu" },
  { key: "contact", label: "Liên hệ", href: "/admin/seo/contact", path: "/lien-he" },
] as const;

export type PageSeoKey = (typeof PAGE_SEO_KEYS)[number]["key"];

export function emptyPageSeo(): PageSeo {
  return {
    title: "",
    keywords: "",
    description: "",
    focusKeyword: "",
    ogImage: "",
    indexable: true,
    canonical: "",
    ogSiteName: "",
    ogType: "website",
    ogUrl: "",
  };
}

export function defaultBannerData(): BannerData {
  return {
    logo: { url: "/images/logo.jpg", visible: true },
    favicon: { url: "/favicon.ico", visible: true },
    video: { url: "", visible: true },
    slideshow: [
      {
        id: "slide_1",
        title: "Học Yoga - Hiểu cơ thể",
        link: "",
        imageUrl: "/images/yoga-studio.jpg",
        sortOrder: 0,
        isVisible: true,
      },
      {
        id: "slide_2",
        title: "Lớp đào tạo HLV",
        link: "",
        imageUrl: "/images/class-training.jpg",
        sortOrder: 1,
        isVisible: true,
      },
      {
        id: "slide_3",
        title: "Phương Lily",
        link: "",
        imageUrl: "/images/blog-2.jpg",
        sortOrder: 2,
        isVisible: true,
      },
      {
        id: "slide_4",
        title: "Yoga phục hồi",
        link: "",
        imageUrl: "/images/blog-3.jpg",
        sortOrder: 3,
        isVisible: true,
      },
    ],
    socialFooter: [],
    pageSeo: Object.fromEntries(PAGE_SEO_KEYS.map((p) => [p.key, emptyPageSeo()])),
    header: defaultHeader(),
    hero: defaultHero(),
    academy: defaultAcademy(),
    roadmap: defaultRoadmap(),
    founder: defaultFounder(),
    appPromo: defaultAppPromo(),
    training: defaultTraining(),
    quoteCta: defaultQuoteCta(),
    faq: defaultFaq(),
    blogSection: defaultBlogSection(),
    footer: defaultFooter(),
    pageArticles: defaultPageArticles(),
  };
}

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** Merge stored JSON over defaults: objects merge recursively, arrays replace (unless empty). */
function mergeDefaults<T>(base: T, parsed: unknown): T {
  if (Array.isArray(base)) {
    return (Array.isArray(parsed) && parsed.length ? parsed : base) as T;
  }
  if (isObj(base)) {
    if (!isObj(parsed)) return base;
    const out: Obj = { ...base };
    for (const key of Object.keys(parsed)) {
      out[key] = key in base ? mergeDefaults((base as Obj)[key], parsed[key]) : parsed[key];
    }
    return out as T;
  }
  return (parsed === undefined || parsed === null ? base : parsed) as T;
}

export function parseBannerData(raw?: string | null): BannerData {
  const base = defaultBannerData();
  if (!raw) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<BannerData>;
    const merged = mergeDefaults(base, parsed);
    // Lists the admin may intentionally empty.
    merged.slideshow = Array.isArray(parsed.slideshow) ? parsed.slideshow : base.slideshow;
    merged.socialFooter = Array.isArray(parsed.socialFooter) ? parsed.socialFooter : [];
    if (merged.roadmap.eyebrow === "Các chương trình đào tạo") {
      merged.roadmap.eyebrow = "Lớp đào tạo giảng viên";
    }
    if (merged.training.title === "Khám phá các nhóm đào tạo") {
      merged.training.title = "Lớp tập online";
    }
    if (merged.blogSection.title.trim().toLowerCase() === "blog") {
      merged.blogSection.title = "Kiến thức Yoga";
    }
    if (merged.footer.wordmark.replace(/\s+/g, "").toLowerCase() === "phuonglilyacademy") {
      merged.footer.wordmark = "Phuong Lily Academy";
    }
    const hasRecruitment = merged.header.links.some(
      (link) => link.href === "/tuyen-dung" || link.label.trim().toLowerCase() === "tuyển dụng",
    );
    if (!hasRecruitment) {
      merged.header.links = [
        ...merged.header.links,
        { id: "nav_tuyen_dung", label: "Tuyển dụng", href: "/tuyen-dung" },
      ];
    }
    return merged;
  } catch {
    return base;
  }
}

export function newMediaItem(partial?: Partial<MediaListItem>): MediaListItem {
  return {
    id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    link: "",
    imageUrl: "",
    sortOrder: 0,
    isVisible: true,
    ...partial,
  };
}

export function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
}

/** Chuyển link YouTube/Vimeo sang embed URL; trả null nếu là file video trực tiếp. */
export function toEmbedUrl(url: string): string | null {
  const u = url.trim();
  const yt =
    u.match(/youtu\.be\/([\w-]{6,})/) ||
    u.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}
