import { NextResponse } from "next/server";

// API này không còn cần thiết (hoKinhDoanh đã bị xóa khỏi schema)
export async function POST() {
  return NextResponse.json({ ok: true, message: "Migration không cần thiết nữa" });
}
