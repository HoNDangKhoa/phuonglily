import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { formatDate } from "@/components/site/PostCard";
import { POST_TYPE_LABEL } from "@/lib/cms";
import { getStudentCourses } from "@/lib/course-queries";
import { requireStudent } from "@/lib/student-auth";

export default async function MyCoursesPage() {
  const student = await requireStudent("/tai-khoan/khoa-hoc");
  const courses = await getStudentCourses(student.id);

  return (
    <>
      <h2 className="mb-6 text-2xl font-medium text-forest">Khoá học của tôi</h2>
      {courses.length === 0 ? (
        <div className="rounded-[24px] bg-white p-8">
          <p className="text-forest/70">
            Bạn chưa có khoá học nào đang học. Khoá học sẽ xuất hiện ở đây sau khi đăng ký được xác nhận.
          </p>
          <Link
            href="/hoc-online"
            className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-leaf"
          >
            Khám phá học online
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {courses.map((c) => (
            <article key={c.enrollmentId} className="flex flex-col overflow-hidden rounded-[24px] bg-white">
              <Link href={`/hoc/${c.post.slug}`} className="group relative block aspect-[16/9] bg-sage">
                {c.post.thumbnail && (
                  <Image
                    src={c.post.thumbnail}
                    alt={c.post.title}
                    fill
                    sizes="(min-width:640px) 420px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-forest/0 text-white opacity-0 transition group-hover:bg-forest/30 group-hover:opacity-100">
                  <PlayCircle size={48} strokeWidth={1.4} />
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs text-forest/50">
                  {POST_TYPE_LABEL[c.post.type]}
                  {c.packageName ? ` · Gói ${c.packageName}` : ""}
                </p>
                <h3 className="mt-1 line-clamp-2 text-lg leading-snug text-forest">{c.post.title}</h3>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-forest/60">
                    <span>
                      {c.done}/{c.total} bài học
                    </span>
                    <span className="font-medium text-forest">{c.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sage">
                    <div className="h-full rounded-full bg-leaf" style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
                <p className="mt-3 line-clamp-1 text-xs text-forest/50">
                  {c.lastLesson
                    ? `Học gần nhất: ${c.lastLesson.title} · ${formatDate(c.lastLesson.at.toISOString())}`
                    : "Chưa bắt đầu học"}
                </p>
                <Link
                  href={`/hoc/${c.post.slug}${c.lastLesson ? `?bai=${c.lastLesson.id}` : ""}`}
                  className="mt-5 inline-flex justify-center rounded-full bg-forest px-5 py-2.5 text-sm text-white hover:bg-leaf"
                >
                  {c.percent === 100 ? "Ôn tập lại" : c.lastLesson ? "Tiếp tục học" : "Bắt đầu học"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
