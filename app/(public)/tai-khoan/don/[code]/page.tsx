import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/components/site/PostCard";
import { POST_TYPE_VIEW_PATH } from "@/lib/cms";
import { getStudentOrder } from "@/lib/course-queries";
import { enrollmentStatus, formatVnd } from "@/lib/learning";
import { SepayQrPay } from "@/components/course/SepayQrPay";
import { sepayQrConfig, sepayQrUrl } from "@/lib/sepay";
import { getSiteSettings } from "@/lib/queries";
import { requireStudent } from "@/lib/student-auth";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ moi?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { code } = await params;
  const { moi } = await searchParams;
  const qr = sepayQrConfig();
  const student = await requireStudent(`/tai-khoan/don/${code}`);
  const [order, settings] = await Promise.all([getStudentOrder(student.id, code), getSiteSettings()]);
  if (!order) notFound();

  const status = enrollmentStatus(order.status);
  const created = order.createdAt;
  const discount = order.oldAmount && order.oldAmount > order.amount ? order.oldAmount - order.amount : 0;

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/tai-khoan"
          aria-label="Quay lại"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/20 text-forest hover:bg-white"
        >
          <ArrowLeft size={16} />
        </Link>
        <h2 className="text-2xl font-medium text-forest">Chi tiết đăng ký #{order.code}</h2>
      </div>

      {moi && (
        <div className="mb-5 flex gap-3 rounded-[20px] bg-emerald-50 p-5 text-emerald-800">
          <CheckCircle2 className="mt-0.5 shrink-0" size={20} />
          <p className="text-sm leading-relaxed">
            {order.status === "ACTIVE"
              ? "Đăng ký thành công! Khoá học đã được kích hoạt, bạn có thể vào học ngay."
              : "Đăng ký thành công! Đội ngũ tư vấn sẽ liên hệ để xác nhận và hướng dẫn thanh toán trong vòng 24 giờ."}
          </p>
        </div>
      )}

      <div className="rounded-[24px] bg-white p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest/10 pb-4">
          <p className="font-medium text-forest">#{order.code}</p>
          <p className="text-sm text-forest/60">
            Đăng ký lúc <b className="text-forest">{formatDate(created.toISOString(), true)}</b>
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs text-forest/50">
              <tr className="border-b border-forest/10">
                <th className="py-3 font-normal">Khoá học</th>
                <th className="py-3 font-normal">Gói</th>
                <th className="py-3 font-normal">Số lượng</th>
                <th className="py-3 text-right font-normal">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-forest/10">
                <td className="py-4">
                  <Link
                    href={`${POST_TYPE_VIEW_PATH[order.post.type]}/${order.post.slug}`}
                    className="flex items-center gap-3 font-medium text-forest hover:text-leaf"
                  >
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-sage">
                      {order.post.thumbnail && (
                        <Image src={order.post.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                      )}
                    </span>
                    {order.post.title}
                  </Link>
                </td>
                <td className="py-4 text-forest/70">{order.packageName || "—"}</td>
                <td className="py-4 text-forest/50">x1 gói</td>
                <td className="py-4 text-right text-forest">{formatVnd(order.amount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl className="text-sm">
          <div className="flex justify-between border-b border-forest/10 py-3 text-forest/70">
            <dt>Học phí gốc</dt>
            <dd>{formatVnd(order.oldAmount ?? order.amount)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between border-b border-forest/10 py-3 text-forest/70">
              <dt>Ưu đãi</dt>
              <dd>-{formatVnd(discount)}</dd>
            </div>
          )}
          <div className="flex justify-between pt-4 font-medium text-forest">
            <dt>Tổng thanh toán</dt>
            <dd className="text-xl">{formatVnd(order.amount)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 rounded-[24px] bg-white p-5 md:p-7">
        <p className="mb-4 font-medium text-forest">Thông tin học viên</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-[180px_1fr]">
          <dt className="text-forest/55">Trạng thái:</dt>
          <dd>
            <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium", status.tone)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
              {status.label}
            </span>
          </dd>
          <dt className="text-forest/55">Học viên:</dt>
          <dd className="text-forest">
            <b>{order.fullName}</b> · {order.phone}
            <br />
            {student.email}
            {order.address && (
              <>
                <br />
                {order.address}
              </>
            )}
          </dd>
          {order.note && (
            <>
              <dt className="text-forest/55">Ghi chú:</dt>
              <dd className="whitespace-pre-line text-forest">{order.note}</dd>
            </>
          )}
          {order.post._count.lessons > 0 && (
            <>
              <dt className="text-forest/55">Nội dung:</dt>
              <dd className="text-forest">{order.post._count.lessons} bài học video</dd>
            </>
          )}
        </dl>

        {order.status === "PENDING" && order.amount > 0 && qr.enabled && (
          <SepayQrPay
            code={order.code}
            amount={order.amount}
            qrUrl={sepayQrUrl(order.amount, order.code)}
            bank={qr.bank}
            account={qr.account}
            holder={qr.holder}
          />
        )}
        {order.status === "PENDING" && order.amount > 0 && !qr.enabled && (
          <div className="mt-6 rounded-2xl bg-sage/60 p-4 text-sm leading-relaxed text-forest/80">
            Đơn đăng ký đang chờ xác nhận. Tư vấn viên sẽ liên hệ qua số <b>{order.phone}</b> để hướng
            dẫn thanh toán. Cần hỗ trợ ngay, vui lòng gọi{" "}
            <a href={`tel:${settings.hotline || settings.footer.phone}`} className="font-semibold text-leaf">
              {settings.hotline || settings.footer.phone}
            </a>
            .
          </div>
        )}
        {order.status === "ACTIVE" && (
          <Link
            href={`/hoc/${order.post.slug}`}
            className="mt-6 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-medium text-white hover:bg-leaf"
          >
            Vào học ngay
          </Link>
        )}
      </div>
    </>
  );
}
