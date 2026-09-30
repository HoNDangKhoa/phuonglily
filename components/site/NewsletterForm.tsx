"use client";

import { useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import { subscribeNewsletter } from "@/lib/public-actions";
import { cn } from "@/lib/utils";

export function NewsletterForm({ placeholder }: { placeholder: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const res = await subscribeNewsletter(email);
          if (res.ok) {
            setEmail("");
            setStatus({ ok: true, text: "Cảm ơn bạn đã đăng ký!" });
          } else {
            setStatus({ ok: false, text: res.error });
          }
        });
      }}
    >
      <div className="flex items-center gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 min-w-0 flex-1 rounded-full border border-forest/10 bg-lime-bright px-5 text-sm text-forest placeholder:text-forest/50 outline-none transition focus:ring-2 focus:ring-forest/30"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Đăng ký"
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-forest transition-all duration-500 hover:bg-forest hover:text-white disabled:opacity-60"
        >
          <ChevronRight size={18} className="transition-transform duration-500 group-hover:translate-x-0.5" />
        </button>
      </div>
      {status && (
        <p className={cn("mt-2 text-xs font-medium", status.ok ? "text-forest" : "text-red-700")}>
          {status.text}
        </p>
      )}
    </form>
  );
}
