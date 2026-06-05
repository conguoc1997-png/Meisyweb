export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Pro: 60s, Hobby: 10s
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── GET: Export toàn bộ DB ra JSON ──────────────────────────
export async function GET() {
  try {
    // Fetch tuần tự để tránh timeout & connection pool
    const doiTra      = await prisma.doiTra.findMany();
    const feedback    = await prisma.feedback.findMany();
    const buTien      = await prisma.buTien.findMany();
    const ungTien     = await prisma.ungTien.findMany();
    const loCat       = await prisma.loCat.findMany();
    const vaiTon      = await prisma.vaiTon.findMany();
    const koc         = await prisma.kOC.findMany();
    const kocBooking  = await prisma.kOCBooking.findMany();
    const vatTu       = await prisma.vatTu.findMany();
    const nhaCungCap  = await prisma.nhaCungCap.findMany();
    const quyDoiDonVi = await prisma.quyDoiDonVi.findMany();
    const phieuNhapKho = await prisma.phieuNhapKho.findMany({ include: { chiTiet: true } });
    const congNo      = await prisma.congNo.findMany();
    const nhanVien    = await prisma.nhanVien.findMany();
    const chamCong    = await prisma.chamCong.findMany();
    const donHoanTra  = await prisma.donHoanTra.findMany();
    const sanPham     = await prisma.sanPham.findMany();
    const nhapXuatKho = await prisma.nhapXuatKho.findMany();

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      tables: {
        doiTra, feedback, buTien, ungTien,
        loCat, vaiTon,
        koc, kocBooking,
        vatTu, nhaCungCap, quyDoiDonVi,
        phieuNhapKho, congNo,
        nhanVien, chamCong,
        donHoanTra,
        sanPham, nhapXuatKho,
      },
    };

    return NextResponse.json(backup);
  } catch (e: unknown) {
    console.error("[backup GET]", e);
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Lỗi export"
    }, { status: 500 });
  }
}

// ── POST: Import JSON để restore DB ─────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const t = body.tables;
    if (!t) return NextResponse.json({ error: "File không hợp lệ" }, { status: 400 });

    const mode = (body.mode as string) || "overwrite"; // "overwrite" | "merge"
    const results: Record<string, number> = {};

    // Helper upsert (ghi đè) — cập nhật nếu đã có, tạo mới nếu chưa có
    async function upsertMany<T extends Record<string, unknown>>(
      model: string, rows: T[], key: string = "id"
    ) {
      if (!rows?.length) return 0;
      let count = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (prisma as any)[model];
      for (const row of rows) {
        try {
          await m.upsert({ where: { [key]: row[key] }, update: row, create: row });
          count++;
        } catch { /* bỏ qua row lỗi */ }
      }
      return count;
    }

    // Helper merge — chỉ thêm record chưa có, không đụng record cũ
    async function mergeMany<T extends Record<string, unknown>>(
      model: string, rows: T[]
    ) {
      if (!rows?.length) return 0;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await (prisma as any)[model].createMany({ data: rows, skipDuplicates: true });
        return res.count;
      } catch { return 0; }
    }

    const save = mode === "merge" ? mergeMany : upsertMany;

    // Restore theo thứ tự (tránh lỗi foreign key)
    results.vatTu       = await save("vatTu",       t.vatTu       || []);
    results.nhaCungCap  = await save("nhaCungCap",  t.nhaCungCap  || []);
    results.quyDoiDonVi = await save("quyDoiDonVi", t.quyDoiDonVi || []);
    results.nhanVien    = await save("nhanVien",    t.nhanVien    || []);
    results.chamCong    = await save("chamCong",    t.chamCong    || []);
    results.doiTra      = await save("doiTra",      t.doiTra      || []);
    results.feedback    = await save("feedback",    t.feedback    || []);
    results.buTien      = await save("buTien",      t.buTien      || []);
    results.ungTien     = await save("ungTien",     t.ungTien     || []);
    results.loCat       = await save("loCat",       t.loCat       || []);
    results.vaiTon      = await save("vaiTon",      t.vaiTon      || []);
    results.koc         = await save("kOC",         t.koc         || []);
    results.kocBooking  = await save("kOCBooking",  t.kocBooking  || []);
    results.congNo      = await save("congNo",      t.congNo      || []);
    results.donHoanTra  = await save("donHoanTra",  t.donHoanTra  || []);
    results.sanPham     = await save("sanPham",     t.sanPham     || []);
    results.nhapXuatKho = await save("nhapXuatKho", t.nhapXuatKho || []);

    // PhieuNhapKho + chiTiet (nested)
    let phieuCount = 0;
    for (const phieu of (t.phieuNhapKho || [])) {
      try {
        const { chiTiet, ...phieuData } = phieu;
        if (mode === "merge") {
          // Merge: chỉ tạo nếu chưa có
          const exists = await prisma.phieuNhapKho.findUnique({ where: { id: phieuData.id } });
          if (exists) { phieuCount++; continue; }
          await prisma.phieuNhapKho.create({ data: phieuData });
        } else {
          await prisma.phieuNhapKho.upsert({ where: { id: phieuData.id }, update: phieuData, create: phieuData });
        }
        for (const ct of (chiTiet || [])) {
          if (mode === "merge") {
            await prisma.chiTietNhapKho.createMany({ data: [ct], skipDuplicates: true });
          } else {
            await prisma.chiTietNhapKho.upsert({ where: { id: ct.id }, update: ct, create: ct });
          }
        }
        phieuCount++;
      } catch { /* bỏ qua */ }
    }
    results.phieuNhapKho = phieuCount;

    return NextResponse.json({ ok: true, restored: results });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi import" }, { status: 500 });
  }
}
