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

const COLOR_KEYS_SORTED = [
  "VANGCHANH","MUOITIEU","LTUAXDAM","LTUAXN","XNAVY","XBABY","XNHAT",
  "DTHAN","DTHA","XDEN","XDAM","TRANG","CHAM","KHOI","KAKI","NUDE","NAVY",
  "2VIEN","NAU","KEM","XAM","CAM","TIM","XN","DO","BO","BE","DEN",
].sort((a, b) => b.length - a.length);

function extractColor(sku: string): string | null {
  const up = sku.toUpperCase();
  for (const key of COLOR_KEYS_SORTED) if (up.includes(key)) return key;
  return null;
}

// Bỏ mã màu ra khỏi SKU để lấy phần base thuần
function removeColor(sku: string, color: string): string {
  const idx = sku.toUpperCase().indexOf(color);
  return idx === -1 ? sku : sku.slice(0, idx) + sku.slice(idx + color.length);
}

// So sánh 2 chuỗi thuần (prefix + char freq)
function rawSimilarity(A: string, B: string): number {
  if (A === B) return 1;
  if (!A || !B) return 0;
  let prefixLen = 0;
  while (prefixLen < A.length && prefixLen < B.length && A[prefixLen] === B[prefixLen]) prefixLen++;
  const freqA: Record<string, number> = {};
  for (const c of A) freqA[c] = (freqA[c] ?? 0) + 1;
  let common = 0;
  for (const c of B) { if (freqA[c] > 0) { common++; freqA[c]--; } }
  const charScore = (2 * common) / (A.length + B.length);
  const prefixScore = prefixLen / Math.max(A.length, B.length);
  return 0.4 * prefixScore + 0.6 * charScore;
}

// Tính điểm tương đồng: tách màu ra → so base code riêng, màu riêng
function similarity(a: string, b: string): number {
  const A = a.toUpperCase();
  const B = b.toUpperCase();
  if (A === B) return 1;

  const colorA = extractColor(A);
  const colorB = extractColor(B);

  // Khác màu → loại ngay
  if (colorA && colorB && colorA !== colorB) return 0;

  // So sánh phần base (đã bỏ màu)
  const baseA = colorA ? removeColor(A, colorA) : A;
  const baseB = colorB ? removeColor(B, colorB) : B;
  const baseScore = rawSimilarity(baseA, baseB);

  // Cùng màu → bonus
  const colorBonus = colorA && colorB && colorA === colorB ? 0.1 : 0;
  return Math.min(1, baseScore + colorBonus);
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

// GET: trả về danh sách SKU chưa khớp + gợi ý
export async function GET(): Promise<NextResponse> {
  try {
    const tokenRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_access_token" } });
    const bizRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_business_id" } });
    if (!tokenRow?.value || !bizRow?.value)
      return NextResponse.json({ error: "Chưa kết nối Nhanh.vn" }, { status: 400 });

    // Đọc mapping hiện có
    const mappingRow = await prisma.appSettings.findUnique({ where: { key: "nhanh_sku_mapping" } });
    const existingMapping: Record<string, string> = mappingRow?.value ? JSON.parse(mappingRow.value) : {};

    const nhanhAll = await fetchAllNhanhProducts(tokenRow.value, bizRow.value);

    // Tập hợp các base SKU Nhanh (bỏ size suffix) — loại bỏ parent ảo (parentId=-2)
    const nhanhBaseSet = new Set<string>();
    const nhanhStockByBase = new Map<string, number>();
    // Map base → tên gốc (để hiện trong UI)
    const nhanhBaseNames = new Map<string, string>();
    for (const p of nhanhAll) {
      if (!p.code || typeof p.code !== "string") continue;
      if (p.parentId === -2) continue;
      const base = stripSize(p.code);
      const baseUp = base.toUpperCase();
      nhanhBaseSet.add(baseUp);
      nhanhStockByBase.set(baseUp, (nhanhStockByBase.get(baseUp) ?? 0) + (p.inventory?.remain ?? 0));
      if (!nhanhBaseNames.has(baseUp)) {
        const name = typeof p.name === "string" ? p.name : "";
        const nameParts = name.split(" - ");
        nhanhBaseNames.set(baseUp, nameParts.slice(0, -1).join(" - ") || name);
      }
    }
    const nhanhBases = Array.from(nhanhBaseSet);

    // Local SKU chưa có trong Nhanh và chưa có mapping
    const localAll = await prisma.sanPham.findMany({ select: { sku: true, ten: true, mauSac: true } });
    const localParents = localAll.filter(p => !p.sku.match(new RegExp(`(${SIZES.join("|")})$`, "i")));
    const localSkuSet = new Set(localParents.map(p => p.sku.toUpperCase()));
    // reverse mapping: nhanhBase → localSku
    const reverseMapping = new Map(Object.entries(existingMapping).map(([k, v]) => [v.toUpperCase(), k]));

    const unmatched: Array<{
      localSku: string; ten: string; mauSac: string | null;
      suggestions: Array<{ nhanhBase: string; nhanhName: string; score: number; totalStock: number }>;
    }> = [];

    for (const local of localParents) {
      const upper = local.sku.toUpperCase();
      if (nhanhBaseSet.has(upper) || existingMapping[upper]) continue;

      const scored = nhanhBases.map(nb => {
        const nhanhName = nhanhBaseNames.get(nb) ?? "";
        const nameContains = nhanhName.toUpperCase().includes(upper) ? 1.0 : 0;
        const codeScore = similarity(upper, nb);
        const score = nameContains > 0 ? nameContains : codeScore;
        return { nhanhBase: nb, nhanhName, score, totalStock: nhanhStockByBase.get(nb) ?? 0 };
      })
        .filter(x => x.score >= 0.6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (scored.length > 0) {
        unmatched.push({ localSku: local.sku, ten: local.ten, mauSac: local.mauSac, suggestions: scored });
      }
    }

    // Nhanh base không có parent local (ngược lại)
    const nhanhUnmatched: Array<{
      nhanhBase: string; nhanhName: string; totalStock: number;
      suggestions: Array<{ localSku: string; ten: string; score: number }>;
    }> = [];

    const localSkuArr = localParents.map(p => ({ sku: p.sku, ten: p.ten }));
    for (const nb of nhanhBases) {
      if (localSkuSet.has(nb) || reverseMapping.has(nb)) continue;

      const nhanhName = nhanhBaseNames.get(nb) ?? "";
      const scored = localSkuArr.map(local => {
        const upper = local.sku.toUpperCase();
        const nameContains = nhanhName.toUpperCase().includes(upper) ? 1.0 : 0;
        const codeScore = similarity(upper, nb);
        const score = nameContains > 0 ? nameContains : codeScore;
        return { localSku: local.sku, ten: local.ten, score };
      })
        .filter(x => x.score >= 0.6)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      if (scored.length > 0) {
        nhanhUnmatched.push({ nhanhBase: nb, nhanhName, totalStock: nhanhStockByBase.get(nb) ?? 0, suggestions: scored });
      }
    }

    return NextResponse.json({ unmatched, nhanhUnmatched, existingMapping });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST: lưu mapping đã chọn
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
