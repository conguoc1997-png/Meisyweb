export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (body.nhomXuong !== undefined) { sets.push(`"nhomXuong"=$${i++}`); vals.push(body.nhomXuong); }
    if (body.ma        !== undefined) { sets.push(`ma=$${i++}`);           vals.push(body.ma); }
    if (body.chiPhi    !== undefined) { sets.push(`"chiPhi"=$${i++}::jsonb`); vals.push(JSON.stringify(body.chiPhi)); }
    if (body.thuTu     !== undefined) { sets.push(`"thuTu"=$${i++}`);      vals.push(body.thuTu); }
    if (sets.length === 0) return NextResponse.json({ error: "nothing to update" }, { status: 400 });
    sets.push(`"updatedAt"=now()`);
    vals.push(id);
    const rows = await prisma.$queryRawUnsafe<object[]>(
      `UPDATE "GiaCongLoai" SET ${sets.join(",")} WHERE id=$${i} RETURNING *`,
      ...vals
    );
    return NextResponse.json(rows[0] ?? {});
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM "GiaCongLoai" WHERE id=$1`, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
