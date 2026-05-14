const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

// Add 3 boolean columns to LoCat
const cols = db.prepare("PRAGMA table_info('LoCat')").all().map(c => c.name);

if (!cols.includes("hdMayDa")) {
  db.exec(`ALTER TABLE "LoCat" ADD COLUMN "hdMayDa" INTEGER NOT NULL DEFAULT 0;`);
  console.log("✅ Added hdMayDa");
}
if (!cols.includes("hdGiatViSinhDa")) {
  db.exec(`ALTER TABLE "LoCat" ADD COLUMN "hdGiatViSinhDa" INTEGER NOT NULL DEFAULT 0;`);
  console.log("✅ Added hdGiatViSinhDa");
}
if (!cols.includes("hdGiatMauDa")) {
  db.exec(`ALTER TABLE "LoCat" ADD COLUMN "hdGiatMauDa" INTEGER NOT NULL DEFAULT 0;`);
  console.log("✅ Added hdGiatMauDa");
}

console.log("✅ Migration done");
db.close();
