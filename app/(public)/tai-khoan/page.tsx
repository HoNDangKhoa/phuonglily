import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/components/site/PostCard";
import { POST_TYPE_LABEL, POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { getStudentOrders } from "@/lib/course-queries";
import { enrollmentStatus, formatVnd } from "@/lib/learning";
import { requireStudent } from "@/lib/student-auth";
import { cn } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const student = await requireStudent("/tai-khoan");
  const orders = await getStudentOrders(student.id);

  return (
    <>
      <h2 className="mb-6 text-2xl font-medium text-forest">Lịch sử đăng ký</h2>
      {orders.length === 0 ? (
        <div className="rounded-[24px] bg-white p-8">
          <p className="text-forest/70">Bạn chưa đăng ký khoá học nào.</p>
          <Link
            href="/khoa-hoc"
            className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-leaf"
          >
            Khám phá khoá học
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const status = enrollmentStatus(order.status);
            const courseHref = `${POST_TYPE_VIEW_PATH[order.post.type]}/${order.post.slug}`;
            return (
              <article key={order.id} className="overflow-hidden rounded-[24px] bg-white">
                <header className="flex flex-wrap items-center gap-x-8 gap-y-1 border-b border-forest/10 px-5 py-4 text-sm text-forest/80 md:px-6">
                  <span>Ngày đăng ký {formatDate(order.createdAt.toISOString())}</span>
                  <span>{POST_TYPE_LABEL[order.post.type]}</span>
                  <span className="font-medium text-forest">#{order.code}</span>
                  <span className="ml-auto flex items-center gap-2 text-forest">
                    <span className={cn("h-2 w-2 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </header>
                <div className="flex items-center gap-4 px-5 py-4 md:px-6">
                  <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-sage">
                    {order.post.thumbnail && (
                      <Image src={order.post.thumbnail} alt="" fill sizes="80px" className="object-cover" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={courseHref} className="line-clamp-2 font-medium text-forest hover:text-leaf">
                      {order.post.title}
                    </Link>
                    {order.packageName && (
                      <p className="mt-0.5 text-xs text-forest/55">Gói {order.packageName}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-forest">{formatVnd(order.amount)}</p>
                    <p className="text-xs text-forest/50">x1 gói</p>
                  </div>
                </div>
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-forest/10 px-5 py-4 md:px-6">
                  <p className="text-sm text-forest/70">
                    Tổng thanh toán: <b className="text-forest">{formatVnd(order.amount)}</b>
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={`/tai-khoan/don/${order.code}`}
                      className="rounded-full border border-forest/20 px-5 py-2 text-sm text-forest hover:border-forest"
                    >
                      Xem chi tiết
                    </Link>
                    {order.status === "ACTIVE" ? (
                      <Link
                        href={`/hoc/${order.post.slug}`}
                        className="rounded-full bg-forest px-5 py-2 text-sm text-white hover:bg-leaf"
                      >
                        Vào học
                      </Link>
                    ) : order.status === "CANCELLED" ? (
                      <Link
                        href={courseHref}
                        className="rounded-full bg-forest px-5 py-2 text-sm text-white hover:bg-leaf"
                      >
                        Đăng ký lại
                      </Link>
                    ) : null}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
