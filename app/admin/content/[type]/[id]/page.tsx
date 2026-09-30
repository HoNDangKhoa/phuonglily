import { notFound } from "next/navigation";
import {
  LessonsEditor,
  PackagesEditor,
} from "@/components/admin/CourseExtrasEditor";
import { PostForm } from "@/components/admin/PostForm";
import { adminSlugToType } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ type: string; id: string }> };

const toDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export default async function EditContentPage({ params }: Props) {
  const { type: typeSlug, id } = await params;
  const type = adminSlugToType(typeSlug);
  if (!type) notFound();

  const post = await prisma.post.findFirst({
    where: { id, type },
    include: {
      category: true,
      packages: { orderBy: { sortOrder: "asc" } },
      lessons: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!post) notFound();

  const learnable = post.type === "COURSE" || post.type === "ONLINE";

  return (
    <div className="space-y-4">
      <PostForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          contentHtml: post.contentHtml,
          thumbnail: post.thumbnail,
          type: post.type,
          status: post.status,
          categoryName: post.category?.name,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          seoKeywords: post.seoKeywords,
          canonicalUrl: post.canonicalUrl,
          tags: post.tags,
          sortOrder: post.sortOrder,
          isVisible: post.isVisible,
          isFeatured: post.isFeatured,
          isNew: post.isNew,
          publishedAt: toDate(post.publishedAt),
          eventDate: post.eventDate
            ? post.eventDate.toISOString().slice(0, 16)
            : null,
          location: post.location,
          price: post.price,
          duration: post.duration,
          audience: post.audience,
          schedule: post.schedule,
          validity: post.validity,
          offer: post.offer,
          goals: post.goals,
        }}
      />
      {learnable && (
        <>
          <PackagesEditor
            postId={post.id}
            initial={post.packages.map((p) => ({
              id: p.id,
              name: p.name,
              badge: p.badge,
              description: p.description ?? "",
              price: p.price,
              oldPrice: p.oldPrice,
            }))}
          />
          <LessonsEditor
            postId={post.id}
            initial={post.lessons.map((l) => ({
              id: l.id,
              chapter: l.chapter,
              title: l.title,
              videoUrl: l.videoUrl,
              duration: l.duration ?? "",
              description: l.description ?? "",
              isPreview: l.isPreview,
            }))}
          />
        </>
      )}
    </div>
  );
}
