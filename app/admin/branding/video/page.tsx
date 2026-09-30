import { BrandAssetForm } from "@/components/admin/BrandAssetForm";
import { parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export default async function VideoPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const banner = parseBannerData(settings?.bannerData);

  return (
    <BrandAssetForm
      kind="video"
      title="Video giới thiệu (nút “Xem video giới thiệu” ở Hero)"
      initialUrl={banner.video.url}
      initialVisible={banner.video.visible}
      sizeHint="Tải file mp4 / webm hoặc dán link YouTube / Vimeo / mp4"
    />
  );
}
