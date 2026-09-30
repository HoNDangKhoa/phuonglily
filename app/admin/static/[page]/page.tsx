import { notFound } from "next/navigation";
import { PageArticleEditor } from "@/components/admin/HomeSectionForms";
import { isPageArticleKey } from "@/lib/page-articles";
import { getSiteSettings } from "@/lib/queries";

type Props = { params: Promise<{ page: string }> };

export default async function Page({ params }: Props) {
  const { page } = await params;
  if (!isPageArticleKey(page)) notFound();
  const settings = await getSiteSettings();
  return <PageArticleEditor key={page} page={page} initial={settings.pageArticles[page]} />;
}
