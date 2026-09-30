import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminChrome";
import { ContentListPage } from "@/components/admin/ContentListPage";
import {
  POST_TYPE_LABEL,
  POST_TYPE_LIST_PATH,
  POST_TYPE_VIEW_PATH,
  adminSlugToType,
} from "@/lib/cms";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ type: string }> };

export default async function AdminContentListPage({ params }: Props) {
  const type = adminSlugToType((await params).type);
  if (!type) notFound();

  const posts = await prisma.post.findMany({
    where: { type },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
  });
  const label = POST_TYPE_LABEL[type];
  const listPath = POST_TYPE_LIST_PATH[type];

  return (
    <div>
      <AdminPageHeader title={label} />
      <ContentListPage
        typeLabel={label}
        createHref={`${listPath}/new`}
        editBasePath={listPath}
        viewBasePath={POST_TYPE_VIEW_PATH[type]}
        rows={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          thumbnail: p.thumbnail,
          categoryName: p.category?.name,
          createdAt: p.createdAt.toISOString(),
          views: p.views,
          sortOrder: p.sortOrder,
          isNew: p.isNew,
          isVisible: p.isVisible,
        }))}
      />
    </div>
  );
}
