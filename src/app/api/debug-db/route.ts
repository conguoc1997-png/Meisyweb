export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );
    const dbName = await prisma.$queryRawUnsafe<{ db: string }[]>(
      `SELECT current_database() as db`
    );
    return NextResponse.json({ db: dbName[0]?.db, tables: result.map(r => r.table_name) });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
