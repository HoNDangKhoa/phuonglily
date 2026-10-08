export type PageArticle = {
  title: string;
  content: string;
  imageUrl: string;
};

export const PAGE_ARTICLE_KEYS = [
  "about",
  "recruitment",
  "privacy-policy",
  "refund-policy",
  "terms-condition",
] as const;

export type PageArticleKey = (typeof PAGE_ARTICLE_KEYS)[number];

export function isPageArticleKey(value: string): value is PageArticleKey {
  return (PAGE_ARTICLE_KEYS as readonly string[]).includes(value);
}

export const PAGE_ARTICLE_CONFIG: Record<
  PageArticleKey,
  { label: string; path: string; noun: string; hint: string }
> = {
  about: {
    label: "Giới thiệu",
    path: "/gioi-thieu",
    noun: "bài giới thiệu",
    hint: "Dùng định dạng Heading trong trình soạn thảo để chia đoạn (câu chuyện, sứ mệnh, giá trị…).",
  },
  recruitment: {
    label: "Tuyển dụng",
    path: "/tuyen-dung",
    noun: "bài tuyển dụng",
    hint: "Bài giới thiệu vị trí đang tuyển. Form đăng ký phía dưới trang luôn hiển thị.",
  },
  "privacy-policy": {
    label: "Chính sách bảo mật",
    path: "/chinh-sach/privacy-policy",
    noun: "chính sách bảo mật",
    hint: "Dùng Heading để chia các điều khoản (thu thập, sử dụng, bảo vệ thông tin…).",
  },
  "refund-policy": {
    label: "Chính sách hoàn phí",
    path: "/chinh-sach/refund-policy",
    noun: "chính sách hoàn phí",
    hint: "Dùng Heading để chia các điều kiện, thời hạn và quy trình hoàn phí.",
  },
  "terms-condition": {
    label: "Điều khoản sử dụng",
    path: "/chinh-sach/terms-condition",
    noun: "điều khoản sử dụng",
    hint: "Dùng Heading để chia các điều khoản.",
  },
};

export function defaultPageArticle(key: PageArticleKey): PageArticle {
  switch (key) {
    case "about":
      return {
        title: "Về Phương Lily Academy",
        imageUrl: "/images/yoga-studio.jpg",
        content: [
          "<h2>Câu chuyện của chúng tôi</h2>",
          "<p>Phương Lily Academy được thành lập với mong muốn đồng hành cùng bạn trên hành trình chữa lành Tâm – Thân – Trí bằng Yoga và Y học cổ truyền. Chúng tôi tin rằng hiểu cơ thể là bước đầu tiên để kiến tạo sức khoẻ bền vững.</p>",
          "<h2>Sứ mệnh</h2>",
          "<p>Đào tạo thế hệ huấn luyện viên Yoga vững kiến thức giải phẫu, thành thạo kỹ năng giảng dạy và lan toả lối sống lành mạnh tới cộng đồng.</p>",
          "<h2>Giá trị cốt lõi</h2>",
          "<ul><li>Đào tạo chuyên sâu, bài bản theo chuẩn quốc tế</li><li>Học online linh hoạt, phù hợp mọi lịch trình</li><li>Đồng hành lâu dài cùng học viên sau khoá học</li></ul>",
        ].join(""),
      };
    case "recruitment":
      return {
        title: "Tuyển dụng",
        imageUrl: "/images/class-training.jpg",
        content: [
          "<h2>Đồng hành cùng Phương Lily Academy</h2>",
          "<p>Phương Lily Academy tìm những người muốn giảng dạy, hỗ trợ học viên và xây dựng cộng đồng Yoga một cách bài bản. Chúng tôi chào đón giáo viên, trợ giảng và cộng tác viên có cùng định hướng: hiểu cơ thể, thực hành an toàn và đồng hành lâu dài.</p>",
          "<h2>Vị trí đang mở</h2>",
          "<ul><li>Giáo viên Yoga</li><li>Trợ giảng</li><li>Cộng tác nội dung</li><li>Chăm sóc học viên</li></ul>",
          "<h2>Bạn phù hợp khi</h2>",
          "<p>Bạn có nền tảng thực hành Yoga, muốn học thêm về giải phẫu và giảng dạy, hoặc đã có kinh nghiệm đứng lớp và muốn phát triển cùng học viện. Kinh nghiệm không phải điều kiện bắt buộc với một số vị trí hỗ trợ.</p>",
        ].join(""),
      };
    case "privacy-policy":
      return {
        title: "Chính sách bảo mật",
        imageUrl: "",
        content: [
          "<h2>Thu thập thông tin</h2>",
          "<p>Chúng tôi chỉ thu thập thông tin bạn cung cấp khi đăng ký khoá học, đăng ký nhận tin hoặc gửi liên hệ (họ tên, email, số điện thoại).</p>",
          "<h2>Sử dụng thông tin</h2>",
          "<p>Thông tin được dùng để tư vấn, xác nhận đăng ký và gửi tin tức về chương trình học. Chúng tôi không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý của bạn.</p>",
          "<h2>Liên hệ</h2>",
          "<p>Nếu cần chỉnh sửa hoặc xoá thông tin cá nhân, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>",
        ].join(""),
      };
    case "refund-policy":
      return {
        title: "Chính sách hoàn phí",
        imageUrl: "",
        content: [
          "<h2>Điều kiện hoàn phí</h2>",
          "<p>Học viên được hỗ trợ hoàn phí hoặc bảo lưu khoá học khi thông báo trước ngày khai giảng theo quy định của từng chương trình.</p>",
          "<h2>Quy trình</h2>",
          "<p>Vui lòng gửi yêu cầu qua email kèm thông tin đăng ký. Đội ngũ tư vấn sẽ phản hồi trong vòng 3 ngày làm việc.</p>",
        ].join(""),
      };
    case "terms-condition":
      return {
        title: "Điều khoản sử dụng",
        imageUrl: "",
        content: [
          "<h2>Phạm vi áp dụng</h2>",
          "<p>Khi truy cập website và đăng ký khoá học tại Phương Lily Academy, bạn đồng ý với các điều khoản dưới đây.</p>",
          "<h2>Bản quyền nội dung</h2>",
          "<p>Toàn bộ bài giảng, video và tài liệu thuộc bản quyền của Phương Lily Academy, không được sao chép hoặc phát tán khi chưa có sự cho phép.</p>",
        ].join(""),
      };
  }
}

export function defaultPageArticles(): Record<PageArticleKey, PageArticle> {
  return Object.fromEntries(
    PAGE_ARTICLE_KEYS.map((key) => [key, defaultPageArticle(key)]),
  ) as Record<PageArticleKey, PageArticle>;
}
