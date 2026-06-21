import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/so-thu-chi/tai-khoan — lấy số dư 2 hộ
export async function GET() {
  try {
    const taiKhoans = await prisma.taiKhoanQuy.findMany();
    return NextResponse.json(taiKhoans);
  } catch (e) {
    console.error("GET /api/so-thu-chi/tai-khoan error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/so-thu-chi/tai-khoan — upsert số dư đầu kỳ
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { ho, tenHo, soDuDauKy, thang } = data;

    if (!ho) return NextResponse.json({ error: "Thiếu ho" }, { status: 400 });

    const updatePayload: Record<string, unknown> = {};
    if (soDuDauKy !== undefined) updatePayload.soDuDauKy = Number(soDuDauKy);
    if (thang)  updatePayload.thang  = thang;
    if (tenHo)  updatePayload.tenHo  = tenHo;
    // Chốt tháng
    if (data.daChot !== undefined) updatePayload.daChot = data.daChot;
    if (data.ngayChot !== undefined) updatePayload.ngayChot = data.ngayChot ? new Date(data.ngayChot) : null;

    const taiKhoan = await prisma.taiKhoanQuy.upsert({
      where: { ho },
      update: updatePayload,
      create: {
        ho,
        tenHo:     tenHo     || ho,
        soDuDauKy: soDuDauKy ? Number(soDuDauKy) : 0,
        thang:     thang     || "2026-06",
      },
    });

    return NextResponse.json(taiKhoan);
  } catch (e) {
    console.error("PUT /api/so-thu-chi/tai-khoan error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
