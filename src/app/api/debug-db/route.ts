import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy project ID từ connection string (không expose password)
    const dbUrl = process.env.DATABASE_URL ?? "";
    // Extract project ID - try multiple patterns
    const projectId =
      dbUrl.match(/postgres\.([a-z0-9]+)/)?.[1] ??
      dbUrl.match(/@db\.([a-z0-9]+)\.supabase/)?.[1] ??
      dbUrl.match(/\/\/([^:@]+)@/)?.[1] ??
      "check-url";

    // Show partial URL (no password)
    const safeUrl = dbUrl.replace(/:([^@]+)@/, ":***@").substring(0, 80);

    return NextResponse.json({ projectId, safeUrl });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
