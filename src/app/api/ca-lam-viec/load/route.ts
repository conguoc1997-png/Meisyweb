export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/ca-lam-viec/load — trả CaLamViec + NhanVien trong 1 request
export async function GET() {
  try {
    const [caList, nvList] = await Promise.all([
      prisma.$queryRawUnsafe<object[]>(`SELECT * FROM "CaLamViec" ORDER BY "ten" ASC`),
      prisma.$queryRawUnsafe<object[]>(
        `SELECT "id","ten","maNV","phongBan","caLamViecId" FROM "NhanVien" WHERE "active" = true ORDER BY "ten" ASC`
      ).catch(() => []),
    ]);
    return NextResponse.json({ caList, nvList });
  } catch (e) {
    console.error("GET /api/ca-lam-viec/load error:", e);
    return NextResponse.json({ error: String(e), caList: [], nvList: [] }, { status: 500 });
  }
}
