import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Lấy project ID từ connection string (không expose password)
    const dbUrl = process.env.DATABASE_URL ?? "";
    const projectId = dbUrl.match(/postgres\.([a-z0-9]+)/)?.[1] ?? "unknown";

    // Kiểm tra bảng tồn tại
    const tables = await prisma.$queryRaw<{table_name: string}[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('PhieuThuChi', 'TaiKhoanQuy')
    `;

    return NextResponse.json({ projectId, tables });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
