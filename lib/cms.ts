export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  NEW: "Mới",
  CONTACTED: "Đã gọi điện",
  PROCESSING: "Đang tư vấn",
  COMPLETED: "Đã ghi danh",
  CANCELLED: "Huỷ",
};

export const POST_TYPES = ["COURSE", "ONLINE", "EVENT", "BLOG"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_TYPE_LABEL: Record<string, string> = {
  COURSE: "Khoá học",
  ONLINE: "Học online",
  EVENT: "Lịch sự kiện",
  BLOG: "Kiến thức Yoga",
};

export const POST_STATUS_LABEL: Record<string, string> = {
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const POST_TYPE_DEFAULT_CATEGORY: Record<string, string> = {
  COURSE: "Khoá học",
  ONLINE: "Học online",
  EVENT: "Sự kiện",
  BLOG: "Yoga",
};

export const POST_TYPE_ADMIN_SLUG: Record<string, string> = {
  COURSE: "courses",
  ONLINE: "online",
  EVENT: "events",
  BLOG: "blog",
};

export const POST_TYPE_LIST_PATH: Record<string, string> = {
  COURSE: "/admin/content/courses",
  ONLINE: "/admin/content/online",
  EVENT: "/admin/content/events",
  BLOG: "/admin/content/blog",
};

export const POST_TYPE_VIEW_PATH: Record<string, string> = {
  COURSE: "/khoa-hoc",
  ONLINE: "/hoc-online",
  EVENT: "/lich-su-kien",
  BLOG: "/blog",
};

/** Trang thật của menu. Admin chỉ được chọn trong danh sách này để không tạo link 404. */
export const MENU_PAGES = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/khoa-hoc", label: "Lớp đào tạo giảng viên" },
  { href: "/hoc-online", label: "Lớp tập online" },
  { href: "/lich-su-kien", label: "Lịch sự kiện" },
  { href: "/blog", label: "Kiến thức Yoga" },
  { href: "/tuyen-dung", label: "Tuyển dụng" },
  { href: "/lien-he", label: "Liên hệ" },
] as const;

const MENU_ALIAS: Record<string, string> = {
  "gioi-thieu": "/gioi-thieu",
  "ve-phuong-lily": "/gioi-thieu",
  about: "/gioi-thieu",
  "khoa-hoc": "/khoa-hoc",
  "lop-dao-tao": "/khoa-hoc",
  "lop-dao-tao-giao-vien": "/khoa-hoc",
  "lop-dao-tao-giang-vien": "/khoa-hoc",
  "hoc-online": "/hoc-online",
  "lop-tap-online": "/hoc-online",
  "lich-su-kien": "/lich-su-kien",
  "su-kien": "/lich-su-kien",
  blog: "/blog",
  "kien-thuc-yoga": "/blog",
  "lien-he": "/lien-he",
  contact: "/lien-he",
  "tuyen-dung": "/tuyen-dung",
  "tuyen-dung-yoga": "/tuyen-dung",
  careers: "/tuyen-dung",
};

/** Đưa link menu về một trang đang có, kể cả khi admin gõ nhầm slug. */
export function resolveMenuHref(href: string): string {
  const raw = href.trim();
  if (!raw || raw === "#") return "/lien-he";
  if (/^https?:\/\//i.test(raw)) return raw;
  const path = (raw.startsWith("/") ? raw : `/${raw}`).replace(/\/{2,}/g, "/");
  const clean = path.split("?")[0]?.split("#")[0]?.replace(/\/+$/, "") || "/";
  if (clean === "/") return "/";
  const known = MENU_PAGES.find((page) => clean === page.href || clean.startsWith(`${page.href}/`));
  if (known || clean.startsWith("/chinh-sach") || clean.startsWith("/tai-khoan") || clean.startsWith("/dang-") || clean.startsWith("/hoc/")) {
    return path;
  }
  const slug = clean.slice(1).toLowerCase();
  return MENU_ALIAS[slug] ?? "/lien-he";
}

export function adminSlugToType(slug: string): PostType | null {
  const entry = Object.entries(POST_TYPE_ADMIN_SLUG).find(([, s]) => s === slug);
  return (entry?.[0] as PostType) ?? null;
}
