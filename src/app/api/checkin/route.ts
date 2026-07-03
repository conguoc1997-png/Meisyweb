export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Tọa độ 2 địa điểm ──────────────────────────────────────────────
const LOCATIONS = [
  { name: "Văn phòng Gia Lâm", lat: 21.0019011, lng: 105.9462694 },
  { name: "Xưởng Bắc Ninh",    lat: 21.0990275, lng: 106.2232627 },
];
const MAX_DISTANCE_M = 150;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Chuyển "07:30" → phút từ 00:00
function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Làm tròn xuống 30 phút: 7h45m → 7.5h, 7h20m → 7.0h
function roundDown30(minutes: number): number {
  const floor30 = Math.floor(minutes / 30) * 30;
  return floor30 / 60; // trả về số giờ
}

// Tính tổng giờ làm = (gioRa - gioVao) - nghiTrua, làm tròn xuống 30p
function calcTongGio(gioVao: string, gioRa: string, nghiTrua: number): number {
  const vao = timeToMin(gioVao);
  const ra  = timeToMin(gioRa);
  const raw = ra - vao - nghiTrua;
  return raw > 0 ? roundDown30(raw) : 0;
}

// GET /api/checkin — danh sách nhân viên + trạng thái hôm nay
export async function GET() {
  try {
    const list = await prisma.nhanVien.findMany({
      where: { active: true },
      select: {
        id: true, ten: true, maNV: true, phongBan: true,
        loaiLuong: true,
        caLamViec: { select: { gioVao: true, gioRa: true, nghiTrua: true } },
      },
      orderBy: { ten: "asc" },
    });

    // Lấy chấm công hôm nay
    const now   = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const ccs   = await prisma.chamCong.findMany({
      where: { ngay: today },
      select: { nhanVienId: true, gioVao: true, gioRa: true, trangThai: true },
    });
    const ccMap = Object.fromEntries(ccs.map(c => [c.nhanVienId, c]));

    return NextResponse.json(list.map(nv => ({ ...nv, homNay: ccMap[nv.id] || null })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST /api/checkin — chấm công
export async function POST(req: NextRequest) {
  try {
    const { nhanVienId, lat, lng } = await req.json();
    if (!nhanVienId || lat == null || lng == null) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra GPS
    const matched = LOCATIONS.find(
      (loc) => getDistance(lat, lng, loc.lat, loc.lng) <= MAX_DISTANCE_M
    );
    if (!matched) {
      const dist = LOCATIONS.map(
        (loc) => `${loc.name}: ${Math.round(getDistance(lat, lng, loc.lat, loc.lng))}m`
      ).join(", ");
      return NextResponse.json({ error: `Bạn không ở trong khu vực (${dist})` }, { status: 403 });
    }

    // Lấy thông tin nhân viên + ca làm việc
    const nv = await prisma.nhanVien.findUnique({
      where: { id: nhanVienId },
      select: {
        loaiLuong: true,
        caLamViec: { select: { gioVao: true, gioRa: true, nghiTrua: true } },
      },
    });
    if (!nv) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });

    const now      = new Date();
    const vnNow    = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const today    = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const timeStr  = vnNow.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const hourNow  = vnNow.getHours() + vnNow.getMinutes() / 60; // giờ thực tế VN

    const loaiLuong = nv.loaiLuong;
    const ca        = nv.caLamViec;
    const gioRaCa   = ca ? timeToMin(ca.gioRa) / 60 : 17; // giờ tan ca (default 17h)

    // Lấy bản ghi hôm nay
    const existing = await prisma.chamCong.findUnique({
      where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
    });

    // ── LƯƠNG THEO GIỜ ──────────────────────────────────────────────
    if (loaiLuong === "gio") {
      if (!existing || !existing.gioVao) {
        // Chưa vào → chấm VÀO
        await prisma.chamCong.upsert({
          where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
          update: { gioVao: timeStr, trangThai: "di_lam" },
          create: { nhanVienId, ngay: today, trangThai: "di_lam", gioVao: timeStr },
        });
        return NextResponse.json({ ok: true, action: "vao", time: timeStr, location: matched.name });
      }

      if (existing.gioVao && !existing.gioRa) {
        // Đã vào, chưa ra → chỉ cho chấm RA sau 12h
        if (hourNow < 12) {
          return NextResponse.json({
            error: `Bạn đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.`,
          }, { status: 400 });
        }
        // Tính tổng giờ
        const nghiTrua = ca?.nghiTrua ?? 90;
        const tongGio  = calcTongGio(existing.gioVao, timeStr, nghiTrua);
        await prisma.chamCong.update({
          where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
          data: { gioRa: timeStr, tongGio },
        });
        return NextResponse.json({
          ok: true, action: "ra", time: timeStr,
          location: matched.name, tongGio,
          gioVao: existing.gioVao,
        });
      }

      // Đã chấm đủ vào + ra
      return NextResponse.json({
        error: `Hôm nay đã chấm đủ: Vào ${existing.gioVao} – Ra ${existing.gioRa} (${existing.tongGio}h)`,
      }, { status: 400 });
    }

    // ── LƯƠNG CỐ ĐỊNH (co_ban | khoan) ─────────────────────────────
    if (!existing || !existing.gioVao) {
      // Chưa chấm → VÀO
      await prisma.chamCong.upsert({
        where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
        update: { gioVao: timeStr, trangThai: "di_lam" },
        create: { nhanVienId, ngay: today, trangThai: "di_lam", gioVao: timeStr },
      });
      return NextResponse.json({ ok: true, action: "vao", time: timeStr, location: matched.name });
    }

    if (existing.gioVao && !existing.gioRa) {
      // Đã vào → chấm RA (chỉ sau 12h)
      if (hourNow < 12) {
        return NextResponse.json({
          error: `Đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.`,
        }, { status: 400 });
      }
      await prisma.chamCong.update({
        where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
        data: { gioRa: timeStr },
      });
      return NextResponse.json({ ok: true, action: "ra", time: timeStr, location: matched.name });
    }

    // Đã chấm đủ → kiểm tra tăng ca
    if (existing.gioVao && existing.gioRa) {
      if (hourNow < gioRaCa) {
        return NextResponse.json({
          error: `Hôm nay đã chấm đủ: Vào ${existing.gioVao} – Ra ${existing.gioRa}`,
        }, { status: 400 });
      }
      // Tăng ca: thêm giờ TC vào tangCa
      const tcHours = roundDown30((hourNow - gioRaCa) * 60);
      await prisma.chamCong.update({
        where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
        data: { tangCa: tcHours },
      });
      return NextResponse.json({
        ok: true, action: "tang_ca", time: timeStr,
        location: matched.name, tangCa: tcHours,
      });
    }

    return NextResponse.json({ error: "Trạng thái không xác định" }, { status: 400 });
  } catch (e) {
    console.error("POST /api/checkin error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
