export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const item = await prisma.quyDoiDonVi.update({
      where: { id },
      data: {
        ...(body.tuDonVi !== undefined && { tuDonVi: body.tuDonVi }),
        ...(body.veDonVi !== undefined && { veDonVi: body.veDonVi }),
        ...(body.heSo    !== undefined && { heSo: body.heSo }),
        ...(body.ghiChu  !== undefined && { ghiChu: body.ghiChu || null }),
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
    await prisma.quyDoiDonVi.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
