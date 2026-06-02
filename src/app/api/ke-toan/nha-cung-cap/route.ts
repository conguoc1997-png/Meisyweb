export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.nhaCungCap.findMany({
      where: { active: true },
      orderBy: { ten: "asc" },
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    console.error("[nha-cung-cap GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.nhaCungCap.create({
      data: {
        ma: body.ma,
        ten: body.ten,
        sdt: body.sdt || null,
        diaChi: body.diaChi || null,
        email: body.email || null,
        ghiChu: body.ghiChu || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
