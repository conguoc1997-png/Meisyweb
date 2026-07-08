export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/calendar/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { title, startTime, endTime, color, description, date } = await req.json();
    await prisma.$executeRawUnsafe(
      `UPDATE "CalendarEvent"
       SET title=$2, "startTime"=$3, "endTime"=$4, color=$5, description=$6,
           date=$7::date, "updatedAt"=NOW()
       WHERE id=$1`,
      id, title, startTime || null, endTime || null,
      color || "#ef4444", description || null, date
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/calendar/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM "CalendarEvent" WHERE id=$1`, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
