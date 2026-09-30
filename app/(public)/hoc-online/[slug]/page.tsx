import { CourseDetailPage, courseDetailMetadata } from "@/lib/course-pages";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return courseDetailMetadata("ONLINE", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <CourseDetailPage type="ONLINE" slug={(await params).slug} />;
}
