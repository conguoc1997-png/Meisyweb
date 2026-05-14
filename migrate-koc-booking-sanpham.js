const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

try {
  const cols = db.prepare("PRAGMA table_info(KOCBooking)").all().map(c => c.name);

  if (!cols.includes("sanPhamId")) {
    db.prepare("ALTER TABLE KOCBooking ADD COLUMN sanPhamId TEXT").run();
    console.log("✅ Added sanPhamId");
  }
  if (!cols.includes("soLuongGui")) {
    db.prepare("ALTER TABLE KOCBooking ADD COLUMN soLuongGui INTEGER NOT NULL DEFAULT 0").run();
    console.log("✅ Added soLuongGui");
  }
  if (!cols.includes("chiPhiCast")) {
    // Copy existing chiPhi → chiPhiCast
    db.prepare("ALTER TABLE KOCBooking ADD COLUMN chiPhiCast REAL NOT NULL DEFAULT 0").run();
    db.prepare("UPDATE KOCBooking SET chiPhiCast = chiPhi").run();
    console.log("✅ Added chiPhiCast (seeded from chiPhi)");
  }
  if (!cols.includes("chiPhiSP")) {
    db.prepare("ALTER TABLE KOCBooking ADD COLUMN chiPhiSP REAL NOT NULL DEFAULT 0").run();
    console.log("✅ Added chiPhiSP");
  }

  console.log("✅ Migration complete");
} catch (err) {
  console.error("❌ Migration failed:", err.message);
} finally {
  db.close();
}
