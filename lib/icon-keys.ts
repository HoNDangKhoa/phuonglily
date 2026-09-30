export const ICON_OPTIONS = [
  { key: "lotus", label: "Hoa sen" },
  { key: "monitor", label: "Màn hình / Online" },
  { key: "certificate", label: "Chứng nhận" },
  { key: "users", label: "Nhóm người" },
  { key: "award", label: "Huy chương" },
  { key: "graduation", label: "Tốt nghiệp" },
  { key: "heart", label: "Sức khoẻ" },
  { key: "leaf", label: "Lá / Tự nhiên" },
  { key: "sparkles", label: "Năng lượng" },
  { key: "sun", label: "Mặt trời" },
  { key: "calendar", label: "Lịch" },
  { key: "globe", label: "Quốc tế" },
] as const;

export type IconKey = (typeof ICON_OPTIONS)[number]["key"];
