export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.vaiTon.findMany({ orderBy: { updatedAt: "desc" } });
    return NextResponse.json(data);
  } catch {
    // Fallback: cột mới chưa tồn tại trong DB → query thủ công các cột cũ
    try {
      const data = await prisma.$queryRaw`
        SELECT id, "maVai", "soMet", "soCay", "cayData", "donVi",
               "mauSac", "xuong", "ghiChu", "createdAt", "updatedAt",
               NULL as "tenNCC", NULL as "soHoaDon",
               NULL as "chiPhiThucNhap", NULL as "soTienHoaDon",
               NULL as "vatPct", 'thuc_te' as "tinhNoTheo", NULL as "congNoNccId"
        FROM "VaiTon" ORDER BY "updatedAt" DESC
      `;
      return NextResponse.json(data);
    } catch (e2: unknown) {
      return NextResponse.json({ error: e2 instanceof Error ? e2.message : "Lỗi server" }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const cays: { soMet: number }[] = Array.isArray(b.cayData) ? b.cayData : [];
    const soMet = cays.reduce((s, c) => s + (Number(c.soMet) || 0), 0);

    // ── Tính số tiền nợ NCC ──
    const chiPhi    = parseFloat(b.chiPhiThucNhap) || 0;
    const tienHD    = parseFloat(b.soTienHoaDon)   || 0;
    const vatPct    = parseFloat(b.vatPct)          || 0;
    const hdWithVat = tienHD > 0 ? tienHD * (1 + vatPct / 100) : 0;
    const soNoNCC   = b.tinhNoTheo === "hoa_don" ? hdWithVat : chiPhi;
    const coNCC     = !!b.tenNCC && soNoNCC > 0;

    // ── Tạo VaiTon ──
    const row = await prisma.vaiTon.create({
      data: {
        maVai:          b.maVai,
        soMet,
        soCay:          cays.length || 1,
        cayData:        cays.length > 0 ? JSON.stringify(cays) : null,
        donVi:          b.donVi       || "m",
        mauSac:         b.mauSac      || null,
        xuong:          b.xuong       || null,
        ghiChu:         b.ghiChu      || null,
        tenNCC:         b.tenNCC      || null,
        soHoaDon:       b.soHoaDon    || null,
        chiPhiThucNhap: chiPhi > 0    ? chiPhi  : null,
        soTienHoaDon:   tienHD > 0    ? tienHD  : null,
        vatPct:         vatPct > 0    ? vatPct  : null,
        tinhNoTheo:     b.tinhNoTheo  || "thuc_te",
        congNoNccId:    null,
      },
    });

    // ── Tự động tạo CongNoNCC nếu có NCC + số tiền ──
    if (coNCC) {
      const ngay  = new Date();
      const thang = ngay.toISOString().slice(0, 7);
      const congNo = await prisma.congNoNCC.create({
        data: {
          ho:             "nguyen_cong_uoc",
          ngay,
          thang,
          tenNCC:         b.tenNCC,
          soHoaDon:       b.soHoaDon    || null,
          soTienHoaDon:   hdWithVat > 0 ? hdWithVat : tienHD,
          chiPhiThucNhap: soNoNCC,
          daTra:          0,
          conLai:         soNoNCC,
          trangThai:      "con_no",
          ghiChu:         `Từ nhập vải: ${b.maVai}${b.soHoaDon ? ` — HĐ ${b.soHoaDon}` : ""}`,
          nguoiTao:       null,
          phieuNhapId:    null,
        },
      });

      // Link ngược lại VaiTon
      await prisma.vaiTon.update({
        where: { id: row.id },
        data:  { congNoNccId: congNo.id },
      });

      return NextResponse.json({ ...row, congNoNccId: congNo.id, congNo }, { status: 201 });
    }

    return NextResponse.json(row, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
