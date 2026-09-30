"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { createPortal } from "react-dom";
import { ChevronsUpDown, X } from "lucide-react";
import { FormMessage } from "@/components/account/AuthUi";
import { PROVINCES } from "@/lib/learning";
import { updateStudentProfile } from "@/lib/student-actions";

type Profile = {
  name: string;
  phone: string;
  province: string;
  ward: string;
  address: string;
};

const fieldClass =
  "h-12 w-full rounded-full border border-forest/15 bg-white px-5 text-[15px] text-forest outline-none focus:border-leaf";

export function ProfileEditor({ initial, autoOpen }: { initial: Profile; autoOpen?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(!!autoOpen);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const set = (key: keyof Profile) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const close = () => {
    setOpen(false);
    setForm(initial);
    setError("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 rounded-full bg-forest px-5 py-2.5 text-sm text-white hover:bg-leaf"
      >
        Cập nhật thông tin
      </button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/40 p-4 backdrop-blur-sm" data-lenis-prevent>
            <form
              className="flex max-h-[92dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-[24px] bg-white"
              onSubmit={(e) => {
                e.preventDefault();
                setError("");
                startTransition(async () => {
                  const res = await updateStudentProfile(form);
                  if (!res.ok) return setError(res.error);
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h3 className="text-xl font-medium text-forest">Cập nhật thông tin</h3>
                <button type="button" onClick={close} aria-label="Đóng" className="text-forest/60 hover:text-forest">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm text-forest/70">Họ và tên*</span>
                  <input required className={fieldClass} value={form.name} onChange={set("name")} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-forest/70">Số điện thoại*</span>
                  <input required type="tel" className={fieldClass} value={form.phone} onChange={set("phone")} placeholder="(+84) 912 345 678" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-forest/70">Tỉnh/Thành phố*</span>
                  <span className="relative block">
                    <select required className={`${fieldClass} appearance-none pr-10`} value={form.province} onChange={set("province")}>
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronsUpDown size={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-forest/50" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-forest/70">Phường/Xã*</span>
                  <input required className={fieldClass} value={form.ward} onChange={set("ward")} placeholder="VD: Phường Bình Thạnh" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm text-forest/70">Địa chỉ chi tiết*</span>
                  <input required className={fieldClass} value={form.address} onChange={set("address")} placeholder="Số nhà, tên đường" />
                </label>
                <FormMessage error={error} />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-forest/10 p-5">
                <button type="button" onClick={close} className="h-12 rounded-full border border-forest/20 text-sm text-forest hover:border-forest">
                  Huỷ thay đổi
                </button>
                <button type="submit" disabled={pending} className="h-12 rounded-full bg-forest text-sm text-white hover:bg-leaf disabled:opacity-60">
                  {pending ? "Đang lưu…" : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </>
  );
}
