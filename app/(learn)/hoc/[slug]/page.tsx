import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearnPlayer } from "@/components/course/LearnPlayer";
import { POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { getLearnData } from "@/lib/course-queries";
import { getStudent } from "@/lib/student-auth";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bai?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getLearnData((await params).slug, null);
  return { title: data ? `Học: ${data.post.title}` : "Học online", robots: { index: false } };
}

export default async function LearnPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { bai } = await searchParams;
  const student = await getStudent();
  const data = await getLearnData(slug, student?.id ?? null);
  if (!data) notFound();

  const { lessons } = data;
  const current =
    lessons.find((l) => l.id === bai) ??
    lessons.find((l) => l.id === data.lastViewed) ??
    lessons.find((l) => !l.locked && !l.completed) ??
    lessons.find((l) => !l.locked) ??
    lessons[0];

  return (
    <LearnPlayer
      course={{
        title: data.post.title,
        slug: data.post.slug,
        href: `${POST_TYPE_VIEW_PATH[data.post.type]}/${data.post.slug}`,
      }}
      lessons={lessons}
      currentId={current?.id ?? null}
      hasAccess={data.hasAccess}
      loggedIn={!!student}
      pendingCode={data.enrollment?.status === "PENDING" ? data.enrollment.code : null}
    />
  );
}
