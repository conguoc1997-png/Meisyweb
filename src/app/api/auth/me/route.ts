export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Auto-add sessionVersion column if missing (runs once per serverless instance)
let migrated = false;
async function ensureSessionVersion() {
  if (migrated) return;
  migrated = true;
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INT NOT NULL DEFAULT 0`
  ).catch(() => {});
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json(null);

  const user = await verifyToken(token);
  if (!user) {
    // Token hết hạn — xóa cookie
    const res = NextResponse.json(null);
    res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Kiểm tra DB: user còn active không? Role/sessionVersion có thay đổi không?
  if (user.id !== "admin_fallback") {
    try {
      await ensureSessionVersion();
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { active: true, role: true, name: true, sessionVersion: true },
      });

      // Bị vô hiệu hóa hoặc không còn tồn tại → đăng xuất ngay
      if (!dbUser || !dbUser.active) {
        const res = NextResponse.json(null);
        res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return res;
      }

      // sessionVersion không khớp → mật khẩu đã đổi & yêu cầu đăng xuất thiết bị khác
      const tokenVersion = user.sessionVersion ?? 0;
      if (dbUser.sessionVersion !== tokenVersion) {
        const res = NextResponse.json(null);
        res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return res;
      }

      // Role đã thay đổi → trả về role mới nhất từ DB (token sẽ cũ nhưng data đúng)
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: dbUser.name,
        role: dbUser.role, // luôn lấy từ DB, không tin token
        sessionVersion: dbUser.sessionVersion,
      });
    } catch {
      // DB lỗi → vẫn trả về từ token (graceful degradation)
    }
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
