export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Row = { sku: string; giaNhap: number | null; giaBan: number; isNew: boolean; existingId: string | null };

export async function POST(req: NextRequest) {
  try {
    const { rows }: { rows: Row[] } = await req.json();
    let inserted = 0, updated = 0;

    for (const r of rows) {
      if (!r.sku) continue;
      if (r.isNew) {
        await prisma.sanPham.create({
          data: {
            ten: r.sku,
            sku: r.sku,
            giaNhap: r.giaNhap ?? 0,
            giaBan: r.giaBan ?? 0,
            tonKho: 0,
          },
        });
        inserted++;
      } else if (r.existingId) {
        await prisma.sanPham.update({
          where: { id: r.existingId },
          data: {
            ...(r.giaNhap !== null && { giaNhap: r.giaNhap }),
            ...(r.giaBan > 0 && { giaBan: r.giaBan }),
          },
        });
        updated++;
      }
    }

    return NextResponse.json({ inserted, updated });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
