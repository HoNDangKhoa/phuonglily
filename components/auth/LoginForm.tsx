"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const isDev = process.env.NODE_ENV !== "production";

export function LoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = new FormData(e.currentTarget);
        const res = await signIn("credentials", {
          email: String(form.get("email")),
          password: String(form.get("password")),
          redirect: false,
        });
        setLoading(false);
        if (res?.error) {
          setError("Email hoặc mật khẩu không đúng");
          return;
        }
        router.push(callbackUrl);
        router.refresh();
      }}
    >
      <div>
        <Label htmlFor="email">Tên đăng nhập / Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={isDev ? "admin@phuonglilyacademy.com" : undefined}
        />
      </div>
      <div>
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          defaultValue={isDev ? "admin123" : undefined}
        />
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      <Button
        type="submit"
        className="w-full bg-[#3f7d3a] hover:bg-[#2f6230]"
        disabled={loading}
      >
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
      {isDev && (
        <p className="text-xs text-ink/40">
          Demo: admin@phuonglilyacademy.com / admin123
        </p>
      )}
    </form>
  );
}
