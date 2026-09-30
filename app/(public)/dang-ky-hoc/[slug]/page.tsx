import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckoutForm } from "@/components/course/CheckoutForm";
import { POST_TYPE_LABEL, POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";

export const metadata: Metadata = { title: "Đăng ký học", robots: { index: false } };

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ goi?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { goi } = await searchParams;
  const student = await requireStudent(`/dang-ky-hoc/${slug}${goi ? `?goi=${goi}` : ""}`);

  const post = await prisma.post.findFirst({
    where: { slug, type: { in: ["COURSE", "ONLINE"] }, status: "PUBLISHED", isVisible: true },
    include: {
      packages: { orderBy: { sortOrder: "asc" } },
      _count: { select: { lessons: true } },
    },
  });
  if (!post) notFound();

  const existing = await prisma.enrollment.findFirst({
    where: { studentId: student.id, postId: post.id, status: { in: ["PENDING", "ACTIVE"] } },
    select: { code: true },
  });
  if (existing) redirect(`/tai-khoan/don/${existing.code}`);

  const courseHref = `${POST_TYPE_VIEW_PATH[post.type]}/${post.slug}`;

  return (
    <section className="min-h-dvh bg-sage pt-32 pb-24 md:pt-40">
      <div className="container-site">
        <nav className="mb-3 flex flex-wrap gap-1.5 text-sm text-forest/60">
          <Link href={POST_TYPE_VIEW_PATH[post.type]} className="hover:text-forest">
            {POST_TYPE_LABEL[post.type]}
          </Link>
          <span>/</span>
          <Link href={courseHref} className="hover:text-forest">
            {post.title}
          </Link>
        </nav>
        <h1 className="mb-8 text-[clamp(2rem,4vw,3rem)] font-normal tracking-tight text-forest">Đăng ký học</h1>
        <CheckoutForm
          course={{
            id: post.id,
            title: post.title,
            thumbnail: post.thumbnail,
            priceText: post.price,
            lessonCount: post._count.lessons,
          }}
          packages={post.packages.map((p) => ({
            id: p.id,
            name: p.name,
            badge: p.badge,
            description: p.description,
            price: p.price,
            oldPrice: p.oldPrice,
          }))}
          initialPackage={goi}
          profile={{
            name: student.name,
            phone: student.phone ?? "",
            address: [student.address, student.ward, student.province].filter(Boolean).join(", "),
            email: student.email,
          }}
        />
      </div>
    </section>
  );
}
