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
    const caRows = await prisma.$queryRawUnsafe<{ id: string; gioVao: string; gioRa: string; nghiTrua: number; gioVao2: string | null; gioRa2: string | null }[]>(
      `SELECT id, "gioVao", "gioRa", "nghiTrua", "gioVao2", "gioRa2" FROM "CaLamViec"`
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
    const ccRows = await prisma.$queryRawUnsafe<{ nhanVienId: string; gioVao: string | null; gioRa: string | null; gioVao2: string | null; gioRa2: string | null; trangThai: string }[]>(
      `SELECT "nhanVienId", "gioVao", "gioRa", "gioVao2", "gioRa2", "trangThai" FROM "ChamCong" WHERE "ngay" = $1`, today
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

    type CaRow = { gioVao: string; gioRa: string; nghiTrua: number; gioVao2: string | null; gioRa2: string | null };
    const caRows = nv.caLamViecId
      ? await prisma.$queryRawUnsafe<CaRow[]>(`SELECT "gioVao","gioRa","nghiTrua","gioVao2","gioRa2" FROM "CaLamViec" WHERE "id" = $1`, nv.caLamViecId).catch(() => [])
      : [];
    const ca = caRows[0] || null;

    const now     = new Date();
    const vnNow   = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    const today   = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const timeStr = vnNow.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const hourNow = vnNow.getHours() + vnNow.getMinutes() / 60;
    const gioRaCa = ca ? timeToMin(ca.gioRa) / 60 : 17;

    // Phát hiện đi muộn: so với gioVao ca + 15 phút biên độ tha
    const BIEN_DO_MUON = 5;  // phút — muộn từ 5p trở lên mới đánh M
    const BIEN_DO_VE_SOM = 5; // phút — về sớm từ 5p trở lên mới ghi
    const phutMuon = ca
      ? timeToMin(timeStr) - timeToMin(ca.gioVao) - BIEN_DO_MUON
      : 0;
    const diMuon = phutMuon > 0;

    // Lấy bản ghi hôm nay qua raw SQL
    type CCRow = { gioVao: string | null; gioRa: string | null; tongGio: number | null; trangThai: string; ghiChu: string | null; gioVao2: string | null; gioRa2: string | null };
    const ccRows = await prisma.$queryRawUnsafe<CCRow[]>(
      `SELECT "gioVao","gioRa","tongGio","trangThai","ghiChu","gioVao2","gioRa2" FROM "ChamCong" WHERE "nhanVienId"=$1 AND "ngay"=$2`,
      nhanVienId, today
    ).catch(() => []);
    const existing = ccRows[0] || null;

    // Helper: phát hiện về sớm
    function detectVeSom(gioRaCa: string, ghiChuCu: string | null, label = "") {
      const phut = timeToMin(gioRaCa) - timeToMin(timeStr);
      const veSom = phut > BIEN_DO_VE_SOM;
      const note = veSom ? `${label}Về sớm ${phut} phút (ca ${gioRaCa})` : null;
      const ghiChuMoi = note ? (ghiChuCu ? `${ghiChuCu} | ${note}` : note) : ghiChuCu;
      return { veSom, phutVeSom: veSom ? phut : 0, ghiChuMoi };
    }

    // ── LƯƠNG THEO GIỜ ──────────────────────────────────────────────
    if (nv.loaiLuong === "gio") {
      // Bước 1: chưa có gioVao → vào ca 1
      if (!existing?.gioVao) {
        await upsertCC(nhanVienId, today, { trangThai: "di_lam", gioVao: timeStr });
        return NextResponse.json({ ok: true, action: "vao", ca: 1, time: timeStr, location: matched.name });
      }
      // Bước 2: có vao, chưa ra → ra ca 1
      if (existing.gioVao && !existing.gioRa) {
        if (hourNow < 12) return NextResponse.json({ error: `Đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.` }, { status: 400 });
        const { veSom, phutVeSom, ghiChuMoi } = ca ? detectVeSom(ca.gioRa, existing.ghiChu) : { veSom: false, phutVeSom: 0, ghiChuMoi: existing.ghiChu };
        // Nếu có ca 2, tính tongGio từ shift 1 (shift 2 sẽ cộng thêm sau)
        const tongGio1 = calcTongGio(existing.gioVao, timeStr, ca?.gioVao2 ? 0 : (ca?.nghiTrua ?? 90));
        await prisma.$executeRawUnsafe(
          `UPDATE "ChamCong" SET "gioRa"=$3,"tongGio"=$4,"ghiChu"=$5 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
          nhanVienId, today, timeStr, tongGio1, ghiChuMoi
        );
        return NextResponse.json({ ok: true, action: "ra", ca: 1, time: timeStr, location: matched.name, tongGio: tongGio1, gioVao: existing.gioVao, veSom, phutVeSom, gioRaCa: ca?.gioRa, coCA2: !!ca?.gioVao2 });
      }
      // Bước 3: có vao+ra, ca có gioVao2, chưa vào ca 2
      if (existing.gioVao && existing.gioRa && ca?.gioVao2 && !existing.gioVao2) {
        const minVao2 = timeToMin(ca.gioVao2) - 30;
        if (timeToMin(timeStr) < minVao2) return NextResponse.json({ error: `Ca 2 bắt đầu lúc ${ca.gioVao2}. Chờ đến gần giờ mới chấm vào.` }, { status: 400 });
        await prisma.$executeRawUnsafe(
          `UPDATE "ChamCong" SET "gioVao2"=$3 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
          nhanVienId, today, timeStr
        );
        return NextResponse.json({ ok: true, action: "vao", ca: 2, time: timeStr, location: matched.name, gioVaoCa: ca.gioVao2 });
      }
      // Bước 4: có vao2, chưa ra2 → ra ca 2, tính lại tongGio
      if (existing.gioVao2 && !existing.gioRa2) {
        const { veSom, phutVeSom, ghiChuMoi } = ca?.gioRa2 ? detectVeSom(ca.gioRa2, existing.ghiChu, "Ca 2: ") : { veSom: false, phutVeSom: 0, ghiChuMoi: existing.ghiChu };
        const gio1 = existing.gioVao && existing.gioRa ? timeToMin(existing.gioRa) - timeToMin(existing.gioVao) : 0;
        const gio2 = timeToMin(timeStr) - timeToMin(existing.gioVao2);
        const tongGio = roundDown30(Math.max(0, gio1 + gio2 - (ca?.nghiTrua ?? 90)));
        await prisma.$executeRawUnsafe(
          `UPDATE "ChamCong" SET "gioRa2"=$3,"tongGio"=$4,"ghiChu"=$5 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
          nhanVienId, today, timeStr, tongGio, ghiChuMoi
        );
        return NextResponse.json({ ok: true, action: "ra", ca: 2, time: timeStr, location: matched.name, tongGio, gioVao: existing.gioVao2, veSom, phutVeSom, gioRaCa: ca?.gioRa2 });
      }
      return NextResponse.json({ error: `Đã chấm đủ: Vào ${existing.gioVao} – Ra ${existing.gioRa2 ?? existing.gioRa} (${existing.tongGio}h)` }, { status: 400 });
    }

    // ── LƯƠNG CỐ ĐỊNH ────────────────────────────────────────────────
    // Bước 1: vào ca 1
    if (!existing?.gioVao) {
      const trangThai = diMuon ? "di_muon" : "di_lam";
      const realPhutMuon = diMuon ? phutMuon + BIEN_DO_MUON : 0;
      const ghiChu = diMuon ? `Đến ${timeStr}, muộn ${realPhutMuon} phút (ca ${ca?.gioVao})` : null;
      await upsertCC(nhanVienId, today, { trangThai, gioVao: timeStr, ghiChu });
      return NextResponse.json({ ok: true, action: "vao", ca: 1, time: timeStr, location: matched.name, diMuon, phutMuon: realPhutMuon, gioVaoCa: ca?.gioVao });
    }
    // Bước 2: ra ca 1
    if (existing.gioVao && !existing.gioRa) {
      if (hourNow < 12) return NextResponse.json({ error: `Đã chấm vào lúc ${existing.gioVao}. Chấm ra sau 12:00.` }, { status: 400 });
      const { veSom, phutVeSom, ghiChuMoi } = ca ? detectVeSom(ca.gioRa, existing.ghiChu) : { veSom: false, phutVeSom: 0, ghiChuMoi: existing.ghiChu };
      await prisma.$executeRawUnsafe(
        `UPDATE "ChamCong" SET "gioRa"=$3,"ghiChu"=$4 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
        nhanVienId, today, timeStr, ghiChuMoi
      );
      return NextResponse.json({ ok: true, action: "ra", ca: 1, time: timeStr, location: matched.name, gioVao: existing.gioVao, veSom, phutVeSom, gioRaCa: ca?.gioRa, coCA2: !!ca?.gioVao2 });
    }
    // Bước 3: vào ca 2 (nếu ca có gioVao2)
    if (existing.gioVao && existing.gioRa && ca?.gioVao2 && !existing.gioVao2) {
      const minVao2 = timeToMin(ca.gioVao2) - 30;
      if (timeToMin(timeStr) < minVao2) return NextResponse.json({ error: `Ca 2 bắt đầu lúc ${ca.gioVao2}. Chờ đến gần giờ mới chấm vào.` }, { status: 400 });
      const phutMuon2 = timeToMin(timeStr) - timeToMin(ca.gioVao2) - BIEN_DO_MUON;
      const diMuon2 = phutMuon2 > 0;
      const muon2Note = diMuon2 ? `Ca 2 đến ${timeStr}, muộn ${phutMuon2 + BIEN_DO_MUON} phút (ca ${ca.gioVao2})` : null;
      const ghiChuMoi = muon2Note ? (existing.ghiChu ? `${existing.ghiChu} | ${muon2Note}` : muon2Note) : existing.ghiChu;
      await prisma.$executeRawUnsafe(
        `UPDATE "ChamCong" SET "gioVao2"=$3,"ghiChu"=$4 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
        nhanVienId, today, timeStr, ghiChuMoi
      );
      return NextResponse.json({ ok: true, action: "vao", ca: 2, time: timeStr, location: matched.name, diMuon: diMuon2, phutMuon: diMuon2 ? phutMuon2 + BIEN_DO_MUON : 0, gioVaoCa: ca.gioVao2 });
    }
    // Bước 4: ra ca 2
    if (existing.gioVao2 && !existing.gioRa2) {
      const { veSom, phutVeSom, ghiChuMoi } = ca?.gioRa2 ? detectVeSom(ca.gioRa2, existing.ghiChu, "Ca 2: ") : { veSom: false, phutVeSom: 0, ghiChuMoi: existing.ghiChu };
      await prisma.$executeRawUnsafe(
        `UPDATE "ChamCong" SET "gioRa2"=$3,"ghiChu"=$4 WHERE "nhanVienId"=$1 AND "ngay"=$2`,
        nhanVienId, today, timeStr, ghiChuMoi
      );
      return NextResponse.json({ ok: true, action: "ra", ca: 2, time: timeStr, location: matched.name, gioVao: existing.gioVao2, veSom, phutVeSom, gioRaCa: ca?.gioRa2 });
    }
    // Tăng ca (sau khi đã chấm đủ, không có ca 2 hoặc đã xong ca 2)
    if (existing.gioVao && existing.gioRa && !ca?.gioVao2) {
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
