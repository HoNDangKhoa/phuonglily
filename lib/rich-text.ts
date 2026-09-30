const HTML_TAG = /<\/?(p|div|br|h[1-6]|ul|ol|li|strong|em|b|i|u|span|a|img|table|blockquote|pre|figure|iframe|video)\b[^>]*>/i;

export function isHtml(text: string): boolean {
  return HTML_TAG.test(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Nội dung cũ dạng text thuần (đoạn cách nhau 1 dòng trống, **đậm**) → HTML cho editor / hiển thị. */
export function toRichHtml(text: string | null | undefined): string {
  const value = (text ?? "").trim();
  if (!value) return "";
  if (isHtml(value)) return value;
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p>${escapeHtml(p)
          .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
          .replace(/\r?\n/g, "<br>")}</p>`,
    )
    .join("");
}

/** Nội dung là một bố cục tự thiết kế (có CSS riêng) thay vì bài viết thường. */
export function isCustomLayout(html: string | null | undefined): boolean {
  return /<style[\s>]|<link[^>]+stylesheet/i.test(html ?? "");
}

export function stripHtml(text: string | null | undefined): string {
  return (text ?? "")
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
