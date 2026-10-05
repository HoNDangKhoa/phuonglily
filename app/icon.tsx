import { renderSiteIcon } from "@/lib/favicon-image";

export const runtime = "nodejs";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const revalidate = 60;

export default function Icon() {
  return renderSiteIcon(size.width);
}
