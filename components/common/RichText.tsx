import { HtmlContent } from "@/components/common/HtmlContent";
import { isHtml } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

/** Plain CMS text stays as paragraphs. HTML from the content editor renders as rich text. */
export function RichText({
  text,
  className,
}: {
  text?: string | null;
  className?: string;
}) {
  const value = text?.trim() ?? "";
  if (!value) return null;
  if (!isHtml(value)) {
    return (
      <div className={cn(className)} data-no-reveal>
        {value.split("\n").filter(Boolean).map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  }
  return <HtmlContent className={className} html={value} />;
}
