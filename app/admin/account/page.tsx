import { auth } from "@/auth";
import { AccountForm } from "@/components/admin/AccountForm";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminChrome";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, role: true },
      })
    : null;

  return (
    <div>
      <AdminPageHeader title="Tài khoản" />
      <AdminCard>
        <AccountForm
          initial={{
            name: user?.name || session?.user?.name || "",
            email: user?.email || session?.user?.email || "",
            role: user?.role || session?.user?.role || "ADMIN",
          }}
        />
      </AdminCard>
    </div>
  );
}
