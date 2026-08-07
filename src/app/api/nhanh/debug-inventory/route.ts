export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APP_ID = "77932";

export async function GET(): Promise<NextResponse> {
  try {
    const tokenRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_access_token" } });
    const bizRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_business_id" } });
    if (!tokenRow?.value || !bizRow?.value)
      return NextResponse.json({ error: "Chưa kết nối Nhanh.vn" }, { status: 400 });

    const res = await fetch(
      `https://pos.open.nhanh.vn/v3.0/product/list?appId=${APP_ID}&businessId=${bizRow.value}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: tokenRow.value },
        body: JSON.stringify({ filters: {}, paginator: { size: 10, next: "" } }),
      }
    );
    const data = await res.json();
    // Trả về 10 sản phẩm đầu với toàn bộ thông tin inventory để xem field names
    const sample = (data.data ?? []).slice(0, 10).map((p: Record<string, unknown>) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      parentId: p.parentId,
      inventory: p.inventory,  // raw inventory object - xem có những field gì
      prices: p.prices,
    }));
    return NextResponse.json({ sample, totalFetched: data.data?.length ?? 0, paginator: data.paginator });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
