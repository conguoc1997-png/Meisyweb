export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const history = searchParams.get("history");

    // Return history for a specific type
    if (history) {
      const rows = await prisma.hoaDonTonHistory.findMany({
        where: { loaiHD: history },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json(rows);
    }

    // Return current balances
    const rows = await prisma.hoaDonTon.findMany();
    const result: Record<string, number> = {};
    rows.forEach(r => { result[r.id] = r.soTon; });
    return NextResponse.json({
      may: result["may"] ?? 0,
      giat_vi_sinh: result["giat_vi_sinh"] ?? 0,
      giat_mau: result["giat_mau"] ?? 0,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, soTon, ghiChu } = await req.json();

    // Get current value for history
    const current = await prisma.hoaDonTon.findUnique({ where: { id } });
    const soTonCu = current?.soTon ?? 0;

    // Update balance
    const row = await prisma.hoaDonTon.upsert({
      where: { id },
      update: { soTon: Number(soTon) },
      create: { id, soTon: Number(soTon) },
    });

    // Save history
    await prisma.hoaDonTonHistory.create({
      data: {
        loaiHD: id,
        soTonCu,
        soTonMoi: Number(soTon),
        ghiChu: ghiChu || null,
      },
    });

    return NextResponse.json(row);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
