import { PostListPage, listMetadata } from "@/lib/post-pages";

export const revalidate = 300;

export const generateMetadata = () => listMetadata("EVENT");

export default function Page() {
  return <PostListPage type="EVENT" />;
}
