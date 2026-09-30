import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Clock, MapPin } from "lucide-react";
import { POST_TYPE_VIEW_PATH } from "@/lib/cms";
import type { PublicPost } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function formatDate(iso: string | null, withTime = false) {
  if (!iso) return "";
  const d = new Date(iso);
  const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (!withTime) return date;
  return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} · ${date}`;
}

export function PostCard({ post, className }: { post: PublicPost; className?: string }) {
  const href = `${POST_TYPE_VIEW_PATH[post.type] ?? "/blog"}/${post.slug}`;
  const isBlog = post.type === "BLOG";

  return (
    <Link
      href={href}
      className={cn(
        "group flex h-full flex-col rounded-[20px] bg-white p-2.5 shadow-[0_16px_40px_-30px_rgba(29,58,31,0.6)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(29,58,31,0.55)]",
        className,
      )}
    >
      <div className="relative aspect-[1.72/1] overflow-hidden rounded-[14px] bg-sage">
        {post.thumbnail && (
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        {post.categoryName && (
          <span className="w-fit rounded-full border border-forest/40 px-2.5 py-0.5 text-xs text-forest">
            {post.categoryName}
          </span>
        )}
        <h3 className="mt-3 text-lg leading-snug font-normal text-forest md:text-xl">{post.title}</h3>
        {post.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-forest/60">{post.summary}</p>}
        {!isBlog && (
          <div className="mt-3 space-y-1 text-xs text-forest/70">
            {post.eventDate && (
              <p className="flex items-center gap-1.5">
                <CalendarDays size={13} /> {formatDate(post.eventDate, post.type === "EVENT")}
              </p>
            )}
            {post.location && (
              <p className="flex items-center gap-1.5">
                <MapPin size={13} /> {post.location}
              </p>
            )}
            {post.duration && (
              <p className="flex items-center gap-1.5">
                <Clock size={13} /> {post.duration}
              </p>
            )}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-sm text-forest/55">
            {isBlog ? formatDate(post.publishedAt || post.createdAt) : post.price || ""}
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss text-forest transition-all duration-500 group-hover:bg-forest group-hover:text-white">
            <ChevronRight size={20} className="transition-transform duration-500 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
