export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

// Nhanh.vn gửi webhook khi có đơn hàng / thay đổi tồn kho
// → tự động trigger sync-products

async function triggerSync() {
  try {
    const base = process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const res = await fetch(`${base}/api/nhanh/sync-products`, { method: "POST" });
    const data = await res.json() as { message?: string; error?: string };
    console.log("[Nhanh Webhook] Sync triggered:", data.message ?? data.error);
  } catch (e) {
    console.error("[Nhanh Webhook] Sync failed:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    console.log("[Nhanh Webhook] Event received:", body.slice(0, 200));

    // Trigger sync ngay (không await để trả về nhanh cho Nhanh.vn)
    // Nhanh.vn yêu cầu response trong vài giây, sync có thể lâu hơn
    triggerSync().catch(console.error);

  } catch (e) {
    console.error("[Nhanh Webhook] Error:", e);
  }

  // Luôn trả 200 để Nhanh.vn không retry
  return NextResponse.json({ success: true }, { status: 200 });
}

// Nhanh.vn verify webhook bằng GET
export async function GET() {
  return NextResponse.json({ success: true }, { status: 200 });
}
