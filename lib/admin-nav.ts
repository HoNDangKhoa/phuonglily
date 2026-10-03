import {
  BarChart3,
  FileText,
  FolderOpen,
  ImageIcon,
  Search,
  Settings,
  Mail,
  LayoutTemplate,
  Newspaper,
  Tags,
  Users,
  Images,
  Share2,
  Film,
  KeyRound,
  UserRound,
  MailPlus,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href?: string;
  icon?: string;
  children?: { label: string; href: string }[];
};

export const adminNav: AdminNavItem[] = [
  {
    label: "Bảng điều khiển",
    href: "/admin",
    icon: "dashboard",
  },
  {
    label: "Quản lý bài viết",
    icon: "posts",
    children: [
      { label: "Khoá học", href: "/admin/content/courses" },
      { label: "Học online", href: "/admin/content/online" },
      { label: "Lịch sự kiện", href: "/admin/content/events" },
      { label: "Blog", href: "/admin/content/blog" },
      { label: "Danh mục", href: "/admin/categories" },
    ],
  },
  {
    label: "Học viên & đăng ký",
    icon: "users",
    children: [
      { label: "Đơn đăng ký học", href: "/admin/enrollments" },
      { label: "Học viên", href: "/admin/students" },
    ],
  },
  {
    label: "Quản lý trang chủ",
    icon: "home",
    children: [
      { label: "Thanh menu (Header)", href: "/admin/home/header" },
      { label: "Hero / Tiêu đề chính", href: "/admin/home/hero" },
      { label: "Phương Lily Academy", href: "/admin/home/academy" },
      { label: "Lộ trình Yoga", href: "/admin/home/roadmap" },
      { label: "Giới thiệu Phương Lily", href: "/admin/home/founder" },
      { label: "Học Yoga mọi lúc", href: "/admin/home/app-promo" },
      { label: "Nhóm đào tạo", href: "/admin/home/training" },
      { label: "Trích dẫn & CTA", href: "/admin/home/quote" },
      { label: "Câu hỏi thường gặp", href: "/admin/home/faq" },
      { label: "Section Blog", href: "/admin/home/blog" },
      { label: "Footer", href: "/admin/home/footer" },
    ],
  },
  {
    label: "Trang tĩnh",
    icon: "pages",
    children: [
      { label: "Giới thiệu", href: "/admin/static/about" },
      { label: "Chính sách bảo mật", href: "/admin/static/privacy-policy" },
      { label: "Chính sách hoàn phí", href: "/admin/static/refund-policy" },
      { label: "Điều khoản sử dụng", href: "/admin/static/terms-condition" },
    ],
  },
  {
    label: "Quản lý hình ảnh - video",
    icon: "media",
    children: [
      { label: "Logo", href: "/admin/branding/logo" },
      { label: "Video giới thiệu", href: "/admin/branding/video" },
      { label: "Favicon", href: "/admin/branding/favicon" },
      { label: "Slideshow", href: "/admin/branding/slideshow" },
      { label: "Mạng xã hội Footer", href: "/admin/branding/social" },
      { label: "Thư viện media", href: "/admin/media" },
    ],
  },
  {
    label: "Quản lý SEO page",
    icon: "seo",
    children: [
      { label: "Trang chủ", href: "/admin/settings" },
      { label: "Khoá học", href: "/admin/seo/courses" },
      { label: "Học online", href: "/admin/seo/online" },
      { label: "Lịch sự kiện", href: "/admin/seo/events" },
      { label: "Blog", href: "/admin/seo/blog" },
      { label: "Giới thiệu", href: "/admin/seo/about" },
      { label: "Liên hệ", href: "/admin/seo/contact" },
    ],
  },
  {
    label: "Thiết lập thông tin",
    href: "/admin/settings",
    icon: "settings",
  },
  {
    label: "Đăng ký / Liên hệ",
    href: "/admin/contacts",
    icon: "contacts",
  },
  {
    label: "Đăng ký nhận tin",
    href: "/admin/newsletter",
    icon: "newsletter",
  },
];

export const adminIconMap = {
  dashboard: BarChart3,
  posts: FileText,
  home: LayoutTemplate,
  pages: Newspaper,
  media: ImageIcon,
  seo: Search,
  settings: Settings,
  contacts: Mail,
  newsletter: MailPlus,
  news: Newspaper,
  category: Tags,
  gallery: Images,
  social: Share2,
  video: Film,
  account: UserRound,
  password: KeyRound,
  folder: FolderOpen,
  users: Users,
} as const;
