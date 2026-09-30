"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { updateAccount } from "@/lib/actions";

export function AccountForm({
  initial,
}: {
  initial: { name: string; email: string; role: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-lg space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        startTransition(async () => {
          try {
            const res = await updateAccount({ name, email });
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setMessage("Đã cập nhật thông tin tài khoản.");
            router.refresh();
          } catch {
            setError("Có lỗi xảy ra, vui lòng thử lại.");
          }
        });
      }}
    >
      <div>
        <Label>Họ tên</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Email đăng nhập</Label>
        <Input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <Label>Vai trò</Label>
        <Input value={initial.role} readOnly disabled />
      </div>
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      {message && (
        <p className="text-sm font-semibold text-emerald-600">{message}</p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 bg-[#3f7d3a] hover:bg-[#2f6230]"
      >
        {pending ? "Đang lưu…" : "Lưu thay đổi"}
      </Button>
    </form>
  );
}
