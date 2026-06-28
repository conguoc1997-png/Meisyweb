export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-migrate: chạy 1 lần per cold-start
let migrated = false;
async function autoMigrate() {
  if (migrated) return;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "NhanVien" ADD COLUMN IF NOT EXISTS "soChNhatHopDong" INTEGER NOT NULL DEFAULT 0`
    );
  } catch { /* ignore — column already exists */ }
  migrated = true;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await autoMigrate();
  const { id } = await params;
  const data = await req.json();

  try {
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
        heSoTC:          data.heSoTC          !== undefined ? Number(data.heSoTC) : undefined,
        soChNhatHopDong: data.soChNhatHopDong !== undefined ? Number(data.soChNhatHopDong) : undefined,
        ngaySinh: data.ngaySinh !== undefined ? (data.ngaySinh ? new Date(data.ngaySinh) : null) : undefined,
        active:   data.active   !== undefined ? data.active : undefined,
      },
    });

    // Đổi Lương CB kèm tháng áp dụng → lưu lịch sử
    if (data.luongCB !== undefined && data.thangApDung) {
      await prisma.luongCBHistory.upsert({
        where: { nhanVienId_thangApDung: { nhanVienId: id, thangApDung: data.thangApDung } },
        update: { luongCB: Number(data.luongCB) || 0 },
        create: { nhanVienId: id, thangApDung: data.thangApDung, luongCB: Number(data.luongCB) || 0 },
      });
    }

    return NextResponse.json(nv);
  } catch (e: unknown) {
    console.error("[PATCH NhanVien]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi cập nhật" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.nhanVien.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
