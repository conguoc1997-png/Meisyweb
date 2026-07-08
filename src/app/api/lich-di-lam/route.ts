export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

// Tạo bảng + thêm cột mới nếu chưa có
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
  // Thêm cột mới nếu chưa có
  await Promise.all([
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "ca" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "loai" TEXT NOT NULL DEFAULT 'dang_ky'`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "ghiChu" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "gioVao" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "gioRa" TEXT`).catch(() => {}),
    prisma.$executeRawUnsafe(`ALTER TABLE "LichDiLam" ADD COLUMN IF NOT EXISTS "adminNote" TEXT`).catch(() => {}),
  ]);
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
  ca: string | null;
  loai: string;
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
      ca: r.ca ?? null,
      loai: r.loai ?? "dang_ky",
      createdAt: r.createdAt,
      nhanVien: { ten: r.nv_ten, maNV: r.nv_maNV, phongBan: r.nv_phongBan },
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/lich-di-lam
// body: { nhanVienId, ngay, gioVao?, gioRa?, ghiChu?, ca?, loai? }
// loai = 'thay_doi' → luôn tạo bản ghi mới (không overwrite bản ghi da_duyet)
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const { nhanVienId, ngay, gioVao, gioRa, ghiChu, ca, loai } = body;
    if (!nhanVienId || !ngay) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    const loaiValue = loai ?? "dang_ky";

    // Nếu là "thay_doi" → luôn tạo bản ghi MỚI, không đụng vào bản đã duyệt
    if (loaiValue === "thay_doi") {
      const id = cuid();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "LichDiLam" (id,"nhanVienId","ngay","gioVao","gioRa","ghiChu","trangThai","ca","loai")
         VALUES ($1,$2,$3::date,$4,$5,$6,'cho_duyet',$7,'thay_doi')`,
        id, nhanVienId, ngay, gioVao || null, gioRa || null, ghiChu || null, ca || null
      );
      return NextResponse.json({ ok: true, id }, { status: 201 });
    }

    // Kiểm tra đã đăng ký ca này ngày này chưa (upsert theo nhanVienId + ngay + ca)
    const caKey = ca || "khac";
    const existing = await prisma.$queryRawUnsafe<{ id: string; trangThai: string }[]>(
      `SELECT id, "trangThai" FROM "LichDiLam" WHERE "nhanVienId" = $1 AND "ngay" = $2::date AND COALESCE("ca",'khac') = $3 AND "loai" = 'dang_ky'`,
      nhanVienId, ngay, caKey
    );

    if (existing.length > 0) {
      // Nếu ca này đã được duyệt → không cho ghi đè từ client
      if (existing[0].trangThai === "da_duyet") {
        return NextResponse.json({ error: "Ca này đã được duyệt, dùng 'Đề xuất thay đổi' nếu muốn thay đổi" }, { status: 409 });
      }
      // Cập nhật lại nếu chưa được duyệt
      await prisma.$executeRawUnsafe(
        `UPDATE "LichDiLam" SET "gioVao"=$3,"gioRa"=$4,"ghiChu"=$5,"trangThai"='cho_duyet',"adminNote"=NULL,"updatedAt"=NOW()
         WHERE id=$6`,
        nhanVienId, ngay, gioVao || null, gioRa || null, ghiChu || null, existing[0].id
      );
      return NextResponse.json({ ok: true, id: existing[0].id, updated: true });
    }

    const id = cuid();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "LichDiLam" (id,"nhanVienId","ngay","gioVao","gioRa","ghiChu","trangThai","ca","loai")
       VALUES ($1,$2,$3::date,$4,$5,$6,'cho_duyet',$7,'dang_ky')`,
      id, nhanVienId, ngay, gioVao || null, gioRa || null, ghiChu || null, ca || null
    );
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
