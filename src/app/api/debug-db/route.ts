import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TaiKhoanQuy" (
        "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
        "ho"        TEXT NOT NULL,
        "tenHo"     TEXT NOT NULL,
        "soDuDauKy" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "thang"     TEXT NOT NULL DEFAULT '2026-06',
        "daChot"    BOOLEAN NOT NULL DEFAULT false,
        "ngayChot"  TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "TaiKhoanQuy_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "TaiKhoanQuy_ho_key" UNIQUE ("ho")
      )
    `);
    results.push("TaiKhoanQuy: created");

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PhieuThuChi" (
        "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
        "ho"          TEXT NOT NULL,
        "loai"        TEXT NOT NULL,
        "soTien"      DOUBLE PRECISION NOT NULL DEFAULT 0,
        "danhMuc"     TEXT NOT NULL DEFAULT 'khac',
        "dienGiai"    TEXT NOT NULL,
        "nguoiDeXuat" TEXT,
        "trangThai"   TEXT NOT NULL DEFAULT 'cho_duyet',
        "ghiChuDuyet" TEXT,
        "ngay"        TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "thang"       TEXT NOT NULL,
        "nguoiDuyet"  TEXT,
        "ngayDuyet"   TIMESTAMP(3),
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT NOW(),
        CONSTRAINT "PhieuThuChi_pkey" PRIMARY KEY ("id")
      )
    `);
    results.push("PhieuThuChi: created");

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "PhieuThuChi_thang_ho_idx"
      ON "PhieuThuChi"("thang", "ho")
    `);

    await prisma.$executeRawUnsafe(`
      INSERT INTO "TaiKhoanQuy" ("id","ho","tenHo","soDuDauKy","thang","daChot","updatedAt")
      VALUES
        (gen_random_uuid(),'meisy','Meisy',0,'2026-06',false,NOW()),
        (gen_random_uuid(),'nguyen_cong_uoc','Nguyen Cong Uoc',0,'2026-06',false,NOW())
      ON CONFLICT ("ho") DO NOTHING
    `);
    results.push("Seed: done");

    const count = await prisma.phieuThuChi.count();
    results.push("PhieuThuChi.count: " + count);

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), results }, { status: 500 });
  }
}
