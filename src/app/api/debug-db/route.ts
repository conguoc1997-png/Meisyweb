export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const result = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  const dbInfo = await prisma.$queryRaw<{ current_database: string; host: string }[]>`
    SELECT current_database(), inet_server_addr()::text as host
  `;
  return NextResponse.json({ tables: result.map(r => r.table_name), db: dbInfo[0] });
}
