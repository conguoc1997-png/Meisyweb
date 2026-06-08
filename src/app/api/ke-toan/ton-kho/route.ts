export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loai = searchParams.get("loai");
    const nhom = searchParams.get("nhom");

    const [items, chiTiets, quyDoiDonVis] = await Promise.all([
      prisma.tonKhoVatTu.findMany({
        where: {
          vatTu: {
            active: true,
            ...(loai && { loai }),
            ...(nhom && { nhom }),
          },
        },
        include: { vatTu: true },
        orderBy: [
          { vatTu: { loai: "asc" } },
          { vatTu: { nhom: "asc" } },
          { vatTu: { ten: "asc" } },
        ],
      }),
      // Lấy donViMua, quyDoi, donViQuyDoi mới nhất từ lịch sử nhập kho
      prisma.chiTietNhapKho.findMany({
        select: { vatTuId: true, donViMua: true, quyDoi: true, donViQuyDoi: true },
        orderBy: { phieu: { ngay: "desc" } },
        distinct: ["vatTuId"],
      }),
      // Bảng quy đổi đơn vị (fallback khi donViQuyDoi chưa được nhập)
      prisma.quyDoiDonVi.findMany({
        select: { tuDonVi: true, veDonVi: true },
      }),
    ]);

    // Map donViMua → veDonVi từ bảng QuyDoiDonVi
    const quyDoiDVMap = new Map(quyDoiDonVis.map(q => [q.tuDonVi, q.veDonVi]));

    // Map vatTuId → { donViMua, quyDoi, donViQuyDoi }
    const nhapMap = new Map(chiTiets.map(c => [c.vatTuId, {
      donViMua:    c.donViMua,
      quyDoi:      c.quyDoi,
      // Ưu tiên: (1) donViQuyDoi đã lưu trong DB, (2) lookup từ QuyDoiDonVi, (3) null
      donViQuyDoi: (c.donViQuyDoi && c.donViQuyDoi !== c.donViMua)
        ? c.donViQuyDoi
        : (quyDoiDVMap.get(c.donViMua) ?? null),
    }]));

    const result = items.map(t => {
      const info = nhapMap.get(t.vatTuId);
      const donViMua    = info?.donViMua    ?? t.vatTu.donVi;
      const quyDoi      = info?.quyDoi      ?? 1;
      // Fallback cuối: nếu vatTu là vải → "m", ngược lại → vatTu.donVi
      const donViQuyDoi = info?.donViQuyDoi
        ?? (t.vatTu.loai === "vai" ? "m" : t.vatTu.donVi);
      return {
        ...t,
        donViMua,
        quyDoi,
        donViQuyDoi,
        soLuongQD: t.soLuong * quyDoi,
      };
    });

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("[ton-kho GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}
