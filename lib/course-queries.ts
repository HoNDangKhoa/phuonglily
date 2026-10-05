import { prisma } from "@/lib/prisma";
import type { PostType } from "@/lib/cms";
import { progressPercent } from "@/lib/learning";

export type LearnableType = Extract<PostType, "COURSE" | "ONLINE">;

export function isLearnable(type: string): type is LearnableType {
  return type === "COURSE" || type === "ONLINE";
}

const published = { status: "PUBLISHED", isVisible: true };

export type CourseCard = {
  id: string;
  title: string;
  slug: string;
  type: string;
  thumbnail: string | null;
  summary: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  price: number | null;
  oldPrice: number | null;
  priceText: string | null;
  lessonCount: number;
  isFeatured: boolean;
};

function foldLabel(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

const CATALOG_NEEDLES = {
  instructor: ["lop dao tao giang vien", "lop dao tao giao vien"],
  online: ["lop online cong dong"],
} as const;

/** Khoá đã xuất bản của một danh mục. Nếu chưa đặt đúng tên danh mục thì dùng toàn bộ loại đó. */
export async function getCatalogCourses(kind: keyof typeof CATALOG_NEEDLES): Promise<CourseCard[]> {
  const type: LearnableType = kind === "instructor" ? "COURSE" : "ONLINE";
  const cards = await getCourseCards(type);
  const needles = CATALOG_NEEDLES[kind];
  const matched = cards.filter((course) => {
    const label = foldLabel(`${course.categoryName || ""} ${course.categorySlug || ""}`);
    return needles.some((needle) => label.includes(needle));
  });
  return matched.length ? matched : cards;
}

export async function getCourseCards(type: LearnableType): Promise<CourseCard[]> {
  try {
    const posts = await prisma.post.findMany({
      where: { type, ...published },
      include: {
        category: { select: { name: true, slug: true } },
        packages: { orderBy: [{ price: "asc" }] },
        _count: { select: { lessons: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return posts.map((p) => {
      const cheapest = p.packages[0];
      return {
        id: p.id,
        title: p.title,
        slug: p.slug,
        type: p.type,
        thumbnail: p.thumbnail,
        summary: p.summary,
        categoryName: p.category?.name ?? null,
        categorySlug: p.category?.slug ?? null,
        price: cheapest?.price ?? null,
        oldPrice: cheapest?.oldPrice ?? null,
        priceText: p.price,
        lessonCount: p._count.lessons,
        isFeatured: p.isFeatured,
      };
    });
  } catch (error) {
    console.error("[course-queries:getCourseCards]", error);
    return [];
  }
}

export async function getCourseDetail(type: LearnableType, slug: string) {
  try {
    const post = await prisma.post.findFirst({
      where: { type, slug, ...published },
      include: {
        category: { select: { name: true } },
        packages: { orderBy: { sortOrder: "asc" } },
        lessons: {
          orderBy: { sortOrder: "asc" },
          select: { id: true, chapter: true, title: true, duration: true, isPreview: true },
        },
      },
    });
    if (!post) return null;
    return {
      ...post,
      goalsList: (post.goals ?? "")
        .split(/\r?\n/)
        .map((g) => g.trim())
        .filter(Boolean),
    };
  } catch (error) {
    console.error("[course-queries:getCourseDetail]", error);
    return null;
  }
}

export type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseDetail>>>;

export async function getLearnData(slug: string, studentId: string | null) {
  const post = await prisma.post.findFirst({
    where: { slug, type: { in: ["COURSE", "ONLINE"] }, ...published },
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
  });
  if (!post) return null;

  const [enrollment, progress] = studentId
    ? await Promise.all([
        prisma.enrollment.findFirst({
          where: { studentId, postId: post.id, status: { in: ["PENDING", "ACTIVE"] } },
          orderBy: { createdAt: "desc" },
        }),
        prisma.lessonProgress.findMany({
          where: { studentId, lesson: { postId: post.id } },
        }),
      ])
    : [null, []];

  const hasAccess = enrollment?.status === "ACTIVE";
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const lastViewed = [...progress].sort(
    (a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime(),
  )[0]?.lessonId;

  return {
    post,
    enrollment,
    hasAccess,
    lessons: post.lessons.map((l) => ({
      id: l.id,
      chapter: l.chapter,
      title: l.title,
      duration: l.duration,
      description: l.description,
      isPreview: l.isPreview,
      locked: !hasAccess && !l.isPreview,
      videoUrl: hasAccess || l.isPreview ? l.videoUrl : "",
      completed: done.has(l.id),
    })),
    lastViewed,
    percent: progressPercent(done.size, post.lessons.length),
    doneCount: done.size,
  };
}

export type LearnData = NonNullable<Awaited<ReturnType<typeof getLearnData>>>;

export async function getStudentOrders(studentId: string) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      post: { select: { title: true, slug: true, type: true, thumbnail: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStudentOrder(studentId: string, code: string) {
  return prisma.enrollment.findFirst({
    where: { studentId, code },
    include: {
      post: {
        select: {
          title: true,
          slug: true,
          type: true,
          thumbnail: true,
          duration: true,
          _count: { select: { lessons: true } },
        },
      },
    },
  });
}

export async function getStudentCourses(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          thumbnail: true,
          lessons: { select: { id: true } },
        },
      },
    },
    orderBy: { activatedAt: "desc" },
  });
  const progress = await prisma.lessonProgress.findMany({
    where: { studentId },
    include: { lesson: { select: { postId: true, title: true } } },
    orderBy: { lastViewedAt: "desc" },
  });

  return enrollments.map((e) => {
    const mine = progress.filter((p) => p.lesson.postId === e.postId);
    const done = mine.filter((p) => p.completed).length;
    return {
      enrollmentId: e.id,
      code: e.code,
      packageName: e.packageName,
      activatedAt: e.activatedAt,
      post: e.post,
      total: e.post.lessons.length,
      done,
      percent: progressPercent(done, e.post.lessons.length),
      lastLesson: mine[0]
        ? { id: mine[0].lessonId, title: mine[0].lesson.title, at: mine[0].lastViewedAt }
        : null,
    };
  });
}
