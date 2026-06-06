export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const n = (v: unknown) => (v !== "" && v != null ? Number(v) : null);
const ni = (v: unknown) => (v !== "" && v != null ? Math.round(Number(v)) : null);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    const lo = await prisma.loCat.update({
      where: { id },
      data: {
        ...(b.ngay !== undefined && { ngay: new Date(b.ngay) }),
        ...(b.hangCat !== undefined && { hangCat: b.hangCat }),
        ...(b.soSize !== undefined && { soSize: b.soSize || null }),
        ...(b.maVai !== undefined && { maVai: b.maVai || null }),
        ...(b.soMSoDo !== undefined && { soMSoDo: n(b.soMSoDo) }),
        ...(b.soCay !== undefined && { soCay: b.soCay ? Math.round(Number(b.soCay)) : 1 }),
        ...(b.cayData !== undefined && { cayData: b.cayData || null }),
        ...(b.soY !== undefined && { soY: n(b.soY) }),
        ...(b.soM !== undefined && { soM: n(b.soM) }),
        ...(b.tongSize !== undefined && { tongSize: ni(b.tongSize) }),
        ...(b.soLa !== undefined && { soLa: n(b.soLa) }),
        ...(b.soLaThucTe !== undefined && { soLaThucTe: ni(b.soLaThucTe) }),
        ...(b.soSanPham !== undefined && { soSanPham: ni(b.soSanPham) }),
        ...(b.hangThucTe !== undefined && { hangThucTe: ni(b.hangThucTe) }),
        ...(b.ngayNhanHang !== undefined && { ngayNhanHang: b.ngayNhanHang ? new Date(b.ngayNhanHang) : null }),
        ...(b.soLuongThieu !== undefined && { soLuongThieu: ni(b.soLuongThieu) }),
        ...(b.xuongNhanHang !== undefined && { xuongNhanHang: b.xuongNhanHang || null }),
        ...(b.loaiHang !== undefined && { loaiHang: b.loaiHang || null }),
        ...(b.trangThai !== undefined && { trangThai: b.trangThai }),
        ...(b.xuong !== undefined && { xuong: b.xuong }),
        ...(b.hdMay !== undefined && { hdMay: ni(b.hdMay) }),
        ...(b.tonTruocMay !== undefined && { tonTruocMay: n(b.tonTruocMay) }),
        ...(b.hdMayDa !== undefined && { hdMayDa: Boolean(b.hdMayDa) }),
        ...(b.coGiat !== undefined && { coGiat: b.coGiat || null }),
        ...(b.hdGiatViSinh !== undefined && { hdGiatViSinh: ni(b.hdGiatViSinh) }),
        ...(b.tonTruocGiatViSinh !== undefined && { tonTruocGiatViSinh: n(b.tonTruocGiatViSinh) }),
        ...(b.hdGiatViSinhDa !== undefined && { hdGiatViSinhDa: Boolean(b.hdGiatViSinhDa) }),
        ...(b.hdGiatMau !== undefined && { hdGiatMau: ni(b.hdGiatMau) }),
        ...(b.tonTruocGiatMau !== undefined && { tonTruocGiatMau: n(b.tonTruocGiatMau) }),
        ...(b.hdGiatMauDa !== undefined && { hdGiatMauDa: Boolean(b.hdGiatMauDa) }),
        ...(b.daCat !== undefined && { daCat: Boolean(b.daCat) }),
        ...(b.ghiChuMay !== undefined && { ghiChuMay: b.ghiChuMay || null }),
        ...(b.mauGiat !== undefined && { mauGiat: b.mauGiat || null }),
        ...(b.ghiChu !== undefined && { ghiChu: b.ghiChu || null }),
      },
    });
    return NextResponse.json(lo);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Hoàn tác cây vải về kho VaiTon trước khi xoá lô
    const vaiTons = await prisma.vaiTon.findMany();
    for (const vai of vaiTons) {
      if (!vai.cayData) continue;
      let cays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = [];
      try { cays = JSON.parse(vai.cayData); } catch { continue; }

      const hasLinked = cays.some(c => c.lotId === id);
      if (!hasLinked) continue;

      // Khôi phục soMet cho cây liên quan đến lô này
      const restored = cays.map(c => {
        if (c.lotId !== id) return c;
        const { cut: _c, lotId: _l, lotCayIdx: _lci, soMetUsed, ...rest } = c;
        void _c; void _l; void _lci;
        return { ...rest, soMet: c.soMet + (soMetUsed ?? 0) };
      });

      const allUncut = restored.every(c => !(c as { cut?: boolean }).cut);
      const newSoMet = restored.reduce((s, c) => s + (c.soMet ?? 0), 0);

      if (allUncut && newSoMet <= 0) {
        // Không còn vải → xoá record vải
        await prisma.vaiTon.delete({ where: { id: vai.id } });
      } else {
        await prisma.vaiTon.update({
          where: { id: vai.id },
          data: { cayData: JSON.stringify(restored), soMet: newSoMet, soCay: restored.length },
        });
      }
    }

    await prisma.loCat.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
