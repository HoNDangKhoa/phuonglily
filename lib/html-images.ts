const LAZY_ATTRS = [
  "data-src",
  "data-lazy-src",
  "data-original",
  "data-lazy",
  "data-url",
  "data-full-url",
  "data-orig-file",
];

function firstFromSrcset(srcset: string | null): string {
  if (!srcset) return "";
  const candidates = srcset
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
  return candidates[candidates.length - 1] || "";
}

function isPlaceholder(src: string) {
  return (
    !src ||
    src.startsWith("data:image/gif") ||
    src.startsWith("data:image/svg") ||
    /(^|\/)(blank|spacer|placeholder|lazy|loading)[^/]*\.(gif|png|svg)$/i.test(src)
  );
}

/**
 * Chuẩn hóa thẻ <img> trong nội dung dán/nhập từ nơi khác:
 * lấy ảnh thật từ data-src / srcset (lazy-load), chuyển //host → https://host.
 * Trả về các <img> cần xử lý tiếp.
 */
export function normalizeImages(
  images: Iterable<HTMLImageElement>,
  setSrc: (img: HTMLImageElement, src: string) => void,
) {
  for (const img of images) {
    let src = img.getAttribute("src")?.trim() || "";
    const lazy =
      LAZY_ATTRS.map((a) => img.getAttribute(a)?.trim() || "").find(Boolean) ||
      firstFromSrcset(img.getAttribute("data-srcset")) ||
      "";
    if (lazy) src = lazy;
    if (isPlaceholder(src)) src = firstFromSrcset(img.getAttribute("srcset")) || src;
    if (src.startsWith("//")) src = `https:${src}`;
    if (src && src !== img.getAttribute("src")) {
      setSrc(img, src);
      img.removeAttribute("srcset");
      img.removeAttribute("data-srcset");
      img.removeAttribute("sizes");
    }
    for (const attr of LAZY_ATTRS) img.removeAttribute(attr);
    img.classList.remove("lazyload", "lazyloaded", "lazy", "lazy-loaded");
    if (!img.classList.length) img.removeAttribute("class");
    if (img.getAttribute("loading") === "lazy") img.removeAttribute("loading");
  }
}

export function isExternalImage(src: string) {
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const url = new URL(src);
    if (url.host === window.location.host) return false;
    if (url.hostname.endsWith(".blob.vercel-storage.com")) return false;
    return true;
  } catch {
    return false;
  }
}

/** Tải ảnh từ website khác về kho lưu trữ của site. Trả về map url cũ → url mới (null nếu lỗi). */
export async function importRemoteImages(urls: string[]) {
  if (!urls.length) return {} as Record<string, string | null>;
  const res = await fetch("/api/upload/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) throw new Error(`Không tải được ảnh (${res.status})`);
  const data = (await res.json()) as { results?: Record<string, string | null> };
  return data.results ?? {};
}
