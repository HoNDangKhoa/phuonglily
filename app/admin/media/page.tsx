import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { listMedia } from "@/lib/media-actions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const items = await listMedia();
  return <MediaLibrary items={items} />;
}
