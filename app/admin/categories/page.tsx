import { AdminPageHeader } from "@/components/admin/AdminChrome";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { posts: true } } },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <AdminPageHeader title="Danh mục bài viết" />
      <CategoryManager
        initial={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          type: c.type,
          postCount: c._count.posts,
        }))}
      />
    </div>
  );
}
