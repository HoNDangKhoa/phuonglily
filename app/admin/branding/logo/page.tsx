import { BrandAssetForm } from "@/components/admin/BrandAssetForm";
import { parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export default async function LogoPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const banner = parseBannerData(settings?.bannerData);

  return (
    <BrandAssetForm
      kind="logo"
      title="Chi tiết Logo"
      initialUrl={banner.logo.url}
      initialVisible={banner.logo.visible}
      sizeHint="Width: ~180 px - Height: ~60 px (jpg, jpeg, png, gif, webp, svg)"
    />
  );
}
