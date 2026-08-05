export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    // Nếu có spChaId → update bằng raw SQL (cột không có trong Prisma schema)
    if (body.spChaId !== undefined) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      let i = 1;

      if (body.ten        !== undefined) { sets.push(`ten=$${i++}`);            vals.push(body.ten); }
      if (body.sku        !== undefined) { sets.push(`sku=$${i++}`);            vals.push(body.sku); }
      if (body.mauSac     !== undefined) { sets.push(`"mauSac"=$${i++}`);       vals.push(body.mauSac || null); }
      if (body.size       !== undefined) { sets.push(`size=$${i++}`);           vals.push(body.size || null); }
      if (body.giaNhap    !== undefined) { sets.push(`"giaNhap"=$${i++}`);      vals.push(Number(body.giaNhap) || 0); }
      if (body.giaBan     !== undefined) { sets.push(`"giaBan"=$${i++}`);       vals.push(Number(body.giaBan) || 0); }
      if (body.nguon      !== undefined) { sets.push(`nguon=$${i++}`);          vals.push(body.nguon || null); }
      if (body.dinhLuong  !== undefined) { sets.push(`"dinhLuong"=$${i++}`);    vals.push(body.dinhLuong !== "" ? Number(body.dinhLuong) : null); }
      if (body.tenVai     !== undefined) { sets.push(`"tenVai"=$${i++}`);       vals.push(body.tenVai || null); }
      if (body.giaVai     !== undefined) { sets.push(`"giaVai"=$${i++}`);       vals.push(body.giaVai !== "" ? Number(body.giaVai) : null); }
      if (body.loaiGiaCong !== undefined){ sets.push(`"loaiGiaCong"=$${i++}`);  vals.push(body.loaiGiaCong || null); }
      if (body.giaGiaCong !== undefined) { sets.push(`"giaGiaCong"=$${i++}`);   vals.push(body.giaGiaCong !== "" ? Number(body.giaGiaCong) : null); }
      // spChaId
      sets.push(`"spChaId"=$${i++}`);
      vals.push(body.spChaId || null);

      sets.push(`"updatedAt"=now()`);
      vals.push(id);

      if (sets.length <= 2) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

      const rows = await prisma.$queryRawUnsafe<object[]>(
        `UPDATE "SanPham" SET ${sets.join(",")} WHERE id=$${i} RETURNING *`,
        ...vals
      );
      return NextResponse.json(rows[0] ?? {});
    }

    // Path thông thường (không có spChaId)
    const sp = await prisma.sanPham.update({
      where: { id },
      data: {
        ten: body.ten,
        sku: body.sku,
        mauSac: body.mauSac || null,
        size: body.size || null,
        giaNhap: Number(body.giaNhap) || 0,
        giaBan: Number(body.giaBan) || 0,
        nguon: body.nguon || null,
        tiktokProductId: body.tiktokProductId ?? null,
        ...(body.dinhLuong    !== undefined ? { dinhLuong:    body.dinhLuong    !== "" ? Number(body.dinhLuong)    : null } : {}),
        ...(body.tenVai       !== undefined ? { tenVai:       body.tenVai       || null } : {}),
        ...(body.giaVai       !== undefined ? { giaVai:       body.giaVai       !== "" ? Number(body.giaVai)       : null } : {}),
        ...(body.loaiGiaCong  !== undefined ? { loaiGiaCong:  body.loaiGiaCong  || null } : {}),
        ...(body.giaGiaCong   !== undefined ? { giaGiaCong:   body.giaGiaCong   !== "" ? Number(body.giaGiaCong)   : null } : {}),
      },
    });
    return NextResponse.json(sp);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.sanPham.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
