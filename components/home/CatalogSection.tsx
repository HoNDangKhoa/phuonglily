import { CourseGrid } from "@/components/course/CourseGrid";
import { Reveal } from "@/components/site/Reveal";
import type { CourseCard } from "@/lib/course-queries";
import { cn } from "@/lib/utils";

/** Khối trang chủ dùng đúng thẻ khoá học của danh mục tương ứng. */
export function CatalogSection({
  eyebrow,
  title,
  courses,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  courses: CourseCard[];
  align?: "left" | "center";
}) {
  return (
    <section className="bg-sage py-16 md:py-24">
      <div className="container-site">
        <Reveal>
          {eyebrow ? <p className="text-xl text-forest/85 md:text-2xl">{eyebrow}</p> : null}
          <h2
            className={cn(
              "text-[clamp(2rem,3.8vw,2.9rem)] leading-tight font-normal tracking-tight text-forest",
              eyebrow ? "mt-1" : "",
              align === "center" && "text-center",
            )}
          >
            {title}
          </h2>
        </Reveal>
        <div className="mt-10">
          <CourseGrid courses={courses} />
        </div>
      </div>
    </section>
  );
}
