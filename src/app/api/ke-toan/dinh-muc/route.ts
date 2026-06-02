export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hangCat = searchParams.get("hangCat");
    const items = await prisma.dinhMucNPL.findMany({
      where: hangCat ? { hangCat } : undefined,
      include: { vatTu: { include: { tonKho: true } } },
      orderBy: [{ hangCat: "asc" }, { vatTu: { ten: "asc" } }],
    });
    return NextResponse.json(items);
  } catch (e: unknown) {
    console.error("[dinh-muc GET]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const item = await prisma.dinhMucNPL.create({
      data: {
        hangCat:  body.hangCat,
        vatTuId:  body.vatTuId,
        soLuong:  body.soLuong,
        donViMua: body.donViMua ?? "m",
        quyDoi:   body.quyDoi   ?? 1,
        ghiChu:   body.ghiChu   || null,
      },
      include: { vatTu: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    console.error("[dinh-muc POST]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Lỗi server" },
      { status: 500 }
    );
  }
}
