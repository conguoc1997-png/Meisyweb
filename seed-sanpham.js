const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "dev.db"));

function genId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

// SKU → giá xuất (dùng làm giaNhap trong hệ thống)
const products = [
  { sku: "SR26KVXAM",     giaNhap: 114850 },
  { sku: "SR26KVBE",      giaNhap: 114850 },
  { sku: "QL01XN",        giaNhap: 160461.5 },
  { sku: "QL01XDAM",      giaNhap: 160461.5 },
  { sku: "QL01XDEN",      giaNhap: 139101.5 },
  { sku: "QL02XDAM",      giaNhap: 160931.75 },
  { sku: "QL02XDEN",      giaNhap: 139571.75 },
  { sku: "QL02XN",        giaNhap: 160931.75 },
  { sku: "QL25XN",        giaNhap: 159161.9 },
  { sku: "QL25XDAM",      giaNhap: 159161.9 },
  { sku: "QLCOIXDAM",     giaNhap: 171747.5 },
  { sku: "QLCOIXN",       giaNhap: 171747.5 },
  { sku: "OR02KEM",       giaNhap: 118414 },
  { sku: "OR02TRANG",     giaNhap: 118414 },
  { sku: "OR02DEN",       giaNhap: 119052.4 },
  { sku: "ORCS26",        giaNhap: 145238 },
  { sku: "OR02XDAM",      giaNhap: 153791.6 },
  { sku: "OR02XN",        giaNhap: 153791.6 },
  { sku: "OR02XDEN",      giaNhap: 132431.6 },
  { sku: "OR02CHAM",      giaNhap: 147527.6 },
  { sku: "OR02KHOI",      giaNhap: 147527.6 },
  { sku: "OR1PXN",        giaNhap: 153791.6 },
  { sku: "OR1PXDAM",      giaNhap: 153791.6 },
  { sku: "OR1PXDEN",      giaNhap: 132431.6 },
  { sku: "ORTCMUOITIEU",  giaNhap: 161506 },
  { sku: "ORTCXN02",      giaNhap: 151847.6 },
  { sku: "ORTCXDAM02",    giaNhap: 151847.6 },
  { sku: "ORTCXDEN02",    giaNhap: 131654 },
  { sku: "ORKVXN",        giaNhap: 155346.8 },
  { sku: "ORKVXDAM",      giaNhap: 155346.8 },
  { sku: "ORKVXDEN",      giaNhap: 133986.8 },
  { sku: "ORPTCXDAM",     giaNhap: 151145.6 },
  { sku: "ORPTCXN",       giaNhap: 151145.6 },
  { sku: "QP01XDEN",      giaNhap: 166239.2 },
  { sku: "QP01DEN",       giaNhap: 129586 },
  { sku: "ORKVTRANG",     giaNhap: 127990 },
  { sku: "ORKVDTHANVD",   giaNhap: 169430 },
  { sku: "ORKVKEMVD",     giaNhap: 145500.4 },
  { sku: "OR03XDAMVD",    giaNhap: 161870 },
  { sku: "OR03DTHANVD",   giaNhap: 161870 },
  { sku: "ORLYCHEODEN",   giaNhap: 112030 },
  { sku: "ORLYCHEOTRANG", giaNhap: 112030 },
  { sku: "QP01KEM",       giaNhap: 129586 },
  { sku: "QP01TRANG",     giaNhap: 129586 },
  { sku: "QDKEM",         giaNhap: 168310 },
  { sku: "QDXAM",         giaNhap: 168310 },
  { sku: "CVXOEXDAM",     giaNhap: 154310 },
  { sku: "CVXOEDTHAN",    giaNhap: 154310 },
  { sku: "CVDDXDEN",      giaNhap: 145685 },
  { sku: "QODDEN",        giaNhap: 109268.92 },
  { sku: "QODTRANG",      giaNhap: 109268.92 },
  { sku: "QODBE",         giaNhap: 109268.92 },
  { sku: "CV25XDEN",      giaNhap: 157142 },
  { sku: "CV25XDAM",      giaNhap: 178502 },
  { sku: "OR01DTHANT",    giaNhap: 146750 },
  { sku: "OR01KEMT",      giaNhap: 134488 },
  { sku: "OR01TRANGT",    giaNhap: 134488 },
  { sku: "OR01XNT",       giaNhap: 146750 },
  { sku: "OR01TCDENTHAN", giaNhap: 146750 },
  { sku: "OR01NAUT",      giaNhap: 118756 },
  { sku: "OR013P2TDTHAN", giaNhap: 146750 },
  { sku: "OR02LTUAXN",    giaNhap: 146804 },
  { sku: "OR02LTUAXDAM",  giaNhap: 146804 },
  { sku: "ORTUIHOPXDAM",  giaNhap: 135950 },
  { sku: "ORTUIHOPXN",    giaNhap: 135950 },
  { sku: "SCL01DTHAN",    giaNhap: 98686 },
  { sku: "SCL01TRANG",    giaNhap: 95158 },
  { sku: "SCL01BE",       giaNhap: 95158 },
  { sku: "SCL01DEN",      giaNhap: 95158 },
  { sku: "STCMUOITIEU",   giaNhap: 109990 },
  { sku: "STCXDEN",       giaNhap: 88660 },
  { sku: "STCXNAVY",      giaNhap: 109990 },
  { sku: "STCVANGCHANH",  giaNhap: 109990 },
  { sku: "STCXBABY",      giaNhap: 109990 },
  { sku: "S02XDEN",       giaNhap: 84646 },
  { sku: "S02XN",         giaNhap: 92646 },
  { sku: "S02XDAM",       giaNhap: 92646 },
  { sku: "CVXTXDAM",      giaNhap: 139190 },
  { sku: "CVXTDTHAN",     giaNhap: 139190 },
  { sku: "CVXSXDAM",      giaNhap: 139190 },
  { sku: "CVXSDTHAN",     giaNhap: 139190 },
  { sku: "ORTHATEOXDAM",  giaNhap: 143186 },
  { sku: "QBGXDAM",       giaNhap: 135950 },
  { sku: "QBGBE",         giaNhap: 110890 },
];

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO SanPham (id, ten, sku, giaNhap, giaBan, tonKho, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
`);

const updateStmt = db.prepare(`
  UPDATE SanPham SET giaNhap = ?, updatedAt = datetime('now') WHERE sku = ?
`);

const checkStmt = db.prepare("SELECT id FROM SanPham WHERE sku = ?");

let inserted = 0, updated = 0;

db.transaction(() => {
  for (const p of products) {
    const sku = p.sku.trim();
    const existing = checkStmt.get(sku);
    if (existing) {
      updateStmt.run(p.giaNhap, sku);
      updated++;
    } else {
      insertStmt.run(genId(), sku, sku, p.giaNhap);
      inserted++;
    }
  }
})();

console.log(`✅ Done: ${inserted} thêm mới, ${updated} cập nhật giá`);
console.log(`📦 Tổng: ${products.length} sản phẩm`);

db.close();
