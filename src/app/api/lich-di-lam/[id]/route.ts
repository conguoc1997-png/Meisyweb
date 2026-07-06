export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/lich-di-lam/[id]  body: { trangThai: "da_duyet"|"tu_choi", adminNote? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { trangThai, adminNote } = await req.json();
    if (!["da_duyet", "tu_choi"].includes(trangThai)) {
      return NextResponse.json({ error: "trangThai không hợp lệ" }, { status: 400 });
    }

    // Cập nhật trạng thái LichDiLam
    await prisma.$executeRawUnsafe(
      `UPDATE "LichDiLam" SET "trangThai"=$2,"adminNote"=$3,"updatedAt"=NOW() WHERE id=$1`,
      id, trangThai, adminNote || null
    );

    // Nếu duyệt → tạo/cập nhật bản ghi ChamCong (non-blocking, lỗi không fail cả request)
    if (trangThai === "da_duyet") {
      try {
        const rows = await prisma.$queryRawUnsafe<{
          nhanVienId: string; ngay: Date | string; gioVao: string | null; ca: string | null;
        }[]>(
          `SELECT "nhanVienId", "ngay", "gioVao", COALESCE("ca", NULL) as ca FROM "LichDiLam" WHERE id=$1`, id
        );

        if (rows.length > 0) {
          const { nhanVienId, ngay, gioVao, ca } = rows[0];
          const rawDate = typeof ngay === "string" ? ngay : ngay.toISOString();
          const datePart = rawDate.slice(0, 10); // YYYY-MM-DD
          const ngayUTC = new Date(datePart + "T00:00:00.000Z");

          // Kiểm tra đã có bản ghi chấm công chưa
          const cc = await prisma.$queryRawUnsafe<{ id: string }[]>(
            `SELECT id FROM "ChamCong" WHERE "nhanVienId"=$1 AND "ngay"=$2`,
            nhanVienId, ngayUTC
          );

          if (cc.length === 0) {
            const ghiChu = ca
              ? `Đã đăng ký ${ca.replace("_", " ")}`
              : gioVao ? `Đã đăng ký ca ${gioVao}` : "Đã đăng ký lịch";
            const newId = crypto.randomUUID().replace(/-/g, "").slice(0, 24);

            // Thử tạo bằng raw SQL để tránh Prisma schema mismatch
            await prisma.$executeRawUnsafe(
              `INSERT INTO "ChamCong" ("id","nhanVienId","ngay","trangThai","ghiChu")
               VALUES ($1,$2,$3,'da_dang_ky',$4)
               ON CONFLICT DO NOTHING`,
              newId, nhanVienId, ngayUTC, ghiChu
            ).catch(() =>
              // Fallback không có ghiChu
              prisma.$executeRawUnsafe(
                `INSERT INTO "ChamCong" ("id","nhanVienId","ngay","trangThai")
                 VALUES ($1,$2,$3,'da_dang_ky')
                 ON CONFLICT DO NOTHING`,
                newId, nhanVienId, ngayUTC
              ).catch(() => {})
            );
          }
        }
      } catch (chamCongErr) {
        // Lỗi tạo ChamCong không block việc duyệt lịch
        console.error("Tạo ChamCong sau duyệt lỗi (non-fatal):", chamCongErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/lich-di-lam/[id] error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/lich-di-lam/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "LichDiLam" WHERE id=$1`, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
