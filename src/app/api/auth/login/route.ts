export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = process.env.APP_EMAIL || "conguoc1997@gmail.com";
  const validPassword = process.env.APP_PASSWORD || "123456789";

  if (email === validEmail && password === validPassword) {
    const secret = process.env.SESSION_SECRET || "meisy-inhouse-2026";
    const res = NextResponse.json({ ok: true });
    res.cookies.set("auth_session", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && !req.headers.get("host")?.includes("localhost"),
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  return NextResponse.json({ error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
}
