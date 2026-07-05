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

    await prisma.$executeRawUnsafe(
      `UPDATE "LichDiLam" SET "trangThai"=$2,"adminNote"=$3,"updatedAt"=NOW() WHERE id=$1`,
      id, trangThai, adminNote || null
    );

    // Nếu duyệt → tạo/cập nhật bản ghi ChamCong
    if (trangThai === "da_duyet") {
      const rows = await prisma.$queryRawUnsafe<{
        nhanVienId: string; ngay: Date; gioVao: string | null;
      }[]>(
        `SELECT "nhanVienId", "ngay", "gioVao" FROM "LichDiLam" WHERE id=$1`, id
      );
      if (rows.length > 0) {
        const { nhanVienId, ngay, gioVao } = rows[0];
        const ngayUTC = new Date(Date.UTC(
          new Date(ngay).getUTCFullYear(),
          new Date(ngay).getUTCMonth(),
          new Date(ngay).getUTCDate()
        ));

        // Kiểm tra đã có bản ghi chấm công chưa
        const cc = await prisma.$queryRawUnsafe<{ id: string }[]>(
          `SELECT id FROM "ChamCong" WHERE "nhanVienId"=$1 AND "ngay"=$2`,
          nhanVienId, ngayUTC
        );

        const ghiChuCC = gioVao ? `Đã đăng ký ca ${gioVao}` : "Đã đăng ký lịch";

        if (cc.length === 0) {
          // Tạo mới với trạng thái "da_dang_ky" (lịch chờ đến làm)
          await prisma.chamCong.create({
            data: {
              nhanVienId,
              ngay: ngayUTC,
              trangThai: "da_dang_ky",
              ghiChu: ghiChuCC,
            },
          }).catch(() => {
            // Fallback nếu cột ghiChu chưa có
            return prisma.$executeRawUnsafe(
              `INSERT INTO "ChamCong" ("id","nhanVienId","ngay","trangThai") VALUES ($1,$2,$3,'da_dang_ky')`,
              crypto.randomUUID().replace(/-/g, "").slice(0, 24), nhanVienId, ngayUTC
            );
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/lich-di-lam/[id]  — xóa đăng ký (nhân viên tự hủy hoặc admin xóa)
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
