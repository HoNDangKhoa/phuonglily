import type { Metadata } from "next";
import Script from "next/script";
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
        <Script id="hero-header-boot" strategy="beforeInteractive">
          {`(function(){try{if(document.documentElement.dataset.headerReady==="1")return;var p=location.pathname;if(p!=="/"&&p!=="")return;var s=document.createElement("style");s.id="hero-header-boot-style";s.textContent=".site-header-bar{height:119px!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transition:none!important}.site-header-logo{width:95px!important;height:95px!important;transition:none!important}.site-header-nav{border-color:rgba(255,255,255,.55)!important;background:rgba(255,255,255,.25)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)!important;transition:none!important}.site-header-link{color:rgba(255,255,255,.95)!important;transition:none!important}.site-header-cta{background:#fff!important;color:#1d3a1f!important;transition:none!important}@media(min-width:1024px){.site-header-cta{height:clamp(2.15rem,3.4vw,3.15rem)!important}}.site-header-dot{background:#1d3a1f!important}.site-header-account{width:3rem!important;height:3rem!important;border-color:rgba(255,255,255,.3)!important;background:rgba(255,255,255,.1)!important;color:#fff!important;transition:none!important}.site-header-menu{border-color:rgba(255,255,255,.3)!important;background:rgba(255,255,255,.1)!important;color:#fff!important}";document.head.appendChild(s);}catch(e){}})();`}
        </Script>
        <AuthProvider>
          {children}
          <ScrollTextReveal />
        </AuthProvider>
      </body>
    </html>
  );
}
