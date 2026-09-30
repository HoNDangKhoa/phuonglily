import { CourseDetailPage, courseDetailMetadata } from "@/lib/course-pages";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return courseDetailMetadata("COURSE", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <CourseDetailPage type="COURSE" slug={(await params).slug} />;
}
