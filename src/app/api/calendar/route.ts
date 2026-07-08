export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  tableReady = true;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CalendarEvent" (
      "id"          TEXT          NOT NULL PRIMARY KEY,
      "title"       TEXT          NOT NULL,
      "date"        DATE          NOT NULL,
      "startTime"   TEXT,
      "endTime"     TEXT,
      "color"       TEXT          NOT NULL DEFAULT '#ef4444',
      "description" TEXT,
      "type"        TEXT          NOT NULL DEFAULT 'task',
      "createdBy"   TEXT,
      "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});
}

type EventRow = {
  id: string; title: string; date: Date | string;
  startTime: string | null; endTime: string | null;
  color: string; description: string | null;
  type: string; createdBy: string | null; createdAt: Date | string;
};

// GET /api/calendar?thang=2026-07
export async function GET(req: NextRequest) {
  try {
    await ensureTable();
    const thang = req.nextUrl.searchParams.get("thang");
    let where = "WHERE 1=1";
    const params: string[] = [];
    if (thang) {
      where += ` AND to_char("date", 'YYYY-MM') = $1`;
      params.push(thang);
    }
    const rows = await prisma.$queryRawUnsafe<EventRow[]>(
      `SELECT * FROM "CalendarEvent" ${where} ORDER BY "date" ASC, "startTime" ASC NULLS LAST`,
      ...params
    );
    return NextResponse.json(rows.map(r => ({
      ...r,
      date: typeof r.date === "string" ? r.date.slice(0, 10) : r.date.toISOString().slice(0, 10),
    })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/calendar  body: { title, date, startTime?, endTime?, color?, description?, type?, createdBy? }
export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const { title, date, startTime, endTime, color, description, type, createdBy } = await req.json();
    if (!title || !date) return NextResponse.json({ error: "Thiếu title hoặc date" }, { status: 400 });
    const id = cuid();
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CalendarEvent" (id, title, date, "startTime", "endTime", color, description, type, "createdBy")
       VALUES ($1,$2,$3::date,$4,$5,$6,$7,$8,$9)`,
      id, title, date, startTime || null, endTime || null,
      color || "#ef4444", description || null, type || "task", createdBy || null
    );
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
