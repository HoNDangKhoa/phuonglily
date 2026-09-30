import Image from "next/image";
import Link from "next/link";
import { getSiteSettings } from "@/lib/queries";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const s = await getSiteSettings();
  return (
    <div className="flex min-h-dvh flex-col bg-[#f6f8f2]">
      <header className="flex justify-center pt-8">
        <Link href="/" className="flex items-center gap-3">
          {s.logoUrl && (
            <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
              <Image src={s.logoUrl} alt={s.name} fill sizes="48px" className="object-cover" />
            </span>
          )}
          <span className="text-xl font-semibold tracking-tight text-forest">{s.name}</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
    </div>
  );
}
