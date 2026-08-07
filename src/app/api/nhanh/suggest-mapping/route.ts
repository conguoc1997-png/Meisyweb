export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APP_ID = "77932";

const SIZES = ["5XL", "4XL", "3XL", "2XL", "XL", "XS", "L", "M", "S"];

function stripSize(sku: string): string {
  const upper = sku.toUpperCase();
  for (const sz of SIZES) {
    if (upper.endsWith(sz)) return sku.slice(0, sku.length - sz.length);
  }
  return sku;
}

async function fetchAllNhanhProducts(token: string, businessId: string) {
  const products: Array<{ code: string; name: string; parentId: number; inventory?: { remain?: number } }> = [];
  let next: string | object = "";
  for (let page = 0; page < 50; page++) {
    const res = await fetch(
      `https://pos.open.nhanh.vn/v3.0/product/list?appId=${APP_ID}&businessId=${businessId}`,
      { method: "POST", headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ filters: {}, paginator: { size: 100, next } }) }
    );
    const data = await res.json() as { data?: typeof products; paginator?: { next?: string | object } };
    if (!data.data?.length) break;
    products.push(...data.data);
    if (!data.paginator?.next) break;
    next = data.paginator.next;
  }
  return products;
}

// GET: trả về matched pairs + unmatched Nhanh + all local SKUs
export async function GET(): Promise<NextResponse> {
  try {
    const tokenRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_access_token" } });
    const bizRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_business_id" } });
    if (!tokenRow?.value || !bizRow?.value)
      return NextResponse.json({ error: "Chưa kết nối Nhanh.vn" }, { status: 400 });

    // Đọc mapping hiện có
    const mappingRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_sku_mapping" } });
    const existingMapping: Record<string, string> = mappingRow?.value ? JSON.parse(mappingRow.value) : {};
    // reverseMapping: nhanhBase → localSku
    const reverseMapping: Record<string, string> = {};
    for (const [local, nhanh] of Object.entries(existingMapping)) {
      reverseMapping[nhanh.toUpperCase()] = local;
    }

    const nhanhAll = await fetchAllNhanhProducts(tokenRow.value, bizRow.value);

    // Build Nhanh info map
    const nhanhInfoMap = new Map<string, { name: string; stock: number }>();
    for (const p of nhanhAll) {
      if (!p.code || typeof p.code !== "string") continue;
      if (p.parentId === -2) continue;
      const base = stripSize(p.code).toUpperCase();
      const existing = nhanhInfoMap.get(base);
      const stock = (existing?.stock ?? 0) + (p.inventory?.remain ?? 0);
      if (!nhanhInfoMap.has(base)) {
        const name = typeof p.name === "string" ? p.name : "";
        const nameParts = name.split(" - ");
        nhanhInfoMap.set(base, { name: nameParts.slice(0, -1).join(" - ") || name, stock });
      } else {
        nhanhInfoMap.set(base, { name: existing!.name, stock });
      }
    }

    // All local SKUs (tất cả để user chọn thủ công)
    const localAll = await prisma.sanPham.findMany({
      select: { sku: true, ten: true, mauSac: true },
      orderBy: { sku: "asc" },
    });

    // SP đã ghép: từ existingMapping + direct SKU match
    const matched: Array<{
      localSku: string; localTen: string;
      nhanhBase: string; nhanhName: string; nhanhStock: number;
    }> = [];

    // Từ mapping đã lưu
    for (const [localSku, nhanhBase] of Object.entries(existingMapping)) {
      const local = localAll.find(p => p.sku.toUpperCase() === localSku.toUpperCase());
      const info = nhanhInfoMap.get(nhanhBase.toUpperCase());
      matched.push({
        localSku: localSku,
        localTen: local?.ten ?? localSku,
        nhanhBase: nhanhBase,
        nhanhName: info?.name ?? nhanhBase,
        nhanhStock: info?.stock ?? 0,
      });
    }

    // Cũng bao gồm SKU trùng tên trực tiếp (direct match, không cần mapping)
    for (const local of localAll) {
      const upper = local.sku.toUpperCase();
      if (existingMapping[upper]) continue; // đã trong mapping
      if (nhanhInfoMap.has(upper)) {
        const info = nhanhInfoMap.get(upper)!;
        matched.push({
          localSku: local.sku, localTen: local.ten,
          nhanhBase: local.sku.toUpperCase(),
          nhanhName: info.name, nhanhStock: info.stock,
        });
      }
    }

    const localSkuSetUpper = new Set(localAll.map(p => p.sku.toUpperCase()));

    // Xác định Nhanh base nào đã ghép qua variant trực tiếp
    // (ít nhất 1 Nhanh variant = base+size tồn tại trong local)
    const nhanhBaseMatchedViaVariant = new Set<string>();
    for (const p of nhanhAll) {
      if (!p.code || typeof p.code !== "string") continue;
      if (localSkuSetUpper.has(p.code.toUpperCase())) {
        // Variant này khớp trực tiếp → base của nó coi như đã ghép
        nhanhBaseMatchedViaVariant.add(stripSize(p.code).toUpperCase());
      }
    }

    // SP chưa ghép: Nhanh base không có variant nào tồn tại trong local
    const unmatched: Array<{ nhanhBase: string; nhanhName: string; nhanhStock: number }> = [];
    for (const [base, info] of nhanhInfoMap.entries()) {
      if (localSkuSetUpper.has(base)) continue;          // exact base match
      if (reverseMapping[base]) continue;                 // đã map thủ công
      if (nhanhBaseMatchedViaVariant.has(base)) continue; // variants đã khớp trực tiếp
      unmatched.push({ nhanhBase: base, nhanhName: info.name, nhanhStock: info.stock });
    }
    unmatched.sort((a, b) => b.nhanhStock - a.nhanhStock);

    // Danh sách local SKU để chọn trong dropdown
    const localSkus = localAll.map(p => ({ sku: p.sku, ten: p.ten }));

    return NextResponse.json({ matched, unmatched, localSkus, existingMapping });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST: lưu mapping mới
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as { mapping: Record<string, string> };
    const mappingRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_sku_mapping" } });
    const existing: Record<string, string> = mappingRow?.value ? JSON.parse(mappingRow.value) : {};
    const merged = { ...existing, ...body.mapping };
    await prisma.appSettings.upsert({
      where: { key: "nhanh_sku_mapping" },
      update: { value: JSON.stringify(merged) },
      create: { key: "nhanh_sku_mapping", value: JSON.stringify(merged) },
    });
    return NextResponse.json({ ok: true, total: Object.keys(merged).length });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE: xóa 1 mapping (body: { localSku })
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const { localSku } = await req.json() as { localSku: string };
    const mappingRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_sku_mapping" } });
    const existing: Record<string, string> = mappingRow?.value ? JSON.parse(mappingRow.value) : {};
    delete existing[localSku.toUpperCase()];
    await prisma.appSettings.upsert({
      where: { key: "nhanh_sku_mapping" },
      update: { value: JSON.stringify(existing) },
      create: { key: "nhanh_sku_mapping", value: JSON.stringify(existing) },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
