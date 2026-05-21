export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.ungTien.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(records);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.soTien || !body.thang) {
      return NextResponse.json({ error: "Thiếu số tiền hoặc tháng" }, { status: 400 });
    }
    const record = await prisma.ungTien.create({
      data: {
        soTien: Number(body.soTien),
        thang:  body.thang,
        ghiChu: body.ghiChu || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
