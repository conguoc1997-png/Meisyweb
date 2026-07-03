export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Tọa độ 2 địa điểm ──────────────────────────────────────────────
const LOCATIONS = [
  { name: "Văn phòng Gia Lâm", lat: 21.0019011, lng: 105.9462694 },
  { name: "Xưởng Bắc Ninh",    lat: 21.0990275, lng: 106.2232627 },
];
const MAX_DISTANCE_M = 150; // bán kính cho phép (mét)

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/checkin — lấy danh sách nhân viên active
export async function GET() {
  try {
    const list = await prisma.nhanVien.findMany({
      where: { active: true },
      select: { id: true, ten: true, maNV: true, phongBan: true },
      orderBy: { ten: "asc" },
    });
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/checkin — chấm công bằng GPS
export async function POST(req: NextRequest) {
  try {
    const { nhanVienId, lat, lng } = await req.json();
    if (!nhanVienId || lat == null || lng == null) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra GPS có trong vùng cho phép không
    const matched = LOCATIONS.find(
      (loc) => getDistance(lat, lng, loc.lat, loc.lng) <= MAX_DISTANCE_M
    );
    if (!matched) {
      const distances = LOCATIONS.map(
        (loc) => `${loc.name}: ${Math.round(getDistance(lat, lng, loc.lat, loc.lng))}m`
      ).join(", ");
      return NextResponse.json(
        { error: `Bạn không ở trong khu vực xưởng (${distances})` },
        { status: 403 }
      );
    }

    // Ngày hôm nay (UTC 0h)
    const now   = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh",
    });

    // Upsert: vào lần đầu → tạo, vào lần 2 → ghi giờ ra
    const existing = await prisma.chamCong.findUnique({
      where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
    });

    if (!existing) {
      await prisma.chamCong.create({
        data: {
          nhanVienId,
          ngay:       today,
          trangThai:  "X",
          ghiChu:     `Vào: ${timeStr} (${matched.name})`,
        },
      });
      return NextResponse.json({ ok: true, action: "vao", time: timeStr, location: matched.name });
    } else {
      const ghiChuMoi = existing.ghiChu
        ? `${existing.ghiChu} | Ra: ${timeStr}`
        : `Ra: ${timeStr} (${matched.name})`;
      await prisma.chamCong.update({
        where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
        data: { ghiChu: ghiChuMoi },
      });
      return NextResponse.json({ ok: true, action: "ra", time: timeStr, location: matched.name });
    }
  } catch (e) {
    console.error("POST /api/checkin error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
