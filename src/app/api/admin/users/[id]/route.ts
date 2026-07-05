export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";

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
  if (body.role !== undefined) data.role = body.role;
  if (typeof body.active === "boolean") data.active = body.active;

  if (body.password) {
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
  const self = await import("@/lib/auth").then(m => m.getSessionUser());
  if (self?.id === id) {
    return NextResponse.json({ error: "Không thể xóa tài khoản đang đăng nhập" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
