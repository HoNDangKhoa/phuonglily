import type { Metadata } from "next";
import { ContactForm } from "@/components/site/ContactForm";
import { PageArticleView } from "@/components/site/PageArticleView";
import { Reveal } from "@/components/site/Reveal";
import { getSiteSettings } from "@/lib/queries";
import { stripHtml } from "@/lib/rich-text";

export const revalidate = 300;

const POSITIONS = [
  "Tuyển dụng · Giáo viên Yoga",
  "Tuyển dụng · Trợ giảng",
  "Tuyển dụng · Cộng tác nội dung",
  "Tuyển dụng · Chăm sóc học viên",
  "Tuyển dụng · Vị trí khác",
];

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const article = s.pageArticles.recruitment;
  return {
    title: article.title || "Tuyển dụng",
    description: stripHtml(article.content).slice(0, 160) || "Cơ hội đồng hành cùng Phương Lily Academy.",
  };
}

export default async function RecruitmentPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageArticleView
        article={s.pageArticles.recruitment}
        fallbackTitle="Tuyển dụng"
        intro="Giới thiệu các vị trí đang mở và cách đồng hành cùng Phương Lily Academy."
        crumbs={[{ label: "Tuyển dụng" }]}
        flushBottom
      />
      <section className="bg-sage pb-20">
        <div className="container-site">
          <Reveal className="mx-auto max-w-4xl rounded-[28px] bg-white p-6 md:p-12">
            <h2 className="text-2xl font-normal text-forest md:text-3xl">Đăng ký tuyển dụng</h2>
            <p className="mt-2 mb-6 text-sm leading-relaxed text-forest/75">
              Điền thông tin liên hệ. Đội ngũ Phương Lily Academy sẽ phản hồi khi có vị trí phù hợp.
            </p>
            <ContactForm
              programs={POSITIONS}
              programLabel="Vị trí quan tâm"
              emptyProgramLabel="Vị trí quan tâm *"
              submitLabel="Gửi đăng ký tuyển dụng"
              successMessage="Đã nhận đăng ký tuyển dụng. Phương Lily Academy sẽ liên hệ bạn sớm."
              messagePlaceholder="Giới thiệu ngắn về bạn, kinh nghiệm và thời gian có thể bắt đầu"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
