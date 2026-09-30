import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TrainingSection } from "@/components/home/TrainingSection";
import { CourseListPage } from "@/lib/course-pages";
import { listMetadata } from "@/lib/post-pages";
import { getSiteSettings } from "@/lib/queries";

export const revalidate = 300;

export const generateMetadata = () => listMetadata("COURSE");

export default async function Page() {
  const settings = await getSiteSettings();
  return (
    <>
      <CourseListPage type="COURSE" />
      <RoadmapSection roadmap={settings.roadmap} />
      <TrainingSection training={settings.training} />
    </>
  );
}
