const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

db.exec(`CREATE TABLE IF NOT EXISTS "HoaDonTonHistory" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "loaiHD"    TEXT NOT NULL,
  "soTonCu"   REAL NOT NULL DEFAULT 0,
  "soTonMoi"  REAL NOT NULL DEFAULT 0,
  "ghiChu"    TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);

console.log("✅ Tạo bảng HoaDonTonHistory xong");
db.close();
