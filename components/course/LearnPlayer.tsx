"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Lock,
  Menu,
  PlayCircle,
  X,
} from "lucide-react";
import { toEmbedUrl } from "@/lib/branding";
import { groupByChapter, progressPercent } from "@/lib/learning";
import { markLessonViewed, setLessonCompleted } from "@/lib/student-actions";
import { cn } from "@/lib/utils";

type Lesson = {
  id: string;
  chapter: string;
  title: string;
  duration: string | null;
  description: string | null;
  isPreview: boolean;
  locked: boolean;
  videoUrl: string;
  completed: boolean;
};

function VideoFrame({ url, title }: { url: string; title: string }) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-white/60">
        Video của bài học đang được cập nhật.
      </div>
    );
  }
  const embed = toEmbedUrl(url);
  if (embed) {
    return (
      <iframe
        key={embed}
        src={embed.replace("autoplay=1", "autoplay=0")}
        title={title}
        className="h-full w-full"
        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }
  return (
    <video key={url} src={url} controls playsInline controlsList="nodownload" className="h-full w-full bg-black" />
  );
}

export function LearnPlayer({
  course,
  lessons,
  currentId,
  hasAccess,
  loggedIn,
  pendingCode,
}: {
  course: { title: string; slug: string; href: string };
  lessons: Lesson[];
  currentId: string | null;
  hasAccess: boolean;
  loggedIn: boolean;
  pendingCode: string | null;
}) {
  const router = useRouter();
  const [done, setDone] = useState(() => new Set(lessons.filter((l) => l.completed).map((l) => l.id)));
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const index = lessons.findIndex((l) => l.id === currentId);
  const current = index >= 0 ? lessons[index] : null;
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;
  const chapters = useMemo(() => groupByChapter(lessons), [lessons]);
  const percent = progressPercent(done.size, lessons.length);
  const lessonHref = (id: string) => `/hoc/${course.slug}?bai=${id}`;

  useEffect(() => {
    if (current && !current.locked && loggedIn) void markLessonViewed(current.id);
  }, [current, loggedIn]);

  const toggleDone = () => {
    if (!current) return;
    const value = !done.has(current.id);
    setError("");
    startTransition(async () => {
      const res = await setLessonCompleted(current.id, value);
      if (!res.ok) return setError(res.error);
      setDone((s) => {
        const copy = new Set(s);
        if (value) copy.add(current.id);
        else copy.delete(current.id);
        return copy;
      });
      if (value && next && !next.locked) router.push(lessonHref(next.id));
    });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="border-b border-forest/10 p-5">
        <p className="text-sm font-medium text-forest">Nội dung khoá học</p>
        {hasAccess && (
          <>
            <div className="mt-3 flex justify-between text-xs text-forest/60">
              <span>
                Hoàn thành {done.size}/{lessons.length} bài
              </span>
              <span className="font-semibold text-forest">{percent}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sage">
              <div className="h-full rounded-full bg-leaf transition-all duration-700" style={{ width: `${percent}%` }} />
            </div>
          </>
        )}
      </div>
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        {chapters.map((group, gi) => {
          const chapterDone = group.lessons.filter((l) => done.has(l.id)).length;
          const containsCurrent = group.lessons.some((l) => l.id === currentId);
          return (
            <details key={`${group.chapter}-${gi}`} open={containsCurrent || gi === 0} className="group border-b border-forest/10">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4">
                <span>
                  <span className="block text-sm font-medium text-forest">{group.chapter}</span>
                  <span className="text-xs text-forest/50">
                    {chapterDone}/{group.lessons.length} bài
                  </span>
                </span>
                <ChevronDown size={16} className="shrink-0 text-forest/50 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="pb-2">
                {group.lessons.map((lesson) => {
                  const active = lesson.id === currentId;
                  const number = lessons.indexOf(lesson) + 1;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={lessonHref(lesson.id)}
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "flex items-start gap-3 px-5 py-2.5 text-sm transition-colors",
                          active ? "bg-leaf/10 text-forest" : "text-forest/75 hover:bg-sage/50",
                        )}
                      >
                        <span className="mt-0.5 shrink-0">
                          {lesson.locked ? (
                            <Lock size={15} className="text-forest/35" />
                          ) : done.has(lesson.id) ? (
                            <CheckCircle2 size={16} className="fill-leaf text-white" />
                          ) : active ? (
                            <PlayCircle size={16} className="text-leaf" />
                          ) : (
                            <Circle size={16} className="text-forest/30" />
                          )}
                        </span>
                        <span className="flex-1">
                          <span className={cn("block leading-snug", active && "font-medium")}>
                            {number}. {lesson.title}
                          </span>
                          <span className="mt-0.5 flex gap-2 text-xs text-forest/45">
                            {lesson.duration && <span>{lesson.duration}</span>}
                            {lesson.isPreview && !hasAccess && <span className="text-leaf">Học thử</span>}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-forest px-4 text-white md:px-6">
        <Link
          href={hasAccess ? "/tai-khoan/khoa-hoc" : course.href}
          aria-label="Quay lại"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <ArrowLeft size={18} />
        </Link>
        <p className="line-clamp-1 flex-1 text-sm font-medium md:text-base">{course.title}</p>
        {hasAccess && (
          <div className="hidden items-center gap-3 text-xs sm:flex">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-lime-bright" style={{ width: `${percent}%` }} />
            </div>
            <span>{percent}% hoàn thành</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-9 items-center gap-2 rounded-full bg-white/10 px-3 text-sm hover:bg-white/20 lg:hidden"
        >
          <Menu size={16} /> Bài học
        </button>
      </header>

      <div className="flex flex-1">
        <main className="min-w-0 flex-1">
          <div className="relative aspect-video max-h-[calc(100dvh-4rem)] w-full bg-black">
            {current && !current.locked ? (
              <VideoFrame url={current.videoUrl} title={current.title} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-white">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  {pendingCode ? <Clock3 size={24} /> : <Lock size={24} />}
                </span>
                <p className="max-w-md text-lg">
                  {pendingCode
                    ? "Đơn đăng ký của bạn đang chờ xác nhận. Khoá học sẽ mở ngay khi được kích hoạt."
                    : "Bài học này dành cho học viên đã đăng ký khoá học."}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {pendingCode ? (
                    <Link href={`/tai-khoan/don/${pendingCode}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-forest">
                      Xem đơn #{pendingCode}
                    </Link>
                  ) : (
                    <Link href={`/dang-ky-hoc/${course.slug}`} className="rounded-full bg-lime-bright px-5 py-2.5 text-sm font-semibold text-forest">
                      Đăng ký khoá học
                    </Link>
                  )}
                  {!loggedIn && (
                    <Link
                      href={`/dang-nhap?next=${encodeURIComponent(current ? lessonHref(current.id) : `/hoc/${course.slug}`)}`}
                      className="rounded-full border border-white/40 px-5 py-2.5 text-sm"
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {current ? (
            <div className="mx-auto max-w-4xl px-5 py-7 md:px-8">
              <p className="text-xs tracking-wide text-leaf uppercase">
                {current.chapter || "Nội dung khoá học"} · Bài {index + 1}/{lessons.length}
              </p>
              <h1 className="mt-2 text-2xl font-medium text-forest md:text-3xl">{current.title}</h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {hasAccess && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={toggleDone}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60",
                      done.has(current.id)
                        ? "bg-leaf/10 text-leaf hover:bg-leaf/15"
                        : "bg-forest text-white hover:bg-leaf",
                    )}
                  >
                    <CheckCircle2 size={17} />
                    {done.has(current.id) ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  {prev && (
                    <Link href={lessonHref(prev.id)} className="inline-flex items-center gap-1 rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm text-forest hover:border-forest">
                      <ChevronLeft size={16} /> Bài trước
                    </Link>
                  )}
                  {next && (
                    <Link href={lessonHref(next.id)} className="inline-flex items-center gap-1 rounded-full border border-forest/15 bg-white px-4 py-2.5 text-sm text-forest hover:border-forest">
                      Bài tiếp <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              {current.description && !current.locked && (
                <div className="mt-8 rounded-[20px] bg-white p-6">
                  <p className="mb-3 font-medium text-forest">Mô tả bài học</p>
                  <p className="leading-relaxed whitespace-pre-line text-forest/75">{current.description}</p>
                </div>
              )}
              {hasAccess && percent === 100 && (
                <div className="mt-6 rounded-[20px] bg-lime-bright/30 p-6 text-forest">
                  Chúc mừng! Bạn đã hoàn thành toàn bộ khoá học.
                </div>
              )}
            </div>
          ) : (
            <p className="p-10 text-center text-forest/60">Khoá học chưa có bài học nào.</p>
          )}
        </main>

        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[360px] shrink-0 border-l border-forest/10 bg-white lg:block">
          {sidebar}
        </aside>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-forest/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="h-full w-[88%] max-w-sm bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-3">
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Đóng" className="p-2 text-forest">
                <X size={20} />
              </button>
            </div>
            <div className="h-[calc(100%-56px)]">{sidebar}</div>
          </div>
        </div>
      )}
    </div>
  );
}
