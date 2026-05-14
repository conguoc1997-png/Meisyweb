const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "prisma", "dev.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS "LoCat" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "ngay"         DATETIME NOT NULL,
    "hangCat"      TEXT NOT NULL,
    "soSize"       TEXT,
    "maVai"        TEXT,
    "soDo"         REAL,
    "soY"          REAL,
    "soM"          REAL,
    "soLa"         INTEGER,
    "soLaThucTe"   INTEGER,
    "sauCat"       INTEGER,
    "giao"         INTEGER,
    "hangThucTe"   INTEGER,
    "trangThai"    TEXT NOT NULL DEFAULT 'chua_xuat',
    "hdVai"        INTEGER,
    "hdMay"        INTEGER,
    "hdGiatMau"    INTEGER,
    "hdGiatViSinh" INTEGER,
    "coGiat"       TEXT,
    "soHoaDon"     TEXT,
    "xuong"        TEXT NOT NULL DEFAULT 'meisy',
    "ghiChu"       TEXT,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("✅ Tạo bảng LoCat thành công!");
db.close();
