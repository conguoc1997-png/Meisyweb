export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

// Tạo bảng nếu chưa có
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  tableReady = true;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LichDiLam" (
      "id"          TEXT        NOT NULL PRIMARY KEY,
      "nhanVienId"  TEXT        NOT NULL,
      "ngay"        DATE        NOT NULL,
      "gioVao"      TEXT,
      "gioRa"       TEXT,
      "ghiChu"      TEXT,
      "trangThai"   TEXT        NOT NULL DEFAULT 'cho_duyet',
      "adminNote"   TEXT,
      "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
}

type Row = {
  id: string;
  nhanVienId: string;
  ngay: Date | string;
  gioVao: string | null;
  gioRa: string | null;
  ghiChu: string | null;
  trangThai: string;
  adminNote: string | null;
  createdAt: Date | string;
  nv_ten: string;
  nv_maNV: string;
  nv_phongBan: string | null;
};

// GET /api/lich-di-lam?thang=2026-07&trangThai=cho_duyet&nhanVienId=xxx
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const url    = req.nextUrl;
    const thang  = url.searchParams.get("thang");
    const tt     = url.searchParams.get("trangThai");
    const nvId   = url.searchParams.get("nhanVienId");

    let where = `WHERE 1=1`;
    const params: (string | Date)[] = [];
    let pi = 1;

    if (thang) {
      where += ` AND to_char(l."ngay", 'YYYY-MM') = $${pi++}`;
      params.push(thang);
    }
    if (tt) {
      where += ` AND l."trangThai" = $${pi++}`;
      params.push(tt);
    }
    if (nvId) {
      where += ` AND l."nhanVienId" = $${pi++}`;
      params.push(nvId);
    }

    const rows = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT l.*, n.ten as nv_ten, n."maNV" as "nv_maNV", n."phongBan" as "nv_phongBan"
       FROM "LichDiLam" l
       JOIN "NhanVien" n ON n.id = l."nhanVienId"
       ${where}
       ORDER BY l."ngay" DESC, l."createdAt" DESC`,
      ...params
    );

    return NextResponse.json(rows.map(r => ({
      id: r.id,
      nhanVienId: r.nhanVienId,
      ngay: typeof r.ngay === "string" ? r.ngay.slice(0, 10) : r.ngay.toISOString().slice(0, 10),
      gioVao: r.gioVao,
      gioRa: r.gioRa,
      ghiChu: r.ghiChu,
      trangThai: r.trangThai,
      adminNote: r.adminNote,
      createdAt: r.createdAt,
      nhanVien: { ten: r.nv_ten, maNV: r.nv_maNV, phongBan: r.nv_phongBan },
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/lich-di-lam  body: { nhanVienId, ngay, gioVao?, gioRa?, ghiChu? }
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const { nhanVienId, ngay, gioVao, gioRa, ghiChu } = body;
    if (!nhanVienId || !ngay) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra đã đăng ký ngày này chưa
    const existing = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "LichDiLam" WHERE "nhanVienId" = $1 AND "ngay" = $2::date`,
      nhanVienId, ngay
    );
    if (existing.length > 0) {
      // Cập nhật lại (cho phép sửa nếu chưa được duyệt)
      await prisma.$executeRawUnsafe(
        `UPDATE "LichDiLam" SET "gioVao"=$3,"gioRa"=$4,"ghiChu"=$5,"trangThai"='cho_duyet',"adminNote"=NULL,"updatedAt"=NOW()
         WHERE "nhanVienId"=$1 AND "ngay"=$2::date`,
        nhanVienId, ngay, gioVao || null, gioRa || null, ghiChu || null
      );
      return NextResponse.json({ ok: true, id: existing[0].id, updated: true });
    }

    const id = cuid();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "LichDiLam" (id,"nhanVienId","ngay","gioVao","gioRa","ghiChu","trangThai")
       VALUES ($1,$2,$3::date,$4,$5,$6,'cho_duyet')`,
      id, nhanVienId, ngay, gioVao || null, gioRa || null, ghiChu || null
    );
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
