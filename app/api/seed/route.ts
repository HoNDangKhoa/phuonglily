import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { invalidateCmsCache } from "@/lib/cache";
import { main as seed } from "../../../prisma/seed";

/**
 * One-shot / re-runnable production seed (upserts).
 * curl -X POST -H "Authorization: Bearer $AUTH_SECRET" https://…/api/seed
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!process.env.AUTH_SECRET || token !== process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await seed();
    await invalidateCmsCache([]);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[seed]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 },
    );
  }
}
