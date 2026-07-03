export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  try {
    // Tạo bảng CaLamViec nếu chưa có
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CaLamViec" (
        "id"        TEXT NOT NULL,
        "ten"       TEXT NOT NULL,
        "gioVao"    TEXT NOT NULL DEFAULT '07:30',
        "gioRa"     TEXT NOT NULL DEFAULT '17:30',
        "nghiTrua"  INTEGER NOT NULL DEFAULT 90,
        "ghiChu"    TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("id")
      )
    `);
    // Thêm cột mới vào NhanVien
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`
    );
    // Thêm cột mới vào ChamCong
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`
    );
  } catch { /* ignore */ }
  migrated = true;
}

// GET /api/ca-lam-viec
export async function GET() {
  await autoMigrate();
  const list = await prisma.caLamViec.findMany({ orderBy: { ten: "asc" } });
  return NextResponse.json(list);
}

// POST /api/ca-lam-viec — tạo mới
export async function POST(req: NextRequest) {
  await autoMigrate();
  const { ten, gioVao, gioRa, nghiTrua, ghiChu } = await req.json();
  if (!ten || !gioVao || !gioRa) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const ca = await prisma.caLamViec.create({
    data: { ten, gioVao, gioRa, nghiTrua: Number(nghiTrua) || 90, ghiChu: ghiChu || null },
  });
  return NextResponse.json(ca);
}

// PUT /api/ca-lam-viec — cập nhật
export async function PUT(req: NextRequest) {
  await autoMigrate();
  const { id, ten, gioVao, gioRa, nghiTrua, ghiChu } = await req.json();
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  const ca = await prisma.caLamViec.update({
    where: { id },
    data: { ten, gioVao, gioRa, nghiTrua: Number(nghiTrua) || 90, ghiChu: ghiChu || null },
  });
  return NextResponse.json(ca);
}

// DELETE /api/ca-lam-viec?id=xxx
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  await prisma.caLamViec.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
