import type { IconKey } from "@/lib/icon-keys";

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Section 1 — Hero (tiêu đề hồng + 2 nút đỏ) */
export type HeroContent = {
  heading: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  videoLabel: string;
  /** Link YouTube/Vimeo hoặc file mp4 — bấm nút sẽ phát trong popup */
  videoUrl: string;
};

export type IconItem = {
  id: string;
  icon: IconKey;
  /** Icon tải lên riêng — ưu tiên hơn icon chọn sẵn */
  iconUrl: string;
  title: string;
  description: string;
};

/** Section 2 — Phương Lily Academy + 3 icon */
export type AcademyContent = {
  title: string;
  description: string;
  features: IconItem[];
};

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
};

/** Section 3 — Lộ trình Yoga toàn diện (accordion 5 mục + ảnh đổi theo mục) */
export type RoadmapContent = {
  eyebrow: string;
  title: string;
  items: RoadmapItem[];
};

export type FounderStat = {
  id: string;
  icon: IconKey;
  iconUrl: string;
  value: string;
  label: string;
};

/** Section 4 — Xin chào, tôi là Phương Lily */
export type FounderContent = {
  imageUrl: string;
  title: string;
  content: string;
  stats: FounderStat[];
};

/** Section 5 — Học Yoga mọi lúc, mọi nơi */
export type AppPromoContent = {
  title: string;
  imageUrl: string;
  avatars: string[];
  membersLabel: string;
  href: string;
};

export type TrainingGroup = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isVisible: boolean;
};

/** Section 6 — Khám phá các nhóm đào tạo (6 ô) */
export type TrainingContent = {
  title: string;
  items: TrainingGroup[];
};

/** Section 7 — Trích dẫn + nút Bắt đầu hành trình */
export type QuoteCtaContent = {
  imageUrl: string;
  quote: string;
  ctaLabel: string;
  ctaHref: string;
};

export type FaqItem = { id: string; question: string; answer: string };

/** Section 8 — FAQs */
export type FaqContent = {
  title: string;
  description: string;
  items: FaqItem[];
};

/** Section 9 — Blog */
export type BlogSectionContent = {
  title: string;
  limit: number;
};

export type FooterLink = { id: string; label: string; href: string };

/** Section 10 — Footer + wordmark chạy liên tục */
export type FooterContent = {
  copyright: string;
  contactTitle: string;
  phone: string;
  email: string;
  website: string;
  addressTitle: string;
  address: string;
  policyTitle: string;
  policies: FooterLink[];
  newsletterTitle: string;
  newsletterDescription: string;
  newsletterPlaceholder: string;
  wordmark: string;
};

export type NavLink = { id: string; label: string; href: string };

export type HeaderContent = {
  links: NavLink[];
  ctaLabel: string;
  ctaHref: string;
};

export function defaultHeader(): HeaderContent {
  return {
    links: [
      { id: "nav_1", label: "Giới Thiệu", href: "/gioi-thieu" },
      { id: "nav_2", label: "Khoá Học", href: "/khoa-hoc" },
      { id: "nav_3", label: "Học Online", href: "/hoc-online" },
      { id: "nav_4", label: "Lịch Sự Kiện", href: "/lich-su-kien" },
      { id: "nav_5", label: "Blog", href: "/blog" },
    ],
    ctaLabel: "Liên Hệ",
    ctaHref: "/lien-he",
  };
}

export function defaultHero(): HeroContent {
  return {
    heading: "Học Yoga\nHiểu Cơ Thể\nKiến Tạo Sức Khoẻ",
    description:
      "Phương Lily Academy Đồng Hành Cùng Bạn Trên Hành Trình Chữa Lành Tâm - Thân - Trí Bằng Yoga Và Y Học Cổ Truyền",
    primaryLabel: "Khám phá khoá học",
    primaryHref: "/khoa-hoc",
    videoLabel: "Xem video giới thiệu",
    videoUrl: "",
  };
}

const LOREM_CLASS =
  "Classes for all levels, from beginners to advanced. Enjoy various styles like Hatha, Vinyasa, and Yin Yoga.";

export function defaultAcademy(): AcademyContent {
  return {
    title: "Phương Lily Academy",
    description:
      "Whether you're a beginner or an advanced practitioner, our offerings are designed to inspire and support you on your wellness journey.",
    features: [
      { id: "ac_1", icon: "lotus", iconUrl: "", title: "Đào tạo chuyên sâu", description: LOREM_CLASS },
      { id: "ac_2", icon: "monitor", iconUrl: "", title: "Học online linh hoạt", description: LOREM_CLASS },
      { id: "ac_3", icon: "certificate", iconUrl: "", title: "Chứng nhận quốc tế", description: LOREM_CLASS },
    ],
  };
}

export function defaultRoadmap(): RoadmapContent {
  const img = ["/images/class-training.jpg", "/images/yoga-studio.jpg"];
  return {
    eyebrow: "Lớp đào tạo giảng viên",
    title: "Lộ trình Yoga toàn diện",
    items: [
      { id: "rm_1", title: "200H - HLV Yoga nền tảng", description: "Xây dựng nền tảng vững chắc để trở thành HLV Yoga", ctaLabel: "Đăng ký", ctaHref: "/lien-he?chuong-trinh=200H", imageUrl: img[0] },
      { id: "rm_2", title: "100H Yoga phục hồi", description: "Phương pháp phục hồi và cân bằng Thân – Tâm – Năng lượng", ctaLabel: "Đăng ký", ctaHref: "/lien-he?chuong-trinh=100H", imageUrl: "/images/founder.jpg" },
      { id: "rm_3", title: "300H - HLV Yoga nâng cao", description: "Nâng cao kỹ năng giảng dạy, căn chỉnh và thiết kế giáo án chuyên sâu", ctaLabel: "Đăng ký", ctaHref: "/lien-he?chuong-trinh=300H", imageUrl: img[1] },
      { id: "rm_4", title: "500H - Master Yoga", description: "Chương trình Master dành cho HLV muốn dẫn dắt và đào tạo thế hệ kế tiếp", ctaLabel: "Đăng ký", ctaHref: "/lien-he?chuong-trinh=500H", imageUrl: img[0] },
      { id: "rm_5", title: "Chuyên đề Yoga", description: "Các chuyên đề chuyên sâu: Yoga trị liệu, thiền, hơi thở, Yoga bầu…", ctaLabel: "Đăng ký", ctaHref: "/lien-he?chuong-trinh=chuyen-de", imageUrl: img[1] },
    ],
  };
}

export function defaultFounder(): FounderContent {
  return {
    imageUrl: "/images/founder.jpg",
    title: "Xin chào,\nTôi là Phương Lily",
    content:
      "For years, I thought strength meant doing more — training harder, eating cleaner, sleeping less. I pushed through exhaustion, believing discipline would bring freedom. It didn't. When burnout finally forced me to slow down, I started listening. I studied how movement, hormones, rest, and mindset work together — and rebuilt my strength through awareness, not pressure.\nNow I help women do the same: feel capable and confident again without sacrificing themselves to get there. My approach blends science and empathy — habit-based, psychology-first, and built for lasting balance",
    stats: [
      { id: "st_1", icon: "users", iconUrl: "", value: "+12", label: "Năm kinh nghiệm" },
      { id: "st_2", icon: "users", iconUrl: "", value: "+12", label: "Học viên trong và ngoài nước" },
      { id: "st_3", icon: "users", iconUrl: "", value: "+12", label: "Học viên trong và ngoài nước" },
    ],
  };
}

export function defaultAppPromo(): AppPromoContent {
  return {
    title: "Học Yoga mọi lúc,\nmọi nơi!\nNgười bạn đồng\nhành cùng sức khỏe\ntinh thần của bạn.",
    imageUrl: "/images/app-mockup.jpg",
    avatars: [
      "/images/blog-3.jpg",
      "/images/founder.jpg",
      "/images/blog-2.jpg",
      "/images/yoga-studio.jpg",
      "/images/blog-1.jpg",
    ],
    membersLabel: "200+ Học sinh đã đăng ký",
    href: "/hoc-online",
  };
}

const TRAINING_FEATURES = [
  "Personalized workouts",
  "Personalized workouts",
  "Personalized workouts",
  "Personalized workouts",
];

export function defaultTraining(): TrainingContent {
  const names = [
    "Đào tạo giáo viên Yoga",
    "Yoga phục hồi",
    "Yoga ứng dụng",
    "Thiền và hơi thở",
    "Yoga & Y học cổ truyền",
    "Đào tạo master Yoga",
  ];
  return {
    title: "Lớp tập online",
    items: names.map((name, i) => ({
      id: `tg_${i + 1}`,
      name,
      description: "Early-stage founders seeking clarity & direction.",
      imageUrl: "/images/yoga-studio.jpg",
      features: [...TRAINING_FEATURES],
      ctaLabel: "Đăng ký ngay",
      ctaHref: `/lien-he?chuong-trinh=${encodeURIComponent(name)}`,
      isVisible: true,
    })),
  };
}

export function defaultQuoteCta(): QuoteCtaContent {
  return {
    imageUrl: "/images/class-training.jpg",
    quote: "“Khi bạn thực sự hiểu cơ thể mình,\nbạn sẽ thấy cuộc sống là một món quà.”",
    ctaLabel: "Bắt đầu hành trình với chúng tôi",
    ctaHref: "/lich-su-kien",
  };
}

export function defaultFaq(): FaqContent {
  return {
    title: "Các câu hỏi thường gặp\n( FAQs )",
    description:
      "Bạn có thắc mắc về các lớp học của chúng tôi? Chúng tôi luôn sẵn sàng giải đáp mọi băn khoăn của bạn!",
    items: [
      { id: "fq_1", question: "Tôi có cần kinh nghiệm tập Yoga từ trước không?", answer: "Hoàn toàn không đâu! Các lớp học của chúng tôi chào đón học viên ở mọi trình độ—chúng tôi sẽ hướng dẫn bạn từng bước một." },
      { id: "fq_2", question: "Khoá đào tạo HLV kéo dài bao lâu?", answer: "Tuỳ chương trình 100H, 200H, 300H hay 500H — thời gian từ 1 đến 6 tháng, có lớp cuối tuần và lớp online." },
      { id: "fq_3", question: "Tôi có thể học online không?", answer: "Có. Phương Lily Academy có nền tảng học online với video bài giảng và buổi hỏi đáp trực tiếp cùng giảng viên." },
      { id: "fq_4", question: "Chứng chỉ có được công nhận quốc tế không?", answer: "Các chương trình HLV được thiết kế theo chuẩn quốc tế, học viên nhận chứng nhận sau khi hoàn thành khoá học." },
      { id: "fq_5", question: "Làm sao để đăng ký khoá học?", answer: "Bạn bấm nút “Đăng ký” ở chương trình mong muốn hoặc liên hệ hotline, đội ngũ tư vấn sẽ phản hồi trong 24 giờ." },
    ],
  };
}

export function defaultBlogSection(): BlogSectionContent {
  return { title: "Kiến thức Yoga", limit: 9 };
}

export function defaultFooter(): FooterContent {
  return {
    copyright: "© 2026\nAll rights reserved.",
    contactTitle: "LIÊN HỆ",
    phone: "+84 764 984 097",
    email: "contact@phuonglilyacademy.com",
    website: "phuonglilyacademy.com",
    addressTitle: "ĐỊA CHỈ",
    address: "23 Madison Street,New York,USA",
    policyTitle: "CHÍNH SÁCH",
    policies: [
      { id: "pl_1", label: "Privacy Policy", href: "/chinh-sach/privacy-policy" },
      { id: "pl_2", label: "Refund Policy", href: "/chinh-sach/refund-policy" },
      { id: "pl_3", label: "Terms & Condition", href: "/chinh-sach/terms-condition" },
    ],
    newsletterTitle: "ĐĂNG KÝ NHẬN TIN",
    newsletterDescription:
      "Hãy đăng ký để nhận các lời khuyên thiết thực, thông tin chuyên sâu về tập luyện và các công cụ hỗ trợ hành trình rèn luyện thể chất của bạn.",
    newsletterPlaceholder: "Hãy nhập email của bạn",
    wordmark: "Phuong Lily Academy",
  };
}

export function newIconItem(): IconItem {
  return { id: uid("ac"), icon: "lotus", iconUrl: "", title: "", description: "" };
}

export function newRoadmapItem(): RoadmapItem {
  return { id: uid("rm"), title: "", description: "", ctaLabel: "Đăng ký", ctaHref: "/lien-he", imageUrl: "" };
}

export function newFounderStat(): FounderStat {
  return { id: uid("st"), icon: "users", iconUrl: "", value: "", label: "" };
}

export function newTrainingGroup(): TrainingGroup {
  return {
    id: uid("tg"),
    name: "",
    description: "",
    imageUrl: "",
    features: ["", "", "", ""],
    ctaLabel: "Đăng ký ngay",
    ctaHref: "/lien-he",
    isVisible: true,
  };
}

export function newFaqItem(): FaqItem {
  return { id: uid("fq"), question: "", answer: "" };
}

export function newLink(prefix = "lk"): FooterLink {
  return { id: uid(prefix), label: "", href: "" };
}
