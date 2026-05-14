const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "dev.db"));
const cols = db.prepare("PRAGMA table_info('VaiTon')").all().map(c => c.name);
if (!cols.includes("xuong")) {
  db.exec(`ALTER TABLE "VaiTon" ADD COLUMN "xuong" TEXT;`);
  console.log("✅ Added xuong");
}
console.log("✅ Done"); db.close();
