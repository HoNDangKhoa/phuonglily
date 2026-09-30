import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "video/mp4",
  "video/webm",
  "application/pdf",
  "application/zip",
];

export function isAllowedUpload(file: File) {
  return (
    ALLOWED_MIME.includes(file.type) ||
    /\.(pdf|zip|png|jpe?g|webp|gif|svg|ico|mp4|webm)$/i.test(file.name)
  );
}

export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export function getBlobToken() {
  // Guard against corrupted env values (CLI prompt leftovers like "\ny" / "\\ny")
  const rawBlob = process.env.BLOB_READ_WRITE_TOKEN ?? "";
  return (
    rawBlob.match(/vercel_blob_rw_[A-Za-z0-9_]+/)?.[0] ||
    rawBlob.replace(/\\n/g, "\n").split(/\r?\n/)[0]?.trim().replace(/\s+y$/i, "").trim() ||
    ""
  );
}

/**
 * Upload file:
 * - Production / có BLOB_READ_WRITE_TOKEN → Vercel Blob
 * - Local dev không token → public/uploads/
 */
export async function uploadFile(
  file: File,
  folder: "uploads" | "attachments" | "cms" = "uploads",
): Promise<{ url: string; pathname: string; provider: "blob" | "local" }> {
  if (!isAllowedUpload(file)) {
    throw new Error("File type not allowed");
  }

  const ext = path.extname(file.name) || ".bin";
  const filename = `${folder}/${randomUUID()}${ext}`;

  const blobToken = getBlobToken();
  if (blobToken) {
    const blob = await put(filename, file, {
      access: "public",
      token: blobToken,
    });
    return { url: blob.url, pathname: blob.pathname, provider: "blob" };
  }

  // Local filesystem (không dùng được trên Vercel serverless)
  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is required on Vercel. Enable Vercel Blob in the project.",
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return {
    url: `/uploads/${name}`,
    pathname: `uploads/${name}`,
    provider: "local",
  };
}
