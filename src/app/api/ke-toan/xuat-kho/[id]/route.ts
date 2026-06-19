export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Hủy phiếu: đánh dấu da_huy + hoàn tồn kho
    if (body.trangThai === "da_huy") {
      const phieu = await prisma.phieuXuatKho.findUnique({
        where: { id },
        include: { chiTiet: true },
      });
      if (!phieu) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
      if ((phieu as { trangThai?: string }).trangThai === "da_huy")
        return NextResponse.json({ error: "Phiếu đã hủy trước đó" }, { status: 400 });

      const vatTuIds = [...new Set(phieu.chiTiet.map(c => c.vatTuId))];

      // Đánh dấu hủy
      await prisma.phieuXuatKho.update({
        where: { id },
        data: {
          trangThai: "da_huy",
          lyHuy: body.lyHuy || "Hủy phiếu",
          ngayHuy: new Date(),
          nguoiHuy: body.nguoiHuy || null,
        } as Record<string, unknown>,
      });

      // Recalc lại tồn kho (hoàn ngược xuất)
      if (vatTuIds.length > 0) await recalcVatTuIds(vatTuIds);

      return NextResponse.json({ ok: true, message: "Đã hủy phiếu và hoàn tồn kho" });
    }

    return NextResponse.json({ error: "Không hỗ trợ thao tác này" }, { status: 400 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

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
  // quyDoi mới nhất per vatTuId (lấy từ nhập mới nhất theo ngày)
  const quyDoiInfos = await prisma.chiTietNhapKho.findMany({
    where:    { vatTuId: { in: vatTuIds } },
    select:   { vatTuId: true, quyDoi: true },
    orderBy:  { phieu: { ngay: "desc" } },
    distinct: ["vatTuId"],
  });
  const quyDoiMap = new Map(quyDoiInfos.map(r => [r.vatTuId, r.quyDoi ?? 1]));

  const nhapInfos = await prisma.chiTietNhapKho.findMany({
    where:  { vatTuId: { in: vatTuIds } },
    select: { vatTuId: true, soLuongMua: true, donGia: true, vat: true },
  });
  const xuatInfos = await prisma.phieuXuatChiTiet.findMany({
    where:  {
      vatTuId: { in: vatTuIds },
      phieu: { trangThai: { not: "da_huy" } }, // bỏ qua phiếu đã hủy
    },
    select: { vatTuId: true, soLuong: true },
  });

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

  await Promise.all([...map.entries()].map(([vatTuId, d]) => {
    const quyDoi       = quyDoiMap.get(vatTuId) ?? 1;
    const soLuong      = Math.max(0, d.soLuongNhap - d.soLuongXuatBase / quyDoi);
    const giaTrungBinh = d.soLuongNhap > 0 ? d.giaTriNhap / d.soLuongNhap : 0;
    const giaTriTon    = soLuong * giaTrungBinh;
    return prisma.tonKhoVatTu.upsert({
      where:  { vatTuId },
      update: { soLuong, giaTrungBinh, giaTriTon },
      create: { vatTuId, soLuong, giaTrungBinh, giaTriTon },
    });
  }));
}
