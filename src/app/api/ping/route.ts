export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint này được Vercel Cron gọi mỗi 3 ngày lúc 8:00 sáng
// Mục đích: giữ Supabase không bị pause (Free tier tự pause sau 7 ngày không hoạt động)
export async function GET() {
  try {
    const start = Date.now();
    // Ping nhẹ: đếm số user — không tốn tài nguyên
    const count = await prisma.user.count();
    const ms = Date.now() - start;
    console.log(`[ping] DB alive — ${count} users — ${ms}ms`);
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      db_response_ms: ms,
      message: "Supabase vẫn hoạt động ✅",
    });
  } catch (e: unknown) {
    console.error("[ping] DB error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
