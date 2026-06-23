export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ho = searchParams.get("ho");
    const thang = searchParams.get("thang");
    const trangThai = searchParams.get("trangThai");

    const records = await prisma.congNoKhachHang.findMany({
      where: {
        ...(ho && { ho }),
        ...(thang && { thang }),
        ...(trangThai && trangThai !== "all" && { trangThai }),
      },
      include: { doanhThu: true },
      orderBy: { ngay: "desc" },
    });
    return NextResponse.json(records);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ho, ngay, tenKhachHang, soTien, doanhThuId, ghiChu, nguoiTao } = body;

    const thang = (ngay as string).slice(0, 7);
    const st = parseFloat(soTien) || 0;

    const record = await prisma.congNoKhachHang.create({
      data: {
        ho,
        ngay: new Date(ngay),
        thang,
        tenKhachHang,
        doanhThuId: doanhThuId || null,
        soTien: st,
        daTra: 0,
        conLai: st,
        trangThai: "con_no",
        ghiChu: ghiChu || null,
        nguoiTao: nguoiTao || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
