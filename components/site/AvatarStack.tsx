import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";

/** Pawlates-style avatar group: avatars pop in one by one and lift/spread on hover. */
export function AvatarStack({ avatars, label }: { avatars: string[]; label: string }) {
  const list = avatars.filter(Boolean);
  return (
    <Reveal className="flex items-center gap-3">
      <div className="avatar-stack flex -space-x-2.5">
        {list.map((src, i) => (
          <span
            key={`${src}-${i}`}
            className="avatar-pop relative block h-9 w-9 overflow-hidden rounded-full border-2 border-moss-soft bg-sage md:h-10 md:w-10"
            style={{ animationDelay: `${i * 90}ms`, zIndex: list.length - i }}
          >
            <Image src={src} alt="" fill sizes="40px" className="object-cover" />
          </span>
        ))}
      </div>
      <span className="text-sm text-forest/85">{label}</span>
    </Reveal>
  );
}
