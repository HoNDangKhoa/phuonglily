import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, getBlobToken } from "@/lib/storage";

export async function GET() {
  return NextResponse.json({ enabled: Boolean(getBlobToken()) });
}

export async function POST(request: Request) {
  const token = getBlobToken();
  if (!token) {
    return NextResponse.json({ error: "Blob storage is not configured" }, { status: 501 });
  }

  const body = (await request.json()) as HandleUploadBody;
  if (body.type === "blob.generate-client-token") {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("cms/")) throw new Error("Invalid path");
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
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
