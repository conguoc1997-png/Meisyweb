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
    const chiTiet = body.chiTiet as RowIn[];
    const vatTuIds = [...new Set(chiTiet.map(r => r.vatTuId))];

    // Pre-fetch tồn kho và quyDoi TRƯỚC transaction để tránh timeout
    const [tonRows, nhapRows] = await Promise.all([
      prisma.tonKhoVatTu.findMany({ where: { vatTuId: { in: vatTuIds } } }),
      prisma.chiTietNhapKho.findMany({
        where: { vatTuId: { in: vatTuIds } },
        orderBy: { id: "desc" },
        distinct: ["vatTuId"],
        select: { vatTuId: true, quyDoi: true },
      }),
    ]);
    const tonMap    = new Map(tonRows.map(t => [t.vatTuId, t]));
    const quyDoiMap = new Map(nhapRows.map(n => [n.vatTuId, n.quyDoi ?? 1]));

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
            create: chiTiet.map(r => ({
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

      // 2. Trừ tồn kho — dùng data đã pre-fetch, chỉ update bên trong transaction
      for (const r of chiTiet) {
        const ton    = tonMap.get(r.vatTuId);
        const quyDoi = quyDoiMap.get(r.vatTuId) ?? 1;
        if (ton) {
          const newSL = Math.max(0, ton.soLuong - r.soLuong / quyDoi);
          await tx.tonKhoVatTu.update({
            where: { vatTuId: r.vatTuId },
            data: { soLuong: newSL, giaTriTon: newSL * ton.giaTrungBinh },
          });
        }
      }

      return p;
    }, { timeout: 20000 });

    return NextResponse.json(phieu, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
