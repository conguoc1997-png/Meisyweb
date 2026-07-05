export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });

    if (!user || !user.active) {
      // Fallback to env credentials if no users exist in DB yet
      const validEmail = process.env.APP_EMAIL || "conguoc1997@gmail.com";
      const validPassword = process.env.APP_PASSWORD || "123456789";
      if (email === validEmail && password === validPassword) {
        const sessionUser: SessionUser = { id: "admin_fallback", email: validEmail, name: "Admin", role: "admin" };
        const token = await signToken(sessionUser);
        const res = NextResponse.json({ ok: true, name: "Admin", role: "admin" });
        res.cookies.set("auth_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
        return res;
      }
      return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const sessionUser: SessionUser = { id: user.id, email: user.email, name: user.name, role: user.role as SessionUser["role"], sessionVersion: user.sessionVersion ?? 0 };
    const token = await signToken(sessionUser);

    const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
    res.cookies.set("auth_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  } catch {
    // Table may not exist yet — fallback to env credentials
    const validEmail = process.env.APP_EMAIL || "conguoc1997@gmail.com";
    const validPassword = process.env.APP_PASSWORD || "123456789";
    if (email === validEmail && password === validPassword) {
      const sessionUser: SessionUser = { id: "admin_fallback", email: validEmail, name: "Admin", role: "admin" };
      const token = await signToken(sessionUser);
      const res = NextResponse.json({ ok: true, name: "Admin", role: "admin" });
      res.cookies.set("auth_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
      return res;
    }
    return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
  }
}
