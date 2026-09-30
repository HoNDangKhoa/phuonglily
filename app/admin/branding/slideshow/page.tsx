import { MediaListManager } from "@/components/admin/MediaListManager";
import { parseBannerData } from "@/lib/branding";
import { prisma } from "@/lib/prisma";

export default async function SlideshowPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: "site_config" },
  });
  const banner = parseBannerData(settings?.bannerData);

  return (
    <MediaListManager
      title="Slideshow"
      kind="slideshow"
      initial={banner.slideshow}
    />
  );
}
