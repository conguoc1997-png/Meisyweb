import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sanPhams = await prisma.sanPham.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sanPhams);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sp = await prisma.sanPham.create({
      data: {
        ten: body.ten,
        sku: body.sku,
        mauSac: body.mauSac || null,
        size: body.size || null,
        giaNhap: Number(body.giaNhap) || 0,
        giaBan: Number(body.giaBan) || 0,
        tonKho: Number(body.tonKho) || 0,
        nguon: body.nguon || null,
      },
    });
    return NextResponse.json(sp, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
