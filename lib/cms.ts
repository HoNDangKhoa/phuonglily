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
  BLOG: "Blog",
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

export function adminSlugToType(slug: string): PostType | null {
  const entry = Object.entries(POST_TYPE_ADMIN_SLUG).find(([, s]) => s === slug);
  return (entry?.[0] as PostType) ?? null;
}
