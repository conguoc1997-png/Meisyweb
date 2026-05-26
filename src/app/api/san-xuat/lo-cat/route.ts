export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang");
    const xuong = searchParams.get("xuong");
    const trangThai = searchParams.get("trangThai");
    const where: Record<string, unknown> = {};
    if (thang) {
      const [y, m] = thang.split("-").map(Number);
      where.ngay = { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
    }
    if (xuong) where.xuong = xuong;
    if (trangThai) where.trangThai = trangThai;
    const data = await prisma.loCat.findMany({ where, orderBy: [{ ngay: "desc" }, { createdAt: "desc" }] });
    return NextResponse.json(data);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

const n = (v: unknown) => (v !== "" && v != null ? Number(v) : null);
const ni = (v: unknown) => (v !== "" && v != null ? Math.round(Number(v)) : null);

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const lo = await prisma.loCat.create({
      data: {
        ngay: new Date(b.ngay),
        hangCat: b.hangCat,
        soSize: b.soSize || null,
        maVai: b.maVai || null,
        soMSoDo: n(b.soMSoDo),
        soCay: b.soCay ? Math.round(Number(b.soCay)) : 1,
        cayData: b.cayData || null,
        soY: n(b.soY),
        soM: n(b.soM),
        tongSize: ni(b.tongSize),
        soLa: n(b.soLa),
        soLaThucTe: ni(b.soLaThucTe),
        soSanPham: ni(b.soSanPham),
        hangThucTe: ni(b.hangThucTe),
        ngayNhanHang: b.ngayNhanHang ? new Date(b.ngayNhanHang) : null,
        soLuongThieu: ni(b.soLuongThieu),
        xuongNhanHang: b.xuongNhanHang || null,
        trangThai: b.trangThai || "chua_xuat",
        xuong: b.xuong || "meisy",
        hdMay: ni(b.hdMay),
        tonTruocMay: n(b.tonTruocMay),
        coGiat: b.coGiat || null,
        hdGiatViSinh: ni(b.hdGiatViSinh),
        tonTruocGiatViSinh: n(b.tonTruocGiatViSinh),
        hdGiatMau: ni(b.hdGiatMau),
        tonTruocGiatMau: n(b.tonTruocGiatMau),
        ghiChuMay: b.ghiChuMay || null,
        mauGiat: b.mauGiat || null,
        ghiChu: b.ghiChu || null,
      },
    });
    return NextResponse.json(lo, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
