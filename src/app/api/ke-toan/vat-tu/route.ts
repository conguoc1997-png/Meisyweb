export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loai = searchParams.get("loai");
    const nhom = searchParams.get("nhom");
    const active = searchParams.get("active");

    const items = await prisma.vatTu.findMany({
      where: {
        ...(loai && { loai }),
        ...(nhom && { nhom }),
        ...(active !== null && { active: active !== "false" }),
      },
      include: { tonKho: true },
      orderBy: [{ loai: "asc" }, { nhom: "asc" }, { ten: "asc" }],
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    console.error("[vat-tu GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.vatTu.create({
      data: {
        ma:       body.ma,
        ten:      body.ten,
        loai:     body.loai,
        nhom:     body.nhom     || null,
        donVi:    body.donVi    || "m",
        donViMua: body.donViMua || body.donVi || "m",
        quyDoi:   body.quyDoi   ?? 1,
        ghiChu:   body.ghiChu   || null,
        active:   body.active !== false,
      },
      include: { tonKho: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
