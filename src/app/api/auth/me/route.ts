export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json(null);

  const user = await verifyToken(token);
  if (!user) {
    // Token hết hạn — xóa cookie
    const res = NextResponse.json(null);
    res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Kiểm tra DB: user còn active không? Role có bị thay đổi không?
  if (user.id !== "admin_fallback") {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { active: true, role: true, name: true },
      });

      // Bị vô hiệu hóa hoặc không còn tồn tại → đăng xuất ngay
      if (!dbUser || !dbUser.active) {
        const res = NextResponse.json(null);
        res.cookies.set("auth_session", "", { maxAge: 0, path: "/" });
        return res;
      }

      // Role đã thay đổi → trả về role mới nhất từ DB (token sẽ cũ nhưng data đúng)
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: dbUser.name,
        role: dbUser.role, // luôn lấy từ DB, không tin token
      });
    } catch {
      // DB lỗi → vẫn trả về từ token (graceful degradation)
    }
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
