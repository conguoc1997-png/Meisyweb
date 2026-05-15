export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    // cayData có thể là array (với extra fields như cut:true) hoặc undefined
    const cays: Record<string, unknown>[] | undefined = Array.isArray(b.cayData) ? b.cayData : undefined;
    const soMet = cays
      ? cays.reduce((s, c) => s + (Number(c.soMet) || 0), 0)
      : b.soMet !== undefined ? Number(b.soMet) : undefined;
    const row = await prisma.vaiTon.update({
      where: { id },
      data: {
        ...(b.maVai !== undefined && { maVai: b.maVai }),
        ...(soMet !== undefined && { soMet }),
        ...(cays !== undefined && { soCay: cays.length, cayData: JSON.stringify(cays) }),
        ...(b.donVi !== undefined && { donVi: b.donVi }),
        ...(b.mauSac !== undefined && { mauSac: b.mauSac || null }),
        ...(b.xuong !== undefined && { xuong: b.xuong || null }),
        ...(b.ghiChu !== undefined && { ghiChu: b.ghiChu || null }),
      },
    });
    return NextResponse.json(row);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.vaiTon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
