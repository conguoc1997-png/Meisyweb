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

  // Đảm bảo các cột mới tồn tại trước khi query
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nhanVienId" TEXT`).catch(() => {});
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`).catch(() => {});

  type UserRow = { id: string; email: string; name: string; role: string; active: boolean; createdAt: Date; nhanVienId: string | null; avatarUrl: string | null };
  const users = await prisma.$queryRawUnsafe<UserRow[]>(
    `SELECT id, email, name, role, active, "createdAt", "nhanVienId", "avatarUrl" FROM "User" ORDER BY "createdAt" ASC`
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
  // Kiểm tra độ mạnh mật khẩu
  if (password.length < 8) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự" }, { status: 400 });
  if (!/[A-Z]/.test(password)) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 1 chữ hoa" }, { status: 400 });
  if (!/[0-9]/.test(password)) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 1 chữ số" }, { status: 400 });
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
