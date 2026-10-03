import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ScrollTextReveal } from "@/components/site/ScrollTextReveal";
import { getSiteSettings } from "@/lib/queries";
import { parseVerification } from "@/lib/site-settings";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const title = s.metaTitle || `${s.name} | Học Yoga - Hiểu cơ thể - Kiến tạo sức khoẻ`;
  const verification = parseVerification(s.googleWebmaster);
  return {
    title: { default: title, template: `%s | ${s.name}` },
    description: s.metaDescription || s.hero.description,
    keywords: s.seoKeywords || undefined,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    verification: verification ? { google: verification } : undefined,
    openGraph: { title, siteName: s.name, type: "website", locale: "vi_VN" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${font.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>
          {children}
          <ScrollTextReveal />
        </AuthProvider>
      </body>
    </html>
  );
}
