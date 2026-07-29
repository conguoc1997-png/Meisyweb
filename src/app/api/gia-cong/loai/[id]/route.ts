export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const row = await prisma.giaCongLoai.update({
    where: { id },
    data: {
      ...(body.nhomXuong !== undefined ? { nhomXuong: body.nhomXuong } : {}),
      ...(body.ma        !== undefined ? { ma: body.ma } : {}),
      ...(body.chiPhi    !== undefined ? { chiPhi: body.chiPhi } : {}),
      ...(body.thuTu     !== undefined ? { thuTu: body.thuTu } : {}),
    },
  });
  return NextResponse.json(row);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.giaCongLoai.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
