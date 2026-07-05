import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string; // "admin" | comma-separated module keys e.g. "kho,san-xuat,doi-tra"
  sessionVersion?: number;
};

// Tất cả module keys có thể phân quyền
export const ALL_MODULES = [
  { key: "tong-quan", label: "Tổng quan",       routes: ["/tong-quan", "/api/dashboard", "/"] },
  { key: "kho",       label: "Quản lý Kho",      routes: ["/kho", "/api/kho", "/doi-soat", "/api/doi-soat", "/fake-kho", "/api/fake-kho"] },
  { key: "san-xuat",  label: "Sản xuất",          routes: ["/san-xuat", "/api/san-xuat"] },
  { key: "doi-tra",   label: "Chăm sóc KH",      routes: ["/doi-tra", "/api/doi-tra", "/api/feedback", "/api/bu-tien", "/api/ung-tien"] },
  { key: "koc",       label: "KOC Booking",       routes: ["/koc", "/api/koc"] },
  { key: "gia-ban",   label: "Giá bán SP",        routes: ["/gia-ban", "/api/gia-ban"] },
  { key: "ke-toan",   label: "Kế toán",           routes: ["/ke-toan", "/api/ke-toan"] },
  { key: "cham-cong", label: "Chấm công",           routes: ["/cham-cong", "/bang-luong", "/api/cham-cong", "/api/lich-di-lam", "/cham-cong/ca-lam-viec", "/cham-cong/qr"] },
  { key: "so-thu-chi", label: "Sổ Thu Chi",        routes: ["/so-thu-chi", "/api/so-thu-chi"] },
  { key: "cong-no",    label: "Công Nợ & DT",       routes: ["/cong-no", "/api/cong-no-ncc", "/api/cong-no-khach-hang", "/api/doanh-thu"] },
  { key: "users",     label: "Quản lý User",      routes: ["/admin/users", "/api/admin"] },
  { key: "backup",    label: "Backup & Restore",  routes: ["/backup", "/api/backup"] },
] as const;

// Chuyển đổi role cũ sang module keys mới (backward compat)
export function parseModules(role: string): string[] {
  if (role === "admin") return ALL_MODULES.map(m => m.key);
  if (role === "kho")      return ["tong-quan", "kho", "doi-tra"];
  if (role === "san_xuat") return ["tong-quan", "san-xuat"];
  // Định dạng mới: "kho,san-xuat,doi-tra"
  return role.split(",").map(s => s.trim()).filter(Boolean);
}

const getSecret = () => {
  const s = process.env.SESSION_SECRET || "meisy-inhouse-2026";
  return new TextEncoder().encode(s);
};

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export function canAccess(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  // Launcher + login + public pages luôn mở
  if (pathname === "/" || pathname === "/login") return true;
  // Admin routes chỉ cho admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return false;

  const modules = parseModules(role);
  return modules.some(mk => {
    const mod = ALL_MODULES.find(m => m.key === mk);
    return mod?.routes.some(prefix => pathname.startsWith(prefix)) ?? false;
  });
}

// NOTE: getSessionUser, requireAdmin, requireAuth đã được chuyển sang
// @/lib/auth-server để tránh import next/headers trong Edge runtime (proxy.ts)
