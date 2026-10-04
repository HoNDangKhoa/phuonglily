import Image from "next/image";

/** One member row. The photos bob in place; the label stays still. */
export function AvatarStack({ avatars, label }: { avatars: string[]; label: string }) {
  const list = avatars.filter(Boolean);
  if (!list.length && !label) return null;

  return (
    <div className="flex items-center gap-3" data-no-reveal>
      <div className="flex -space-x-2.5">
        {list.map((src, i) => (
          <span
            key={`${src}-${i}`}
            className="avatar-float relative block h-9 w-9 overflow-hidden rounded-full border-2 border-moss-soft bg-sage md:h-10 md:w-10"
            style={{ animationDelay: `${i * 160}ms`, zIndex: list.length - i }}
          >
            <Image src={src} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ))}
      </div>
      {label && <span className="text-sm text-forest/85">{label}</span>}
    </div>
  );
}
