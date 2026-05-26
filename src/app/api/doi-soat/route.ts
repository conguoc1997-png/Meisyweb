export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const dons = await prisma.donHoanTra.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(dons);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Import nhiều đơn cùng lúc
    if (Array.isArray(body)) {
      const batchId = `batch_${Date.now()}`;
      const created = await prisma.donHoanTra.createMany({
        data: body.map((d: {
          maDon: string; san?: string; tenSP?: string; sku?: string;
          soLuong?: number; ngayTaoDon?: string; lyDoHoan?: string;
        }) => ({
          maDon:      d.maDon?.trim() ?? "",
          san:        d.san        ?? "shopee",
          tenSP:      d.tenSP      ?? "",
          sku:        d.sku        ?? "",
          soLuong:    Number(d.soLuong) || 1,
          ngayTaoDon: d.ngayTaoDon ? new Date(d.ngayTaoDon) : null,
          lyDoHoan:   d.lyDoHoan   ?? null,
          batchId,
        })),
        skipDuplicates: false,
      });
      return NextResponse.json({ ok: true, count: created.count, batchId });
    }
    // Tạo 1 đơn
    const d = body;
    const don = await prisma.donHoanTra.create({
      data: {
        maDon:      d.maDon?.trim() ?? "",
        san:        d.san        ?? "shopee",
        tenSP:      d.tenSP      ?? "",
        sku:        d.sku        ?? "",
        soLuong:    Number(d.soLuong) || 1,
        ngayTaoDon: d.ngayTaoDon ? new Date(d.ngayTaoDon) : null,
        lyDoHoan:   d.lyDoHoan   ?? null,
        ghiChu:     d.ghiChu     ?? null,
      },
    });
    return NextResponse.json(don, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Xóa tất cả
    if (body.deleteAll === true) {
      await prisma.donHoanTra.deleteMany({});
      return NextResponse.json({ ok: true });
    }
    // Xóa theo danh sách IDs
    if (Array.isArray(body.ids) && body.ids.length > 0) {
      await prisma.donHoanTra.deleteMany({ where: { id: { in: body.ids } } });
      return NextResponse.json({ ok: true });
    }
    // Xóa theo batchId
    if (body.batchId) {
      await prisma.donHoanTra.deleteMany({ where: { batchId: body.batchId } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Thiếu tham số" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
