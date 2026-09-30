const DEFAULT_MAP =
  "https://maps.google.com/maps?q=Phuong%20Lily%20Academy&t=&z=13&ie=UTF8&iwloc=&output=embed";

/** Accepts a Google Maps embed URL, a full `<iframe>` snippet, or falls back to coordinates. */
export function resolveMapEmbed(embed?: string | null, coords?: string | null) {
  const raw = (embed ?? "").trim();
  const src = raw.match(/src\s*=\s*["']([^"']+)["']/i)?.[1] ?? raw;
  if (/^https:\/\//i.test(src)) return src.replace(/&amp;/g, "&");
  const point = (coords ?? "").replace(/\s+/g, "");
  if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(point)) {
    return `https://maps.google.com/maps?q=${point}&z=15&output=embed`;
  }
  return DEFAULT_MAP;
}

/** Google Analytics field: either a measurement ID or a full tracking snippet. */
export function parseAnalytics(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return { id: "", html: "" };
  if (/<script/i.test(raw)) return { id: "", html: raw };
  const id = raw.match(/\b(G-[A-Z0-9]+|UA-\d+-\d+|GT-[A-Z0-9]+|AW-\d+)\b/i)?.[1];
  return { id: id?.toUpperCase() ?? "", html: "" };
}

/** Webmaster field: either the verification code or the full `<meta>` tag. */
export function parseVerification(value?: string | null) {
  const raw = (value ?? "").trim();
  return raw.match(/content\s*=\s*["']([^"']+)["']/i)?.[1] ?? raw.replace(/[<>"']/g, "");
}

export function zaloHref(value?: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? `https://zalo.me/${digits}` : "";
}
