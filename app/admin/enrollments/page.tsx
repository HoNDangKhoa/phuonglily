import { AdminPageHeader } from "@/components/admin/AdminChrome";
import { EnrollmentsTable } from "@/components/admin/EnrollmentsTable";
import { POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminEnrollmentsPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const rows = await prisma.enrollment.findMany({
    include: {
      student: { select: { email: true } },
      post: { select: { title: true, slug: true, type: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Đơn đăng ký học" />
      <p className="mb-4 text-sm text-ink/55">
        Đơn chuyển khoản QR được SePay tự chuyển sang “Đang học” khi tiền vào. Có thể đổi trạng thái thủ công nếu cần.
      </p>
      <EnrollmentsTable
        initialFilter={status && ["PENDING", "ACTIVE", "CANCELLED"].includes(status) ? status : "ALL"}
        rows={rows.map((r) => ({
          id: r.id,
          code: r.code,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          amount: r.amount,
          packageName: r.packageName,
          fullName: r.fullName,
          phone: r.phone,
          address: r.address,
          note: r.note,
          adminNote: r.adminNote,
          studentEmail: r.student.email,
          courseTitle: r.post.title,
          courseHref: `${POST_TYPE_VIEW_PATH[r.post.type]}/${r.post.slug}`,
        }))}
      />
    </div>
  );
}
