import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const nv = await prisma.nhanVien.update({
    where: { id },
    data: {
      ten:      data.ten      ?? undefined,
      chucVu:   data.chucVu   !== undefined ? (data.chucVu   || null) : undefined,
      phongBan: data.phongBan !== undefined ? (data.phongBan || null) : undefined,
      loaiLuong: data.loaiLuong !== undefined ? (data.loaiLuong || "co_ban") : undefined,
      luongCB:   data.luongCB  !== undefined ? (data.luongCB ? Number(data.luongCB) : null) : undefined,
      phuCapChuyenCan: data.phuCapChuyenCan !== undefined ? (data.phuCapChuyenCan ? Number(data.phuCapChuyenCan) : null) : undefined,
      phuCapAn:        data.phuCapAn        !== undefined ? (data.phuCapAn        ? Number(data.phuCapAn)        : null) : undefined,
      phuCapDacBiet:   data.phuCapDacBiet   !== undefined ? (data.phuCapDacBiet   ? Number(data.phuCapDacBiet)   : null) : undefined,
      heSoTC:   data.heSoTC   !== undefined ? Number(data.heSoTC) : undefined,
      ngaySinh: data.ngaySinh !== undefined ? (data.ngaySinh ? new Date(data.ngaySinh) : null) : undefined,
      active:       data.active       !== undefined ? data.active : undefined,
    },
  });
  return NextResponse.json(nv);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Soft delete — giữ lịch sử chấm công
  await prisma.nhanVien.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
