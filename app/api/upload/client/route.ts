import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { issueSignedToken } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, getBlobToken } from "@/lib/storage";

function uploadMode() {
  if (getBlobToken()) return "token" as const;
  if (process.env.BLOB_STORE_ID && process.env.BLOB_WEBHOOK_PUBLIC_KEY) return "presigned" as const;
  return null;
}

export async function GET() {
  const mode = uploadMode();
  return NextResponse.json({ enabled: Boolean(mode), mode });
}

async function assertAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function assertPath(pathname: string) {
  if (!pathname.startsWith("cms/") || pathname.includes("..")) throw new Error("Invalid path");
}

export async function POST(request: Request) {
  const mode = uploadMode();
  if (!mode) {
    return NextResponse.json({ error: "Blob storage is not configured" }, { status: 501 });
  }

  try {
    if (mode === "presigned") {
      const body = (await request.json()) as HandleUploadPresignedBody;
      const result = await handleUploadPresigned({
        body,
        request,
        getSignedToken: async (pathname) => {
          await assertAdmin();
          assertPath(pathname);
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: ALLOWED_MIME,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            validUntil: Date.now() + 30 * 60 * 1000,
          });
          return {
            token,
            urlOptions: { allowedContentTypes: ALLOWED_MIME, maximumSizeInBytes: MAX_UPLOAD_BYTES },
          };
        },
      });
      return NextResponse.json(result);
    }

    const body = (await request.json()) as HandleUploadBody;
    if (body.type === "blob.generate-client-token") await assertAdmin();
    const result = await handleUpload({
      body,
      request,
      token: getBlobToken(),
      onBeforeGenerateToken: async (pathname) => {
        assertPath(pathname);
        return {
          allowedContentTypes: ALLOWED_MIME,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 400 });
  }
}
