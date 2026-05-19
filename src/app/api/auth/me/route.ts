export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_session")?.value;
  if (!token) return NextResponse.json(null);
  const user = await verifyToken(token);
  if (!user) return NextResponse.json(null);
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}
