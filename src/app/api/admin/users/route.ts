export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth-server";

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: msg === "UNAUTHORIZED" ? "Chưa đăng nhập" : "Không có quyền" }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
  }

  // Dùng raw SQL để lấy nhanVienId (cột mới, Prisma client chưa biết)
  type UserRow = { id: string; email: string; name: string; role: string; active: boolean; createdAt: Date; nhanVienId: string | null };
  const users = await prisma.$queryRawUnsafe<UserRow[]>(
    `SELECT id, email, name, role, active, "createdAt", "nhanVienId" FROM "User" ORDER BY "createdAt" ASC`
  );
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: msg === "UNAUTHORIZED" ? "Chưa đăng nhập" : "Không có quyền" }, { status: msg === "UNAUTHORIZED" ? 401 : 403 });
  }

  const { email, name, password, role } = await req.json();
  if (!email || !name || !password || !role) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email: email.toLowerCase(), name, password: hashed, role },
      select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
  }
}
