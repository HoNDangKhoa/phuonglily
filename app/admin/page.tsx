import { Suspense } from "react";
import Link from "next/link";
import { Gauge } from "lucide-react";
import {
  DashboardAnalyticsPanel,
  QuickLinkCards,
} from "@/components/admin/DashboardAnalytics";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminChrome";
import { Badge } from "@/components/ui/input";
import {
  getDashboardAnalytics,
  seedDemoVisitsIfEmpty,
} from "@/lib/analytics";
import { INQUIRY_STATUS_LABEL } from "@/lib/cms";
import { enrollmentStatus, formatVnd } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

type Props = { searchParams: Promise<{ month?: string; year?: string }> };

export default async function AdminDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  const month = Number(sp.month) || undefined;
  const year = Number(sp.year) || undefined;

  await seedDemoVisitsIfEmpty();

  const [analytics, latest, enrollments, pendingCount, activeCount, studentCount] = await Promise.all([
    getDashboardAnalytics(month, year),
    prisma.contactInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { post: { select: { title: true } } },
    }),
    prisma.enrollment.count({ where: { status: "PENDING" } }),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.student.count(),
  ]);

  const enrollmentStats: [string, number, string][] = [
    ["Đơn chờ xác nhận", pendingCount, "/admin/enrollments?status=PENDING"],
    ["Đang học", activeCount, "/admin/enrollments?status=ACTIVE"],
    ["Học viên", studentCount, "/admin/students"],
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Bảng điều khiển"
        icon={<Gauge size={20} />}
      />

      <QuickLinkCards />

      <Suspense
        fallback={
          <div className="rounded-2xl border border-black/8 bg-white p-8 text-sm text-ink/50">
            Đang tải thống kê…
          </div>
        }
      >
        <DashboardAnalyticsPanel initial={analytics} />
      </Suspense>

      <AdminCard title="Đơn đăng ký học">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          {enrollmentStats.map(([label, value, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-black/8 p-4 hover:border-[#3f7d3a]"
            >
              <p className="text-xs font-semibold text-ink/50">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#3f7d3a]">{value}</p>
            </Link>
          ))}
        </div>
        {enrollments.length === 0 ? (
          <p className="text-sm text-ink/50">Chưa có đơn đăng ký học nào.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {enrollments.map((row) => {
              const status = enrollmentStatus(row.status);
              return (
                <li key={row.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      #{row.code} · {row.fullName}
                    </p>
                    <p className="truncate text-xs font-semibold text-ink/45">
                      {row.post.title} · {row.packageName} · {formatVnd(row.amount)}
                    </p>
                  </div>
                  <Badge tone={row.status === "ACTIVE" ? "success" : row.status === "CANCELLED" ? "danger" : "warn"}>
                    {status.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <AdminCard title="Đăng ký / liên hệ gần đây">
        <div className="mb-3 flex justify-end">
          <Link
            href="/admin/contacts"
            className="text-sm font-semibold text-[#3f7d3a]"
          >
            Xem tất cả
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="text-sm text-ink/50">
            Chưa có đăng ký nào.
          </p>
        ) : (
          <ul className="divide-y divide-black/5">
            {latest.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{row.fullName}</p>
                  <p className="text-xs font-semibold text-ink/45">
                    {row.companyName || row.email}
                  </p>
                </div>
                <Badge
                  tone={
                    row.status === "NEW"
                      ? "warn"
                      : row.status === "COMPLETED"
                        ? "success"
                        : "info"
                  }
                >
                  {INQUIRY_STATUS_LABEL[row.status] || row.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </div>
  );
}
