export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — quét toàn bộ ChiTietNhapKho, gom các cặp (donViMua → donViQuyDoi, hệ số quyDoi)
// đã từng nhập, tự tạo vào bảng QuyDoiDonVi nếu chưa có (không ghi đè dòng đã tồn tại).
export async function POST() {
  try {
    const chiTiets = await prisma.chiTietNhapKho.findMany({
      where: { donViQuyDoi: { not: null } },
      select: { donViMua: true, donViQuyDoi: true, quyDoi: true, vatTu: { select: { ten: true } } },
    });

    // Gom theo key (donViMua|donViQuyDoi|heSo) — gom TẤT CẢ tên vật tư dùng chung hệ số này
    const map = new Map<string, { tuDonVi: string; veDonVi: string; heSo: number; vatTuTens: Set<string> }>();
    for (const c of chiTiets) {
      const tuDonVi = (c.donViMua || "").trim();
      const veDonVi = (c.donViQuyDoi || "").trim();
      if (!tuDonVi || !veDonVi || tuDonVi === veDonVi) continue;
      const key = `${tuDonVi}|${veDonVi}|${c.quyDoi}`;
      if (!map.has(key)) map.set(key, { tuDonVi, veDonVi, heSo: c.quyDoi, vatTuTens: new Set() });
      if (c.vatTu?.ten) map.get(key)!.vatTuTens.add(c.vatTu.ten);
    }

    const existing = await prisma.quyDoiDonVi.findMany({ select: { tuDonVi: true, veDonVi: true, heSo: true } });
    const existingKeys = new Set(existing.map(e => `${e.tuDonVi}|${e.veDonVi}|${e.heSo}`));

    const toCreate = [...map.values()].filter(v => !existingKeys.has(`${v.tuDonVi}|${v.veDonVi}|${v.heSo}`));

    if (toCreate.length > 0) {
      await prisma.quyDoiDonVi.createMany({
        data: toCreate.map(v => ({
          tuDonVi: v.tuDonVi,
          veDonVi: v.veDonVi,
          heSo: v.heSo,
          vatTuVD: [...v.vatTuTens].join(", ") || null,
          ghiChu: null,
        })),
      });
    }

    return NextResponse.json({ ok: true, soDongMoi: toCreate.length, tongQuet: map.size });
  } catch (e: unknown) {
    console.error("[trich-tu-nhap-kho POST]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
