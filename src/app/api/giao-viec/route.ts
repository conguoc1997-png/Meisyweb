export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  tableReady = true;
  // Task table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Task" (
      "id"          TEXT          NOT NULL PRIMARY KEY,
      "title"       TEXT          NOT NULL,
      "description" TEXT,
      "deadline"    DATE,
      "priority"    TEXT          NOT NULL DEFAULT 'trung_binh',
      "color"       TEXT          NOT NULL DEFAULT '#4285f4',
      "trangThai"   TEXT          NOT NULL DEFAULT 'chua_lam',
      "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  // TaskAssignment table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "TaskAssignment" (
      "id"          TEXT          NOT NULL PRIMARY KEY,
      "taskId"      TEXT          NOT NULL REFERENCES "Task"("id") ON DELETE CASCADE,
      "nhanVienId"  TEXT          NOT NULL REFERENCES "NhanVien"("id") ON DELETE CASCADE,
      "trangThai"   TEXT          NOT NULL DEFAULT 'chua_lam',
      "note"        TEXT,
      "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TaskAssignment_taskId_nhanVienId_key" UNIQUE ("taskId","nhanVienId")
    )
  `).catch(() => {});
}

type TaskRow = {
  id: string; title: string; description: string | null;
  deadline: Date | string | null; priority: string; color: string;
  trangThai: string; createdAt: Date | string;
};
type AssignRow = {
  id: string; taskId: string; nhanVienId: string;
  trangThai: string; note: string | null; updatedAt: Date | string;
  ten: string; maNV: string; phongBan: string | null;
};

function fmtTask(r: TaskRow) {
  return {
    ...r,
    deadline: r.deadline
      ? (typeof r.deadline === "string" ? r.deadline.slice(0, 10) : (r.deadline as Date).toISOString().slice(0, 10))
      : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : (r.createdAt as Date).toISOString(),
  };
}

// GET /api/giao-viec?thang=2026-07  (optional filter)
// GET /api/giao-viec?nv=<nhanVienId>  (NV personal view)
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = req.nextUrl;
    const nvId = searchParams.get("nv");

    // Fetch tasks
    let taskRows: TaskRow[];
    if (nvId) {
      // Only tasks assigned to this NV
      taskRows = await prisma.$queryRawUnsafe<TaskRow[]>(
        `SELECT t.* FROM "Task" t
         INNER JOIN "TaskAssignment" ta ON ta."taskId" = t.id
         WHERE ta."nhanVienId" = $1
         ORDER BY t."deadline" ASC NULLS LAST, t."createdAt" DESC`,
        nvId
      );
    } else {
      taskRows = await prisma.$queryRawUnsafe<TaskRow[]>(
        `SELECT * FROM "Task" ORDER BY "deadline" ASC NULLS LAST, "createdAt" DESC`
      );
    }

    // Fetch assignments with NV info
    const taskIds = taskRows.map(t => t.id);
    let assignments: AssignRow[] = [];
    if (taskIds.length > 0) {
      const placeholders = taskIds.map((_, i) => `$${i + 1}`).join(",");
      assignments = await prisma.$queryRawUnsafe<AssignRow[]>(
        `SELECT ta.*, nv.ten, nv."maNV", nv."phongBan"
         FROM "TaskAssignment" ta
         JOIN "NhanVien" nv ON nv.id = ta."nhanVienId"
         WHERE ta."taskId" IN (${placeholders})
         ORDER BY nv.ten ASC`,
        ...taskIds
      );
    }

    // Group assignments by taskId
    const assignMap: Record<string, AssignRow[]> = {};
    for (const a of assignments) {
      if (!assignMap[a.taskId]) assignMap[a.taskId] = [];
      assignMap[a.taskId].push(a);
    }

    const result = taskRows.map(t => ({
      ...fmtTask(t),
      assignments: assignMap[t.id] ?? [],
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("GET /api/giao-viec error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/giao-viec  body: { title, description?, deadline?, priority?, color?, nhanVienIds: string[] }
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const { title, description, deadline, priority, color, nhanVienIds } = await req.json();
    if (!title?.trim()) return NextResponse.json({ error: "Thiếu title" }, { status: 400 });

    const id = cuid();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "Task" (id, title, description, deadline, priority, color, "trangThai")
       VALUES ($1,$2,$3,$4::date,$5,$6,'chua_lam')`,
      id, title.trim(), description || null,
      deadline || null, priority || "trung_binh", color || "#4285f4"
    );

    // Create assignments
    if (Array.isArray(nhanVienIds) && nhanVienIds.length > 0) {
      for (const nvId of nhanVienIds) {
        const aId = cuid();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "TaskAssignment" (id, "taskId", "nhanVienId", "trangThai")
           VALUES ($1,$2,$3,'chua_lam') ON CONFLICT DO NOTHING`,
          aId, id, nvId
        );
      }
    }

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
