export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST — quét toàn bộ ChiTietNhapKho, gom các cặp (donViMua → donViQuyDoi, hệ số quyDoi)
// đã từng nhập: tạo dòng mới nếu chưa có, hoặc bổ sung tên vật tư vào dòng đã tồn tại
// (không ghi đè hệ số/ghi chú đã có, chỉ thêm tên vật tư còn thiếu vào Vật tư mẫu).
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

    const existing = await prisma.quyDoiDonVi.findMany();
    const existingByKey = new Map(existing.map(e => [`${e.tuDonVi}|${e.veDonVi}|${e.heSo}`, e]));

    const toCreate: { tuDonVi: string; veDonVi: string; heSo: number; vatTuVD: string | null; ghiChu: null }[] = [];
    let soDongCapNhat = 0;

    for (const v of map.values()) {
      const key = `${v.tuDonVi}|${v.veDonVi}|${v.heSo}`;
      const found = existingByKey.get(key);
      if (!found) {
        toCreate.push({ tuDonVi: v.tuDonVi, veDonVi: v.veDonVi, heSo: v.heSo, vatTuVD: [...v.vatTuTens].join(", ") || null, ghiChu: null });
        continue;
      }
      // Đã có dòng này — bổ sung tên vật tư còn thiếu vào vatTuVD (không trùng lặp)
      const daCo = new Set((found.vatTuVD || "").split(",").map(s => s.trim()).filter(Boolean));
      const thieu = [...v.vatTuTens].filter(t => !daCo.has(t));
      if (thieu.length > 0) {
        const merged = [...daCo, ...thieu].join(", ");
        await prisma.quyDoiDonVi.update({ where: { id: found.id }, data: { vatTuVD: merged } });
        soDongCapNhat++;
      }
    }

    if (toCreate.length > 0) {
      await prisma.quyDoiDonVi.createMany({ data: toCreate });
    }

    return NextResponse.json({ ok: true, soDongMoi: toCreate.length, soDongCapNhat, tongQuet: map.size });
  } catch (e: unknown) {
    console.error("[trich-tu-nhap-kho POST]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
