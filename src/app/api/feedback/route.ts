export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.feedback.findMany({
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
    if (!body.loai || !body.noiDung?.trim()) {
      return NextResponse.json({ error: "Thiếu loại hoặc nội dung" }, { status: 400 });
    }
    const record = await prisma.feedback.create({
      data: {
        tenKhach:     body.tenKhach     || null,
        sdtKhach:     body.sdtKhach     || null,
        sku:          body.sku          || null,
        kenh:         body.kenh         || "khac",
        loai:         body.loai,
        noiDung:      body.noiDung.trim(),
        danhGia:      body.danhGia      ? Number(body.danhGia) : null,
        nguoiGhiNhan: body.nguoiGhiNhan || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
