import Link from "next/link";
import { ProfileEditor } from "@/components/account/ProfileEditor";
import { formatDate } from "@/components/site/PostCard";
import { requireStudent } from "@/lib/student-auth";

type Props = { searchParams: Promise<{ moi?: string }> };

export default async function ProfilePage({ searchParams }: Props) {
  const { moi } = await searchParams;
  const student = await requireStudent("/tai-khoan/ho-so");
  const fullAddress = [student.address, student.ward, student.province].filter(Boolean).join(", ");
  const missing = !student.phone || !student.address;

  const rows: [string, string][] = [
    ["Họ tên", student.name],
    ["Email", student.email],
    ["Số điện thoại", student.phone || "Chưa cập nhật"],
    ["Địa chỉ", fullAddress || "Chưa cập nhật"],
    ["Ngày tham gia", formatDate(student.createdAt.toISOString())],
  ];

  return (
    <>
      <h2 className="mb-6 text-2xl font-medium text-forest">Thông tin của tôi</h2>
      {moi && (
        <p className="mb-5 rounded-[20px] bg-emerald-50 p-5 text-sm text-emerald-800">
          Tạo tài khoản thành công! Hãy cập nhật họ tên và số điện thoại để đăng ký khoá học nhanh hơn.
        </p>
      )}
      <div className="rounded-[24px] bg-white p-6 md:p-7">
        <dl className="space-y-2.5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-wrap gap-x-2">
              <dt className="font-semibold text-forest">{label}:</dt>
              <dd className={value === "Chưa cập nhật" ? "text-forest/40" : "text-forest/80"}>{value}</dd>
            </div>
          ))}
        </dl>
        <ProfileEditor
          autoOpen={!!moi && missing}
          initial={{
            name: student.name,
            phone: student.phone ?? "",
            province: student.province ?? "",
            ward: student.ward ?? "",
            address: student.address ?? "",
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white p-6 text-sm md:p-7">
        <div>
          <p className="font-semibold text-forest">Mật khẩu</p>
          <p className="mt-1 text-forest/60">Đổi mật khẩu bằng mã xác nhận gửi về email của bạn.</p>
        </div>
        <Link href="/quen-mat-khau?next=/tai-khoan/ho-so" className="rounded-full border border-forest/20 px-5 py-2.5 text-forest hover:border-forest">
          Đổi mật khẩu
        </Link>
      </div>
    </>
  );
}
