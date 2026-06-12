export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loCatId = searchParams.get("loCatId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const phieus = await prisma.phieuXuatKho.findMany({
      where: {
        ...(loCatId && { loCatId }),
        ...(from || to ? {
          ngay: {
            ...(from && { gte: new Date(from) }),
            ...(to && { lte: new Date(to + "T23:59:59") }),
          }
        } : {}),
      },
      include: { chiTiet: { include: { vatTu: true } } },
      orderBy: { ngay: "desc" },
    });
    return NextResponse.json(phieus);
  } catch (e: unknown) {
    console.error("[xuat-kho GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // body: { soPhieu, loCatId?, hangCat?, soSanPham, ngay, lyDo?, ghiChu?, nguoiTao?,
    //         chiTiet: [{vatTuId, soLuong, donGia, ghiChu?}] }

    type RowIn = { vatTuId: string; soLuong: number; donGia: number; ghiChu?: string };

    const phieu = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu xuất
      const p = await tx.phieuXuatKho.create({
        data: {
          soPhieu: body.soPhieu,
          loCatId: body.loCatId || null,
          hangCat: body.hangCat || null,
          soSanPham: body.soSanPham || 0,
          ngay: new Date(body.ngay),
          lyDo: body.lyDo || "san_xuat",
          ghiChu: body.ghiChu || null,
          nguoiTao: body.nguoiTao || null,
          chiTiet: {
            create: (body.chiTiet as RowIn[]).map(r => ({
              vatTuId: r.vatTuId,
              soLuong: r.soLuong,
              donGia: r.donGia,
              thanhTien: r.soLuong * r.donGia,
              ghiChu: r.ghiChu || null,
            })),
          },
        },
        include: { chiTiet: { include: { vatTu: true } } },
      });

      // 2. Trừ tồn kho — soLuong lưu theo đơn vị cơ bản, quyDoi để convert ra đvMua
      for (const r of body.chiTiet as RowIn[]) {
        const ton = await tx.tonKhoVatTu.findUnique({ where: { vatTuId: r.vatTuId } });
        if (ton) {
          // Lấy quyDoi từ lần nhập gần nhất
          const nhap = await tx.chiTietNhapKho.findFirst({
            where: { vatTuId: r.vatTuId },
            orderBy: { id: "desc" },
            select: { quyDoi: true },
          });
          const quyDoi = nhap?.quyDoi ?? 1;
          // soLuong (đvCơBản) / quyDoi = đvMua để trừ tồn
          const newSL = Math.max(0, ton.soLuong - r.soLuong / quyDoi);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
          });
        }
      }

      return p;
    });

    return NextResponse.json(phieu, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
