export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// "Hắc Long" → "hac_long"
function toSlug(str: string): string {
  const map: Record<string, string> = {
    "à":"a","á":"a","ã":"a","ä":"a","å":"a",
    "ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a",
    "â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a",
    "è":"e","é":"e","ë":"e",
    "ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e",
    "ì":"i","í":"i","î":"i","ï":"i",
    "ò":"o","ó":"o","õ":"o","ö":"o",
    "ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o",
    "ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o",
    "ù":"u","ú":"u","û":"u","ü":"u",
    "ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u",
    "ý":"y","ÿ":"y","ỳ":"y","ỵ":"y","ỷ":"y","ỹ":"y",
    "đ":"d",
  };
  return str.toLowerCase()
    .split("")
    .map(c => map[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

// GET /api/ke-toan/cong-no/sync — trả về danh sách old keys trong PhieuNhapKho
export async function GET() {
  // Lấy tất cả distinct nhaCC values
  const rows = await prisma.phieuNhapKho.findMany({
    select: { nhaCC: true },
    distinct: ["nhaCC"],
  });
  // Lọc ra các key cũ (không phải UUID — UUID có dạng cuid/uuid dài)
  const oldKeys = rows
    .map(r => r.nhaCC)
    .filter((k): k is string => !!k && k.length < 30 && !k.includes("-"))
    .sort();
  return NextResponse.json({ oldKeys });
}

// POST /api/ke-toan/cong-no/sync
// Tạo CongNo từ PhieuNhapKho theo tên NCC (đồng bộ dữ liệu cũ)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nhaCCId, nhaCCTen, oldKey } = body;
    if (!nhaCCId || !nhaCCTen) {
      return NextResponse.json({ error: "Thiếu nhaCCId hoặc nhaCCTen" }, { status: 400 });
    }

    const slug = toSlug(nhaCCTen); // vd "Hắc Long" → "hac_long"

    const orConditions: object[] = [
      { tenNhaCC: { equals: nhaCCTen, mode: "insensitive" } },
      { tenNhaCC: { contains: nhaCCTen, mode: "insensitive" } },
      { nhaCC: { equals: nhaCCId } },
      { nhaCC: { equals: slug } },           // auto slug
      { nhaCC: { contains: slug } },         // partial match
    ];
    if (oldKey) {
      orConditions.push({ nhaCC: { equals: oldKey } });
    }

    const phieus = await prisma.phieuNhapKho.findMany({
      where: { OR: orConditions },
      orderBy: { ngay: "asc" },
    });

    if (phieus.length === 0) {
      const sample = await prisma.phieuNhapKho.findMany({
        take: 5, orderBy: { ngay: "desc" },
        select: { nhaCC: true, tenNhaCC: true },
      });
      return NextResponse.json({ created: 0, message: "Không tìm thấy phiếu nhập kho phù hợp", debug: { nhaCCTen, slug, oldKey, sample } });
    }

    // Lấy tất cả soPhieu của phiếu tìm được
    const soPhieuList = phieus.map(p => p.soPhieu);

    // Tìm CongNo đã có với soChungTu trùng (dù nhaCC là key cũ hay UUID mới)
    const existingCN = await prisma.congNo.findMany({
      where: { soChungTu: { in: soPhieuList }, loai: "mua_hang" },
      select: { id: true, soChungTu: true, nhaCC: true },
    });
    const existingMap = new Map(existingCN.map(e => [e.soChungTu, e]));

    let created = 0;
    let migrated = 0;

    for (const p of phieus) {
      const existing = existingMap.get(p.soPhieu);

      if (existing) {
        // CongNo đã tồn tại với key cũ → migrate sang nhaCCId mới
        if (existing.nhaCC !== nhaCCId) {
          await prisma.congNo.update({
            where: { id: existing.id },
            data: { nhaCC: nhaCCId },
          });
          migrated++;
        }
      } else {
        // Chưa có → tạo mới
        await prisma.congNo.create({
          data: {
            nhaCC:     nhaCCId,
            ngay:      p.ngay,
            soChungTu: p.soPhieu,
            dienGiai:  `Nhập kho NPL - ${p.soPhieu}${p.soHoaDon ? ` / HĐ ${p.soHoaDon}` : ""}`,
            loai:      "mua_hang",
            soTien:    p.tongTien,
            nguoiTao:  p.nguoiTao || null,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ created, migrated, total: phieus.length });
  } catch (e: unknown) {
    console.error("[cong-no sync]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
