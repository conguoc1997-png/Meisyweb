export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function ensureTables() {
  // Bảng SP Cha
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SanPhamCha" (
      id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
      ma          TEXT        NOT NULL UNIQUE,
      ten         TEXT        NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  // Thêm cột spChaId vào SanPham nếu chưa có
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SanPham" ADD COLUMN IF NOT EXISTS "spChaId" TEXT
  `);
}

export async function GET() {
  try {
    await ensureTables();
    const rows = await prisma.$queryRawUnsafe<object[]>(
      `SELECT c.*, COUNT(s.id)::int as "skuCount"
       FROM "SanPhamCha" c
       LEFT JOIN "SanPham" s ON s."spChaId" = c.id
       GROUP BY c.id
       ORDER BY c.ten ASC`
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const body = await req.json();

    if (!body.ten) return NextResponse.json({ error: "Thiếu tên SP Cha" }, { status: 400 });

    // ma: tự sinh từ ten nếu không truyền
    const ma = (body.ma || body.ten).toUpperCase().trim().replace(/\s+/g, "_").slice(0, 50);

    const rows = await prisma.$queryRawUnsafe<object[]>(
      `INSERT INTO "SanPhamCha"(ma, ten)
       VALUES($1, $2)
       ON CONFLICT(ma) DO UPDATE SET ten=EXCLUDED.ten, "updatedAt"=now()
       RETURNING *`,
      ma, body.ten.trim()
    );

    // Nếu có autoAssign: gán spChaId cho các SKU khớp pattern
    if (body.autoAssign && Array.isArray(body.skuIds) && body.skuIds.length > 0) {
      const id = (rows[0] as { id: string }).id;
      // Build placeholders
      const placeholders = body.skuIds.map((_: string, i: number) => `$${i + 2}`).join(",");
      await prisma.$executeRawUnsafe(
        `UPDATE "SanPham" SET "spChaId"=$1 WHERE id IN (${placeholders})`,
        id, ...body.skuIds
      );
    }

    return NextResponse.json(rows[0], { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Mã SP Cha đã tồn tại" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Auto-gán SP Cha từ text parsing tên SKU
export async function PUT(req: NextRequest) {
  try {
    await ensureTables();
    const { action } = await req.json();

    if (action === "auto_assign") {
      // Lấy tất cả SKU chưa có spChaId
      const skus = await prisma.$queryRawUnsafe<{ id: string; ten: string }[]>(
        `SELECT id, ten FROM "SanPham" WHERE "spChaId" IS NULL ORDER BY ten`
      );

      // Group theo tên cha (phần trước " - ")
      const groups = new Map<string, string[]>();
      for (const sp of skus) {
        const dashIdx = sp.ten.indexOf(" - ");
        const parentName = dashIdx > 0 ? sp.ten.slice(0, dashIdx).trim() : sp.ten.trim();
        if (!groups.has(parentName)) groups.set(parentName, []);
        groups.get(parentName)!.push(sp.id);
      }

      let created = 0;
      let assigned = 0;
      for (const [parentName, ids] of groups) {
        const ma = parentName.toUpperCase().replace(/\s+/g, "_").slice(0, 50);
        // Upsert SP Cha
        const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
          `INSERT INTO "SanPhamCha"(ma, ten) VALUES($1, $2)
           ON CONFLICT(ma) DO UPDATE SET "updatedAt"=now()
           RETURNING id`,
          ma, parentName
        );
        const chaId = rows[0].id;
        created++;

        // Assign
        const placeholders = ids.map((_, i) => `$${i + 2}`).join(",");
        await prisma.$executeRawUnsafe(
          `UPDATE "SanPham" SET "spChaId"=$1 WHERE id IN (${placeholders})`,
          chaId, ...ids
        );
        assigned += ids.length;
      }

      return NextResponse.json({ ok: true, created, assigned });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
