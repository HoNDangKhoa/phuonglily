import { renderSiteIcon } from "@/lib/favicon-image";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const revalidate = 60;

export default function AppleIcon() {
  return renderSiteIcon(size.width);
}
