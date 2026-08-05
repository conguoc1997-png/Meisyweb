export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ENSURE_LOG = `
  CREATE TABLE IF NOT EXISTS "VaiLog" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "vaiTonId" TEXT NOT NULL, "maVai" TEXT NOT NULL, "mauSac" TEXT, "xuong" TEXT,
    "donVi" TEXT NOT NULL DEFAULT 'm', "loai" TEXT NOT NULL, "soMet" FLOAT NOT NULL,
    "soMetTruoc" FLOAT, "soMetSau" FLOAT, "nguon" TEXT, "ghiChu" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();

    // Lấy dữ liệu hiện tại để tính delta
    const current = await prisma.vaiTon.findUnique({ where: { id } });
    const soMetTruoc = current?.soMet ?? 0;

    // cayData có thể là array (với extra fields như cut:true) hoặc undefined
    const cays: Record<string, unknown>[] | undefined = Array.isArray(b.cayData) ? b.cayData : undefined;
    const activeCays = cays ? cays.filter(c => !c.deleted) : undefined;
    const soMet = activeCays
      ? activeCays.reduce((s, c) => s + (Number(c.soMet) || 0), 0)
      : b.soMet !== undefined ? Number(b.soMet) : undefined;

    const row = await prisma.vaiTon.update({
      where: { id },
      data: {
        ...(b.maVai !== undefined && { maVai: b.maVai }),
        ...(soMet !== undefined && { soMet }),
        ...(cays !== undefined && { soCay: activeCays!.length, cayData: JSON.stringify(cays) }),
        ...(b.donVi !== undefined && { donVi: b.donVi }),
        ...(b.mauSac !== undefined && { mauSac: b.mauSac || null }),
        ...(b.xuong !== undefined && { xuong: b.xuong || null }),
        ...(b.ghiChu !== undefined && { ghiChu: b.ghiChu || null }),
      },
    });

    // ── Ghi log nếu có thay đổi số mét ──
    // Bỏ qua: chỉ đổi xuong/mauSac/ghiChu (không có soMet thay đổi)
    const nguon: string | null = b.nguon ?? null; // caller truyền nguon để phân loại
    const shouldLog = soMet !== undefined && Math.abs(soMet - soMetTruoc) > 0.0001;
    if (shouldLog) {
      const soMetSau  = soMet!;
      const delta     = soMetSau - soMetTruoc;
      const loai      = delta > 0 ? "nhap" : "xuat";
      const nguonLog  = nguon ?? (delta > 0 ? "cong_vao" : "xuat_kho");
      await prisma.$executeRawUnsafe(ENSURE_LOG).catch(() => {});
      await prisma.$executeRawUnsafe(
        `INSERT INTO "VaiLog"("vaiTonId","maVai","mauSac","xuong","donVi","loai","soMet","soMetTruoc","soMetSau","nguon","ghiChu")
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        id, row.maVai, row.mauSac ?? null, row.xuong ?? null, row.donVi,
        loai, delta, soMetTruoc, soMetSau, nguonLog, b.ghiChuLog ?? null
      ).catch(() => {});
    }

    return NextResponse.json(row);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.vaiTon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
