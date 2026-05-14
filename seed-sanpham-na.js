const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

function genId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

const products = [
  "Q2KHUY", "QBGDEN", "ORTHATEODEN",
  "TL01DEN", "TL01NAU", "TL02DEN", "TL02NAU",
  "NUTDC1", "NUTDC3", "NUMHOACUC",
  "S03CHAM", "S032VIEN", "S03XN", "S03XDAM",
  "QYEM01DEN", "QYEM01XDAM", "YEMVAY01DTHAN",
  "CVN2DT", "CVNTH", "CVN01TT", "SCG01", "CVNAU",
  "SHORTXOE", "OD2VXK", "ODTUIHOP",
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO SanPham (id, ten, sku, giaNhap, giaBan, tonKho, createdAt, updatedAt)
  VALUES (?, ?, ?, 0, 0, 0, datetime('now'), datetime('now'))
`);

const checkStmt = db.prepare("SELECT id FROM SanPham WHERE sku = ?");

let inserted = 0, skipped = 0;

db.transaction(() => {
  for (const sku of products) {
    const existing = checkStmt.get(sku);
    if (existing) { skipped++; }
    else { insertStmt.run(genId(), sku, sku); inserted++; }
  }
})();

console.log(`✅ Done: ${inserted} thêm mới, ${skipped} đã tồn tại`);
db.close();
