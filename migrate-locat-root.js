const Database = require("better-sqlite3");
const path = require("path");

// Dùng đúng file dev.db ở root (file app đang dùng)
const db = new Database(path.join(__dirname, "dev.db"));

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

const check = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='LoCat'").get();
console.log("✅ Tạo bảng LoCat thành công:", check);
db.close();
