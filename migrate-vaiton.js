const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "dev.db"));

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
if (!tables.includes("VaiTon")) {
  db.exec(`CREATE TABLE "VaiTon" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "maVai"     TEXT NOT NULL,
    "soMet"     REAL NOT NULL DEFAULT 0,
    "donVi"     TEXT NOT NULL DEFAULT 'm',
    "mauSac"    TEXT,
    "ghiChu"    TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`);
  console.log("✅ Created VaiTon table");
} else {
  console.log("ℹ️  VaiTon already exists");
}
console.log("✅ Done"); db.close();
