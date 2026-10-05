import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gift,
  Lock,
  MapPin,
  PlayCircle,
  Users,
  Video,
} from "lucide-react";
import { HtmlContent } from "@/components/common/HtmlContent";
import { RichText } from "@/components/common/RichText";
import { CourseCard } from "@/components/course/CourseCard";
import { CourseGrid } from "@/components/course/CourseGrid";
import { EnrollCard } from "@/components/course/EnrollCard";
import { PageHero } from "@/components/site/PageHero";
import { formatDate } from "@/components/site/PostCard";
import { POST_TYPE_LABEL, POST_TYPE_VIEW_PATH } from "@/lib/cms";
import {
  getCourseCards,
  getCourseDetail,
  type LearnableType,
} from "@/lib/course-queries";
import { groupByChapter } from "@/lib/learning";
import { incrementPostViews } from "@/lib/queries";
import { stripHtml } from "@/lib/rich-text";

const INTRO: Record<LearnableType, string> = {
  COURSE: "Các chương trình đào tạo HLV và Yoga chuyên sâu theo lộ trình toàn diện.",
  ONLINE: "Học Yoga mọi lúc, mọi nơi với bài giảng video và lộ trình theo dõi tiến độ.",
};

export async function CourseListPage({ type }: { type: LearnableType }) {
  const courses = await getCourseCards(type);
  const label = POST_TYPE_LABEL[type];
  return (
    <>
      <PageHero title={label} description={INTRO[type]} crumbs={[{ label }]} />
      <section className="bg-sage pb-24">
        <div className="container-site">
          <CourseGrid courses={courses} />
        </div>
      </section>
    </>
  );
}

export async function courseDetailMetadata(type: LearnableType, slug: string): Promise<Metadata> {
  const post = await getCourseDetail(type, slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || stripHtml(post.summary) || undefined,
    keywords: post.seoKeywords || undefined,
    alternates: post.canonicalUrl ? { canonical: post.canonicalUrl } : undefined,
    openGraph: post.thumbnail ? { images: [post.thumbnail] } : undefined,
  };
}

export async function CourseDetailPage({ type, slug }: { type: LearnableType; slug: string }) {
  const [post, all] = await Promise.all([getCourseDetail(type, slug), getCourseCards(type)]);
  if (!post) notFound();
  void incrementPostViews(post.id);

  const label = POST_TYPE_LABEL[type];
  const listHref = POST_TYPE_VIEW_PATH[type];
  const related = all.filter((c) => c.id !== post.id).slice(0, 4);
  const chapters = groupByChapter(post.lessons);

  const facts = [
    post.audience && { icon: Users, label: "Đối tượng học", value: post.audience },
    post.schedule && { icon: Video, label: "Hình thức học", value: post.schedule },
    post.eventDate && { icon: CalendarDays, label: "Khai giảng", value: formatDate(post.eventDate.toISOString()) },
    post.validity && { icon: Clock, label: "Hạn sử dụng", value: post.validity },
    post.duration && { icon: Clock, label: "Thời lượng", value: post.duration },
    post.location && { icon: MapPin, label: "Địa điểm", value: post.location },
    post.offer && { icon: Gift, label: "Ưu đãi", value: post.offer },
  ].filter(Boolean) as { icon: typeof Users; label: string; value: string }[];

  return (
    <>
      <section className="bg-sage pt-28 md:pt-32">
        <div className="container-site">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-forest/60">
            <Link href="/" className="hover:text-forest">Trang chủ</Link>
            <span>/</span>
            <Link href={listHref} className="hover:text-forest">{label}</Link>
            <span>/</span>
            <span className="line-clamp-1 text-forest">{post.title}</span>
          </nav>
          {post.thumbnail && (
            <div className="relative isolate aspect-[16/9] overflow-hidden rounded-[24px] bg-white md:aspect-[2/1] lg:aspect-[21/8] lg:rounded-[28px]">
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="relative z-10 bg-sage pt-5 pb-20 md:pt-8">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <article className="rounded-[24px] bg-white p-6 md:p-8">
              <h1 className="text-[clamp(1.45rem,5.4vw,2.3rem)] leading-[1.38] font-normal text-forest md:leading-snug">
                {post.title}
              </h1>
              {post.category && (
                <span className="mt-3 inline-block rounded-full border border-forest/20 px-3 py-0.5 text-xs text-forest/70">
                  {post.category.name}
                </span>
              )}
              <h2 className="mt-6 text-xl font-medium text-forest">Giới thiệu</h2>
              <RichText text={post.summary} className="mt-3 leading-relaxed text-forest/75" />

              {facts.length > 0 && (
                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  {facts.map((f) => (
                    <div key={f.label} className="flex gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-forest">
                        <f.icon size={17} />
                      </span>
                      <div>
                        <dt className="text-xs text-forest/50">{f.label}:</dt>
                        <dd className="text-sm font-medium text-forest">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              {post.goalsList.length > 0 && (
                <>
                  <h2 className="mt-8 text-xl font-medium text-forest">Mục tiêu chương trình học</h2>
                  <ul className="mt-4 space-y-3">
                    {post.goalsList.map((goal) => (
                      <li key={goal} className="flex gap-3 text-forest/80">
                        <CheckCircle2 size={20} className="mt-0.5 shrink-0 fill-leaf text-white" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>

            {post.lessons.length > 0 && (
              <section className="rounded-[24px] bg-white p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 className="text-xl font-medium text-forest">Nội dung khoá học</h2>
                  <p className="text-sm text-forest/55">
                    {chapters.length} chương · {post.lessons.length} bài học
                  </p>
                </div>
                <div className="mt-5 space-y-3">
                  {chapters.map((group, gi) => (
                    <details key={group.chapter} open={gi === 0} className="group rounded-2xl border border-forest/10">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5">
                        <span className="font-medium text-forest">{group.chapter}</span>
                        <span className="flex items-center gap-3 text-xs text-forest/50">
                          {group.lessons.length} bài
                          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                        </span>
                      </summary>
                      <ul className="border-t border-forest/10">
                        {group.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm text-forest/80">
                            {lesson.isPreview ? (
                              <PlayCircle size={16} className="shrink-0 text-leaf" />
                            ) : (
                              <Lock size={14} className="shrink-0 text-forest/35" />
                            )}
                            <span className="flex-1">{lesson.title}</span>
                            {lesson.isPreview && (
                              <Link href={`/hoc/${post.slug}?bai=${lesson.id}`} className="rounded-full bg-lime-bright/80 px-2.5 py-0.5 text-xs font-medium text-forest hover:bg-lime-bright">
                                Học thử
                              </Link>
                            )}
                            {lesson.duration && <span className="text-xs text-forest/45">{lesson.duration}</span>}
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {post.contentHtml && (
              <section className="rounded-[24px] bg-white p-6 md:p-8">
                <h2 className="mb-4 text-xl font-medium text-forest">Chi tiết chương trình</h2>
                <HtmlContent className="prose-pl" html={post.contentHtml} />
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <EnrollCard
              postId={post.id}
              slug={post.slug}
              title={post.title}
              priceText={post.price}
              lessonCount={post.lessons.length}
              packages={post.packages.map((p) => ({
                id: p.id,
                name: p.name,
                badge: p.badge,
                description: p.description,
                price: p.price,
                oldPrice: p.oldPrice,
              }))}
            />
          </aside>
        </div>

        {related.length > 0 && (
          <div className="container-site mt-16">
            <h2 className="mb-8 text-3xl font-normal text-forest">{label} khác</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
