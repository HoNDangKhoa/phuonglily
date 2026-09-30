import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const isCkeditor = url.searchParams.has("ckeditor");
  const form = await request.formData();

  // CKEditor filebrowser gửi field "upload"; form thường gửi "file"
  const file = form.get("upload") || form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  try {
    const uploaded = await uploadFile(file, "cms");

    if (isCkeditor) {
      const funcNum = url.searchParams.get("CKEditorFuncNum") || "1";
      const safeUrl = JSON.stringify(uploaded.url);
      const html = `<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(${funcNum}, ${safeUrl}, "");</script>`;
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return NextResponse.json({
      url: uploaded.url,
      pathname: uploaded.pathname,
      provider: uploaded.provider,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    if (isCkeditor) {
      const funcNum = url.searchParams.get("CKEditorFuncNum") || "1";
      const html = `<script type="text/javascript">window.parent.CKEDITOR.tools.callFunction(${funcNum}, "", ${JSON.stringify(message)});</script>`;
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
