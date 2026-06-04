export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const item = await prisma.nhaCungCap.update({
      where: { id },
      data: {
        ...(body.ma     !== undefined && { ma: body.ma }),
        ...(body.ten    !== undefined && { ten: body.ten }),
        ...(body.sdt    !== undefined && { sdt: body.sdt || null }),
        ...(body.diaChi !== undefined && { diaChi: body.diaChi || null }),
        ...(body.email  !== undefined && { email: body.email || null }),
        ...(body.ghiChu !== undefined && { ghiChu: body.ghiChu || null }),
        ...(body.active !== undefined && { active: body.active }),
      },
    });
    return NextResponse.json(item);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.nhaCungCap.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
