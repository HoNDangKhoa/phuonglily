import { SettingsForm } from "@/components/admin/SettingsForm";
import { prisma } from "@/lib/prisma";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const social = settings?.socialLinks
    ? (JSON.parse(settings.socialLinks) as Record<string, string>)
    : {};

  return (
    <SettingsForm
      initial={{
        companyName: settings?.companyName || "Phương Lily Academy",
        workingHours: settings?.workingHours || "",
        headOffice: settings?.headOffice || "",
        email: settings?.email || "",
        hotline: settings?.hotline || "",
        phone: settings?.phone || "",
        zalo: social.zalo || "",
        oaidZalo: social.oaidZalo || "",
        website: settings?.website || "https://phuonglilyacademy.com",
        fanpage: social.facebook || social.fanpage || "",
        linkedin: social.linkedin || "",
        mapsCoords: settings?.mapsCoords || "",
        mapsEmbedUrl: settings?.mapsEmbedUrl || "",
        googleAnalytics: settings?.googleAnalytics || "",
        googleWebmaster: settings?.googleWebmaster || "",
        headJs: settings?.headJs || "",
        bodyJs: settings?.bodyJs || "",
        metaTitle: settings?.metaTitle || "",
        seoKeywords: settings?.seoKeywords || "",
        metaDescription: settings?.metaDescription || "",
        primaryKeyword: settings?.primaryKeyword || "",
        mailerHost: settings?.mailerHost || "smtp.gmail.com",
        mailerPort: settings?.mailerPort || "587",
        mailerSecure: settings?.mailerSecure || "TLS",
        mailerEmail: settings?.mailerEmail || "",
        mailerPassword: settings?.mailerPassword || "",
        slogan: settings?.slogan || "",
        factoryAddress: settings?.factoryAddress || "",
      }}
    />
  );
}
