export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function roundDown30(minutes: number): number {
  return Math.floor(minutes / 30) * 30 / 60;
}

function calcTongGio(gioVao: string, gioRa: string, nghiTrua: number): number {
  const raw = timeToMin(gioRa) - timeToMin(gioVao) - nghiTrua;
  return raw > 0 ? roundDown30(raw) : 0;
}

// GET — danh sách nhân viên + trạng thái hôm nay
export async function GET() {
  try {
    const list = await prisma.nhanVien.findMany({
      where: { active: true },
      select: { id: true, ten: true, maNV: true, phongBan: true, loaiLuong: true },
      orderBy: { ten: "asc" },
    });

    // Lấy caLamViec qua raw SQL
    const caRows = await prisma.$queryRawUnsafe<{ id: string; gioVao: string; gioRa: string; nghiTrua: number }[]>(
      `SELECT id, "gioVao", "gioRa", "nghiTrua" FROM "CaLamViec"`
    ).catch(() => []);
    const caMap = Object.fromEntries(caRows.map(c => [c.id, c]));

    // Lấy caLamViecId từ NhanVien
    const nvCaRows = await prisma.$queryRawUnsafe<{ id: string; caLamViecId: string | null }[]>(
      `SELECT "id", "caLamViecId" FROM "NhanVien" WHERE "active" = true`
    ).catch(() => []);
    const nvCaMap = Object.fromEntries(nvCaRows.map(r => [r.id, r.caLamViecId]));

    // Chấm công hôm nay
    const now   = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const ccRows = await prisma.$queryRawUnsafe<{ nhanVienId: string; gioVao: string | null; gioRa: string | null; trangThai: string }[]>(
      `SELECT "nhanVienId", "gioVao", "gioRa", "trangThai" FROM "ChamCong" WHERE "ngay" = $1`, today
    ).catch(() => []);
    const ccMap = Object.fromEntries(ccRows.map(c => [c.nhanVienId, c]));

    return NextResponse.json(list.map(nv => {
      const caId = nvCaMap[nv.id];
      const ca   = caId ? caMap[caId] : null;
      return { ...nv, caLamViec: ca || null, homNay: ccMap[nv.id] || null };
    }));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// POST — chấm công
export async function POST(req: NextRequest) {
  try {
    const { nhanVienId, lat, lng } = await req.json();
    if (!nhanVienId || lat == null || lng == null) {
      return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 });
    }

    // Kiểm tra GPS
    const matched = LOCATIONS.find(loc => getDistance(lat, lng, loc.lat, loc.lng) <= MAX_DISTANCE_M);
    if (!matched) {
      const dist = LOCATIONS.map(loc => `${loc.name}: ${Math.round(getDistance(lat, lng, loc.lat, loc.lng))}m`).join(", ");
      return NextResponse.json({ error: `Bạn không ở trong khu vực (${dist})` }, { status: 403 });
    }

    // Lấy NhanVien + caLamViec qua raw SQL
    type NVRow = { loaiLuong: string; caLamViecId: string | null };
    const nvRows = await prisma.$queryRawUnsafe<NVRow[]>(
      `SELECT "loaiLuong", "caLamViecId" FROM "NhanVien" WHERE "id" = $1`, nhanVienId
    );
    if (!nvRows.length) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });
    const nv = nvRows[0];

    type CaRow = { gioVao: string; gioRa: string; nghiTrua: number };
    const caRows = nv.caLamViecId
      ? await prisma.$queryRawUnsafe<CaRow[]>(`SELECT "gioVao","gioRa","nghiTrua" FROM "CaLamViec" WHERE "id" = $1`, nv.caLamViecId).catch(() => [])
      : [];
    const ca = caRows[0] || null;

    const now     = new Date();
    const vnNow   = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const today   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const timeStr = vnNow.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const hourNow = vnNow.getHours() + vnNow.getMinutes() / 60;
    const gioRaCa = ca ? timeToMin(ca.gioRa) / 60 : 17;

    // Phát hiện đi muộn: so với gioVao ca + 15 phút biên độ tha
    const BIEN_DO_MUON = 5; // phút — muộn từ 5p trở lên mới đánh M
    const phutMuon = ca
      ? timeToMin(timeStr) - timeToMin(ca.gioVao) - BIEN_DO_MUON
      : 0;
    const diMuon = phutMuon > 0;

    // Lấy bản ghi hôm nay qua raw SQL
    type CCRow = { gioVao: string | null; gioRa: string | null; tongGio: number | null; trangThai: string };
    const ccRows = await prisma.$queryRawUnsafe<CCRow[]>(
      `SELECT "gioVao","gioRa","tongGio","trangThai" FROM "ChamCong" WHERE "nhanVienId"=$1 AND "ngay"=$2`,
      nhanVienId, today
    ).catch(() => []);
    const existing = ccRows[0] || null;

    // ── LƯƠNG THEO GIỜ ──────────────────────────────────────────────
    if (nv.loaiLuong === "gio") {
      if (!existing?.gioVao) {
        // Theo giờ: không đánh muộn, chỉ ghi giờ vào thực tế
        await upsertCC(nhanVienId, today, { trangThai: "di_lam", gioVao: timeStr });
        return NextResponse.json({ ok: true, action: "vao", time: timeStr, location: matched.name });
      }
      if (existing.gioVao && !existing.gioRa) {
        if (hourNow < 12) return NextResponse.json({ error: `Đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.` }, { status: 400 });
        const nghiTrua = ca?.nghiTrua ?? 90;
        const tongGio  = calcTongGio(existing.gioVao, timeStr, nghiTrua);
        await prisma.$executeRawUnsafe(
          `UPDATE "ChamCong" SET "gioRa"=$3,"tongGio"=$4 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
          nhanVienId, today, timeStr, tongGio
        );
        return NextResponse.json({ ok: true, action: "ra", time: timeStr, location: matched.name, tongGio, gioVao: existing.gioVao });
      }
      return NextResponse.json({ error: `Đã chấm đủ: Vào ${existing.gioVao} – Ra ${existing.gioRa} (${existing.tongGio}h)` }, { status: 400 });
    }

    // ── LƯƠNG CỐ ĐỊNH ────────────────────────────────────────────────
    if (!existing?.gioVao) {
      const trangThai = diMuon ? "di_muon" : "di_lam";
      const realPhutMuon = diMuon ? phutMuon + BIEN_DO_MUON : 0;
      const ghiChu = diMuon
        ? `Đến ${timeStr}, muộn ${realPhutMuon} phút (ca ${ca?.gioVao})`
        : null;
      await upsertCC(nhanVienId, today, { trangThai, gioVao: timeStr, ghiChu });
      return NextResponse.json({
        ok: true, action: "vao", time: timeStr, location: matched.name,
        diMuon, phutMuon: realPhutMuon,
        gioVaoCa: ca?.gioVao,
      });
    }
    if (existing.gioVao && !existing.gioRa) {
      if (hourNow < 12) return NextResponse.json({ error: `Đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.` }, { status: 400 });
      await prisma.$executeRawUnsafe(
        `UPDATE "ChamCong" SET "gioRa"=$3 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
        nhanVienId, today, timeStr
      );
      return NextResponse.json({ ok: true, action: "ra", time: timeStr, location: matched.name });
    }
    if (existing.gioVao && existing.gioRa) {
      if (hourNow < gioRaCa) return NextResponse.json({ error: `Đã chấm đủ: Vào ${existing.gioVao} – Ra ${existing.gioRa}` }, { status: 400 });
      const tcHours = roundDown30((hourNow - gioRaCa) * 60);
      await prisma.$executeRawUnsafe(
        `UPDATE "ChamCong" SET "tangCa"=$3 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
        nhanVienId, today, tcHours
      );
      return NextResponse.json({ ok: true, action: "tang_ca", time: timeStr, location: matched.name, tangCa: tcHours });
    }

    return NextResponse.json({ error: "Trạng thái không xác định" }, { status: 400 });
  } catch (e) {
    console.error("POST /api/checkin error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

async function upsertCC(nhanVienId: string, today: Date, data: { trangThai: string; gioVao: string; ghiChu?: string | null }) {
  const existing = await prisma.chamCong.findUnique({
    where: { nhanVienId_ngay: { nhanVienId, ngay: today } },
  });
  if (existing) {
    await prisma.$executeRawUnsafe(
      `UPDATE "ChamCong" SET "gioVao"=$3,"trangThai"=$4,"ghiChu"=$5 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
      nhanVienId, today, data.gioVao, data.trangThai, data.ghiChu ?? null
    );
  } else {
    await prisma.chamCong.create({
      data: { nhanVienId, ngay: today, trangThai: data.trangThai, ghiChu: data.ghiChu ?? null },
    });
    await prisma.$executeRawUnsafe(
      `UPDATE "ChamCong" SET "gioVao"=$3 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
      nhanVienId, today, data.gioVao
    );
  }
}
