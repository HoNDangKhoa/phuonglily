import type { PrismaClient } from "@prisma/client";

const SAMPLE_VIDEO = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const CURRICULUM: { chapter: string; lessons: [string, string][] }[] = [
  {
    chapter: "Chương 1: Nền tảng Yoga",
    lessons: [
      ["Giới thiệu khoá học & lộ trình", "05:12"],
      ["Hơi thở Pranayama căn bản", "12:40"],
      ["Khởi động an toàn cho cột sống", "10:05"],
    ],
  },
  {
    chapter: "Chương 2: Asana & căn chỉnh",
    lessons: [
      ["Chuỗi chào mặt trời A", "15:20"],
      ["Tư thế đứng & căn chỉnh khớp gối", "18:02"],
      ["Tư thế gập & mở hông", "16:45"],
    ],
  },
  {
    chapter: "Chương 3: Thư giãn & phục hồi",
    lessons: [
      ["Yin Yoga giải phóng căng thẳng", "20:10"],
      ["Thiền chánh niệm 10 phút", "10:00"],
    ],
  },
];

const PAID_PACKAGES = (base: number) => [
  { name: "Basic", badge: "leaf", description: "Video bài giảng trọn đời", price: base, oldPrice: Math.round(base * 1.8) },
  { name: "Standard", badge: "lime", description: "Video + 4 buổi livestream", price: base + 300_000, oldPrice: Math.round((base + 300_000) * 1.8) },
  { name: "Advance", badge: "forest", description: "Video + livestream + kèm 1:1", price: base + 500_000, oldPrice: Math.round((base + 500_000) * 1.8) },
];

export async function seedLearning(prisma: PrismaClient) {
  const posts = await prisma.post.findMany({
    where: { type: { in: ["COURSE", "ONLINE"] } },
    include: { _count: { select: { packages: true, lessons: true } } },
    orderBy: { sortOrder: "asc" },
  });

  for (const [i, post] of posts.entries()) {
    const isOnline = post.type === "ONLINE";
    if (!post.audience) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          audience: isOnline ? "Người mới bắt đầu & người tập tại nhà" : "Học viên muốn trở thành HLV Yoga",
          schedule: isOnline ? "Video bài giảng + livestream cuối tuần" : "Học trực tiếp & online, 3 buổi/tuần",
          validity: "12 tháng kể từ ngày kích hoạt",
          offer: "Tặng giáo trình điện tử & thảm tập",
          goals: [
            "Hiểu cấu trúc cơ thể và nguyên lý vận động an toàn.",
            "Thực hành chuẩn xác các tư thế nền tảng và nâng cao.",
            "Làm chủ hơi thở, thiền và phương pháp thư giãn sâu.",
            "Xây dựng thói quen tập luyện bền vững mỗi ngày.",
          ].join("\n"),
        },
      });
    }

    if (!post._count.packages) {
      const free = isOnline && i === posts.length - 1;
      const packages = free
        ? [{ name: "Miễn phí", badge: "lime", description: "Truy cập toàn bộ bài học", price: 0, oldPrice: 490_000 }]
        : PAID_PACKAGES(isOnline ? 990_000 : 1_990_000 + i * 200_000);
      await prisma.coursePackage.createMany({
        data: packages.map((p, sortOrder) => ({ ...p, postId: post.id, sortOrder })),
      });
    }

    if (!post._count.lessons) {
      let order = 0;
      await prisma.lesson.createMany({
        data: CURRICULUM.flatMap((group) =>
          group.lessons.map(([title, duration]) => ({
            postId: post.id,
            chapter: group.chapter,
            title,
            duration,
            videoUrl: SAMPLE_VIDEO,
            description: `Bài học "${title}" thuộc ${group.chapter.toLowerCase()}. Hãy chuẩn bị thảm tập, mặc trang phục thoải mái và tập theo nhịp thở của bạn.`,
            isPreview: order === 0,
            sortOrder: order++,
          })),
        ),
      });
    }
  }

  return posts.length;
}

if (process.argv[1]?.endsWith("seed-learning.ts")) {
  (async () => {
    (await import("dotenv")).config();
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    try {
      const n = await seedLearning(prisma);
      console.log(`Seeded learning data for ${n} courses.`);
    } finally {
      await prisma.$disconnect();
    }
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
