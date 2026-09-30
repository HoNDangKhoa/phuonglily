export function formatVnd(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  if (value === 0) return "Miễn phí";
  return `${value.toLocaleString("vi-VN")}đ`;
}

export function discountPercent(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export const ENROLLMENT_STATUS = {
  PENDING: { label: "Chờ xác nhận", dot: "bg-amber-500", tone: "bg-amber-50 text-amber-700" },
  ACTIVE: { label: "Đang học", dot: "bg-leaf", tone: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Đã huỷ", dot: "bg-red-500", tone: "bg-red-50 text-red-600" },
} as const;

export type EnrollmentStatus = keyof typeof ENROLLMENT_STATUS;

export function enrollmentStatus(status: string) {
  return ENROLLMENT_STATUS[status as EnrollmentStatus] ?? ENROLLMENT_STATUS.PENDING;
}

export const PACKAGE_BADGES = {
  leaf: { label: "Xanh lá", className: "bg-leaf text-white" },
  lime: { label: "Vàng chanh", className: "bg-lime text-forest" },
  forest: { label: "Xanh đậm", className: "bg-forest text-white" },
  rose: { label: "Hồng", className: "bg-rose-500 text-white" },
} as const;

export type PackageBadge = keyof typeof PACKAGE_BADGES;

export function badgeClass(badge: string) {
  return (PACKAGE_BADGES[badge as PackageBadge] ?? PACKAGE_BADGES.leaf).className;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 1)}${"*".repeat(Math.max(3, name.length - 1))}@${domain}`;
}

/** Only allow same-site relative redirects. */
export function safeNext(next: string | null | undefined, fallback = "/tai-khoan") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export function progressPercent(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

/** Group lessons by chapter, keeping the admin's ordering. */
export function groupByChapter<T extends { chapter: string }>(lessons: T[]) {
  const groups: { chapter: string; lessons: T[] }[] = [];
  for (const lesson of lessons) {
    const name = lesson.chapter.trim() || "Nội dung khoá học";
    const last = groups[groups.length - 1];
    if (last && last.chapter === name) last.lessons.push(lesson);
    else groups.push({ chapter: name, lessons: [lesson] });
  }
  return groups;
}

export const PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Huế",
  "Cần Thơ",
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Tĩnh",
  "Hưng Yên",
  "Khánh Hoà",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hoá",
  "Tuyên Quang",
  "Vĩnh Long",
];
