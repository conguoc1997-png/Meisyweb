export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Auto-migrate: thêm cột mới nếu chưa có
let migrated = false;
async function ensureCols() {
  if (migrated) return;
  migrated = true;
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INT NOT NULL DEFAULT 0`
  ).catch(() => {});
  // Liên kết User → NhanVien (cho /viec-cua-toi tự động nhận diện)
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nhanVienId" TEXT`
  ).catch(() => {});
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json(null);

  const user = await verifyToken(token);
  if (!user) {
    const res = NextResponse.json(null);
    res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  if (user.id !== "admin_fallback") {
    try {
      await ensureCols();
      type DbUser = { active: boolean; role: string; name: string; sessionVersion: number; nhanVienId: string | null };
      const [dbUser] = await prisma.$queryRawUnsafe<DbUser[]>(
        `SELECT active, role, name, "sessionVersion", "nhanVienId" FROM "User" WHERE id = $1`,
        user.id
      );

      if (!dbUser || !dbUser.active) {
        const res = NextResponse.json(null);
        res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return res;
      }

      const tokenVersion = user.sessionVersion ?? 0;
      if (dbUser.sessionVersion !== tokenVersion) {
        const res = NextResponse.json(null);
        res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return res;
      }

      return NextResponse.json({
        id:           user.id,
        email:        user.email,
        name:         dbUser.name,
        role:         dbUser.role,
        sessionVersion: dbUser.sessionVersion,
        nhanVienId:   dbUser.nhanVienId ?? null,
      });
    } catch {
      // DB lỗi → graceful degradation
    }
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, nhanVienId: null });
}
