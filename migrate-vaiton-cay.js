const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "dev.db"));

const cols = db.prepare("PRAGMA table_info('VaiTon')").all().map(c => c.name);
if (!cols.includes("soCay")) {
  db.exec(`ALTER TABLE "VaiTon" ADD COLUMN "soCay" INTEGER NOT NULL DEFAULT 1;`);
  console.log("✅ Added soCay");
}
if (!cols.includes("cayData")) {
  db.exec(`ALTER TABLE "VaiTon" ADD COLUMN "cayData" TEXT;`);
  console.log("✅ Added cayData");
}
console.log("✅ Done"); db.close();
