export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/koc/import-tiktok
// Body: { thang: "2026-05", rows: [{ tiktokProductId, creatorName, donHang, doanhThu, hoaHong, hoanTien, soMon }] }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { thang, rows } = body as {
      thang: string;
      rows: {
        tiktokProductId: string;
        creatorName: string;
        donHang: number;
        doanhThu: number;
        hoaHong: number;
        hoanTien: number;
        soMon: number;
      }[];
    };

    if (!thang || !rows?.length) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // Load all products with tiktokProductId
    const allSanPhams = await prisma.sanPham.findMany({
      select: { id: true, ten: true, sku: true, tiktokProductId: true },
    });
    const productMap = new Map(
      allSanPhams.filter(s => s.tiktokProductId).map(s => [s.tiktokProductId!, s])
    );

    // Load all KOCs
    const allKOCs = await prisma.kOC.findMany({ select: { id: true, ten: true } });
    const kocMap = new Map(allKOCs.map(k => [k.ten.toLowerCase().trim(), k]));

    // ── Aggregate by tiktokProductId ──
    const spAgg = new Map<string, { donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const pid = row.tiktokProductId;
      const existing = spAgg.get(pid);
      if (existing) {
        existing.donHang  += row.donHang;
        existing.doanhThu += row.doanhThu;
        existing.hoaHong  += row.hoaHong;
        existing.hoanTien += row.hoanTien;
        existing.soMon    += row.soMon;
      } else {
        spAgg.set(pid, { donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
      }
    }

    // ── Aggregate by creatorName ──
    const kocAgg = new Map<string, { donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }>();
    for (const row of rows) {
      const name = row.creatorName;
      const existing = kocAgg.get(name);
      if (existing) {
        existing.donHang  += row.donHang;
        existing.doanhThu += row.doanhThu;
        existing.hoaHong  += row.hoaHong;
        existing.hoanTien += row.hoanTien;
        existing.soMon    += row.soMon;
      } else {
        kocAgg.set(name, { donHang: row.donHang, doanhThu: row.doanhThu, hoaHong: row.hoaHong, hoanTien: row.hoanTien, soMon: row.soMon });
      }
    }

    const unmatchedProducts: string[] = [];
    const newKOCs: string[] = [];

    // ── Upsert TiktokDoanhThuSP ──
    for (const [pid, agg] of spAgg) {
      const sp = productMap.get(pid);
      if (!sp) {
        unmatchedProducts.push(pid);
        continue;
      }
      await prisma.tiktokDoanhThuSP.upsert({
        where: { sanPhamId_thang: { sanPhamId: sp.id, thang } },
        update: { doanhThu: agg.doanhThu, donHang: agg.donHang, hoaHong: agg.hoaHong, hoanTien: agg.hoanTien, soMon: agg.soMon },
        create: { sanPhamId: sp.id, thang, doanhThu: agg.doanhThu, donHang: agg.donHang, hoaHong: agg.hoaHong, hoanTien: agg.hoanTien, soMon: agg.soMon },
      });
    }

    // ── Upsert TiktokDoanhThuKOC (auto-create KOC if missing) ──
    for (const [creatorName, agg] of kocAgg) {
      let koc = kocMap.get(creatorName.toLowerCase().trim());

      if (!koc) {
        // Tự tạo KOC mới
        const newKoc = await prisma.kOC.create({
          data: { ten: creatorName, platform: "tiktok", follower: 0, giaCast: 0 },
        });
        koc = { id: newKoc.id, ten: newKoc.ten };
        kocMap.set(creatorName.toLowerCase().trim(), koc);
        newKOCs.push(creatorName);
      }

      await prisma.tiktokDoanhThuKOC.upsert({
        where: { kocId_thang: { kocId: koc.id, thang } },
        update: { doanhThu: agg.doanhThu, donHang: agg.donHang, hoaHong: agg.hoaHong, hoanTien: agg.hoanTien, soMon: agg.soMon, creatorName },
        create: { kocId: koc.id, thang, creatorName, doanhThu: agg.doanhThu, donHang: agg.donHang, hoaHong: agg.hoaHong, hoanTien: agg.hoanTien, soMon: agg.soMon },
      });
    }

    return NextResponse.json({
      success: true,
      thang,
      spSaved: spAgg.size - unmatchedProducts.length,
      spTotal: spAgg.size,
      kocSaved: kocAgg.size,
      newKOCs,
      unmatchedProducts,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
