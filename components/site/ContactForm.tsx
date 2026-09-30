"use client";

import { useState } from "react";
import { RollButton } from "@/components/site/Buttons";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-2xl border border-forest/15 bg-white px-4 py-3 text-sm text-forest outline-none transition placeholder:text-forest/40 focus:border-leaf focus:ring-2 focus:ring-leaf/15";

export function ContactForm({
  programs,
  defaultProgram = "",
  compact,
}: {
  programs: string[];
  defaultProgram?: string;
  compact?: boolean;
}) {
  const [state, setState] = useState<{ status: "idle" | "sending" | "ok" | "error"; message?: string }>({
    status: "idle",
  });
  const options = Array.from(new Set([defaultProgram, ...programs].filter(Boolean)));

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setState({ status: "sending" });
        const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).catch(() => null);
        const body = (await res?.json().catch(() => ({}))) as { error?: string };
        if (res?.ok) {
          form.reset();
          setState({ status: "ok", message: "Đăng ký thành công! Phương Lily Academy sẽ liên hệ bạn trong 24 giờ." });
        } else {
          setState({ status: "error", message: body?.error || "Không gửi được, vui lòng thử lại." });
        }
      }}
    >
      <div className={cn("grid gap-3", !compact && "md:grid-cols-2")}>
        <input name="fullName" required minLength={2} placeholder="Họ và tên *" className={field} />
        <input name="phone" required minLength={8} placeholder="Số điện thoại *" className={field} />
        <input name="email" type="email" required placeholder="Email *" className={field} />
        <select name="serviceType" defaultValue={defaultProgram} className={field}>
          <option value="">Chương trình quan tâm</option>
          {options.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
      <textarea name="message" rows={compact ? 3 : 5} placeholder="Lời nhắn" className={field} />
      <div className="flex flex-wrap items-center gap-4 pt-1">
        <RollButton
          type="submit"
          label={state.status === "sending" ? "Đang gửi…" : "Gửi đăng ký"}
          className={cn(state.status === "sending" && "pointer-events-none opacity-70")}
        />
        {state.message && (
          <p className={cn("text-sm", state.status === "ok" ? "text-leaf" : "text-red-600")}>{state.message}</p>
        )}
      </div>
    </form>
  );
}
