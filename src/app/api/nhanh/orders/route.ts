export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APP_ID = "77932";
const SHOPEE = 42;
const TIKTOK = 48;

async function nhanhPost(endpoint: string, token: string, businessId: string, body: object) {
  const res = await fetch(
    `https://pos.open.nhanh.vn/v3.0/${endpoint}?appId=${APP_ID}&businessId=${businessId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(body),
    }
  );
  return res.json();
}

// Lấy tất cả đơn trong khoảng thời gian, tối đa maxPages trang
async function fetchAllOrders(token: string, businessId: string, from: number, to: number, maxPages = 5) {
  const orders: Array<{
    id: number; createdAt: number; saleChannel: number;
    status: number; revenue: number; appOrderId: string; customerName: string;
  }> = [];

  let next: object = {};
  for (let page = 0; page < maxPages; page++) {
    const data = await nhanhPost("order/list", token, businessId, {
      filters: { createdFrom: from, createdTo: to },
      paginator: { size: 100, next },
    });
    if (!data.data?.length) break;

    for (const o of data.data) {
      const ch = o.channel?.saleChannel;
      if (ch !== SHOPEE && ch !== TIKTOK) continue;
      // Chỉ lấy đơn thực sự được TẠO trong khoảng thời gian
      if (o.info.createdAt < from || o.info.createdAt > to) continue;
      const revenue = (o.products || []).reduce(
        (s: number, p: { quantity: number; price: number }) => s + p.quantity * p.price, 0
      );
      orders.push({
        id: o.info.id,
        createdAt: o.info.createdAt,
        saleChannel: ch,
        status: o.info.status,
        revenue,
        appOrderId: o.channel?.appOrderId ?? "",
        customerName: o.shippingAddress?.name ?? "",
      });
    }
    if (!data.paginator?.next) break;
    next = data.paginator.next;
  }
  return orders;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    return await _get(req);
  } catch (e) {
    console.error("[nhanh/orders]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function _get(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "1");

  const tokenRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_access_token" } });
  const bizRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_business_id" } });
  if (!tokenRow?.value || !bizRow?.value)
    return NextResponse.json({ error: "Chưa kết nối Nhanh.vn" }, { status: 400 });

  const token = tokenRow.value;
  const businessId = bizRow.value;

  const now = Math.floor(Date.now() / 1000);

  // Nếu hôm nay (1 ngày): lấy live, tối đa 5 trang (~500 đơn)
  // Nếu dài hơn: thử cache trong AppSettings
  let allOrders: Awaited<ReturnType<typeof fetchAllOrders>> = [];

  if (days === 1) {
    // 00:00 hôm nay giờ VN (UTC+7)
    const nowD = new Date(now * 1000);
    const vnHours = (nowD.getUTCHours() + 7) % 24;
    const vnMins = nowD.getUTCMinutes();
    const vnSecs = nowD.getUTCSeconds();
    const from = now - vnHours * 3600 - vnMins * 60 - vnSecs;
    allOrders = await fetchAllOrders(token, businessId, from, now, 8);
  } else {
    // Thử dùng cache từ AppSettings
    const cacheKey = `nhanh_orders_cache_${days}`;
    const cacheRow = await prisma.appSettings.findUnique({ where: { key: cacheKey } });
    if (cacheRow?.value) {
      try {
        const cached = JSON.parse(cacheRow.value);
        if (Date.now() - cached.fetchedAt < 30 * 60 * 1000) { // cache 30 phút
          return NextResponse.json({ ...cached.result, cached: true });
        }
      } catch { /* ignore */ }
    }

    // Fetch mới, tối đa 15 trang (~1500 đơn)
    const from = now - days * 86400;
    allOrders = await fetchAllOrders(token, businessId, from, now, 15);

    // Lưu cache
    const result = buildResult(allOrders, days, now);
    await prisma.appSettings.upsert({
      where: { key: `nhanh_orders_cache_${days}` },
      update: { value: JSON.stringify({ fetchedAt: Date.now(), result }) },
      create: { key: `nhanh_orders_cache_${days}`, value: JSON.stringify({ fetchedAt: Date.now(), result }) },
    });
    return NextResponse.json(result);
  }

  return NextResponse.json(buildResult(allOrders, days, now));
}

function buildResult(
  allOrders: Array<{ id: number; createdAt: number; saleChannel: number; status: number; revenue: number; appOrderId: string; customerName: string }>,
  days: number,
  now: number
) {
  const shopeeOrders = allOrders.filter((o) => o.saleChannel === SHOPEE);
  const tiktokOrders = allOrders.filter((o) => o.saleChannel === TIKTOK);

  const STATUS_CANCEL = [7, 8, 9, 10, 54, 55];
  const STATUS_SHIPPING = [5, 6, 56, 57, 58, 59];
  const STATUS_DONE = [3, 4];
  const STATUS_NEW = [1, 2];

  const statRow = (orders: typeof allOrders) => {
    const active = orders.filter((o) => !STATUS_CANCEL.includes(o.status));
    const cancelled = orders.filter((o) => STATUS_CANCEL.includes(o.status));
    return {
      total: active.length,
      newOrders: active.filter((o) => STATUS_NEW.includes(o.status)).length,
      shipping: active.filter((o) => STATUS_SHIPPING.includes(o.status)).length,
      done: active.filter((o) => STATUS_DONE.includes(o.status)).length,
      cancelled: cancelled.length,
      cancelledRevenue: cancelled.reduce((s, o) => s + o.revenue, 0),
      revenue: active.reduce((s, o) => s + o.revenue, 0),
    };
  };

  // Chart theo ngày
  const dayMap: Record<string, { shopee: number; tiktok: number; shopeeOrders: number; tiktokOrders: number }> = {};
  for (let d = 0; d < days; d++) {
    const dt = new Date((now - (days - 1 - d) * 86400) * 1000);
    const key = dt.toISOString().slice(0, 10);
    dayMap[key] = { shopee: 0, tiktok: 0, shopeeOrders: 0, tiktokOrders: 0 };
  }
  for (const o of allOrders) {
    const key = new Date(o.createdAt * 1000).toISOString().slice(0, 10);
    if (!dayMap[key]) continue;
    if (o.saleChannel === SHOPEE) { dayMap[key].shopee += o.revenue; dayMap[key].shopeeOrders++; }
    else { dayMap[key].tiktok += o.revenue; dayMap[key].tiktokOrders++; }
  }

  return {
    days,
    chart: Object.entries(dayMap).map(([date, v]) => ({ date, ...v })),
    shopee: statRow(shopeeOrders),
    tiktok: statRow(tiktokOrders),
    recentOrders: allOrders.slice(0, 50),
  };
}
