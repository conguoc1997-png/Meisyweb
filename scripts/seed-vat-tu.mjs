// Script seed vật tư mẫu cho Meisy
// Chạy: node scripts/seed-vat-tu.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const VAT_TUS = [
  // ── VẢI ──────────────────────────────────────────
  { ma: "VCT001", ten: "Vải cotton trắng",    loai: "vai", nhom: "vai_cotton", donVi: "m" },
  { ma: "VCT002", ten: "Vải cotton đen",      loai: "vai", nhom: "vai_cotton", donVi: "m" },
  { ma: "VCT003", ten: "Vải cotton màu",      loai: "vai", nhom: "vai_cotton", donVi: "m" },
  { ma: "VTH001", ten: "Vải thun trắng",      loai: "vai", nhom: "vai_thun",   donVi: "m" },
  { ma: "VTH002", ten: "Vải thun đen",        loai: "vai", nhom: "vai_thun",   donVi: "m" },
  { ma: "VTH003", ten: "Vải thun màu",        loai: "vai", nhom: "vai_thun",   donVi: "m" },
  { ma: "VLU001", ten: "Vải lụa trắng",       loai: "vai", nhom: "vai_lua",    donVi: "m" },
  { ma: "VLU002", ten: "Vải lụa đen",         loai: "vai", nhom: "vai_lua",    donVi: "m" },

  // ── CHỈ ──────────────────────────────────────────
  { ma: "CHI001", ten: "Chỉ trắng",           loai: "phu_lieu", nhom: "chi", donVi: "cuon" },
  { ma: "CHI002", ten: "Chỉ đen",             loai: "phu_lieu", nhom: "chi", donVi: "cuon" },
  { ma: "CHI003", ten: "Chỉ màu (các màu)",   loai: "phu_lieu", nhom: "chi", donVi: "cuon" },

  // ── CÚC ──────────────────────────────────────────
  { ma: "CUC001", ten: "Cúc nhựa trắng",      loai: "phu_lieu", nhom: "cuc", donVi: "cai" },
  { ma: "CUC002", ten: "Cúc nhựa đen",        loai: "phu_lieu", nhom: "cuc", donVi: "cai" },
  { ma: "CUC003", ten: "Cúc kim loại bạc",    loai: "phu_lieu", nhom: "cuc", donVi: "cai" },
  { ma: "CUC004", ten: "Cúc kim loại vàng",   loai: "phu_lieu", nhom: "cuc", donVi: "cai" },

  // ── KHÓA / KÉO ───────────────────────────────────
  { ma: "KK001",  ten: "Khóa kéo 20cm trắng", loai: "phu_lieu", nhom: "khoa_keo", donVi: "cai" },
  { ma: "KK002",  ten: "Khóa kéo 20cm đen",   loai: "phu_lieu", nhom: "khoa_keo", donVi: "cai" },
  { ma: "KK003",  ten: "Khóa kéo 30cm",       loai: "phu_lieu", nhom: "khoa_keo", donVi: "cai" },
  { ma: "KK004",  ten: "Khóa dây kéo vàng",   loai: "phu_lieu", nhom: "khoa_keo", donVi: "cai" },

  // ── LÓT ──────────────────────────────────────────
  { ma: "LOT001", ten: "Vải lót trắng",        loai: "phu_lieu", nhom: "lot", donVi: "m" },
  { ma: "LOT002", ten: "Vải lót đen",          loai: "phu_lieu", nhom: "lot", donVi: "m" },
  { ma: "LOT003", ten: "Vải lót màu kem",      loai: "phu_lieu", nhom: "lot", donVi: "m" },

  // ── ĐINH TÁN ─────────────────────────────────────
  { ma: "DT001",  ten: "Đinh tán bạc nhỏ",    loai: "phu_lieu", nhom: "dinh_tan", donVi: "cai" },
  { ma: "DT002",  ten: "Đinh tán bạc lớn",    loai: "phu_lieu", nhom: "dinh_tan", donVi: "cai" },
  { ma: "DT003",  ten: "Đinh tán vàng",        loai: "phu_lieu", nhom: "dinh_tan", donVi: "cai" },

  // ── MEX ──────────────────────────────────────────
  { ma: "MEX001", ten: "Mex dính trắng",       loai: "phu_lieu", nhom: "mex", donVi: "m" },
  { ma: "MEX002", ten: "Mex dính đen",         loai: "phu_lieu", nhom: "mex", donVi: "m" },
  { ma: "MEX003", ten: "Mex cứng",             loai: "phu_lieu", nhom: "mex", donVi: "m" },

  // ── NHÃN ─────────────────────────────────────────
  { ma: "NHA001", ten: "Nhãn vải thương hiệu", loai: "phu_lieu", nhom: "nhan", donVi: "cai" },
  { ma: "NHA002", ten: "Nhãn size",            loai: "phu_lieu", nhom: "nhan", donVi: "cai" },
  { ma: "NHA003", ten: "Nhãn thành phần",      loai: "phu_lieu", nhom: "nhan", donVi: "cai" },

  // ── ĐÓNG GÓI ─────────────────────────────────────
  { ma: "DG001",  ten: "Túi PP trong",         loai: "phu_lieu", nhom: "dong_goi", donVi: "cai" },
  { ma: "DG002",  ten: "Túi zip khóa",         loai: "phu_lieu", nhom: "dong_goi", donVi: "cai" },
  { ma: "DG003",  ten: "Hộp carton",           loai: "phu_lieu", nhom: "dong_goi", donVi: "cai" },
  { ma: "DG004",  ten: "Thẻ bài giấy",         loai: "phu_lieu", nhom: "dong_goi", donVi: "cai" },
];

async function main() {
  console.log(`🌱 Bắt đầu seed ${VAT_TUS.length} vật tư...`);
  let added = 0, skipped = 0;

  for (const vt of VAT_TUS) {
    const existing = await prisma.vatTu.findUnique({ where: { ma: vt.ma } });
    if (existing) {
      console.log(`  ⏭  Bỏ qua (đã có): ${vt.ma} — ${vt.ten}`);
      skipped++;
      continue;
    }
    await prisma.vatTu.create({ data: vt });
    console.log(`  ✅ Đã thêm: ${vt.ma} — ${vt.ten}`);
    added++;
  }

  console.log(`\n✨ Hoàn tất! Đã thêm ${added} vật tư, bỏ qua ${skipped} (đã tồn tại).`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
