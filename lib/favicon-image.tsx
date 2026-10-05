import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/queries";

function faviconSource(url: string) {
  const value = url.trim();
  if (!value || value === "/favicon.ico" || value.startsWith("/icon") || value.startsWith("/apple-icon")) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) return value;
  const base = process.env.AUTH_URL || "https://www.phuonglilyacademy.com";
  try {
    return new URL(value, base.endsWith("/") ? base : `${base}/`).toString();
  } catch {
    return "";
  }
}

function monogram(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1d3a1f",
          color: "#ffffff",
          fontSize: Math.round(size * 0.42),
          fontWeight: 700,
        }}
      >
        PL
      </div>
    ),
    { width: size, height: size },
  );
}

/** Favicon thật lấy từ ảnh admin đã tải lên, để /icon và /apple-icon luôn khớp CMS. */
export async function renderSiteIcon(size: number) {
  try {
    const settings = await getSiteSettings();
    const src = faviconSource(settings.faviconUrl);
    if (!src) return monogram(size);
    const file = await fetch(src, { next: { revalidate: 60 } });
    const type = file.headers.get("content-type") || "";
    if (!file.ok || !type.startsWith("image/") || type.includes("svg")) return monogram(size);
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: "#ffffff" }}>
          {/* next/og renders this img into the icon response */}
          <img alt="" src={src} width={size} height={size} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ),
      { width: size, height: size },
    );
  } catch {
    return monogram(size);
  }
}
