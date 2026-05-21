export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.buTien.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(records);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.tenKhach || !body.loiBu) {
      return NextResponse.json({ error: "Thiếu tên khách hoặc lý do" }, { status: 400 });
    }
    const record = await prisma.buTien.create({
      data: {
        tenKhach:  body.tenKhach,
        sdtKhach:  body.sdtKhach  || null,
        loiBu:     body.loiBu,
        soTien:    Number(body.soTien) || 0,
        trangThai: body.trangThai || "cho_bu",
        ghiChu:    body.ghiChu    || null,
        nguoiXuLy: body.nguoiXuLy || null,
        nguon:     body.nguon     || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
