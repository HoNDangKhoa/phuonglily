import { PostDetailPage, detailMetadata } from "@/lib/post-pages";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return detailMetadata("BLOG", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <PostDetailPage type="BLOG" slug={(await params).slug} />;
}
