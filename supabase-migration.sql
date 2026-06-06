-- ============================================================
-- MEISY INHOUSE — Full Migration Script
-- Chạy trên Supabase SQL Editor
-- Dùng CREATE TABLE IF NOT EXISTS → an toàn, không mất dữ liệu cũ
-- ============================================================

-- VatTu
CREATE TABLE IF NOT EXISTS "VatTu" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ma"        TEXT UNIQUE NOT NULL,
  "ten"       TEXT NOT NULL,
  "loai"      TEXT NOT NULL,
  "nhom"      TEXT,
  "donVi"     TEXT NOT NULL DEFAULT 'm',
  "donViMua"  TEXT NOT NULL DEFAULT 'm',
  "quyDoi"    FLOAT8 NOT NULL DEFAULT 1,
  "ghiChu"    TEXT,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE "VatTu" ADD COLUMN IF NOT EXISTS "donViMua" TEXT NOT NULL DEFAULT 'm';
ALTER TABLE "VatTu" ADD COLUMN IF NOT EXISTS "quyDoi"   FLOAT8 NOT NULL DEFAULT 1;

-- TonKhoVatTu
CREATE TABLE IF NOT EXISTS "TonKhoVatTu" (
  "id"           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vatTuId"      TEXT UNIQUE NOT NULL REFERENCES "VatTu"("id"),
  "soLuong"      FLOAT8 NOT NULL DEFAULT 0,
  "giaTrungBinh" FLOAT8 NOT NULL DEFAULT 0,
  "giaTriTon"    FLOAT8 NOT NULL DEFAULT 0,
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NhaCungCap
CREATE TABLE IF NOT EXISTS "NhaCungCap" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "ma"        TEXT UNIQUE NOT NULL,
  "ten"       TEXT NOT NULL,
  "sdt"       TEXT,
  "diaChi"    TEXT,
  "email"     TEXT,
  "ghiChu"    TEXT,
  "active"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QuyDoiDonVi
CREATE TABLE IF NOT EXISTS "QuyDoiDonVi" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "tuDonVi"   TEXT NOT NULL,
  "veDonVi"   TEXT NOT NULL,
  "heSo"      FLOAT8 NOT NULL,
  "ghiChu"    TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PhieuNhapKho
CREATE TABLE IF NOT EXISTS "PhieuNhapKho" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "soPhieu"     TEXT UNIQUE NOT NULL,
  "ngay"        TIMESTAMPTZ NOT NULL,
  "nhaCC"       TEXT NOT NULL,
  "tenNhaCC"    TEXT,
  "soHoaDon"    TEXT,
  "ngayHoaDon"  TIMESTAMPTZ,
  "tongTien"    FLOAT8 NOT NULL DEFAULT 0,
  "trangThai"   TEXT NOT NULL DEFAULT 'chua_thanh_toan',
  "ghiChu"      TEXT,
  "nguoiTao"    TEXT,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ChiTietNhapKho
CREATE TABLE IF NOT EXISTS "ChiTietNhapKho" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "phieuId"    TEXT NOT NULL REFERENCES "PhieuNhapKho"("id") ON DELETE CASCADE,
  "vatTuId"    TEXT NOT NULL REFERENCES "VatTu"("id"),
  "soLuongMua" FLOAT8 NOT NULL DEFAULT 0,
  "donViMua"   TEXT NOT NULL DEFAULT 'm',
  "quyDoi"     FLOAT8 NOT NULL DEFAULT 1,
  "soLuong"    FLOAT8 NOT NULL,
  "donGia"     FLOAT8 NOT NULL,
  "thanhTien"  FLOAT8 NOT NULL,
  "ghiChu"     TEXT
);

-- DinhMucNPL
CREATE TABLE IF NOT EXISTS "DinhMucNPL" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "hangCat"   TEXT NOT NULL,
  "vatTuId"   TEXT NOT NULL REFERENCES "VatTu"("id"),
  "soLuong"   FLOAT8 NOT NULL,
  "donViMua"  TEXT NOT NULL DEFAULT 'm',
  "quyDoi"    FLOAT8 NOT NULL DEFAULT 1,
  "ghiChu"    TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PhieuXuatKho
CREATE TABLE IF NOT EXISTS "PhieuXuatKho" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "soPhieu"   TEXT UNIQUE NOT NULL,
  "loCatId"   TEXT,
  "hangCat"   TEXT,
  "soSanPham" INT NOT NULL DEFAULT 0,
  "ngay"      TIMESTAMPTZ NOT NULL,
  "lyDo"      TEXT NOT NULL DEFAULT 'san_xuat',
  "ghiChu"    TEXT,
  "nguoiTao"  TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PhieuXuatChiTiet
CREATE TABLE IF NOT EXISTS "PhieuXuatChiTiet" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "phieuXuatId" TEXT NOT NULL REFERENCES "PhieuXuatKho"("id") ON DELETE CASCADE,
  "vatTuId"     TEXT NOT NULL REFERENCES "VatTu"("id"),
  "soLuong"     FLOAT8 NOT NULL,
  "donGia"      FLOAT8 NOT NULL DEFAULT 0,
  "thanhTien"   FLOAT8 NOT NULL DEFAULT 0,
  "ghiChu"      TEXT
);

-- CongNo
CREATE TABLE IF NOT EXISTS "CongNo" (
  "id"         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "nhaCC"      TEXT NOT NULL,
  "ngay"       TIMESTAMPTZ NOT NULL,
  "soChungTu"  TEXT,
  "dienGiai"   TEXT NOT NULL,
  "loai"       TEXT NOT NULL,
  "soTien"     FLOAT8 NOT NULL DEFAULT 0,
  "ghiChu"     TEXT,
  "nguoiTao"   TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Done! Tất cả bảng module Kế toán đã sẵn sàng.
-- ============================================================

-- ============================================================
-- Module Sản xuất — thêm cột loaiHang vào LoCat
-- ============================================================
ALTER TABLE "LoCat" ADD COLUMN IF NOT EXISTS "loaiHang" TEXT DEFAULT 'dai_thuong';
