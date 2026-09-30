import { AdminPageHeader } from "@/components/admin/AdminChrome";
import { NewsletterTable } from "@/components/admin/NewsletterTable";
import { prisma } from "@/lib/prisma";

export default async function NewsletterPage() {
  const rows = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Đăng ký nhận tin" />
      <p className="mb-5 text-sm text-ink/55">
        Email đăng ký từ form “Đăng ký nhận tin” ở footer.
      </p>
      <NewsletterTable
        initial={rows.map((r) => ({
          id: r.id,
          email: r.email,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
