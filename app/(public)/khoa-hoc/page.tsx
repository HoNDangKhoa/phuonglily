import { RoadmapSection } from "@/components/home/RoadmapSection";
import { TrainingSection } from "@/components/home/TrainingSection";
import { getCatalogCourses, withCatalogLinks } from "@/lib/course-queries";
import { CourseListPage } from "@/lib/course-pages";
import { listMetadata } from "@/lib/post-pages";
import { getSiteSettings } from "@/lib/queries";

export const revalidate = 300;

export const generateMetadata = () => listMetadata("COURSE");

export default async function Page() {
  const [settings, instructorCourses, onlineCourses] = await Promise.all([
    getSiteSettings(),
    getCatalogCourses("instructor"),
    getCatalogCourses("online"),
  ]);
  const roadmap = {
    ...settings.roadmap,
    items: withCatalogLinks(settings.roadmap.items, (item) => item.title, instructorCourses),
  };
  const training = {
    ...settings.training,
    items: withCatalogLinks(settings.training.items, (item) => item.name, onlineCourses),
  };

  return (
    <>
      <CourseListPage type="COURSE" />
      <RoadmapSection roadmap={roadmap} />
      <TrainingSection training={training} />
    </>
  );
}
