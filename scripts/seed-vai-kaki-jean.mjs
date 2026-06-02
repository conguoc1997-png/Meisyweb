// Seed vải Kaki & Jean cho Meisy
// Chạy: node scripts/seed-vai-kaki-jean.mjs

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const VAT_TUS = [
  // ── KAKI ──────────────────────────────────────────────────────────────
  { ma: "VKK001", ten: "Kaki trắng trơn",           loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK002", ten: "Kaki kem / be",              loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK003", ten: "Kaki xám nhạt",              loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK004", ten: "Kaki xám đậm",               loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK005", ten: "Kaki đen",                   loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK006", ten: "Kaki xanh navy",             loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK007", ten: "Kaki xanh rêu / olive",      loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK008", ten: "Kaki nâu caramel",           loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK009", ten: "Kaki hồng pastel",           loai: "vai", nhom: "vai_kaki", donVi: "m" },
  { ma: "VKK010", ten: "Kaki co giãn 4 chiều",       loai: "vai", nhom: "vai_kaki", donVi: "m" },

  // ── JEAN / BÒ ─────────────────────────────────────────────────────────
  { ma: "VJE001", ten: "Jean bò xanh nhạt cổ điển",  loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE002", ten: "Jean bò xanh đậm",           loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE003", ten: "Jean bò đen",                loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE004", ten: "Jean bò trắng",              loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE005", ten: "Jean bò xám",                loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE006", ten: "Jean co giãn xanh nhạt",     loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE007", ten: "Jean co giãn xanh đậm",      loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE008", ten: "Jean co giãn đen",           loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE009", ten: "Jean dày không co giãn",     loai: "vai", nhom: "vai_jean", donVi: "m" },
  { ma: "VJE010", ten: "Jean wash bạc vintage",      loai: "vai", nhom: "vai_jean", donVi: "m" },
];

async function main() {
  console.log(`🌱 Seed ${VAT_TUS.length} loại vải Kaki & Jean...`);
  let added = 0, skipped = 0;

  for (const vt of VAT_TUS) {
    const existing = await prisma.vatTu.findUnique({ where: { ma: vt.ma } });
    if (existing) {
      console.log(`  ⏭  Bỏ qua (đã có): ${vt.ma} — ${vt.ten}`);
      skipped++;
      continue;
    }
    await prisma.vatTu.create({ data: vt });
    console.log(`  ✅ ${vt.ma} — ${vt.ten}`);
    added++;
  }

  console.log(`\n✨ Hoàn tất! +${added} mới, bỏ qua ${skipped}.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
