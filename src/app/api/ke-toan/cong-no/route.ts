export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const nhaCC = req.nextUrl.searchParams.get("nhaCC");
  try {
    const records = await prisma.congNo.findMany({
      where: nhaCC ? { nhaCC } : undefined,
      orderBy: [{ ngay: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(records);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nhaCC || !body.ngay || !body.dienGiai || !body.loai || !body.soTien) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }
    const record = await prisma.congNo.create({
      data: {
        nhaCC:      body.nhaCC,
        ngay:       new Date(body.ngay),
        soChungTu:  body.soChungTu || null,
        dienGiai:   body.dienGiai,
        loai:       body.loai,
        soTien:     Number(body.soTien),
        ghiChu:     body.ghiChu || null,
        nguoiTao:   body.nguoiTao || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
