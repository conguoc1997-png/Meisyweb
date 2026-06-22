import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/so-thu-chi?thang=2026-06&ho=meisy
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang") || "";
    const ho    = searchParams.get("ho") || "";

    const where: Record<string, unknown> = {};
    if (thang) where.thang = thang;
    if (ho)    where.ho    = ho;

    // Sequential queries — tránh connection pool timeout (Supabase limit=1)
    const phieus    = await prisma.phieuThuChi.findMany({ where, orderBy: { ngay: "desc" } });
    const taiKhoans = await prisma.taiKhoanQuy.findMany();

    return NextResponse.json({ phieus, taiKhoans });
  } catch (e) {
    console.error("GET /api/so-thu-chi error:", e);
    return NextResponse.json({ error: String(e), phieus: [], taiKhoans: [] }, { status: 500 });
  }
}

// POST /api/so-thu-chi — tạo đề xuất mới
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { ho, loai, soTien, danhMuc, dienGiai, nguoiDeXuat, ngay } = data;

    if (!ho || !loai || !soTien || !dienGiai) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    const ngayDate = ngay ? new Date(ngay) : new Date();
    const thang = `${ngayDate.getFullYear()}-${String(ngayDate.getMonth() + 1).padStart(2, "0")}`;

    const phieu = await prisma.phieuThuChi.create({
      data: {
        ho,
        loai,
        soTien: Number(soTien),
        danhMuc: danhMuc || "khac",
        dienGiai,
        nguoiDeXuat: nguoiDeXuat || null,
        // Thu: ghi nhận thẳng. Chi: cần duyệt
        trangThai: loai === "thu" ? "da_chi" : "cho_duyet",
        ngay: ngayDate,
        thang,
      },
    });

    return NextResponse.json(phieu);
  } catch (e) {
    console.error("POST /api/so-thu-chi error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
