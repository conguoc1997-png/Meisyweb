export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* Tự tạo bảng nếu chưa có (không cần prisma db push) */
async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "GiaCongLoai" (
      id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
      "nhomXuong" TEXT        NOT NULL,
      ma          TEXT        NOT NULL UNIQUE,
      "chiPhi"    JSONB       NOT NULL DEFAULT '{}',
      "thuTu"     INTEGER     NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await prisma.$queryRawUnsafe<object[]>(
      `SELECT * FROM "GiaCongLoai" ORDER BY "nhomXuong" ASC, "thuTu" ASC`
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    if (!body.nhomXuong || !body.ma) {
      return NextResponse.json({ error: "Thiếu nhomXuong hoặc ma" }, { status: 400 });
    }
    // Đếm số hàng cùng nhóm để tính thuTu
    const countRes = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::text as count FROM "GiaCongLoai" WHERE "nhomXuong"=$1`,
      body.nhomXuong
    );
    const thuTu = parseInt(countRes[0]?.count ?? "0");
    const chiPhi = body.chiPhi ?? {};
    const rows = await prisma.$queryRawUnsafe<object[]>(
      `INSERT INTO "GiaCongLoai"("nhomXuong","ma","chiPhi","thuTu")
       VALUES($1,$2,$3::jsonb,$4)
       RETURNING *`,
      body.nhomXuong, body.ma, JSON.stringify(chiPhi), thuTu
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate") || msg.includes("already exists")) {
      return NextResponse.json({ error: `Mã này đã tồn tại trong hệ thống` }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
