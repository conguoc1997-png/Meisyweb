export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

function newId() { return randomBytes(12).toString("base64url"); }

let migrated = false;
async function run(sql: string) {
  try { await prisma.$executeRawUnsafe(sql); } catch { /* ignore */ }
}
async function autoMigrate() {
  if (migrated) return;
  await run(`
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
  await run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "caLamViecId" TEXT`);
  await run(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "luongGio" DOUBLE PRECISION`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`);
  await run(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`);
  migrated = true;
}

// GET /api/ca-lam-viec
export async function GET() {
  await autoMigrate();
  const list = await prisma.$queryRawUnsafe<object[]>(
    `SELECT * FROM "CaLamViec" ORDER BY "ten" ASC`
  );
  return NextResponse.json(list);
}

// Helper: gán ca cho NV sau khi tạo/cập nhật
async function assignCa(caId: string, apDung: string, boPhanList: string[], nhanVienIds: string[]) {
  if (apDung === "bo_phan" && boPhanList.length > 0) {
    for (const bp of boPhanList) {
      await prisma.$executeRawUnsafe(
        `UPDATE "NhanVien" SET "caLamViecId"=$1 WHERE "phongBan" ILIKE $2 AND "active"=true`,
        caId, bp
      );
    }
  } else if (apDung === "nhan_vien" && nhanVienIds.length > 0) {
    for (const nvId of nhanVienIds) {
      await prisma.$executeRawUnsafe(
        `UPDATE "NhanVien" SET "caLamViecId"=$1 WHERE "id"=$2`,
        caId, nvId
      );
    }
  }
}

// POST — tạo mới
export async function POST(req: NextRequest) {
  await autoMigrate();
  const { ten, gioVao, gioRa, nghiTrua, ghiChu, apDung, boPhanList, nhanVienIds } = await req.json();
  if (!ten || !gioVao || !gioRa) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const id = newId();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "CaLamViec" ("id","ten","gioVao","gioRa","nghiTrua","ghiChu") VALUES ($1,$2,$3,$4,$5,$6)`,
    id, ten, gioVao, gioRa, Number(nghiTrua) || 90, ghiChu || null
  );
  await assignCa(id, apDung || "khong", boPhanList || [], nhanVienIds || []);
  const rows = await prisma.$queryRawUnsafe<object[]>(
    `SELECT * FROM "CaLamViec" WHERE "id" = $1`, id
  );
  return NextResponse.json(rows[0]);
}

// PUT — cập nhật
export async function PUT(req: NextRequest) {
  await autoMigrate();
  const { id, ten, gioVao, gioRa, nghiTrua, ghiChu, apDung, boPhanList, nhanVienIds } = await req.json();
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  await assignCa(id, apDung || "khong", boPhanList || [], nhanVienIds || []);
  await prisma.$executeRawUnsafe(
    `UPDATE "CaLamViec" SET "ten"=$2,"gioVao"=$3,"gioRa"=$4,"nghiTrua"=$5,"ghiChu"=$6 WHERE "id"=$1`,
    id, ten, gioVao, gioRa, Number(nghiTrua) || 90, ghiChu || null
  );
  const rows = await prisma.$queryRawUnsafe<object[]>(
    `SELECT * FROM "CaLamViec" WHERE "id" = $1`, id
  );
  return NextResponse.json(rows[0]);
}

// DELETE
export async function DELETE(req: NextRequest) {
  await autoMigrate();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Thiếu id" }, { status: 400 });
  await prisma.$executeRawUnsafe(`DELETE FROM "CaLamViec" WHERE "id" = $1`, id);
  return NextResponse.json({ ok: true });
}
