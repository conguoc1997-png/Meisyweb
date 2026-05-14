-- CreateTable
CREATE TABLE "SanPham" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ten" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "mauSac" TEXT,
    "size" TEXT,
    "giaNhap" REAL NOT NULL DEFAULT 0,
    "giaBan" REAL NOT NULL DEFAULT 0,
    "tonKho" INTEGER NOT NULL DEFAULT 0,
    "nguon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "NhapXuatKho" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sanPhamId" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "ghiChu" TEXT,
    "nguoiTao" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NhapXuatKho_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "SanPham" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DoiTra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "maDoiTra" TEXT NOT NULL,
    "maDonHang" TEXT,
    "tenKhach" TEXT NOT NULL,
    "sdtKhach" TEXT,
    "loaiVanDe" TEXT NOT NULL,
    "moTa" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'cho_xu_ly',
    "nguon" TEXT,
    "nguoiXuLy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DoiTraItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "doiTraId" TEXT NOT NULL,
    "sanPhamId" TEXT,
    "tenSanPham" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL DEFAULT 1,
    "ghiChu" TEXT,
    CONSTRAINT "DoiTraItem_doiTraId_fkey" FOREIGN KEY ("doiTraId") REFERENCES "DoiTra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DoiTraItem_sanPhamId_fkey" FOREIGN KEY ("sanPhamId") REFERENCES "SanPham" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KOC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ten" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "follower" INTEGER NOT NULL DEFAULT 0,
    "linkProfile" TEXT,
    "sdt" TEXT,
    "email" TEXT,
    "ghiChu" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "KOCBooking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kocId" TEXT NOT NULL,
    "chiPhi" REAL NOT NULL DEFAULT 0,
    "ngayBat" DATETIME NOT NULL,
    "ngayKet" DATETIME,
    "trangThai" TEXT NOT NULL DEFAULT 'dang_chay',
    "doanhThu" REAL NOT NULL DEFAULT 0,
    "donHang" INTEGER NOT NULL DEFAULT 0,
    "luotXem" INTEGER NOT NULL DEFAULT 0,
    "ghiChu" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KOCBooking_kocId_fkey" FOREIGN KEY ("kocId") REFERENCES "KOC" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "SanPham_sku_key" ON "SanPham"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "DoiTra_maDoiTra_key" ON "DoiTra"("maDoiTra");
