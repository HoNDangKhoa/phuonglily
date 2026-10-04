import { BrandAssetForm } from "@/components/admin/BrandAssetForm";
import { parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export default async function FaviconPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const banner = parseBannerData(settings?.bannerData);

  return (
    <BrandAssetForm
      kind="favicon"
      title="Chi tiết Favicon"
      initialUrl={banner.favicon.url}
      initialVisible={banner.favicon.visible}
      sizeHint="Thiết kế ảnh vuông 64 × 64 px. Định dạng png hoặc ico."
    />
  );
}
