export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: lấy toàn bộ fake kho, sort mới nhất trước
export async function GET() {
  try {
    const data = await prisma.fakeKho.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

// POST: tạo record mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, tenSanPham, sanPhamId, size, ngayNhap, soLuongNhap, ngayRaHang, soLuongRa, ghiChu } = body;

    if (!sku || !ngayNhap || !soLuongNhap) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const record = await prisma.fakeKho.create({
      data: {
        sku,
        tenSanPham: tenSanPham || null,
        sanPhamId:  sanPhamId  || null,
        size:        size       || null,
        ngayNhap:   new Date(ngayNhap),
        soLuongNhap: Number(soLuongNhap) || 0,
        ngayRaHang:  ngayRaHang ? new Date(ngayRaHang) : null,
        soLuongRa:   Number(soLuongRa) || 0,
        ghiChu:      ghiChu || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
