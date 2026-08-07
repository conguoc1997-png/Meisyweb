export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APP_ID = "77932";

const SIZES = ["5XL", "4XL", "3XL", "2XL", "XL", "XS", "L", "M", "S"];

const COLOR_MAP: Record<string, string> = {
  VANGCHANH: "VÀNG CHANH", MUOITIEU: "MUỐI TIÊU",
  LTUAXDAM: "LỤA XANH ĐẬM", LTUAXN: "LỤA XANH NHẠT",
  XNAVY: "XANH NAVY", XBABY: "XANH BABY", XNHAT: "XANH NHẠT",
  DTHAN: "ĐEN THAN", DTHA: "ĐEN THAN",
  XDEN: "XANH ĐEN", XDAM: "XANH ĐẬM", TRANG: "TRẮNG",
  CHAM: "CHẤM", KHOI: "KHÓI", KAKI: "KAKI", NUDE: "NUDE", NAVY: "XANH NAVY",
  "2VIEN": "2 VIỀN", NAU: "NÂU", KEM: "KEM", XAM: "XÁM",
  CAM: "CAM", TIM: "TÍM", DO: "ĐỎ", XN: "XANH NHẠT",
  BO: "BÒ", BE: "BÊ", DEN: "ĐEN",
};

const COLOR_KEYS = Object.keys(COLOR_MAP).sort((a, b) => b.length - a.length);

// Safe toUpperCase — không throw nếu input không phải string
function up(s: unknown): string {
  return typeof s === "string" ? s.toUpperCase() : String(s ?? "").toUpperCase();
}

function parseSkuColor(sku: string): string | null {
  const upper = up(sku);
  for (const key of COLOR_KEYS) if (upper.includes(key)) return COLOR_MAP[key];
  return null;
}

function stripSize(sku: unknown): { base: string; size: string | null } {
  const s = typeof sku === "string" ? sku : String(sku ?? "");
  const upper = s.toUpperCase();
  for (const sz of SIZES) {
    if (upper.endsWith(sz)) return { base: s.slice(0, s.length - sz.length), size: sz };
  }
  return { base: s, size: null };
}

interface NhanhAttribute { name: string; value: string }
interface NhanhProduct {
  id: number; parentId?: number; code: string; name: string;
  attributes?: NhanhAttribute[];
  prices?: { import?: number; retail?: number };
  inventory?: { remain?: number; available?: number; shipping?: number; holding?: number; damaged?: number; transfering?: number };
}

async function fetchAllNhanhProducts(token: string, businessId: string): Promise<NhanhProduct[]> {
  const products: NhanhProduct[] = [];
  let next: string | object = "";
  for (let page = 0; page < 50; page++) {
    const res = await fetch(
      `https://pos.open.nhanh.vn/v3.0/product/list?appId=${APP_ID}&businessId=${businessId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ filters: {}, paginator: { size: 100, next } }),
      }
    );
    const data = await res.json() as { data?: NhanhProduct[]; paginator?: { next?: string | object } };
    if (!data.data?.length) break;
    products.push(...data.data);
    if (!data.paginator?.next) break;
    next = data.paginator.next;
  }
  return products;
}

export async function POST(): Promise<NextResponse> {
  try {
    const tokenRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_access_token" } });
    const bizRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_business_id" } });
    if (!tokenRow?.value || !bizRow?.value)
      return NextResponse.json({ error: "Chưa kết nối Nhanh.vn" }, { status: 400 });

    // 1. Lấy tất cả sản phẩm local, index theo SKU
    const localAll = await prisma.sanPham.findMany();
    const localBySku = new Map(localAll.map(p => [up(p.sku), p]));

    // Đọc mapping thủ công (localSku → nhanhBaseSku)
    const mappingRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_sku_mapping" } });
    const skuMapping: Record<string, string> = mappingRow?.value ? JSON.parse(mappingRow.value) : {};

    // Reverse map: nhanhBase → localSku
    const reverseMapping = new Map<string, string>();
    for (const [localSku, nhanhBase] of Object.entries(skuMapping)) {
      reverseMapping.set(up(nhanhBase), up(localSku));
    }

    // 2. Lấy variants từ Nhanh (có parentId + attributes)
    const nhanhProducts = await fetchAllNhanhProducts(tokenRow.value, bizRow.value);
    const nhanhVariants = nhanhProducts.filter(p => p.code && typeof p.code === "string" && p.parentId && p.parentId > 0 && p.attributes?.length);

    // Thêm cột nếu chưa có
    await prisma.$executeRawUnsafe(`ALTER TABLE "SanPham" ADD COLUMN IF NOT EXISTS "hangTrenDuong" INTEGER NOT NULL DEFAULT 0`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "SanPham" ADD COLUMN IF NOT EXISTS "hangTamGiu" INTEGER NOT NULL DEFAULT 0`);

    // Map SKU Nhanh → inventory (exact match)
    interface InvData { remain: number; oneway: number; reserve: number }
    const nhanhInvMap = new Map<string, InvData>();
    for (const p of nhanhProducts) {
      if (!p.code || typeof p.code !== "string") continue;
      if (p.inventory?.remain !== undefined) {
        nhanhInvMap.set(up(p.code), {
          remain: p.inventory.remain ?? 0,
          oneway: p.inventory.shipping ?? 0,
          reserve: p.inventory.holding ?? 0,
        });
      }
    }

    // Pre-compute: local SKU nào có size variants trong Nhanh (sẽ bị zero-out stock)
    const localSkusWithVariants = new Set<string>();
    for (const variant of nhanhVariants) {
      const nhanhBaseUp = up(stripSize(variant.code).base);
      if (localBySku.has(nhanhBaseUp)) localSkusWithVariants.add(nhanhBaseUp);
      const mappedLocal = reverseMapping.get(nhanhBaseUp);
      if (mappedLocal) localSkusWithVariants.add(mappedLocal);
    }

    let colorUpdated = 0;
    let sizeCreated = 0;
    let tonKhoUpdated = 0;
    let sizeSkipped = 0;
    const localNoMatch: string[] = [];   // local SKU không tìm được stock Nhanh
    const nhanhNoParent: string[] = [];  // Nhanh variant không có parent local

    // 3. Cập nhật màu + tồn kho cho tất cả local SP đã có
    for (const local of localAll) {
      const color = parseSkuColor(local.sku);
      const isNhanhVariant = nhanhVariants.some(v => up(v.code) === up(local.sku));
      const sizeWrong = local.size && !isNhanhVariant;
      const colorChanged = color && color !== local.mauSac;

      // Nếu local SKU này là "cha" của size variants → zero-out tonKho để tránh double-count
      if (localSkusWithVariants.has(up(local.sku))) {
        const needUpdate = colorChanged || sizeWrong || local.tonKho !== 0;
        if (needUpdate) {
          await prisma.sanPham.update({
            where: { id: local.id },
            data: {
              ...(colorChanged ? { mauSac: color } : {}),
              ...(sizeWrong ? { size: null } : {}),
              tonKho: 0,
            },
          });
          if (colorChanged) colorUpdated++;
          if (local.tonKho !== 0) tonKhoUpdated++;
        }
        continue;
      }

      // Sản phẩm đơn (không có size variants): sync tồn kho + oneway + reserve từ Nhanh
      const nhanhInv = nhanhInvMap.get(up(local.sku));
      if (nhanhInv === undefined) localNoMatch.push(local.sku);
      const stockChanged = nhanhInv !== undefined && nhanhInv.remain !== local.tonKho;

      if (!colorChanged && !stockChanged && !sizeWrong) continue;
      await prisma.$executeRawUnsafe(
        `UPDATE "SanPham" SET "mauSac"=$2,"size"=$3,"tonKho"=$4,"hangTrenDuong"=$5,"hangTamGiu"=$6,"updatedAt"=now() WHERE id=$1`,
        local.id,
        colorChanged ? color : (local.mauSac ?? null),
        sizeWrong ? null : local.size,
        nhanhInv ? nhanhInv.remain : local.tonKho,
        nhanhInv ? nhanhInv.oneway : 0,
        nhanhInv ? nhanhInv.reserve : 0,
      );
      if (colorChanged) colorUpdated++;
      if (stockChanged) tonKhoUpdated++;
    }

    // 4. Tạo size variants từ Nhanh (nếu chưa có trong local)
    for (const variant of nhanhVariants) {
      const nhanhSku = up(variant.code);
      if (localBySku.has(nhanhSku)) {
        // Cập nhật tồn kho + oneway + reserve cho size variant đã tồn tại
        const existLocal = localBySku.get(nhanhSku)!;
        const inv = variant.inventory;
        if (inv) {
          await prisma.$executeRawUnsafe(
            `UPDATE "SanPham" SET "tonKho"=$2,"hangTrenDuong"=$3,"hangTamGiu"=$4,"updatedAt"=now() WHERE id=$1`,
            existLocal.id, inv.remain ?? 0, inv.shipping ?? 0, inv.holding ?? 0
          );
          if ((inv.remain ?? 0) !== existLocal.tonKho) tonKhoUpdated++;
        }
        sizeSkipped++; continue;
      }

      const { base, size } = stripSize(variant.code);
      if (!size) continue;

      // Tìm parent local: thử direct base match trước, sau đó reverse mapping
      const nhanhBaseUp = up(base);
      const parentLocal = localBySku.get(nhanhBaseUp)
        ?? localBySku.get(reverseMapping.get(nhanhBaseUp) ?? "");
      if (!parentLocal) { nhanhNoParent.push(variant.code); continue; }

      const colorAttr = variant.attributes?.find(a =>
        a.name.toLowerCase().includes("màu") || a.name.toLowerCase().includes("color")
      );
      const sizeAttr = variant.attributes?.find(a =>
        a.name.toLowerCase().includes("kích") || a.name.toLowerCase().includes("size")
      );

      const mauSac = colorAttr?.value ?? parentLocal.mauSac ?? parseSkuColor(variant.code);
      const sizeVal = sizeAttr?.value ?? size;
      const tonKho = variant.inventory?.remain ?? 0;
      const hangTrenDuong = variant.inventory?.shipping ?? 0;
      const hangTamGiu = variant.inventory?.holding ?? 0;
      const ten = parentLocal.ten + " - " + sizeVal;

      await prisma.$executeRawUnsafe(
        `INSERT INTO "SanPham"(id,sku,ten,"mauSac",size,"giaNhap","giaBan","tonKho","hangTrenDuong","hangTamGiu",nguon,"createdAt","updatedAt")
         VALUES(gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now())`,
        variant.code, ten, mauSac ?? null, sizeVal,
        parentLocal.giaNhap, parentLocal.giaBan, tonKho, hangTrenDuong, hangTamGiu,
        parentLocal.nguon
      );

      localBySku.set(nhanhSku, { id: "", sku: variant.code, ten, mauSac: mauSac ?? null, size: sizeVal, giaNhap: parentLocal.giaNhap, giaBan: parentLocal.giaBan, tonKho, nguon: parentLocal.nguon, tiktokProductId: null, createdAt: new Date(), updatedAt: new Date(), dinhLuong: null, tenVai: null, giaVai: null, loaiGiaCong: null, giaGiaCong: null } as Parameters<typeof localBySku.set>[1]);
      sizeCreated++;
      if (tonKho > 0) tonKhoUpdated++;
    }

    // Lưu thời gian sync cuối
    await prisma.appSettings.upsert({
      where: { key: "nhanh_last_sync" },
      update: { value: new Date().toISOString() },
      create: { key: "nhanh_last_sync", value: new Date().toISOString() },
    });

    return NextResponse.json({
      ok: true,
      colorUpdated,
      sizeCreated,
      tonKhoUpdated,
      localNoMatch,
      nhanhNoParent,
      message: `Cập nhật màu: ${colorUpdated} · Tạo biến thể size: ${sizeCreated} · Cập nhật tồn kho: ${tonKhoUpdated} · Local không tìm được Nhanh: ${localNoMatch.length} · Nhanh không có parent local: ${nhanhNoParent.length}`,
    });
  } catch (e) {
    console.error("[sync-products]", e);
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
