export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.giaCongLoai.findMany({ orderBy: [{ nhomXuong: "asc" }, { thuTu: "asc" }] });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = await prisma.giaCongLoai.count({ where: { nhomXuong: body.nhomXuong } });
  const row = await prisma.giaCongLoai.create({
    data: {
      nhomXuong: body.nhomXuong,
      ma: body.ma,
      chiPhi: body.chiPhi ?? {},
      thuTu: count,
    },
  });
  return NextResponse.json(row, { status: 201 });
}
