import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { adminSlugToType } from "@/lib/cms";

type Props = { params: Promise<{ type: string }> };

export default async function NewContentPage({ params }: Props) {
  const type = adminSlugToType((await params).type);
  if (!type) notFound();
  return <PostForm initial={{ type, status: "DRAFT" }} />;
}
