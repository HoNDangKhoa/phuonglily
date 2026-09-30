import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { defaultBannerData } from "../lib/branding";
import { slugify } from "../lib/cms";
import { seedLearning } from "./seed-learning";

const prisma = new PrismaClient();

const para = (...lines: string[]) => lines.map((l) => `<p>${l}</p>`).join("");

type SeedPost = {
  type: "COURSE" | "ONLINE" | "EVENT" | "BLOG";
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  contentHtml: string;
  eventDate?: string;
  location?: string;
  price?: string;
  duration?: string;
  isFeatured?: boolean;
};

const posts: SeedPost[] = [
  {
    type: "COURSE",
    title: "200H - HLV Yoga nền tảng",
    summary: "Xây dựng nền tảng vững chắc để trở thành HLV Yoga chuyên nghiệp.",
    thumbnail: "/images/class-training.jpg",
    category: "Đào tạo HLV",
    eventDate: "2026-11-02T08:00",
    location: "Hà Nội & Online",
    price: "Liên hệ",
    duration: "200 giờ / 3 tháng",
    isFeatured: true,
    contentHtml: para(
      "Chương trình 200H trang bị kiến thức giải phẫu học, căn chỉnh tư thế, kỹ thuật thở và phương pháp giảng dạy.",
      "Học viên được thực hành đứng lớp ngay trong khoá học và nhận chứng nhận khi hoàn thành.",
    ),
  },
  {
    type: "COURSE",
    title: "100H Yoga phục hồi",
    summary: "Phương pháp phục hồi và cân bằng Thân – Tâm – Năng lượng.",
    thumbnail: "/images/founder.jpg",
    category: "Yoga phục hồi",
    eventDate: "2026-10-20T08:00",
    location: "Hà Nội",
    price: "Liên hệ",
    duration: "100 giờ",
    contentHtml: para(
      "Kết hợp Yoga trị liệu và Y học cổ truyền giúp phục hồi cột sống, khớp và hệ thần kinh.",
    ),
  },
  {
    type: "COURSE",
    title: "300H - HLV Yoga nâng cao",
    summary: "Nâng cao kỹ năng giảng dạy, căn chỉnh và thiết kế giáo án chuyên sâu.",
    thumbnail: "/images/yoga-studio.jpg",
    category: "Đào tạo HLV",
    location: "Hà Nội",
    duration: "300 giờ",
    contentHtml: para("Dành cho HLV đã có chứng chỉ 200H muốn phát triển chuyên môn."),
  },
  {
    type: "ONLINE",
    title: "Yoga cơ bản tại nhà",
    summary: "Lộ trình 30 ngày tập Yoga tại nhà cho người mới bắt đầu.",
    thumbnail: "/images/blog-3.jpg",
    category: "Học online",
    location: "Online",
    duration: "30 bài học",
    contentHtml: para("Video bài giảng chi tiết, tập mọi lúc mọi nơi trên điện thoại hoặc laptop."),
  },
  {
    type: "ONLINE",
    title: "Thiền và hơi thở",
    summary: "Làm chủ hơi thở, giảm căng thẳng và ngủ ngon hơn.",
    thumbnail: "/images/blog-2.jpg",
    category: "Học online",
    location: "Online",
    duration: "12 bài học",
    contentHtml: para("Các kỹ thuật Pranayama và thiền định dễ áp dụng hằng ngày."),
  },
  {
    type: "EVENT",
    title: "Workshop Yoga & Chữa lành âm thanh",
    summary: "Trải nghiệm chuông xoay Himalaya và thiền chữa lành cùng Phương Lily.",
    thumbnail: "/images/class-training.jpg",
    category: "Workshop",
    eventDate: "2026-10-18T08:30",
    location: "Phương Lily Academy, Hà Nội",
    price: "Miễn phí",
    contentHtml: para("Sự kiện dành cho tất cả mọi người, số lượng chỗ có hạn."),
  },
  {
    type: "EVENT",
    title: "Khai giảng khoá 200H tháng 11",
    summary: "Lễ khai giảng và buổi học trải nghiệm miễn phí.",
    thumbnail: "/images/yoga-studio.jpg",
    category: "Khai giảng",
    eventDate: "2026-11-02T08:00",
    location: "Hà Nội",
    contentHtml: para("Đăng ký tham dự để nhận ưu đãi học phí dành riêng cho sự kiện."),
  },
  {
    type: "BLOG",
    title: "Full-Body Strength Training: Week Program",
    summary: "Take the first step towards mastering Japanese. Discover our structured courses designed to elevate your skills.",
    thumbnail: "/images/blog-1.jpg",
    category: "Yoga",
    contentHtml: para("Chương trình tập luyện toàn thân trong 1 tuần kết hợp Yoga và sức mạnh."),
  },
  {
    type: "BLOG",
    title: "7 Day Yoga Flexibility Series for this Year",
    summary: "Take the first step towards mastering Japanese. Discover our structured courses designed to elevate your skills.",
    thumbnail: "/images/blog-2.jpg",
    category: "Yoga",
    contentHtml: para("Chuỗi 7 ngày cải thiện độ dẻo dai với các tư thế Yoga đơn giản."),
  },
  {
    type: "BLOG",
    title: "5 Day Challenge Trainer Series",
    summary: "Take the first step towards mastering Japanese. Discover our structured courses designed to elevate your skills.",
    thumbnail: "/images/blog-3.jpg",
    category: "Yoga",
    contentHtml: para("Thử thách 5 ngày cùng HLV Phương Lily Academy."),
  },
  {
    type: "BLOG",
    title: "Yoga phục hồi cho dân văn phòng",
    summary: "Các bài tập giải phóng cổ vai gáy và cột sống sau giờ làm việc.",
    thumbnail: "/images/yoga-studio.jpg",
    category: "Yoga",
    contentHtml: para("Chỉ 15 phút mỗi ngày để cơ thể nhẹ nhàng và tinh thần tỉnh táo hơn."),
  },
];

export async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@phuonglilyacademy.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "Phương Lily Admin", role: "SUPER_ADMIN" },
    create: { name: "Phương Lily Admin", email, passwordHash, role: "SUPER_ADMIN" },
  });

  const existing = await prisma.siteSetting.findUnique({ where: { id: "site_config" } });
  if (!existing) {
    await prisma.siteSetting.create({
      data: {
        id: "site_config",
        companyName: "Phương Lily Academy",
        slogan: "Học Yoga - Hiểu cơ thể - Kiến tạo sức khoẻ",
        hotline: "+84 764 984 097",
        email: "contact@phuonglilyacademy.com",
        headOffice: "23 Madison Street, New York, USA",
        website: "https://phuonglilyacademy.com",
        metaTitle: "Phương Lily Academy | Học Yoga - Hiểu cơ thể - Kiến tạo sức khoẻ",
        metaDescription:
          "Phương Lily Academy đồng hành cùng bạn trên hành trình chữa lành Tâm - Thân - Trí bằng Yoga và Y học cổ truyền.",
        socialLinks: JSON.stringify({ facebook: "", linkedin: "", zalo: "" }),
        bannerData: JSON.stringify(defaultBannerData()),
      },
    });
  }

  for (const [i, p] of posts.entries()) {
    const catSlug = `${p.type.toLowerCase()}-${slugify(p.category)}`;
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: {},
      create: { name: p.category, slug: catSlug, type: p.type },
    });
    const slug = slugify(p.title);
    const data = {
      title: p.title,
      summary: p.summary,
      contentHtml: p.contentHtml,
      thumbnail: p.thumbnail,
      type: p.type,
      status: "PUBLISHED",
      isVisible: true,
      isFeatured: !!p.isFeatured,
      sortOrder: i,
      eventDate: p.eventDate ? new Date(p.eventDate) : null,
      location: p.location ?? null,
      price: p.price ?? null,
      duration: p.duration ?? null,
      publishedAt: new Date("2026-09-30T08:00:00+07:00"),
      categoryId: category.id,
      authorId: admin.id,
    };
    await prisma.post.upsert({ where: { slug }, update: {}, create: { slug, ...data } });
  }

  await seedLearning(prisma);

  console.log(`Seeded admin ${email} and ${posts.length} posts.`);
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
