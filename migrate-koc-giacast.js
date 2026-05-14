const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

try {
  // Add giaCast column if it doesn't exist
  const cols = db.prepare("PRAGMA table_info(KOC)").all();
  const hasGiaCast = cols.some((c) => c.name === "giaCast");
  if (!hasGiaCast) {
    db.prepare("ALTER TABLE KOC ADD COLUMN giaCast REAL NOT NULL DEFAULT 0").run();
    console.log("✅ Added giaCast column to KOC table");
  } else {
    console.log("ℹ️  giaCast column already exists");
  }
} catch (err) {
  console.error("❌ Migration failed:", err.message);
} finally {
  db.close();
}
