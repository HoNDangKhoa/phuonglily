import Script from "next/script";
import { CustomScripts } from "@/components/common/CustomScripts";
import { VisitTracker } from "@/components/common/VisitTracker";
import { ContactDock } from "@/components/site/ContactDock";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { getSiteSettings } from "@/lib/queries";
import { parseAnalytics } from "@/lib/site-settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const analytics = parseAnalytics(settings.googleAnalytics);

  return (
    <>
      {analytics.id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${analytics.id}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.id}');`}
          </Script>
        </>
      )}
      <CustomScripts target="head" html={[analytics.html, settings.headJs].join("\n")} />
      <CustomScripts target="body" html={settings.bodyJs} />
      <SmoothScroll />
      <VisitTracker />
      <SiteHeader header={settings.header} logoUrl={settings.logoUrl} siteName={settings.name} />
      <ContactDock phone={settings.hotline || settings.phone} zalo={settings.social.zalo || settings.hotline || settings.phone} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
