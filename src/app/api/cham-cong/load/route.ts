export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Chỉ thêm các cột KHÔNG có trong Prisma schema — chạy 1 lần per cold-start
let migrated = false;
async function ensureColumns() {
  if (migrated) return;
  await Promise.all([
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "ChamCong" ADD COLUMN IF NOT EXISTS "tongGio" DOUBLE PRECISION`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "ngayNghiViec" TEXT`).catch(() => {}),
  ]);
  migrated = true;
}

/**
 * GET /api/cham-cong/load?thang=2026-07&h=1
 * Trả về NV + ChamCong tháng + PhuCap tháng trong 1 request duy nhất
 * h=1 → include luongCBHistory (cho tab bảng lương)
 */
export async function GET(req: NextRequest) {
  try {
    await ensureColumns();
    const url   = new URL(req.url);
    const thang = url.searchParams.get("thang");
    const withHistory = url.searchParams.get("h") === "1";

    // Ngày đầu tháng để lọc NV nghỉ việc
    const monthStart = thang ? `${thang}-01` : null;

    // Chạy song song: NV + CC + PhuCap
    const [nvPrisma, nvExtraRaw, ccRows, phuCapRows] = await Promise.all([
      // 1a. Nhân viên qua Prisma (không lọc active để lấy cả người đã nghỉ trong tháng)
      prisma.nhanVien.findMany({
        orderBy: { ten: "asc" },
        ...(withHistory ? { include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } } } : {}),
      }),

      // 1b. Lấy ngayNghiViec (cột ngoài schema) qua raw SQL
      prisma.$queryRawUnsafe<{ id: string; ngayNghiViec: string | null }[]>(
        `SELECT "id","ngayNghiViec" FROM "NhanVien"`
      ).catch(() => null), // null = cột chưa tồn tại → fallback hiện all active

      // 2. Chấm công tháng — dùng raw SQL để lấy cả gioVao/gioRa
      thang ? (async () => {
        const [y, m] = thang.split("-").map(Number);
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end   = new Date(Date.UTC(y, m, 1));
        return prisma.$queryRawUnsafe<object[]>(
          `SELECT "id","nhanVienId","ngay","trangThai","tangCa","ghiChu","gioVao","gioRa","tongGio"
           FROM "ChamCong" WHERE "ngay" >= $1 AND "ngay" < $2`,
          start, end
        ).catch((e) => { console.error("CC query error:", e); return []; });
      })() : Promise.resolve([]),

      // 3. Phụ cấp tháng
      thang
        ? prisma.phuCapThang.findMany({ where: { thang } }).catch(() => [])
        : Promise.resolve([]),
    ]);

    // Merge ngayNghiViec vào danh sách NV, lọc theo tháng
    // nvExtraRaw = null nghĩa là cột chưa tồn tại → fallback: chỉ hiện active
    const nvExtra = nvExtraRaw ?? [];
    const nghiColExists = nvExtraRaw !== null;
    const nghiMap = Object.fromEntries(nvExtra.map(r => [r.id, r.ngayNghiViec ?? null]));
    const nhanViens = nvPrisma
      .map(nv => ({ ...nv, ngayNghiViec: nghiMap[nv.id] ?? null }))
      .filter(nv => {
        if (nv.active) return true; // đang làm → luôn hiện
        if (!nghiColExists) return false; // cột chưa có → ẩn NV inactive (an toàn)
        if (!monthStart) return false;
        // Đã nghỉ: chỉ hiện nếu nghỉ SAU ngày đầu tháng đang xem
        return nv.ngayNghiViec != null && nv.ngayNghiViec >= monthStart;
      });

    // Chuyển phuCap thành map { [nvId]: {...} }
    const phuCapMap: Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number }> = {};
    for (const r of phuCapRows) {
      phuCapMap[r.nhanVienId] = { phuCapCC: r.phuCapCC, phuCapAn: r.phuCapAn, phuCapDB: r.phuCapDB };
    }

    return NextResponse.json({ nhanViens, chamCongs: ccRows, phuCaps: phuCapMap });
  } catch (e) {
    console.error("GET /api/cham-cong/load error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
