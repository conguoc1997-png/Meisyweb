const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "dev.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS "BuTien" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "tenKhach"    TEXT NOT NULL,
    "sdtKhach"    TEXT,
    "loiBu"       TEXT NOT NULL,
    "soTien"      REAL NOT NULL DEFAULT 0,
    "trangThai"   TEXT NOT NULL DEFAULT 'cho_bu',
    "ghiChu"      TEXT,
    "nguoiXuLy"   TEXT,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("✅ Bảng BuTien đã được tạo thành công!");
db.close();
