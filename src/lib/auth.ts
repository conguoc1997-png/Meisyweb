import { SignJWT, jwtVerify } from "jose";

export type UserRole = "admin" | "kho" | "san_xuat";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

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

// Which pages each role can access (prefix match)
export const ROLE_PAGES: Record<UserRole, string[]> = {
  admin: ["/"],
  kho: ["/", "/tong-quan", "/kho", "/doi-tra", "/api/kho", "/api/doi-tra", "/api/feedback", "/api/bu-tien", "/api/dashboard"],
  san_xuat: ["/", "/tong-quan", "/san-xuat", "/api/san-xuat", "/api/dashboard"],
};

export function canAccess(role: UserRole, pathname: string): boolean {
  if (role === "admin") return true;
  const allowed = ROLE_PAGES[role] ?? [];
  return allowed.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname.startsWith(prefix)
  );
}
