import { revalidatePath } from "next/cache";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminChrome";
import { deleteStudent } from "@/lib/learning-admin-actions";
import { progressPercent } from "@/lib/learning";
import { prisma } from "@/lib/prisma";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      enrollments: {
        where: { status: "ACTIVE" },
        select: { post: { select: { title: true, _count: { select: { lessons: true } } } }, postId: true },
      },
      progress: { where: { completed: true }, select: { lesson: { select: { postId: true } } } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  async function remove(formData: FormData) {
    "use server";
    await deleteStudent(String(formData.get("id")));
    revalidatePath("/admin/students");
  }

  return (
    <div>
      <AdminPageHeader title="Học viên" />
      <AdminCard title={`Danh sách học viên (${students.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f3f4f6] text-xs font-semibold text-ink/60 uppercase">
              <tr>
                <th className="px-3 py-3">Học viên</th>
                <th className="px-3 py-3">Liên hệ</th>
                <th className="px-3 py-3">Khoá đang học · tiến độ</th>
                <th className="px-3 py-3">Đơn</th>
                <th className="px-3 py-3">Tham gia</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-black/5 align-top">
                  <td className="px-3 py-3">
                    <p className="font-semibold">{s.name || "—"}</p>
                    <p className="text-xs text-ink/55">{s.email}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-ink/70">
                    <p>{s.phone || "—"}</p>
                    <p>{[s.address, s.ward, s.province].filter(Boolean).join(", ")}</p>
                  </td>
                  <td className="px-3 py-3">
                    {s.enrollments.length === 0 && <span className="text-ink/40">—</span>}
                    <ul className="space-y-1.5">
                      {s.enrollments.map((e) => {
                        const done = s.progress.filter((p) => p.lesson.postId === e.postId).length;
                        const pct = progressPercent(done, e.post._count.lessons);
                        return (
                          <li key={e.postId}>
                            <p className="text-xs font-medium">{e.post.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-black/10">
                                <div className="h-full bg-[#3f7d3a]" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-ink/55">{pct}%</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                  <td className="px-3 py-3">{s._count.enrollments}</td>
                  <td className="px-3 py-3 text-ink/60">{s.createdAt.toLocaleDateString("vi-VN")}</td>
                  <td className="px-3 py-3 text-right">
                    <form action={remove}>
                      <input type="hidden" name="id" value={s.id} />
                      <button type="submit" className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                        Xoá
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center font-semibold text-ink/45">
                    Chưa có học viên đăng ký tài khoản.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
