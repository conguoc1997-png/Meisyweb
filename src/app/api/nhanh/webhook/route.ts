export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.NHANH_WEBHOOK_VERIFY_TOKEN ?? "meisy2026nhanhvn";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    console.log("[Nhanh Webhook]", body.slice(0, 300));
  } catch { /* ignore */ }
  return NextResponse.json({ success: true }, { status: 200 });
}

// Nhanh.vn test bằng GET
export async function GET() {
  return NextResponse.json({ success: true }, { status: 200 });
}
