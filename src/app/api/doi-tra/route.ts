export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genMaDoiTra } from "@/lib/utils";

export async function GET() {
  try {
    const records = await prisma.doiTra.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Tự động tính phí ship
    let phiShip = Number(body.phiShip) || 0;
    if (body.loaiVanDe === "doi_size" && !body.phiShipThuCong) {
      phiShip = 30000;
    }

    const record = await prisma.doiTra.create({
      data: {
        maDoiTra:      genMaDoiTra(),
        sdtThangTruoc: body.sdtThangTruoc || null,
        sdtHienTai:    body.sdtHienTai    || null,
        tenKhach:      body.tenKhach,
        diaChi:        body.diaChi        || null,
        skuHienTai:    body.skuHienTai    || null,
        skuDoiSang:    body.skuDoiSang    || null,
        giaTriHang:    Number(body.giaTriHang) || 0,
        loaiVanDe:     body.loaiVanDe,
        ghiChu:        body.ghiChu        || null,
        phiShip,
        soChieuShip:   Number(body.soChieuShip) || 2,
        nguon:         body.nguon         || null,
        maVanDon:      body.maVanDon      || null,
        trangThai:     "cho_xu_ly",
        nguoiXuLy:     body.nguoiXuLy     || null,
        nguon:         body.nguon         || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
