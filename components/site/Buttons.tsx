import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}

function ArrowSwap({ size = 16 }: { size?: number }) {
  return (
    <span className="arrow-swap flex h-full w-full items-center justify-center">
      <ArrowUpRight size={size} strokeWidth={2} />
      <ArrowUpRight size={size} strokeWidth={2} aria-hidden />
    </span>
  );
}

type RollButtonProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "glass" | "light" | "dark";
  withArrow?: boolean;
  className?: string;
  type?: "button" | "submit";
};

/** Elaria-style button: label rolls upward and the arrow swaps diagonally on hover. */
export function RollButton({
  label,
  href,
  onClick,
  variant = "primary",
  withArrow = variant === "primary",
  className,
  type = "button",
}: RollButtonProps) {
  const styles = {
    primary:
      "bg-leaf text-white shadow-[0_10px_30px_-10px_rgba(47,107,44,0.7)] hover:bg-leaf-hover",
    glass:
      "border border-white/35 bg-white/15 text-white backdrop-blur-md hover:bg-white/25",
    light: "bg-white text-forest shadow-sm hover:shadow-md",
    dark: "bg-forest text-white hover:bg-leaf",
  }[variant];
  const circle = {
    primary: "bg-white text-leaf",
    glass: "bg-white text-forest",
    light: "bg-leaf text-white",
    dark: "bg-white text-forest",
  }[variant];

  const inner = (
    <>
      <span className="text-sm font-medium md:text-[15px]">
        <RollText>{label}</RollText>
      </span>
      {withArrow && (
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full md:h-9 md:w-9",
            circle,
          )}
        >
          <ArrowSwap />
        </span>
      )}
    </>
  );

  const cls = cn(
    "group inline-flex items-center gap-3 rounded-full transition-[background,box-shadow,transform] duration-500 active:scale-[0.97]",
    withArrow ? "py-1.5 pr-1.5 pl-5 md:pl-6" : "px-6 py-3 md:px-7",
    styles,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

type PawButtonProps = {
  label: string;
  href?: string;
  variant?: "white" | "outline" | "soft";
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
};

/** Pawlates-style button: the round arrow badge expands to flood the pill on hover. */
export function PawButton({
  label,
  href,
  variant = "white",
  size = "md",
  className,
  type = "button",
  onClick,
}: PawButtonProps) {
  const base = {
    white: "bg-white text-forest",
    outline: "border border-leaf/60 bg-transparent text-forest",
    soft: "bg-moss text-forest",
  }[variant];
  const sm = size === "sm";

  const inner = (
    <>
      <span className="paw-fill" aria-hidden />
      <span className={cn("paw-label font-medium", sm ? "text-xs" : "text-sm")}>
        {label}
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full text-white",
          sm ? "h-6 w-6" : "h-8 w-8",
        )}
      >
        <ArrowUpRight className="paw-arrow" size={sm ? 13 : 17} strokeWidth={2} />
      </span>
    </>
  );

  const cls = cn(
    "paw-btn inline-flex items-center justify-between gap-4 rounded-full",
    sm ? "py-1 pr-1 pl-4 [--paw-inset:4px] [--paw-size:24px]" : "py-1.5 pr-1.5 pl-5",
    base,
    className,
  );

  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function CircleArrow({
  active,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-forest shadow-sm transition-all duration-500",
        active && "bg-forest text-white",
        className,
      )}
    >
      {active ? <ArrowRight size={17} /> : <ArrowUpRight size={17} />}
    </span>
  );
}
