import {
  Award,
  CalendarDays,
  Globe,
  GraduationCap,
  HeartPulse,
  Leaf,
  MonitorPlay,
  Sparkles,
  Sun,
  Users,
  type LucideProps,
} from "lucide-react";
import type { IconKey } from "@/lib/icon-keys";

function Lotus({ size = 24, strokeWidth = 1.5, className }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M24 8c4 5 6 10 6 15s-2.5 9-6 12c-3.5-3-6-7-6-12s2-10 6-15Z" />
      <path d="M18.5 16.5C13 16 9 17 6 18.5c1 6 4 11 9 14 3 1.8 6 2.5 9 2.5" />
      <path d="M29.5 16.5C35 16 39 17 42 18.5c-1 6-4 11-9 14-3 1.8-6 2.5-9 2.5" />
      <path d="M13 26c-4 .2-7.5 1.2-10 2.5 3 5 8 7.5 14 8.5 2.5.4 5 .5 7 .2" />
      <path d="M35 26c4 .2 7.5 1.2 10 2.5-3 5-8 7.5-14 8.5-2.5.4-5 .5-7 .2" />
    </svg>
  );
}

function Certificate({ size = 24, strokeWidth = 1.5, className }: LucideProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M30 42H12a4 4 0 0 1-4-4V6h26v14" />
      <path d="M8 6a4 4 0 0 0-4 4v2h4" />
      <path d="M14 14h14M14 20h12M14 26h8M14 32h6" />
      <circle cx="35" cy="28" r="6" />
      <circle cx="35" cy="28" r="2.5" />
      <path d="m31.5 33-1.5 9 5-2.5 5 2.5-1.5-9" />
    </svg>
  );
}

const MAP: Record<IconKey, React.ComponentType<LucideProps>> = {
  lotus: Lotus,
  monitor: MonitorPlay,
  certificate: Certificate,
  users: Users,
  award: Award,
  graduation: GraduationCap,
  heart: HeartPulse,
  leaf: Leaf,
  sparkles: Sparkles,
  sun: Sun,
  calendar: CalendarDays,
  globe: Globe,
};

export function SiteIcon({
  icon,
  iconUrl,
  size = 48,
  className,
}: {
  icon?: IconKey;
  iconUrl?: string;
  size?: number;
  className?: string;
}) {
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    );
  }
  const key = icon ?? "lotus";
  const Icon = MAP[key] ?? Lotus;
  const drawn = key === "lotus" || key === "certificate";
  return <Icon size={size} strokeWidth={drawn ? 1.4 : 0.75} className={className} />;
}
