const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "dev.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS "Feedback" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "tenKhach"     TEXT,
    "sdtKhach"     TEXT,
    "sku"          TEXT,
    "kenh"         TEXT NOT NULL DEFAULT 'khac',
    "loai"         TEXT NOT NULL,
    "noiDung"      TEXT NOT NULL,
    "danhGia"      INTEGER,
    "nguoiGhiNhan" TEXT,
    "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// Thêm cột kenh nếu bảng đã tồn tại mà chưa có cột
try {
  db.exec(`ALTER TABLE "Feedback" ADD COLUMN "kenh" TEXT NOT NULL DEFAULT 'khac';`);
  console.log("✅ Đã thêm cột kenh vào bảng Feedback");
} catch {
  console.log("ℹ️ Cột kenh đã tồn tại");
}

console.log("✅ Bảng Feedback đã được tạo thành công!");
db.close();
