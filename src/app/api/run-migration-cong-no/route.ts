export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const results: string[] = [];

  async function run(label: string, sql: string) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`✅ ${label}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      // Bỏ qua lỗi "column already exists" hoặc "already exists"
      if (msg.includes("already exists") || msg.includes("duplicate column")) {
        results.push(`⏭ ${label} (already exists)`);
      } else {
        results.push(`❌ ${label}: ${msg}`);
      }
    }
  }

  // ── Thêm cột mới vào bảng có sẵn ──

  await run(
    'VatTu: add giaBan',
    `ALTER TABLE "VatTu" ADD COLUMN IF NOT EXISTS "giaBan" DOUBLE PRECISION`
  );

  await run(
    'PhieuNhapKho: add ho',
    `ALTER TABLE "PhieuNhapKho" ADD COLUMN IF NOT EXISTS "ho" TEXT NOT NULL DEFAULT 'meisy'`
  );
  await run(
    'PhieuNhapKho: add soTienHoaDon',
    `ALTER TABLE "PhieuNhapKho" ADD COLUMN IF NOT EXISTS "soTienHoaDon" DOUBLE PRECISION`
  );
  await run(
    'PhieuNhapKho: add chiPhiThucNhap',
    `ALTER TABLE "PhieuNhapKho" ADD COLUMN IF NOT EXISTS "chiPhiThucNhap" DOUBLE PRECISION`
  );

  await run(
    'PhieuXuatKho: add ho',
    `ALTER TABLE "PhieuXuatKho" ADD COLUMN IF NOT EXISTS "ho" TEXT NOT NULL DEFAULT 'meisy'`
  );
  await run(
    'PhieuXuatKho: add tenKhachHang',
    `ALTER TABLE "PhieuXuatKho" ADD COLUMN IF NOT EXISTS "tenKhachHang" TEXT`
  );
  await run(
    'PhieuXuatKho: add giaBanTong',
    `ALTER TABLE "PhieuXuatKho" ADD COLUMN IF NOT EXISTS "giaBanTong" DOUBLE PRECISION`
  );

  await run(
    'PhieuXuatChiTiet: add giaBan',
    `ALTER TABLE "PhieuXuatChiTiet" ADD COLUMN IF NOT EXISTS "giaBan" DOUBLE PRECISION NOT NULL DEFAULT 0`
  );
  await run(
    'PhieuXuatChiTiet: add doanhThuCt',
    `ALTER TABLE "PhieuXuatChiTiet" ADD COLUMN IF NOT EXISTS "doanhThuCt" DOUBLE PRECISION NOT NULL DEFAULT 0`
  );

  // ── Tạo bảng mới ──

  await run(
    'CREATE TABLE DoanhThu',
    `CREATE TABLE IF NOT EXISTS "DoanhThu" (
      "id"             TEXT NOT NULL,
      "ho"             TEXT NOT NULL,
      "ngay"           TIMESTAMP(3) NOT NULL,
      "thang"          TEXT NOT NULL,
      "phieuXuatId"    TEXT,
      "tenKhachHang"   TEXT,
      "soTien"         DOUBLE PRECISION NOT NULL DEFAULT 0,
      "giaVon"         DOUBLE PRECISION NOT NULL DEFAULT 0,
      "loiNhuan"       DOUBLE PRECISION NOT NULL DEFAULT 0,
      "trangThai"      TEXT NOT NULL DEFAULT 'chua_thu',
      "ghiChu"         TEXT,
      "nguoiTao"       TEXT,
      "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "DoanhThu_pkey" PRIMARY KEY ("id")
    )`
  );

  await run(
    'DoanhThu: unique phieuXuatId',
    `CREATE UNIQUE INDEX IF NOT EXISTS "DoanhThu_phieuXuatId_key" ON "DoanhThu"("phieuXuatId")`
  );

  await run(
    'CREATE TABLE CongNoKhachHang',
    `CREATE TABLE IF NOT EXISTS "CongNoKhachHang" (
      "id"             TEXT NOT NULL,
      "ho"             TEXT NOT NULL,
      "ngay"           TIMESTAMP(3) NOT NULL,
      "thang"          TEXT NOT NULL,
      "tenKhachHang"   TEXT NOT NULL,
      "doanhThuId"     TEXT,
      "soTien"         DOUBLE PRECISION NOT NULL DEFAULT 0,
      "daTra"          DOUBLE PRECISION NOT NULL DEFAULT 0,
      "conLai"         DOUBLE PRECISION NOT NULL DEFAULT 0,
      "trangThai"      TEXT NOT NULL DEFAULT 'con_no',
      "phieuThuChiId"  TEXT,
      "ghiChu"         TEXT,
      "nguoiTao"       TEXT,
      "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CongNoKhachHang_pkey" PRIMARY KEY ("id")
    )`
  );

  await run(
    'CongNoKhachHang: unique doanhThuId',
    `CREATE UNIQUE INDEX IF NOT EXISTS "CongNoKhachHang_doanhThuId_key" ON "CongNoKhachHang"("doanhThuId")`
  );

  await run(
    'CREATE TABLE CongNoNCC',
    `CREATE TABLE IF NOT EXISTS "CongNoNCC" (
      "id"               TEXT NOT NULL,
      "ho"               TEXT NOT NULL,
      "ngay"             TIMESTAMP(3) NOT NULL,
      "thang"            TEXT NOT NULL,
      "tenNCC"           TEXT NOT NULL,
      "phieuNhapId"      TEXT,
      "soHoaDon"         TEXT,
      "soTienHoaDon"     DOUBLE PRECISION NOT NULL DEFAULT 0,
      "chiPhiThucNhap"   DOUBLE PRECISION NOT NULL DEFAULT 0,
      "daTra"            DOUBLE PRECISION NOT NULL DEFAULT 0,
      "conLai"           DOUBLE PRECISION NOT NULL DEFAULT 0,
      "trangThai"        TEXT NOT NULL DEFAULT 'con_no',
      "phieuThuChiId"    TEXT,
      "ghiChu"           TEXT,
      "nguoiTao"         TEXT,
      "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CongNoNCC_pkey" PRIMARY KEY ("id")
    )`
  );

  return NextResponse.json({ ok: true, results });
}
