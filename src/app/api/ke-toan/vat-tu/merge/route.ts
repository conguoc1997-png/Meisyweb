export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/ke-toan/vat-tu/merge
 * Body: { masterId: string, duplicateIds: string[] }
 * - Chuyển toàn bộ ChiTietNhapKho, PhieuXuatChiTiet, DinhMucNPL từ duplicate → master
 * - Cộng gộp TonKhoVatTu (soLuong, giaTriTon)
 * - Xoá TonKhoVatTu + VatTu của duplicate
 */
export async function POST(req: NextRequest) {
  try {
    const { masterId, duplicateIds }: { masterId: string; duplicateIds: string[] } = await req.json();
    if (!masterId || !duplicateIds?.length) {
      return NextResponse.json({ error: "Thiếu masterId hoặc duplicateIds" }, { status: 400 });
    }

    for (const dupId of duplicateIds) {
      if (dupId === masterId) continue;

      await prisma.$transaction(async (tx) => {
        // 1. Chuyển ChiTietNhapKho
        await tx.chiTietNhapKho.updateMany({ where: { vatTuId: dupId }, data: { vatTuId: masterId } });

        // 2. Chuyển PhieuXuatChiTiet
        await tx.phieuXuatChiTiet.updateMany({ where: { vatTuId: dupId }, data: { vatTuId: masterId } });

        // 3. Chuyển DinhMucNPL (bỏ qua nếu master đã có cùng hangCat để tránh unique conflict)
        const dmDup    = await tx.dinhMucNPL.findMany({ where: { vatTuId: dupId } });
        const dmMaster = await tx.dinhMucNPL.findMany({ where: { vatTuId: masterId } });
        const masterHangCats = new Set(dmMaster.map(d => d.hangCat));
        for (const dm of dmDup) {
          if (!masterHangCats.has(dm.hangCat)) {
            await tx.dinhMucNPL.update({ where: { id: dm.id }, data: { vatTuId: masterId } });
          } else {
            await tx.dinhMucNPL.delete({ where: { id: dm.id } });
          }
        }

        // 4. Gộp TonKhoVatTu
        const tonDup    = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: dupId } });
        const tonMaster = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: masterId } });
        if (tonDup) {
          if (tonMaster) {
            const newSL = tonMaster.soLuong + tonDup.soLuong;
            const newGT = tonMaster.giaTriTon + tonDup.giaTriTon;
            await tx.tonKhoVatTu.update({
              where: { vatTuId: masterId },
              data: {
                soLuong:      newSL,
                giaTriTon:    newGT,
                giaTrungBinh: newSL > 0 ? newGT / newSL : tonMaster.giaTrungBinh,
              },
            });
          } else {
            await tx.tonKhoVatTu.update({ where: { vatTuId: dupId }, data: { vatTuId: masterId } });
          }
          // Xoá tonKho duplicate (nếu còn)
          const remaining = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: dupId } });
          if (remaining) await tx.tonKhoVatTu.delete({ where: { vatTuId: dupId } });
        }

        // 5. Xoá VatTu duplicate
        await tx.vatTu.delete({ where: { id: dupId } });
      }, { maxWait: 15000, timeout: 30000 });
    }

    const master = await prisma.vatTu.findUnique({ where: { id: masterId }, include: { tonKho: true } });
    return NextResponse.json({ ok: true, master });
  } catch (e: unknown) {
    console.error("[vat-tu merge]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
