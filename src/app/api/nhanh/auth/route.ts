export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const res = await fetch("https://nhanh.vn/api/account/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId: "77932",
        businessUsername: process.env.NHANH_USERNAME,
        businessPassword: process.env.NHANH_PASSWORD,
        secretKey: process.env.NHANH_SECRET_KEY,
      }),
    });
    const data = await res.json();
    if (!data.data?.accessToken) {
      return NextResponse.json({ error: "Lỗi lấy token", detail: data }, { status: 400 });
    }

    // Lưu vào DB
    await prisma.appSettings.upsert({
      where: { key: "nhanh_access_token" },
      update: { value: data.data.accessToken },
      create: { key: "nhanh_access_token", value: data.data.accessToken },
    });

    return NextResponse.json({ ok: true, businessId: data.data.businessId });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
