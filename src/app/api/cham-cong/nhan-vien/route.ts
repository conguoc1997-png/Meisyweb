import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const list = await prisma.nhanVien.findMany({
    orderBy: { ten: "asc" },
  });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { maNV, ten, chucVu, phongBan, luongCB } = data;
  if (!maNV || !ten) return NextResponse.json({ error: "Thiếu mã NV hoặc tên" }, { status: 400 });

  const existing = await prisma.nhanVien.findUnique({ where: { maNV } });
  if (existing) return NextResponse.json({ error: "Mã NV đã tồn tại" }, { status: 400 });

  const { ngaySinh } = data;
  const nv = await prisma.nhanVien.create({
    data: {
      maNV, ten,
      chucVu:   chucVu   || null,
      phongBan: phongBan || null,
      luongCB:  luongCB  ? Number(luongCB) : null,
      ngaySinh: ngaySinh ? new Date(ngaySinh) : null,
    },
  });
  return NextResponse.json(nv);
}
