"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/components/course/CourseCard";
import type { CourseCard as CourseCardData } from "@/lib/course-queries";
import { cn } from "@/lib/utils";

export function CourseGrid({ courses }: { courses: CourseCardData[] }) {
  const [active, setActive] = useState("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of courses) {
      if (c.categorySlug && c.categoryName) map.set(c.categorySlug, c.categoryName);
    }
    return [...map.entries()];
  }, [courses]);

  const visible = active === "all" ? courses : courses.filter((c) => c.categorySlug === active);

  if (!courses.length) {
    return (
      <p className="rounded-3xl bg-white/60 p-12 text-center text-forest/60">Nội dung đang được cập nhật.</p>
    );
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {[["all", "Tất cả"] as const, ...categories].map(([slug, name]) => (
            <button
              key={slug}
              type="button"
              onClick={() => setActive(slug)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                active === slug
                  ? "border-forest bg-forest text-white"
                  : "border-forest/15 bg-white text-forest/80 hover:border-forest/40",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </>
  );
}
