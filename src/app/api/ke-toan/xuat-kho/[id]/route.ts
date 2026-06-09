export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const phieu = await prisma.phieuXuatKho.findUnique({
    where: { id },
    include: { chiTiet: { include: { vatTu: true } } },
  });
  if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(phieu);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const phieu = await prisma.phieuXuatKho.findUnique({
      where: { id },
      include: { chiTiet: { select: { vatTuId: true } } },
    });
    if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

    const vatTuIds = [...new Set(phieu.chiTiet.map(c => c.vatTuId))];

    // 1. Xóa phiếu (cascade chiTiet) — không dùng interactive transaction
    await prisma.phieuXuatKho.delete({ where: { id } });

    // 2. Reset xuatHoaDonDa nếu phiếu gắn với lô cắt
    if (phieu.loCatId) {
      await prisma.loCat.update({
        where: { id: phieu.loCatId },
        data:  { xuatHoaDonDa: false },
      }).catch(() => {});
    }

    // 3. Recalc tồn kho đúng: nhap(đvMua) − xuat(đvCơBản)/quyDoi
    if (vatTuIds.length > 0) {
      await recalcVatTuIds(vatTuIds);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

async function recalcVatTuIds(vatTuIds: string[]) {
  const nhapInfos = await prisma.chiTietNhapKho.findMany({
    where:  { vatTuId: { in: vatTuIds } },
    select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true, quyDoi: true },
  });
  const xuatInfos = await prisma.phieuXuatChiTiet.findMany({
    where:  { vatTuId: { in: vatTuIds } },
    select: { vatTuId: true, soLuong: true },
  });

  const quyDoiMap = new Map<string, number>();
  for (const r of nhapInfos) {
    if (!quyDoiMap.has(r.vatTuId)) quyDoiMap.set(r.vatTuId, r.quyDoi ?? 1);
  }

  type TonInfo = { soLuongNhap: number; giaTriNhap: number; soLuongXuatBase: number };
  const map = new Map<string, TonInfo>();
  for (const r of nhapInfos) {
    const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
    cur.soLuongNhap += r.soLuongMua;
    cur.giaTriNhap  += r.soLuongMua * r.donGia * (1 + (r.vat || 0) / 100);
    map.set(r.vatTuId, cur);
  }
  for (const r of xuatInfos) {
    const cur = map.get(r.vatTuId) ?? { soLuongNhap: 0, giaTriNhap: 0, soLuongXuatBase: 0 };
    cur.soLuongXuatBase += r.soLuong;
    map.set(r.vatTuId, cur);
  }

  for (const [vatTuId, d] of map.entries()) {
    const quyDoi       = quyDoiMap.get(vatTuId) ?? 1;
    const soLuong      = Math.max(0, d.soLuongNhap - d.soLuongXuatBase / quyDoi);
    const giaTrungBinh = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
    await prisma.tonKhoVatTu.upsert({
      where:  { vatTuId },
      update: { soLuong, giaTrungBinh, giaTriTon: soLuong * giaTrungBinh },
      create: { vatTuId, soLuong, giaTrungBinh, giaTriTon: soLuong * giaTrungBinh },
    });
  }
}
