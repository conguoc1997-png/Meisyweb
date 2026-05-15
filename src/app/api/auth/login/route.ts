export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = process.env.APP_EMAIL;
  const validPassword = process.env.APP_PASSWORD;

  if (email === validEmail && password === validPassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_session", process.env.SESSION_SECRET || "meisy-secret", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
}
