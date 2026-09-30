import { upload, uploadPresigned } from "@vercel/blob/client";
import { slugify } from "@/lib/cms";

// Vercel serverless functions reject request bodies above ~4.5 MB.
const SERVER_UPLOAD_LIMIT = 4 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

type BlobMode = "token" | "presigned" | null;

let blobMode: Promise<BlobMode> | null = null;

function getBlobMode() {
  blobMode ??= fetch("/api/upload/client")
    .then((r) => r.json() as Promise<{ enabled?: boolean; mode?: BlobMode }>)
    .then((d) => (d.enabled ? (d.mode ?? "token") : null))
    .catch(() => null);
  return blobMode;
}

async function uploadViaServer(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    throw new Error(
      res.status === 413
        ? "File quá lớn để tải qua máy chủ."
        : data.error || `Upload thất bại (${res.status})`,
    );
  }
  return data.url;
}

export async function uploadAsset(
  file: File,
  onProgress?: (percentage: number) => void,
) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File vượt quá 200MB.");
  }
  const mode = file.size <= SERVER_UPLOAD_LIMIT ? null : await getBlobMode();
  if (!mode) {
    if (file.size > SERVER_UPLOAD_LIMIT) {
      throw new Error("File lớn hơn 4MB cần Vercel Blob để tải lên.");
    }
    return uploadViaServer(file);
  }

  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot).toLowerCase() : "";
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name) || "file";
  if (mode === "presigned") {
    const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const blob = await uploadPresigned(`cms/${base}-${unique}${ext}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload/client",
      onUploadProgress: ({ percentage }) => onProgress?.(percentage),
    });
    return blob.url;
  }

  const blob = await upload(`cms/${base}${ext}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload/client",
    multipart: file.size > 50 * 1024 * 1024,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });
  return blob.url;
}
