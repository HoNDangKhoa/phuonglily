"use server";

import { revalidatePath } from "next/cache";
import { auth, unstable_update } from "@/auth";
import { invalidateCmsCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { POST_TYPES, POST_TYPE_LIST_PATH, POST_TYPE_VIEW_PATH, slugify } from "@/lib/cms";
import type { BannerData, BrandAsset, MediaListItem, PageSeo } from "@/lib/branding";
import { PAGE_ARTICLE_CONFIG, type PageArticle, type PageArticleKey } from "@/lib/page-articles";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

async function revalidatePublic(slugs: string[] = []) {
  await invalidateCmsCache(slugs);
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

function revalidatePostAdmin() {
  for (const p of Object.values(POST_TYPE_LIST_PATH)) revalidatePath(p);
}

export async function savePost(formData: FormData) {
  const session = await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const id = text("id");
  const title = text("title");
  const type = text("type") || "BLOG";
  const status = text("status").toUpperCase() || "DRAFT";
  const categoryName = text("categoryName");
  const publishedRaw = text("publishedAt");
  const eventRaw = text("eventDate");

  if (!title) return { ok: false as const, error: "Vui lòng nhập tiêu đề." };
  if (!POST_TYPE_VIEW_PATH[type]) {
    return { ok: false as const, error: "Loại bài viết không hợp lệ." };
  }

  const base = slugify(text("slug") || title) || `bai-viet-${Date.now()}`;
  let slug = base;
  for (let n = 2; ; n++) {
    const clash = await prisma.post.findFirst({
      where: { slug, ...(id ? { NOT: { id } } : {}) },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${base}-${n}`;
  }

  let categoryId: string | null = null;
  if (categoryName) {
    const catSlug = `${type.toLowerCase()}-${slugify(categoryName)}`;
    const cat = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: categoryName, type },
      create: { name: categoryName, slug: catSlug, type },
    });
    categoryId = cat.id;
  }

  const normalizedStatus = ["PUBLISHED", "REVIEW", "ARCHIVED"].includes(status)
    ? status
    : "DRAFT";
  const publishedAt = publishedRaw ? new Date(publishedRaw) : null;

  const data = {
    title,
    slug,
    summary: text("summary") || null,
    contentHtml: String(formData.get("contentHtml") || ""),
    thumbnail: text("thumbnail") || null,
    type,
    status: normalizedStatus,
    categoryId,
    metaTitle: text("metaTitle") || null,
    metaDescription: text("metaDescription") || null,
    seoKeywords: text("seoKeywords") || null,
    canonicalUrl: text("canonicalUrl") || null,
    tags: text("tags") || null,
    sortOrder: Number(formData.get("sortOrder") || 0) || 0,
    isVisible: text("isVisible") !== "0",
    isFeatured: text("isFeatured") === "1",
    isNew: text("isNew") === "1",
    eventDate: eventRaw ? new Date(eventRaw) : null,
    location: text("location") || null,
    price: text("price") || null,
    duration: text("duration") || null,
    audience: text("audience") || null,
    schedule: text("schedule") || null,
    validity: text("validity") || null,
    offer: text("offer") || null,
    goals: String(formData.get("goals") ?? "").trim() || null,
    publishedAt:
      normalizedStatus === "PUBLISHED" ? publishedAt || new Date() : publishedAt,
    authorId: session.user!.id,
  };

  let savedId = id;
  let oldSlug: string | undefined;
  try {
    if (id) {
      const existing = await prisma.post.findUnique({
        where: { id },
        select: { slug: true },
      });
      if (!existing) {
        return { ok: false as const, error: "Bài viết không còn tồn tại." };
      }
      oldSlug = existing.slug;
      await prisma.post.update({ where: { id }, data });
    } else {
      savedId = (await prisma.post.create({ data })).id;
    }
  } catch (error) {
    console.error("[savePost]", error);
    return { ok: false as const, error: "Không lưu được bài viết. Vui lòng thử lại." };
  }

  await revalidatePublic([slug, ...(oldSlug ? [oldSlug] : [])]);
  revalidatePostAdmin();
  return { ok: true as const, slug, id: savedId };
}

export async function deletePost(id: string) {
  await requireAdmin();
  const post = await prisma.post.delete({ where: { id } });
  await revalidatePublic([post.slug]);
  revalidatePostAdmin();
}

export async function togglePostFlag(
  id: string,
  field: "isNew" | "isVisible" | "isFeatured",
  value: boolean,
) {
  await requireAdmin();
  const data: Record<string, boolean | string | Date | null> = { [field]: value };
  if (field === "isVisible") {
    data.status = value ? "PUBLISHED" : "DRAFT";
    data.publishedAt = value ? new Date() : null;
  }
  const post = await prisma.post.update({ where: { id }, data, select: { slug: true } });
  await revalidatePublic([post.slug]);
  revalidatePostAdmin();
}

export async function updatePostSortOrder(id: string, sortOrder: number) {
  await requireAdmin();
  const post = await prisma.post.update({
    where: { id },
    data: { sortOrder },
    select: { slug: true },
  });
  await revalidatePublic([post.slug]);
  revalidatePostAdmin();
}

function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePostAdmin();
}

export async function saveCategory(input: { id?: string; name: string; type: string }) {
  await requireAdmin();
  const name = input.name.trim();
  const type = (POST_TYPES as readonly string[]).includes(input.type) ? input.type : "BLOG";
  if (!name) return { ok: false as const, error: "Vui lòng nhập tên danh mục." };
  const slug = `${type.toLowerCase()}-${slugify(name)}`;
  const clash = await prisma.category.findFirst({
    where: { slug, ...(input.id ? { NOT: { id: input.id } } : {}) },
    select: { id: true },
  });
  if (clash) return { ok: false as const, error: "Danh mục này đã tồn tại." };
  if (input.id) {
    await prisma.category.update({ where: { id: input.id }, data: { name, type, slug } });
  } else {
    await prisma.category.create({ data: { name, type, slug } });
  }
  await revalidatePublic();
  revalidateCategoryPages();
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.$transaction([
    prisma.post.updateMany({ where: { categoryId: id }, data: { categoryId: null } }),
    prisma.category.delete({ where: { id } }),
  ]);
  await revalidatePublic();
  revalidateCategoryPages();
  return { ok: true as const };
}

export async function updateInquiryStatus(id: string, status: string, notes?: string) {
  await requireAdmin();
  await prisma.contactInquiry.update({
    where: { id },
    data: { status, notes: notes ?? undefined },
  });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}

export async function deleteInquiry(id: string) {
  await requireAdmin();
  await prisma.contactInquiry.delete({ where: { id } });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
}

export async function deleteSubscribers(ids: string[]) {
  await requireAdmin();
  await prisma.newsletterSubscriber.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/newsletter");
}

export async function toggleSubscriber(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.newsletterSubscriber.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/newsletter");
}

async function existingMailerPassword() {
  const row = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
    select: { mailerPassword: true },
  });
  return row?.mailerPassword || null;
}

export async function saveSiteSettings(formData: FormData) {
  await requireAdmin();
  const text = (key: string) => String(formData.get(key) ?? "").trim() || null;
  const companyName = text("companyName");
  if (!companyName) {
    return { ok: false as const, error: "Vui lòng nhập tiêu đề (tên học viện)." };
  }
  const data = {
    companyName,
    slogan: text("slogan"),
    hotline: text("hotline"),
    phone: text("phone"),
    email: text("email"),
    workingHours: text("workingHours"),
    headOffice: text("headOffice"),
    factoryAddress: text("factoryAddress"),
    website: text("website"),
    mapsCoords: text("mapsCoords"),
    mapsEmbedUrl: text("mapsEmbedUrl"),
    googleAnalytics: text("googleAnalytics"),
    googleWebmaster: text("googleWebmaster"),
    headJs: text("headJs"),
    bodyJs: text("bodyJs"),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    seoKeywords: text("seoKeywords"),
    primaryKeyword: text("primaryKeyword"),
    mailerHost: text("mailerHost"),
    mailerPort: text("mailerPort"),
    mailerSecure: text("mailerSecure"),
    mailerEmail: text("mailerEmail"),
    mailerPassword: text("mailerPassword") ?? (await existingMailerPassword()),
    socialLinks: JSON.stringify({
      facebook: text("fanpage") ?? "",
      fanpage: text("fanpage") ?? "",
      linkedin: text("linkedin") ?? "",
      zalo: text("zalo") ?? "",
      oaidZalo: text("oaidZalo") ?? "",
    }),
  };
  await prisma.siteSetting.upsert({
    where: { id: "site_config" },
    update: data,
    create: { id: "site_config", ...data },
  });
  await revalidatePublic();
  return { ok: true as const };
}

export async function changePassword(formData: FormData) {
  const bcrypt = (await import("bcryptjs")).default;
  const session = await requireAdmin();
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirmPassword") || "");

  if (next.length < 6) {
    return { ok: false as const, error: "Mật khẩu mới tối thiểu 6 ký tự." };
  }
  if (next !== confirm) {
    return { ok: false as const, error: "Mật khẩu nhập lại không khớp." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user!.id } });
  if (!user) return { ok: false as const, error: "Không tìm thấy tài khoản." };

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) {
    return { ok: false as const, error: "Mật khẩu hiện tại không đúng." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });
  return { ok: true as const };
}

export async function updateAccount(input: { name: string; email: string }) {
  const session = await requireAdmin();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!name) return { ok: false as const, error: "Vui lòng nhập họ tên." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Email không hợp lệ." };
  }
  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id: session.user!.id } },
    select: { id: true },
  });
  if (clash) return { ok: false as const, error: "Email đã được dùng cho tài khoản khác." };
  await prisma.user.update({
    where: { id: session.user!.id },
    data: { name, email },
  });
  await unstable_update({ user: { name, email } });
  revalidatePath("/admin", "layout");
  return { ok: true as const };
}

async function saveBannerData(mutator: (data: BannerData) => BannerData) {
  await requireAdmin();
  const { parseBannerData } = await import("@/lib/branding");
  const row = await prisma.siteSetting.findUnique({ where: { id: "site_config" } });
  const next = mutator(parseBannerData(row?.bannerData));
  await prisma.siteSetting.upsert({
    where: { id: "site_config" },
    update: { bannerData: JSON.stringify(next) },
    create: { id: "site_config", bannerData: JSON.stringify(next) },
  });
  await revalidatePublic();
  return next;
}

export type HomeSectionKey =
  | "header"
  | "hero"
  | "academy"
  | "roadmap"
  | "founder"
  | "appPromo"
  | "training"
  | "quoteCta"
  | "faq"
  | "blogSection"
  | "footer";

export async function saveHomeSection<K extends HomeSectionKey>(
  key: K,
  value: BannerData[K],
) {
  await saveBannerData((data) => ({ ...data, [key]: value }));
  return { ok: true as const };
}

export async function savePageArticle(page: PageArticleKey, article: PageArticle) {
  const config = PAGE_ARTICLE_CONFIG[page];
  if (!config) return { ok: false as const, error: "Trang không hợp lệ." };
  try {
    await saveBannerData((data) => ({
      ...data,
      pageArticles: {
        ...data.pageArticles,
        [page]: {
          title: String(article.title ?? "").trim(),
          content: String(article.content ?? ""),
          imageUrl: String(article.imageUrl ?? "").trim(),
        },
      },
    }));
    revalidatePath(`/admin/static/${page}`);
    revalidatePath(config.path);
    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Không lưu được bài viết. Vui lòng thử lại." };
  }
}

export async function saveBrandAsset(
  kind: "logo" | "favicon" | "video",
  payload: BrandAsset,
) {
  await saveBannerData((data) => ({ ...data, [kind]: payload }));
  if (kind === "favicon") {
    revalidatePath("/icon");
    revalidatePath("/apple-icon");
  }
}

export async function saveSlideshowItems(items: MediaListItem[]) {
  await saveBannerData((data) => ({ ...data, slideshow: items }));
}

export async function saveSocialFooterItems(items: MediaListItem[]) {
  await saveBannerData((data) => ({ ...data, socialFooter: items }));
}

export async function savePageSeo(key: string, seo: PageSeo) {
  await saveBannerData((data) => ({
    ...data,
    pageSeo: { ...data.pageSeo, [key]: seo },
  }));
}

export async function sendTestMail() {
  await requireAdmin();
  try {
    const { sendTestEmail } = await import("@/lib/mailer");
    const to = await sendTestEmail();
    return { ok: true as const, to };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Gửi email thất bại",
    };
  }
}
