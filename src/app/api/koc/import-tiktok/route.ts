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

    const productMap = new Map(allSanPhams.filter(s => s.tiktokProductId).map(s => [s.tiktokProductId!, s.id]));
    const kocMap = new Map(allKOCs.map(k => [k.ten.toLowerCase().trim(), k.id]));

    // ── Aggregate by tiktokProductId ──
    const spAgg = new Map<string, { donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const e = spAgg.get(row.tiktokProductId);
      if (e) { e.donHang += row.donHang; e.doanhThu += row.doanhThu; e.hoaHong += row.hoaHong; e.hoanTien += row.hoanTien; e.soMon += row.soMon; }
      else spAgg.set(row.tiktokProductId, { donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
    }

    // ── Aggregate by creatorName ──
    const kocAgg = new Map<string, { donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const e = kocAgg.get(row.creatorName);
      if (e) { e.donHang += row.donHang; e.doanhThu += row.doanhThu; e.hoaHong += row.hoaHong; e.hoanTien += row.hoanTien; e.soMon += row.soMon; }
      else kocAgg.set(row.creatorName, { donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
    }

    // ── Auto-create missing KOCs in one batch ──
    const newKOCNames = [...kocAgg.keys()].filter(name => !kocMap.has(name.toLowerCase().trim()));
    const newKOCs: string[] = [];
    if (newKOCNames.length > 0) {
      const toCreate = newKOCNames.map(name => ({ id: cuid(), ten: name, platform: "tiktok", follower: 0, giaCast: 0 }));
      await prisma.kOC.createMany({ data: toCreate, skipDuplicates: true });
      for (const k of toCreate) {
        kocMap.set(k.ten.toLowerCase().trim(), k.id);
        newKOCs.push(k.ten);
      }
    }

    // ── Xóa data cũ tháng này rồi insert mới (nhanh hơn upsert nhiều dòng) ──
    const matchedSpIds = [...spAgg.entries()]
      .map(([pid]) => productMap.get(pid))
      .filter(Boolean) as string[];
    const matchedKocIds = [...kocAgg.keys()]
      .map(name => kocMap.get(name.toLowerCase().trim()))
      .filter(Boolean) as string[];

    await Promise.all([
      matchedSpIds.length > 0 ? prisma.tiktokDoanhThuSP.deleteMany({ where: { thang, sanPhamId: { in: matchedSpIds } } }) : Promise.resolve(),
      matchedKocIds.length > 0 ? prisma.tiktokDoanhThuKOC.deleteMany({ where: { thang, kocId: { in: matchedKocIds } } }) : Promise.resolve(),
    ]);

    // ── Batch insert ──
    const unmatchedProducts: string[] = [];
    const spInsert: { id: string; sanPhamId: string; thang: string; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number }[] = [];
    for (const [pid, agg] of spAgg) {
      const spId = productMap.get(pid);
      if (!spId) { unmatchedProducts.push(pid); continue; }
      spInsert.push({ id: cuid(), sanPhamId: spId, thang, ...agg });
    }

    const kocInsert: { id: string; kocId: string; thang: string; creatorName: string; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number }[] = [];
    for (const [name, agg] of kocAgg) {
      const kocId = kocMap.get(name.toLowerCase().trim());
      if (!kocId) continue;
      kocInsert.push({ id: cuid(), kocId, thang, creatorName: name, ...agg });
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
