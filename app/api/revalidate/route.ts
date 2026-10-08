import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { invalidateCmsCache } from "@/lib/cache";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    paths?: string[];
    slugs?: string[];
  };

  const paths = body.paths?.length
    ? body.paths
    : ["/", "/khoa-hoc", "/hoc-online", "/lich-su-kien", "/blog", "/lien-he", "/gioi-thieu", "/tuyen-dung"];

  await invalidateCmsCache(body.slugs || []);

  for (const p of paths) {
    revalidatePath(p);
  }

  return NextResponse.json({ ok: true, paths, redisInvalidated: true });
}
