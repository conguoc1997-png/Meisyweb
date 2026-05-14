export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Kiểm tra SĐT có từng xuất hiện trong hệ thống chưa (phát hiện lạm dụng)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sdt = searchParams.get("sdt");
  if (!sdt) return NextResponse.json({ count: 0, records: [] });

  try {
    const records = await prisma.doiTra.findMany({
      where: { sdtHienTai: sdt },
      select: {
        id: true,
        maDoiTra: true,
        tenKhach: true,
        loaiVanDe: true,
        maVanDon: true,
        ghiChu: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ count: records.length, records });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
