import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canAccess } from "@/lib/auth";

// Routes công khai — không cần đăng nhập
const PUBLIC_PAGES = ["/login", "/checkin", "/lich-di-lam"];
const PUBLIC_API   = [
  "/api/auth/login", "/api/auth/logout", "/api/auth/me",
  "/api/lich-di-lam", "/api/cham-cong/nhan-vien", "/api/cham-cong/lock",
  "/api/run-migration-hao-hui", "/api/run-migration-cong-no",
  "/api/run-migration-vai-ncc", "/api/run-migration-booking-schedule",
  "/api/run-migration-fake-kho", "/api/run-add-size-fakekho",
  "/api/run-migration-so-ch-nhat", "/api/run-migration-phu-cap-thang",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bỏ qua static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images")
  ) return NextResponse.next();

  // Cho phép public pages
  if (PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Cho phép public APIs
  if (PUBLIC_API.some(p => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Kiểm tra JWT
  const token = req.cookies.get("auth_session")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await verifyToken(token);
  if (!user) {
    // Token hết hạn hoặc bị giả mạo — xóa cookie
    const res = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "Phiên đăng nhập hết hạn" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url));
    res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Admin routes chỉ cho admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (user.role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Kiểm tra quyền truy cập theo role
  if (!canAccess(user.role, pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
