export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Log tất cả params để debug
  const allParams: Record<string, string> = {};
  searchParams.forEach((v, k) => { allParams[k] = v; });
  console.log("[Nhanh Callback] params:", JSON.stringify(allParams));

  const accessCode = searchParams.get("accessCode") ?? searchParams.get("code") ?? searchParams.get("access_code");
  if (!accessCode) return NextResponse.json({ error: "Thiếu accessCode", params: allParams }, { status: 400 });

  // Đổi accessCode → accessToken
  const appId = "77932";
  const secretKey = "eDru8EHjHlBKVdrMpmxB0qyv0CXM2TV7CkXBwAVb4hVcpVZAAfK177Uy4UfoVpJuGS52ketazDhUehSNEcrw7f91DEPAuSeEL6DvAaLBq7o4mgurNXuZZ8WEa7KoYVTN";

  const resV3 = await fetch(`https://pos.open.nhanh.vn/v3.0/app/getaccesstoken?appId=${appId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessCode, secretKey }),
  });
  const data = await resV3.json() as { code: number; data?: { accessToken?: string; businessId?: number } };
  console.log("[Nhanh Callback v3]", JSON.stringify(data).slice(0, 200));

  const token = data.data?.accessToken;
  const businessId = data.data?.businessId;
  if (!token) {
    return new NextResponse(`Lỗi lấy token: ${JSON.stringify(data)}`, { status: 400 });
  }

  // Lưu token vào DB
  await prisma.appSettings.upsert({
    where: { key: "nhanh_access_token" },
    update: { value: token },
    create: { key: "nhanh_access_token", value: token },
  });
  await prisma.appSettings.upsert({
    where: { key: "nhanh_business_id" },
    update: { value: String(businessId) },
    create: { key: "nhanh_business_id", value: String(businessId) },
  });

  return new NextResponse(`
    <html><body style="font-family:sans-serif;padding:40px">
      <h2>✅ Kết nối Nhanh.vn thành công!</h2>
      <p>Access Token đã được lưu. Bạn có thể đóng trang này.</p>
    </body></html>
  `, { headers: { "Content-Type": "text/html" } });
}
