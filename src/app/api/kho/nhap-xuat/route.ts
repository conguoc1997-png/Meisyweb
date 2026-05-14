import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.nhapXuatKho.findMany({
      include: { sanPham: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const soLuong = Number(body.soLuong);
    const loai = body.loai; // "nhap" | "xuat"

    const record = await prisma.$transaction(async (tx) => {
      const sp = await tx.sanPham.findUnique({ where: { id: body.sanPhamId } });
      if (!sp) throw new Error("Không tìm thấy sản phẩm");

      if (loai === "xuat" && sp.tonKho < soLuong) {
        throw new Error("Tồn kho không đủ");
      }

      const delta = loai === "nhap" ? soLuong : -soLuong;
      await tx.sanPham.update({
        where: { id: body.sanPhamId },
        data: { tonKho: { increment: delta } },
      });

      return tx.nhapXuatKho.create({
        data: {
          sanPhamId: body.sanPhamId,
          loai,
          soLuong,
          ghiChu: body.ghiChu || null,
          nguoiTao: body.nguoiTao || null,
        },
        include: { sanPham: true },
      });
    });

    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
