export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ho = searchParams.get("ho");
    const thang = searchParams.get("thang");

    const records = await prisma.doanhThu.findMany({
      where: {
        ...(ho && { ho }),
        ...(thang && { thang }),
      },
      include: {
        phieuXuat: {
          include: { chiTiet: { include: { vatTu: true } } },
        },
        congNoKhachHang: true,
      },
      orderBy: { ngay: "desc" },
    });
    return NextResponse.json(records);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
