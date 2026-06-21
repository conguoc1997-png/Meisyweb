import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  // Chỉ lấy host để identify project (không lộ password)
  const match = url.match(/@([^:/]+)/);
  const host = match ? match[1] : "unknown";
  return NextResponse.json({ host });
}
