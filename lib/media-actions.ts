"use server";

import { del, list } from "@vercel/blob";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getBlobAuth } from "@/lib/storage";

export type MediaItem = {
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
};

const LOCAL_DIR = path.join(process.cwd(), "public", "uploads");

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
}

export async function listMedia(): Promise<MediaItem[]> {
  await requireAdmin();
  const blobAuth = getBlobAuth();
  if (blobAuth) {
    const items: MediaItem[] = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: "cms/", ...blobAuth, cursor, limit: 1000 });
      for (const b of page.blobs) {
        items.push({
          url: b.url,
          name: b.pathname.replace(/^cms\//, ""),
          size: b.size,
          uploadedAt: new Date(b.uploadedAt).toISOString(),
        });
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  }

  const names = await readdir(LOCAL_DIR).catch(() => [] as string[]);
  const items = await Promise.all(
    names
      .filter((n) => !n.startsWith("."))
      .map(async (name) => {
        const info = await stat(path.join(LOCAL_DIR, name));
        return {
          url: `/uploads/${name}`,
          name,
          size: info.size,
          uploadedAt: info.mtime.toISOString(),
        };
      }),
  );
  return items.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function deleteMedia(urls: string[]) {
  await requireAdmin();
  const blobAuth = getBlobAuth();
  if (blobAuth) {
    const blobUrls = urls.filter((u) => /^https:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(u));
    if (blobUrls.length) await del(blobUrls, blobAuth);
  } else {
    for (const url of urls) {
      if (!url.startsWith("/uploads/")) continue;
      await unlink(path.join(LOCAL_DIR, path.basename(url))).catch(() => {});
    }
  }
  revalidatePath("/admin/media");
}
