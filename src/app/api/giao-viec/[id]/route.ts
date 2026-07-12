export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

// PATCH /api/giao-viec/[id]
// Body: { title?, description?, deadline?, priority?, color?, trangThai?, nhanVienIds? }
// Special: body.assignment = { nhanVienId, trangThai, note } → update 1 assignment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json();

    // Assignment update from NV
    if (body.assignment) {
      const { nhanVienId, trangThai, note } = body.assignment;
      // Upsert assignment
      const aId = cuid();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "TaskAssignment" (id, "taskId", "nhanVienId", "trangThai", note, "updatedAt")
         VALUES ($1,$2,$3,$4,$5,NOW())
         ON CONFLICT ("taskId","nhanVienId") DO UPDATE SET
           "trangThai" = $4, note = $5, "updatedAt" = NOW()`,
        aId, id, nhanVienId, trangThai, note ?? null
      );

      // Auto-update task trangThai based on assignments
      type CountRow = { total: number; done: number; started: number };
      const [counts] = await prisma.$queryRawUnsafe<CountRow[]>(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE "trangThai"='hoan_thanh') as done,
                COUNT(*) FILTER (WHERE "trangThai"='dang_lam') as started
         FROM "TaskAssignment" WHERE "taskId" = $1`,
        id
      );
      const total = Number(counts.total);
      const done  = Number(counts.done);
      const started = Number(counts.started);
      const newTT = done === total && total > 0
        ? "hoan_thanh"
        : (started > 0 || done > 0) ? "dang_lam" : "chua_lam";
      await prisma.$executeRawUnsafe(
        `UPDATE "Task" SET "trangThai"=$1, "updatedAt"=NOW() WHERE id=$2`,
        newTT, id
      );

      return NextResponse.json({ ok: true });
    }

    // Task update from admin
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    if (body.title       !== undefined) { sets.push(`title=$${i++}`);       vals.push(body.title); }
    if (body.description !== undefined) { sets.push(`description=$${i++}`); vals.push(body.description); }
    if (body.deadline    !== undefined) { sets.push(`deadline=$${i++}::date`); vals.push(body.deadline || null); }
    if (body.priority    !== undefined) { sets.push(`priority=$${i++}`);    vals.push(body.priority); }
    if (body.color       !== undefined) { sets.push(`color=$${i++}`);       vals.push(body.color); }
    if (body.trangThai   !== undefined) { sets.push(`"trangThai"=$${i++}`); vals.push(body.trangThai); }

    if (sets.length > 0) {
      sets.push(`"updatedAt"=NOW()`);
      vals.push(id);
      await prisma.$executeRawUnsafe(
        `UPDATE "Task" SET ${sets.join(",")} WHERE id=$${i}`,
        ...vals
      );
    }

    // Update assigned NVs if provided
    if (Array.isArray(body.nhanVienIds)) {
      // Remove old, add new
      await prisma.$executeRawUnsafe(`DELETE FROM "TaskAssignment" WHERE "taskId"=$1`, id);
      for (const nvId of body.nhanVienIds) {
        const aId = cuid();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "TaskAssignment" (id, "taskId", "nhanVienId", "trangThai")
           VALUES ($1,$2,$3,'chua_lam') ON CONFLICT DO NOTHING`,
          aId, id, nvId
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/giao-viec/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "Task" WHERE id=$1`, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
