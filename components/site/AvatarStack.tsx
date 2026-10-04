import Image from "next/image";

/** Repeating avatar row that drifts left, in the style of the Pawlates member strip. */
export function AvatarStack({ avatars, label }: { avatars: string[]; label: string }) {
  const list = avatars.filter(Boolean);
  if (!list.length && !label) return null;

  const group = (
    <div className="flex shrink-0 items-center gap-3 pr-12">
      <div className="flex -space-x-2.5">
        {list.map((src, i) => (
          <span
            key={`${src}-${i}`}
            className="relative block h-9 w-9 overflow-hidden rounded-full border-2 border-moss-soft bg-sage md:h-10 md:w-10"
            style={{ zIndex: list.length - i }}
          >
            <Image src={src} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ))}
      </div>
      {label && <span className="text-sm whitespace-nowrap text-forest/85">{label}</span>}
    </div>
  );

  return (
    <div className="marquee-pause overflow-hidden" data-no-reveal>
      <div className="marquee items-center [--marquee-duration:28s]" aria-hidden>
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i}>{group}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
