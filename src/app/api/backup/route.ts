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

    const results: Record<string, number> = {};

    // Helper upsert từng bảng
    async function upsertMany<T extends Record<string, unknown>>(
      model: string,
      rows: T[],
      key: string = "id"
    ) {
      if (!rows?.length) return 0;
      let count = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (prisma as any)[model];
      for (const row of rows) {
        try {
          await m.upsert({
            where: { [key]: row[key] },
            update: row,
            create: row,
          });
          count++;
        } catch { /* bỏ qua row lỗi */ }
      }
      return count;
    }

    // Restore theo thứ tự (tránh lỗi foreign key)
    results.vatTu       = await upsertMany("vatTu",       t.vatTu       || []);
    results.nhaCungCap  = await upsertMany("nhaCungCap",  t.nhaCungCap  || []);
    results.quyDoiDonVi = await upsertMany("quyDoiDonVi", t.quyDoiDonVi || []);
    results.nhanVien    = await upsertMany("nhanVien",    t.nhanVien    || []);
    results.chamCong    = await upsertMany("chamCong",    t.chamCong    || []);
    results.doiTra      = await upsertMany("doiTra",      t.doiTra      || []);
    results.feedback    = await upsertMany("feedback",    t.feedback    || []);
    results.buTien      = await upsertMany("buTien",      t.buTien      || []);
    results.ungTien     = await upsertMany("ungTien",     t.ungTien     || []);
    results.loCat       = await upsertMany("loCat",       t.loCat       || []);
    results.vaiTon      = await upsertMany("vaiTon",      t.vaiTon      || []);
    results.koc         = await upsertMany("kOC",         t.koc         || []);
    results.kocBooking  = await upsertMany("kOCBooking",  t.kocBooking  || []);
    results.congNo      = await upsertMany("congNo",      t.congNo      || []);
    results.donHoanTra  = await upsertMany("donHoanTra",  t.donHoanTra  || []);

    // PhieuNhapKho + chiTiet (nested)
    let phieuCount = 0;
    for (const phieu of (t.phieuNhapKho || [])) {
      try {
        const { chiTiet, ...phieuData } = phieu;
        await prisma.phieuNhapKho.upsert({
          where: { id: phieuData.id },
          update: phieuData,
          create: phieuData,
        });
        for (const ct of (chiTiet || [])) {
          await prisma.chiTietNhapKho.upsert({
            where: { id: ct.id },
            update: ct,
            create: ct,
          });
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
