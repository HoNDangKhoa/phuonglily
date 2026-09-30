import { PostDetailPage, detailMetadata } from "@/lib/post-pages";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return detailMetadata("EVENT", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <PostDetailPage type="EVENT" slug={(await params).slug} />;
}
