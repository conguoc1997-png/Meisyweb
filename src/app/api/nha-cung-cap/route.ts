export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.nhaCungCap.findMany({
      where: { active: true },
      orderBy: { ten: "asc" },
    });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ten, sdt, ghiChu } = await req.json();
    if (!ten?.trim()) return NextResponse.json({ error: "Thiếu tên NCC" }, { status: 400 });

    // Tạo mã tự động từ tên
    const ma = ten.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) + Date.now().toString().slice(-4);

    const record = await prisma.nhaCungCap.create({
      data: { ma, ten: ten.trim(), sdt: sdt || null, ghiChu: ghiChu || null },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
