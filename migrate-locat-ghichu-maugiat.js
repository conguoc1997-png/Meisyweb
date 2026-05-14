const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "dev.db"));

const cols = db.prepare("PRAGMA table_info('LoCat')").all().map(c => c.name);
if (!cols.includes("ghiChuMay")) {
  db.exec(`ALTER TABLE "LoCat" ADD COLUMN "ghiChuMay" TEXT;`);
  console.log("✅ Added ghiChuMay");
}
if (!cols.includes("mauGiat")) {
  db.exec(`ALTER TABLE "LoCat" ADD COLUMN "mauGiat" TEXT;`);
  console.log("✅ Added mauGiat");
}
console.log("✅ Done"); db.close();
