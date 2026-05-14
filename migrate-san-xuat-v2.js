const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "prisma", "dev.db"));

// Drop and recreate (no data yet)
db.exec(`DROP TABLE IF EXISTS "LoCat";`);

db.exec(`
  CREATE TABLE "LoCat" (
    "id"                  TEXT NOT NULL PRIMARY KEY,
    "ngay"                DATETIME NOT NULL,
    "hangCat"             TEXT NOT NULL,
    "soSize"              TEXT,
    "maVai"               TEXT,
    "soMSoDo"             REAL,
    "soY"                 REAL,
    "soM"                 REAL,
    "tongSize"            INTEGER,
    "soLa"                REAL,
    "soLaThucTe"          INTEGER,
    "soSanPham"           INTEGER,
    "hangThucTe"          INTEGER,
    "soLuongThieu"        INTEGER,
    "xuongNhanHang"       TEXT,
    "trangThai"           TEXT NOT NULL DEFAULT 'chua_xuat',
    "xuong"               TEXT NOT NULL DEFAULT 'meisy',
    "hdMay"               INTEGER,
    "tonTruocMay"         REAL,
    "coGiat"              TEXT,
    "hdGiatViSinh"        INTEGER,
    "tonTruocGiatViSinh"  REAL,
    "hdGiatMau"           INTEGER,
    "tonTruocGiatMau"     REAL,
    "ghiChu"              TEXT,
    "createdAt"           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("✅ LoCat table recreated with new schema!");
db.close();
