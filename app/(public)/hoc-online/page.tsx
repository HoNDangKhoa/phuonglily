import { CourseListPage } from "@/lib/course-pages";
import { listMetadata } from "@/lib/post-pages";

export const revalidate = 300;

export const generateMetadata = () => listMetadata("ONLINE");

export default function Page() {
  return <CourseListPage type="ONLINE" />;
}
