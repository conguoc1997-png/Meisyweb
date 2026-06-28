export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache trạng thái cột — tránh double-query trong cùng 1 instance
let columnReady: boolean | null = null;

export async function GET() {
  let list: object[];
  if (columnReady !== false) {
    try {
      list = await prisma.nhanVien.findMany({
        orderBy: { ten: "asc" },
        include: { luongCBHistory: { orderBy: { thangApDung: "asc" } } },
      });
      columnReady = true;
      return NextResponse.json(list);
    } catch {
      columnReady = false;
    }
  }
  // Fallback: cột soChNhatHopDong chưa có trong DB
  list = await prisma.$queryRaw`
    SELECT id, "maNV", ten, "chucVu", "phongBan", "loaiLuong",
           "luongCB", "phuCapChuyenCan", "phuCapAn", "phuCapDacBiet",
           "heSoTC", 0 as "soChNhatHopDong", "ngaySinh", active, "createdAt"
    FROM "NhanVien"
    ORDER BY ten ASC
  `;
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { maNV, ten, chucVu, phongBan, luongCB, loaiLuong } = data;
  if (!maNV || !ten) return NextResponse.json({ error: "Thiếu mã NV hoặc tên" }, { status: 400 });

  const existing = await prisma.nhanVien.findUnique({ where: { maNV } });
  if (existing) return NextResponse.json({ error: "Mã NV đã tồn tại" }, { status: 400 });

  const { ngaySinh, thangApDung, soChNhatHopDong } = data;
  const nv = await prisma.nhanVien.create({
    data: {
      maNV, ten,
      chucVu:          chucVu          || null,
      phongBan:        phongBan        || null,
      loaiLuong:       loaiLuong       || "co_ban",
      luongCB:         luongCB         ? Number(luongCB) : null,
      soChNhatHopDong: soChNhatHopDong !== undefined ? Number(soChNhatHopDong) : 0,
      ngaySinh:        ngaySinh        ? new Date(ngaySinh) : null,
    },
  });

  if (luongCB && thangApDung) {
    await prisma.luongCBHistory.create({
      data: { nhanVienId: nv.id, thangApDung, luongCB: Number(luongCB) || 0 },
    });
  }

  return NextResponse.json(nv);
}
