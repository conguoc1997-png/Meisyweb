const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "dev.db"));

db.exec(`CREATE TABLE IF NOT EXISTS "HoaDonTon" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "soTon"     REAL NOT NULL DEFAULT 0,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);

db.exec(`INSERT OR IGNORE INTO "HoaDonTon" ("id","soTon","updatedAt") VALUES
  ('may', 0, CURRENT_TIMESTAMP),
  ('giat', 0, CURRENT_TIMESTAMP);`);

const rows = db.prepare("SELECT * FROM HoaDonTon").all();
console.log("✅ HoaDonTon:", rows);
db.close();
