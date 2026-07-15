export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin, getSessionUser } from "@/lib/auth-server";

async function checkAdmin() {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json(
      { error: msg === "UNAUTHORIZED" ? "Chưa đăng nhập" : "Không có quyền" },
      { status: msg === "UNAUTHORIZED" ? 401 : 403 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await checkAdmin();
  if (deny) return deny;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name) data.name = body.name;
  if (body.email) {
    const newEmail = body.email.toLowerCase().trim();
    // Kiểm tra email trùng với user khác
    const existing = await prisma.user.findFirst({ where: { email: newEmail, NOT: { id } } });
    if (existing) return NextResponse.json({ error: "Email này đã được dùng bởi tài khoản khác" }, { status: 400 });
    data.email = newEmail;
  }
  if (body.role !== undefined) data.role = body.role;
  if (typeof body.active === "boolean") data.active = body.active;
  if ("nhanVienId" in body) data.nhanVienId = body.nhanVienId || null;
  if ("avatarUrl" in body) data.avatarUrl = body.avatarUrl || null;

  if (body.password) {
    if (body.password.length < 8) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự" }, { status: 400 });
    if (!/[A-Z]/.test(body.password)) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 1 chữ hoa" }, { status: 400 });
    if (!/[0-9]/.test(body.password)) return NextResponse.json({ error: "Mật khẩu phải có ít nhất 1 chữ số" }, { status: 400 });
    data.password = await bcrypt.hash(body.password, 10);
    // Nếu admin chọn "đăng xuất thiết bị khác" → tăng sessionVersion
    if (body.logoutOtherDevices) {
      // Lấy version hiện tại rồi tăng lên 1
      const current = await prisma.user.findUnique({
        where: { id },
        select: { sessionVersion: true },
      });
      data.sessionVersion = (current?.sessionVersion ?? 0) + 1;
    }
  }

  // nhanVienId + avatarUrl là cột mới chưa có trong Prisma schema → raw SQL
  if ("nhanVienId" in data || "avatarUrl" in data) {
    const sets: string[] = [];
    const vals: unknown[] = [];
    let pi = 1;
    if ("nhanVienId" in data) { sets.push(`"nhanVienId" = $${pi++}`); vals.push(data.nhanVienId); delete data.nhanVienId; }
    if ("avatarUrl" in data)  { sets.push(`"avatarUrl" = $${pi++}`);  vals.push(data.avatarUrl);  delete data.avatarUrl; }
    vals.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE "User" SET ${sets.join(", ")} WHERE id = $${pi}`,
      ...vals
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true, sessionVersion: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const deny = await checkAdmin();
  if (deny) return deny;

  const { id } = await params;

  // Không cho xóa chính mình
  const self = await getSessionUser();
  if (self?.id === id) {
    return NextResponse.json({ error: "Không thể xóa tài khoản đang đăng nhập" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
