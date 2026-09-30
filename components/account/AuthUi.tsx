"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "h-12 w-full rounded-full border border-forest/15 bg-white px-5 text-[15px] text-forest outline-none transition placeholder:text-forest/35 focus:border-leaf focus:ring-4 focus:ring-leaf/10";

export function AuthTitle({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-7 text-center">
      <h1 className="text-[28px] font-semibold tracking-tight text-forest">{title}</h1>
      {children && <div className="mt-2 text-sm leading-relaxed text-forest/60">{children}</div>}
    </div>
  );
}

export function AuthField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-forest/70">{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function PasswordInput(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className={cn(inputClass, "pr-12", props.className)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-forest/40 hover:text-forest"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
  disabled,
}: {
  children: React.ReactNode;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest text-[15px] font-medium text-white transition hover:bg-leaf disabled:opacity-60"
    >
      {pending && <Loader2 size={18} className="animate-spin" />}
      {children}
    </button>
  );
}

export function FormMessage({ error, info }: { error?: string; info?: string }) {
  if (!error && !info) return null;
  return (
    <p
      className={cn(
        "rounded-2xl px-4 py-3 text-sm",
        error ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700",
      )}
    >
      {error || info}
    </p>
  );
}

export function OtpInput({
  value,
  onChange,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  const setAt = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join("").slice(0, length));
  };

  return (
    <div className="flex justify-between gap-2" onPaste={(e) => {
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (!pasted) return;
      e.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, length - 1)]?.focus();
    }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          placeholder="-"
          aria-label={`Chữ số ${i + 1}`}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, d);
            if (d) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft") refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight") refs.current[i + 1]?.focus();
          }}
          className="aspect-square w-full min-w-0 rounded-full bg-[#eef2e8] text-center text-lg font-medium text-forest outline-none transition placeholder:text-forest/25 focus:bg-white focus:ring-2 focus:ring-leaf"
        />
      ))}
    </div>
  );
}
