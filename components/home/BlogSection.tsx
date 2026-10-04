import Link from "next/link";
import { PostCard } from "@/components/site/PostCard";
import { Reveal } from "@/components/site/Reveal";
import type { PublicPost } from "@/lib/queries";

export function BlogSection({ title, posts }: { title: string; posts: PublicPost[] }) {
  if (!posts.length) return null;
  const moving = posts.length > 3;

  return (
    <section className="bg-sage pb-8">
      <div className="container-site">
        <div className="mb-10 border-t border-forest/15 pt-8">
          <Reveal>
            <h2 className="text-center text-[clamp(2rem,3.8vw,2.9rem)] font-normal tracking-tight text-forest">
              <Link href="/blog" className="transition-colors hover:text-leaf">
                {title}
              </Link>
            </h2>
          </Reveal>
        </div>

        {!moving && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.id} delay={i * 110}>
                <PostCard post={p} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {moving && (
        <div className="marquee-pause overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
          <div
            className="marquee py-3"
            style={{ "--marquee-duration": `${posts.length * 9}s` } as React.CSSProperties}
          >
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 gap-5 pr-5" aria-hidden={dup === 1}>
                {posts.map((p) => (
                  <div key={`${dup}-${p.id}`} className="w-[82vw] shrink-0 sm:w-[360px]">
                    <PostCard post={p} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
