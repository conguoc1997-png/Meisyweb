export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, SessionUser } from "@/lib/auth";

const MAX_ATTEMPTS    = 5;
const LOCK_MINUTES    = 15;
const SESSION_SECONDS = 60 * 60 * 8; // 8 giờ

// Đảm bảo các cột bảo mật + bảng log tồn tại (chạy mỗi request — IF NOT EXISTS nên an toàn)
async function ensureSecuritySchema() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginAttempts" INT DEFAULT 0`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMPTZ`).catch(() => {});
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LoginLog" (
      id         TEXT DEFAULT gen_random_uuid() PRIMARY KEY,
      "userId"   TEXT,
      email      TEXT NOT NULL,
      ip         TEXT,
      success    BOOLEAN NOT NULL,
      reason     TEXT,
      "createdAt" TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});
}

async function logLogin(userId: string | null, email: string, ip: string, success: boolean, reason?: string) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "LoginLog" ("userId", email, ip, success, reason) VALUES ($1,$2,$3,$4,$5)`,
    userId, email, ip, success, reason ?? null
  ).catch(() => {});
}

function getIP(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const ip = getIP(req);

  await ensureSecuritySchema();

  try {
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });

    // ── Fallback env credentials (chỉ dùng khi chưa có DB) ──
    if (!user || !user.active) {
      const validEmail    = process.env.APP_EMAIL    || "conguoc1997@gmail.com";
      const validPassword = process.env.APP_PASSWORD || "123456789";
      if (email === validEmail && password === validPassword) {
        const sessionUser: SessionUser = { id: "admin_fallback", email: validEmail, name: "Admin", role: "admin" };
        const token = await signToken(sessionUser);
        await logLogin(null, email, ip, true, "fallback");
        const res = NextResponse.json({ ok: true, name: "Admin", role: "admin" });
        res.cookies.set("auth_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: SESSION_SECONDS, path: "/" });
        return res;
      }
      await logLogin(null, email, ip, false, "user_not_found");
      return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    // ── Kiểm tra khóa tài khoản ──
    type LockRow = { loginAttempts: number | null; lockedUntil: string | null };
    const lockRows = await prisma.$queryRawUnsafe<LockRow[]>(
      `SELECT "loginAttempts", "lockedUntil" FROM "User" WHERE id = $1`, user.id
    );
    const lock = lockRows[0];
    if (lock?.lockedUntil && new Date(lock.lockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(lock.lockedUntil).getTime() - Date.now()) / 60000);
      await logLogin(user.id, email, ip, false, "account_locked");
      return NextResponse.json(
        { error: `Tài khoản bị khóa tạm thời do nhập sai quá nhiều lần. Thử lại sau ${remaining} phút.` },
        { status: 429 }
      );
    }

    // ── Kiểm tra mật khẩu ──
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      const attempts = (lock?.loginAttempts ?? 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.$executeRawUnsafe(
          `UPDATE "User" SET "loginAttempts" = $1, "lockedUntil" = NOW() + INTERVAL '${LOCK_MINUTES} minutes' WHERE id = $2`,
          attempts, user.id
        );
        await logLogin(user.id, email, ip, false, `wrong_password_locked`);
        return NextResponse.json(
          { error: `Sai mật khẩu quá ${MAX_ATTEMPTS} lần. Tài khoản bị khóa ${LOCK_MINUTES} phút.` },
          { status: 429 }
        );
      }
      await prisma.$executeRawUnsafe(
        `UPDATE "User" SET "loginAttempts" = $1 WHERE id = $2`,
        attempts, user.id
      );
      await logLogin(user.id, email, ip, false, `wrong_password_${attempts}/${MAX_ATTEMPTS}`);
      return NextResponse.json(
        { error: `Sai mật khẩu. Còn ${MAX_ATTEMPTS - attempts} lần thử trước khi bị khóa.` },
        { status: 401 }
      );
    }

    // ── Đăng nhập thành công ──
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET "loginAttempts" = 0, "lockedUntil" = NULL WHERE id = $1`, user.id
    );
    await logLogin(user.id, email, ip, true);

    const sessionUser: SessionUser = {
      id: user.id, email: user.email, name: user.name,
      role: user.role as SessionUser["role"],
      sessionVersion: user.sessionVersion ?? 0,
    };
    const token = await signToken(sessionUser);
    const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
    res.cookies.set("auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_SECONDS,
      path: "/",
    });
    return res;

  } catch {
    // Fallback nếu DB chưa sẵn sàng
    const validEmail    = process.env.APP_EMAIL    || "conguoc1997@gmail.com";
    const validPassword = process.env.APP_PASSWORD || "123456789";
    if (email === validEmail && password === validPassword) {
      const sessionUser: SessionUser = { id: "admin_fallback", email: validEmail, name: "Admin", role: "admin" };
      const token = await signToken(sessionUser);
      const res = NextResponse.json({ ok: true, name: "Admin", role: "admin" });
      res.cookies.set("auth_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: SESSION_SECONDS, path: "/" });
      return res;
    }
    return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
  }
}
