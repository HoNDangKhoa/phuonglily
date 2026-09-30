import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";
import { AdminShell } from "@/components/admin/AdminShell";
import { invalidateCmsCache } from "@/lib/cache";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName =
    session?.user?.name || session?.user?.email?.split("@")[0] || "admin";
  const userInitial = userName.charAt(0).toUpperCase();

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  async function clearCacheAction() {
    "use server";
    await invalidateCmsCache();
    revalidatePath("/", "layout");
    revalidatePath("/admin");
  }

  return (
    <AdminShell
      userName={userName}
      userInitial={userInitial}
      signOutAction={signOutAction}
      clearCacheAction={clearCacheAction}
    >
      {children}
    </AdminShell>
  );
}
