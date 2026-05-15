import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const session = req.cookies.get("auth_session")?.value;
  const secret = process.env.SESSION_SECRET || "meisy-secret";
  const { pathname } = req.nextUrl;

  // Bỏ qua login page và API auth
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Chưa đăng nhập → redirect về login
  if (session !== secret) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
