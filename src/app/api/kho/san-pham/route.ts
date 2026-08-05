export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Dùng raw SQL để lấy cả cột spChaId (không có trong Prisma schema)
    const sanPhams = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT s.*, s."spChaId" FROM "SanPham" s ORDER BY s."updatedAt" DESC`
    ).catch(() =>
      // Fallback nếu cột chưa tồn tại (sẽ được tạo khi gọi san-pham-cha API)
      prisma.sanPham.findMany({ orderBy: { updatedAt: "desc" } }).then(rows =>
        rows.map(r => ({ ...r, spChaId: null }))
      )
    );

    // Sắp xếp: có giá nhập > lên trước, cùng nhóm thì mới nhất trước
    sanPhams.sort((a, b) => {
      const aHas = Number(a.giaNhap) > 0 ? 1 : 0;
      const bHas = Number(b.giaNhap) > 0 ? 1 : 0;
      if (bHas !== aHas) return bHas - aHas;
      return new Date(String(b.updatedAt)).getTime() - new Date(String(a.updatedAt)).getTime();
    });

    return NextResponse.json(sanPhams);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sp = await prisma.sanPham.create({
      data: {
        ten: body.ten,
        sku: body.sku,
        mauSac: body.mauSac || null,
        size: body.size || null,
        giaNhap: Number(body.giaNhap) || 0,
        giaBan: Number(body.giaBan) || 0,
        tonKho: Number(body.tonKho) || 0,
        nguon: body.nguon || null,
      },
    });
    return NextResponse.json(sp, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
