"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CacheKeys, rateLimit } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const emailSchema = z.string().trim().toLowerCase().email();

export async function subscribeNewsletter(email: string) {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false as const, error: "Email không hợp lệ." };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = await rateLimit(CacheKeys.rateContact(`nl:${ip}`), 5, 60);
  if (!limited.ok) {
    return { ok: false as const, error: "Bạn thao tác quá nhanh, thử lại sau." };
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data },
    update: { isActive: true },
    create: { email: parsed.data },
  });
  revalidatePath("/admin/newsletter");
  return { ok: true as const };
}
