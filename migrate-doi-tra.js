// Script cập nhật bảng DoiTra sang cấu trúc mới
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(process.cwd(), 'dev.db');

const db = new Database(dbPath);

console.log('Đang cập nhật database...');

db.exec(`
  -- Xoá bảng cũ
  DROP TABLE IF EXISTS DoiTraItem;
  DROP TABLE IF EXISTS DoiTra;

  -- Tạo bảng DoiTra mới
  CREATE TABLE "DoiTra" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "maDoiTra"      TEXT NOT NULL,

    "sdtThangTruoc" TEXT,
    "sdtHienTai"    TEXT,
    "tenKhach"      TEXT NOT NULL,
    "diaChi"        TEXT,

    "skuHienTai"    TEXT,
    "skuDoiSang"    TEXT,
    "giaTriHang"    REAL NOT NULL DEFAULT 0,

    "loaiVanDe"     TEXT NOT NULL,
    "ghiChu"        TEXT,

    "phiShip"       REAL NOT NULL DEFAULT 0,
    "soChieuShip"   INTEGER NOT NULL DEFAULT 2,

    "maVanDon"      TEXT,
    "trangThai"     TEXT NOT NULL DEFAULT 'cho_xu_ly',
    "nguoiXuLy"     TEXT,

    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX "DoiTra_maDoiTra_key" ON "DoiTra"("maDoiTra");
`);

// Xoá migration cũ để Prisma không conflict
db.prepare("DELETE FROM _prisma_migrations WHERE migration_name NOT LIKE '%init%'").run();

// Đánh dấu migration mới trong _prisma_migrations
const now = new Date().toISOString();
db.prepare(`
  INSERT OR REPLACE INTO _prisma_migrations
  (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
  VALUES (?, ?, ?, ?, NULL, NULL, ?, 1)
`).run(
  'doi-tra-v2-' + Date.now(),
  'manual-migration',
  now,
  '20260508000000_redesign_doi_tra',
  now
);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('✅ Hoàn thành! Bảng hiện có:', tables.map(t => t.name).join(', '));
db.close();
