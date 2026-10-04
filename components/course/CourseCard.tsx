import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { stripHtml } from "@/lib/rich-text";
import type { CourseCard as CourseCardData } from "@/lib/course-queries";
import { discountPercent, formatVnd } from "@/lib/learning";

export function CourseCard({ course }: { course: CourseCardData }) {
  const href = `${POST_TYPE_VIEW_PATH[course.type]}/${course.slug}`;
  const off = course.price !== null ? discountPercent(course.price, course.oldPrice) : 0;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[20px] bg-white p-3 shadow-[0_16px_40px_-30px_rgba(29,58,31,0.6)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(29,58,31,0.55)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-sage">
        {course.thumbnail && (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        )}
        {off > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-lime-bright px-2.5 py-1 text-xs font-semibold text-forest">
            Giảm {off}%
          </span>
        )}
        {course.categoryName && (
          <span className="absolute right-3 bottom-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium text-forest backdrop-blur">
            {course.categoryName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1.5 pt-4 pb-1">
        <h3 className="line-clamp-2 text-[17px] leading-snug font-semibold text-forest uppercase transition-colors group-hover:text-leaf">
          {course.title}
        </h3>
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-forest/60">
          {off > 0 && (
            <span className="rounded-md bg-leaf/10 px-1.5 py-0.5 text-xs font-semibold text-leaf">-{off}%</span>
          )}
          {course.lessonCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <PlayCircle size={14} /> Bao gồm {course.lessonCount} bài học
            </span>
          ) : (
            course.summary && <span className="line-clamp-1">{stripHtml(course.summary)}</span>
          )}
        </div>
        <div className="mt-auto flex items-baseline gap-2.5 pt-4">
          {course.price !== null ? (
            <>
              <span className="text-xl font-bold text-leaf">{formatVnd(course.price)}</span>
              {off > 0 && (
                <span className="text-sm text-forest/40 line-through">{formatVnd(course.oldPrice)}</span>
              )}
            </>
          ) : (
            <span className="text-lg font-semibold text-leaf">{course.priceText || "Liên hệ"}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
