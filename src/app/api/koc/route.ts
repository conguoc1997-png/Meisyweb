export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Auto-migrate: thêm cột còn thiếu vào KOC + KOCBooking ──
let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  migrated = true;
  const run = (sql: string) => prisma.$executeRawUnsafe(sql).catch(() => {});
  await Promise.all([
    // KOC table
    run(`ALTER TABLE "KOC" ADD COLUMN IF NOT EXISTS "trangThaiHopTac" TEXT NOT NULL DEFAULT 'chua_tra_loi'`),
    // KOCBooking table
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "loai" TEXT NOT NULL DEFAULT 'booking'`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "daSent" BOOLEAN NOT NULL DEFAULT false`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "daRecv" BOOLEAN NOT NULL DEFAULT false`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "ngayRaHang" TIMESTAMP(3)`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "ngayLenVideo" TIMESTAMP(3)`),
    run(`ALTER TABLE "KOCBooking" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()`),
    // TiktokDoanhThuSP table (tạo nếu chưa có)
    run(`CREATE TABLE IF NOT EXISTS "TiktokDoanhThuSP" (
      "id" TEXT NOT NULL,
      "sanPhamId" TEXT NOT NULL,
      "thang" TEXT NOT NULL,
      "doanhThu" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "donHang" INTEGER NOT NULL DEFAULT 0,
      "hoanTien" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "hoaHong" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "soMon" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TiktokDoanhThuSP_pkey" PRIMARY KEY ("id")
    )`),
    // TiktokDoanhThuKOC table (tạo nếu chưa có)
    run(`CREATE TABLE IF NOT EXISTS "TiktokDoanhThuKOC" (
      "id" TEXT NOT NULL,
      "kocId" TEXT NOT NULL,
      "thang" TEXT NOT NULL,
      "creatorName" TEXT NOT NULL,
      "tiktokProductId" TEXT,
      "doanhThu" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "donHang" INTEGER NOT NULL DEFAULT 0,
      "hoanTien" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "hoaHong" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "soMon" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TiktokDoanhThuKOC_pkey" PRIMARY KEY ("id")
    )`),
  ]);
}

export async function GET() {
  try {
    await autoMigrate();
    const kocs = await prisma.kOC.findMany({
      include: { bookings: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(kocs);
  } catch (e) {
    // Fallback: trả về danh sách KOC không include bookings
    try {
      const kocs = await prisma.$queryRawUnsafe<unknown[]>(
        `SELECT id, ten, platform, follower, "giaCast", "linkProfile", sdt, email, "diaChi", "ghiChu",
                COALESCE("trangThaiHopTac", 'chua_tra_loi') as "trangThaiHopTac", "createdAt"
         FROM "KOC" ORDER BY "createdAt" DESC`
      );
      return NextResponse.json(kocs.map(k => ({ ...(k as object), bookings: [] })));
    } catch (e2) {
      return NextResponse.json({ error: String(e2) }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const koc = await prisma.kOC.create({
      data: {
        ten: body.ten,
        platform: body.platform,
        follower: Number(body.follower) || 0,
        giaCast: Number(body.giaCast) || 0,
        linkProfile: body.linkProfile || null,
        sdt: body.sdt || null,
        email: body.email || null,
        diaChi: body.diaChi || null,
        ghiChu: body.ghiChu || null,
      },
    });
    return NextResponse.json(koc, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
