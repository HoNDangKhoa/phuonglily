"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/lib/actions";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminChrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function ChangePasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <AdminPageHeader title="Đổi mật khẩu" />
      <AdminCard>
        <form
          className="max-w-lg space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setMessage("");
            setError("");
            const form = e.currentTarget;
            const formData = new FormData(form);
            startTransition(async () => {
              const res = await changePassword(formData);
              if (res.ok) {
                setMessage("Đã cập nhật mật khẩu thành công.");
                form.reset();
              } else {
                setError(res.error);
              }
            });
          }}
        >
          <div>
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Nhập lại mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={6}
            />
          </div>
          {error && (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          )}
          {message && (
            <p className="text-sm font-semibold text-emerald-600">{message}</p>
          )}
          <Button
            type="submit"
            className="bg-[#3f7d3a] hover:bg-[#2f6230]"
            disabled={pending}
          >
            {pending ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
          </Button>
        </form>
      </AdminCard>
    </div>
  );
}
