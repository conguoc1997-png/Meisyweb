export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-server";

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }
  type LogRow = { id: string; userId: string | null; email: string; ip: string | null; success: boolean; reason: string | null; createdAt: string };
  const rows = await prisma.$queryRawUnsafe<LogRow[]>(
    `SELECT l.id, l."userId", l.email, l.ip, l.success, l.reason, l."createdAt",
            u.name as "userName"
     FROM "LoginLog" l
     LEFT JOIN "User" u ON u.id = l."userId"
     ORDER BY l."createdAt" DESC LIMIT 100`
  ).catch(() => []);
  return NextResponse.json(rows);
}
