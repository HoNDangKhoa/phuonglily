"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  AuthField,
  AuthTitle,
  FormMessage,
  OtpInput,
  PasswordInput,
  SubmitButton,
  TextInput,
} from "@/components/account/AuthUi";
import {
  completeRegistration,
  loginStudent,
  requestCode,
  resetPassword,
  verifyCode,
} from "@/lib/student-actions";

function withNext(href: string, next: string) {
  return next ? `${href}?next=${encodeURIComponent(next)}` : href;
}

export function LoginForm({ next, target }: { next: string; target: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <AuthTitle title="Chào mừng trở lại!" />
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          startTransition(async () => {
            const res = await loginStudent(email, password, remember);
            if (!res.ok) return setError(res.error);
            router.replace(target);
            router.refresh();
          });
        }}
      >
        <AuthField label="Email">
          <TextInput
            type="email"
            required
            autoComplete="email"
            placeholder="email.cua.ban@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthField>
        <AuthField label="Mật khẩu">
          <PasswordInput
            required
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>
        <div className="flex items-center justify-between text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-forest/70">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[#2f6b2c]"
            />
            Ghi nhớ đăng nhập
          </label>
          <Link href={withNext("/quen-mat-khau", next)} className="font-medium text-forest hover:text-leaf">
            Quên mật khẩu?
          </Link>
        </div>
        <FormMessage error={error} />
        <SubmitButton pending={pending}>Đăng nhập</SubmitButton>
      </form>
      <p className="mt-8 text-center text-sm text-forest/60">
        Chưa có tài khoản?{" "}
        <Link href={withNext("/dang-ky", next)} className="font-semibold text-forest hover:text-leaf">
          Tạo tài khoản
        </Link>
      </p>
    </>
  );
}

type Purpose = "REGISTER" | "RESET";

const COPY: Record<Purpose, { title: string; codeTitle: string; passwordTitle: string; send: string; finish: string }> = {
  REGISTER: {
    title: "Tạo tài khoản",
    codeTitle: "Kiểm tra email của bạn",
    passwordTitle: "Tạo mật khẩu",
    send: "Tạo tài khoản",
    finish: "Hoàn tất đăng ký",
  },
  RESET: {
    title: "Quên mật khẩu?",
    codeTitle: "Quên mật khẩu?",
    passwordTitle: "Nhập mật khẩu mới",
    send: "Tiếp tục",
    finish: "Đặt lại mật khẩu",
  },
};

/** Email → 6-digit code → password, shared by sign-up and password reset. */
export function EmailCodeFlow({
  purpose,
  next,
  target,
}: {
  purpose: Purpose;
  next: string;
  target: string;
}) {
  const router = useRouter();
  const copy = COPY[purpose];
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [email, setEmail] = useState("");
  const [masked, setMasked] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const send = (onDone?: () => void) =>
    startTransition(async () => {
      setError("");
      setInfo("");
      const res = await requestCode(email, purpose);
      if (!res.ok) return setError(res.error);
      setMasked(res.masked);
      setCooldown(60);
      setCode("");
      if (res.devCode) {
        setInfo(`Chưa cấu hình email (môi trường thử nghiệm) — mã của bạn: ${res.devCode}`);
      }
      onDone?.();
    });

  if (step === "email") {
    return (
      <>
        <AuthTitle title={copy.title}>
          {purpose === "REGISTER"
            ? "Đăng ký bằng email để lưu khoá học và theo dõi tiến độ học tập."
            : "Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận cho bạn."}
        </AuthTitle>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            send(() => setStep("code"));
          }}
        >
          <AuthField label="Email">
            <TextInput
              type="email"
              required
              autoComplete="email"
              placeholder="email.cua.ban@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </AuthField>
          <FormMessage error={error} />
          <SubmitButton pending={pending}>{copy.send}</SubmitButton>
        </form>
        <p className="mt-8 text-center text-sm text-forest/60">
          {purpose === "REGISTER" ? "Đã có tài khoản? " : "Quay lại "}
          <Link href={withNext("/dang-nhap", next)} className="font-semibold text-forest hover:text-leaf">
            Đăng nhập
          </Link>
        </p>
      </>
    );
  }

  if (step === "code") {
    return (
      <>
        <AuthTitle title={copy.codeTitle}>
          Chúng tôi đã gửi mã xác nhận gồm 6 chữ số.
          <br />
          Vui lòng kiểm tra hộp thư <b className="text-forest">{masked}</b>
        </AuthTitle>
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            startTransition(async () => {
              const res = await verifyCode(email, purpose, code);
              if (!res.ok) return setError(res.error);
              setTicket(res.ticket);
              setInfo("");
              setStep("password");
            });
          }}
        >
          <OtpInput value={code} onChange={setCode} />
          <FormMessage error={error} info={info} />
          <SubmitButton pending={pending} disabled={code.length !== 6}>
            Xác nhận mã
          </SubmitButton>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
          <button
            type="button"
            disabled={pending || cooldown > 0}
            onClick={() => send()}
            className="font-medium text-forest hover:text-leaf disabled:text-forest/40"
          >
            {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : "Gửi lại mã"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setError("");
              setInfo("");
            }}
            className="text-forest/50 hover:text-forest"
          >
            Đổi email khác
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AuthTitle title={copy.passwordTitle}>{email}</AuthTitle>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          startTransition(async () => {
            const action = purpose === "REGISTER" ? completeRegistration : resetPassword;
            const res = await action(ticket, password, confirm);
            if (!res.ok) return setError(res.error);
            router.replace(purpose === "REGISTER" && !next ? "/tai-khoan/ho-so?moi=1" : target);
            router.refresh();
          });
        }}
      >
        <AuthField label="Mật khẩu mới">
          <PasswordInput
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthField>
        <AuthField label="Nhập lại mật khẩu">
          <PasswordInput
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </AuthField>
        <FormMessage error={error} />
        <SubmitButton pending={pending}>{copy.finish}</SubmitButton>
      </form>
    </>
  );
}
