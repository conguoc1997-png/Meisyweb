export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.vaiTon.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const cays: { soMet: number }[] = Array.isArray(b.cayData) ? b.cayData : [];
    const soMet = cays.reduce((s, c) => s + (Number(c.soMet) || 0), 0);
    const row = await prisma.vaiTon.create({
      data: {
        maVai: b.maVai,
        soMet,
        soCay: cays.length || 1,
        cayData: cays.length > 0 ? JSON.stringify(cays) : null,
        donVi: b.donVi || "m",
        mauSac: b.mauSac || null,
        xuong: b.xuong || null,
        ghiChu: b.ghiChu || null,
      },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
