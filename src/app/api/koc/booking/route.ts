export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Auto-migrate booking columns ──
let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  migrated = true;
  const run = (sql: string) => prisma.$executeRawUnsafe(sql).catch(() => {});
  await Promise.all([
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "loai" TEXT NOT NULL DEFAULT 'booking'`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "daSent" BOOLEAN NOT NULL DEFAULT false`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "daRecv" BOOLEAN NOT NULL DEFAULT false`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "ngayRaHang" TIMESTAMP(3)`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "ngayLenVideo" TIMESTAMP(3)`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()`),
    run(`ALTER TABLE "KOC" ADD COLUMN IF NOT EXISTS "trangThaiHopTac" TEXT NOT NULL DEFAULT 'chua_tra_loi'`),
  ]);
}

export async function GET() {
  try {
    await autoMigrate();
    const bookings = await prisma.kOCBooking.findMany({
      include: { koc: true, sanPham: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  } catch {
    // Fallback: raw SQL với các cột có thể thiếu dùng COALESCE
    try {
      const bookings = await prisma.$queryRawUnsafe<unknown[]>(`
        SELECT
          b.id, b."kocId", b."sanPhamId",
          b."soLuongGui", b."chiPhiCast", b."chiPhiSP", b."chiPhi",
          b."ngayBat"::text, b."ngayKet"::text,
          b."trangThai", b."doanhThu", b."donHang", b."luotXem", b."ghiChu",
          b."createdAt",
          COALESCE(b."loai", 'booking') as "loai",
          COALESCE(b."daSent", false) as "daSent",
          COALESCE(b."daRecv", false) as "daRecv",
          b."ngayRaHang"::text,
          b."ngayLenVideo"::text,
          row_to_json(k.*) as koc,
          CASE WHEN s.id IS NULL THEN NULL ELSE row_to_json(s.*) END as "sanPham"
        FROM "KOCBooking" b
        JOIN "KOC" k ON k.id = b."kocId"
        LEFT JOIN "SanPham" s ON s.id = b."sanPhamId"
        ORDER BY b."createdAt" DESC
      `);
      return NextResponse.json(bookings);
    } catch (e2: unknown) {
      return NextResponse.json({ error: e2 instanceof Error ? e2.message : "Lỗi server" }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chiPhiCast = Number(body.chiPhiCast) || 0;
    const chiPhiSP   = Number(body.chiPhiSP)   || 0;
    const chiPhi     = chiPhiCast + chiPhiSP;

    const booking = await prisma.kOCBooking.create({
      data: {
        kocId:        body.kocId,
        sanPhamId:    body.sanPhamId  || null,
        soLuongGui:   Number(body.soLuongGui) || 0,
        chiPhiCast,
        chiPhiSP,
        chiPhi,
        ngayBat:      new Date(body.ngayBat),
        ngayKet:      body.ngayKet      ? new Date(body.ngayKet)      : null,
        ngayRaHang:   body.ngayRaHang   ? new Date(body.ngayRaHang)   : null,
        ngayLenVideo: body.ngayLenVideo ? new Date(body.ngayLenVideo) : null,
        trangThai:    body.trangThai || "dang_chay",
        ghiChu:       body.ghiChu || null,
      },
      include: { koc: true, sanPham: true },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
