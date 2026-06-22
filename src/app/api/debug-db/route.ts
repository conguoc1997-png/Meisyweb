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

    // Check if tables exist
    const tables = await prisma.$queryRaw<{table_schema: string; table_name: string}[]>`
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_name IN ('PhieuThuChi', 'TaiKhoanQuy')
    `;

    return NextResponse.json({ projectId, tables });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
