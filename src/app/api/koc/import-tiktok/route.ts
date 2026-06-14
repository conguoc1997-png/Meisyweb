export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
const cuid = () => crypto.randomUUID().replace(/-/g, "").slice(0, 24);

// POST /api/koc/import-tiktok
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thang, rows } = body as {
      thang: string;
      rows: { tiktokProductId: string; creatorName: string; donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }[];
    };

    if (!thang || !rows?.length) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // ── Load lookup data in parallel ──
    const [allSanPhams, allKOCs] = await Promise.all([
      prisma.sanPham.findMany({ select: { id: true, tiktokProductId: true } }),
      prisma.kOC.findMany({ select: { id: true, ten: true } }),
    ]);

    // Map exact + fuzzy (15 ký tự đầu) vì Excel làm tròn số lớn
    const productMap = new Map<string, string>();
    for (const s of allSanPhams) {
      if (!s.tiktokProductId) continue;
      productMap.set(s.tiktokProductId, s.id);
      productMap.set(s.tiktokProductId.slice(0, 15), s.id);
    }
    const kocMap = new Map(allKOCs.map(k => [k.ten.toLowerCase().trim(), k.id]));

    // ── Aggregate spAgg by tiktokProductId ──
    const spAgg = new Map<string, { donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const e = spAgg.get(row.tiktokProductId);
      if (e) { e.donHang += row.donHang; e.doanhThu += row.doanhThu; e.hoaHong += row.hoaHong; e.hoanTien += row.hoanTien; e.soMon += row.soMon; }
      else spAgg.set(row.tiktokProductId, { donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
    }

    // ── Aggregate kocAgg by (creatorName × tiktokProductId) ──
    type KocAggKey = string; // "creatorName|||tiktokProductId"
    const kocAgg = new Map<KocAggKey, { creatorName: string; tiktokProductId: string; donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const key = `${row.creatorName}|||${row.tiktokProductId}`;
      const e = kocAgg.get(key);
      if (e) { e.donHang += row.donHang; e.doanhThu += row.doanhThu; e.hoaHong += row.hoaHong; e.hoanTien += row.hoanTien; e.soMon += row.soMon; }
      else kocAgg.set(key, { creatorName: row.creatorName, tiktokProductId: row.tiktokProductId, donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
    }

    // ── Auto-create missing KOCs in one batch ──
    const allCreatorNames = [...new Set([...kocAgg.values()].map(v => v.creatorName))];
    const newKOCNames = allCreatorNames.filter(name => !kocMap.has(name.toLowerCase().trim()));
    const newKOCs: string[] = [];
    if (newKOCNames.length > 0) {
      const toCreate = newKOCNames.map(name => ({ id: cuid(), ten: name, platform: "tiktok", follower: 0, giaCast: 0 }));
      await prisma.kOC.createMany({ data: toCreate, skipDuplicates: true });
      for (const k of toCreate) {
        kocMap.set(k.ten.toLowerCase().trim(), k.id);
        newKOCs.push(k.ten);
      }
    }

    // ── Xóa data cũ tháng này rồi insert mới ──
    const matchedSpIds = [...spAgg.entries()]
      .map(([pid]) => productMap.get(pid) ?? productMap.get(pid.slice(0, 15)))
      .filter(Boolean) as string[];
    const matchedKocIds = allCreatorNames
      .map(name => kocMap.get(name.toLowerCase().trim()))
      .filter(Boolean) as string[];

    await Promise.all([
      matchedSpIds.length > 0 ? prisma.tiktokDoanhThuSP.deleteMany({ where: { thang, sanPhamId: { in: matchedSpIds } } }) : Promise.resolve(),
      matchedKocIds.length > 0 ? prisma.tiktokDoanhThuKOC.deleteMany({ where: { thang, kocId: { in: matchedKocIds } } }) : Promise.resolve(),
    ]);

    // ── Batch insert SP — group by sanPhamId to avoid duplicate (sanPhamId,thang) ──
    const unmatchedProducts: string[] = [];
    const spBySpId = new Map<string, { doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const [pid, agg] of spAgg) {
      const spId = productMap.get(pid) ?? productMap.get(pid.slice(0, 15));
      if (!spId) { unmatchedProducts.push(pid); continue; }
      const existing = spBySpId.get(spId);
      if (existing) {
        existing.doanhThu += agg.doanhThu; existing.donHang += agg.donHang;
        existing.hoaHong  += agg.hoaHong;  existing.hoanTien += agg.hoanTien; existing.soMon += agg.soMon;
      } else {
        spBySpId.set(spId, { ...agg });
      }
    }
    const spInsert = [...spBySpId.entries()].map(([spId, agg]) => ({ id: cuid(), sanPhamId: spId, thang, ...agg }));

    // ── Batch insert KOC — per (kocId × tiktokProductId) ──
    const kocInsert: { id: string; kocId: string; thang: string; creatorName: string; tiktokProductId: string | null; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number }[] = [];
    for (const agg of kocAgg.values()) {
      const kocId = kocMap.get(agg.creatorName.toLowerCase().trim());
      if (!kocId) continue;
      kocInsert.push({ id: cuid(), kocId, thang, creatorName: agg.creatorName, tiktokProductId: agg.tiktokProductId, ...{ doanhThu: agg.doanhThu, donHang: agg.donHang, hoaHong: agg.hoaHong, hoanTien: agg.hoanTien, soMon: agg.soMon } });
    }

    await Promise.all([
      spInsert.length > 0 ? prisma.tiktokDoanhThuSP.createMany({ data: spInsert }) : Promise.resolve(),
      kocInsert.length > 0 ? prisma.tiktokDoanhThuKOC.createMany({ data: kocInsert }) : Promise.resolve(),
    ]);

    return NextResponse.json({
      success: true, thang,
      spSaved: spInsert.length, spTotal: spAgg.size,
      kocSaved: kocInsert.length,
      newKOCs, unmatchedProducts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
