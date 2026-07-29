export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

// Vercel Cron Job gọi GET — ta tự gọi lại POST sync-products
export async function GET(req: Request): Promise<NextResponse> {
  // Bảo mật: chỉ cho phép Vercel Cron (header Authorization)
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${base}/api/nhanh/sync-products`, { method: "POST" });
    const data = await res.json();
    console.log("[cron/sync-nhanh]", new Date().toISOString(), data.message ?? data.error);
    return NextResponse.json({ ok: true, result: data });
  } catch (e) {
    console.error("[cron/sync-nhanh] error", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
