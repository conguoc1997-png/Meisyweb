export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Số ngày công chuẩn / tháng (cố định 26)
const NGAY_CHUAN = 26;

// Trạng thái chấm công → ngày công quy đổi
const NGAY_CONG_QUY_DOI: Record<string, number> = {
  di_lam:    1,
  di_muon:   1,    // đi muộn vẫn tính 1 ngày (có thể trừ tiền phạt)
  nua_ngay:  0.5,
  nghi_phep: 1,    // nghỉ phép có lương
  nghi_le:   1,    // nghỉ lễ có lương
  vang:      0,    // vắng không phép → 0
};

// Tránh tính PC ăn cho ngày không đi làm thực tế
const TINH_PC_AN: Record<string, boolean> = {
  di_lam:    true,
  di_muon:   true,
  nua_ngay:  false,
  nghi_phep: false,
  nghi_le:   false,
  vang:      false,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const thang = searchParams.get("thang"); // YYYY-MM — bắt buộc

    if (!thang) {
      return NextResponse.json({ error: "Thiếu tham số ?thang=YYYY-MM" }, { status: 400 });
    }

    const [y, m] = thang.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end   = new Date(y, m, 1);

    // Số ngày làm việc trong tháng (bỏ thứ 7, CN)
    let soNgayLvThang = 0;
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) soNgayLvThang++;
    }

    const nhanViens = await prisma.nhanVien.findMany({
      where: { active: true },
      orderBy: { ten: "asc" },
    });

    const chamCongs = await prisma.chamCong.findMany({
      where: { ngay: { gte: start, lt: end } },
    });

    // Group cham-cong theo nhanVienId
    const ccByNV: Record<string, typeof chamCongs> = {};
    for (const cc of chamCongs) {
      if (!ccByNV[cc.nhanVienId]) ccByNV[cc.nhanVienId] = [];
      ccByNV[cc.nhanVienId].push(cc);
    }

    const rows = nhanViens.map(nv => {
      const ccs = ccByNV[nv.id] ?? [];
      const luongCB   = nv.luongCB ?? 0;
      const phuCapAn  = nv.phuCapAn ?? 0;
      const phuCapCC  = nv.phuCapChuyenCan ?? 0;
      const heSoTC    = nv.heSoTC ?? 1.5;

      // Đếm ngày theo loại
      let ngayCong     = 0; // ngày công quy đổi (để tính lương chính)
      let ngayDiLam    = 0; // ngày đi làm thực tế (tính PC ăn)
      let ngayVang     = 0; // vắng không phép
      let tongTC       = 0; // tổng giờ tăng ca
      let ngayDiMuon   = 0;
      let ngayNghiPhep = 0;
      let ngayNghiLe   = 0;

      for (const cc of ccs) {
        const ts = cc.trangThai || "";
        ngayCong += NGAY_CONG_QUY_DOI[ts] ?? 0;
        if (TINH_PC_AN[ts]) ngayDiLam++;
        if (ts === "vang")      ngayVang++;
        if (ts === "di_muon")   ngayDiMuon++;
        if (ts === "nghi_phep") ngayNghiPhep++;
        if (ts === "nghi_le")   ngayNghiLe++;
        if (cc.tangCa) tongTC += cc.tangCa;
      }

      // Ngày chưa chấm công = mặc định di_lam (theo ngày làm việc trong tháng)
      // (Không cộng tự động — chỉ tính theo dữ liệu đã nhập)

      const luongNgay  = luongCB / NGAY_CHUAN;
      const luongChinh = luongNgay * ngayCong;
      const pcAn       = phuCapAn * ngayDiLam;
      const pcChuyenCan = ngayVang === 0 ? phuCapCC : 0; // mất chuyên cần nếu có ngày vắng
      const luongTC    = tongTC > 0 ? heSoTC * tongTC : 0; // heSoTC = VND/giờ (flat rate)
      const tongLuong  = luongChinh + pcAn + pcChuyenCan + luongTC;

      return {
        nhanVienId:   nv.id,
        maNV:         nv.maNV,
        ten:          nv.ten,
        chucVu:       nv.chucVu,
        phongBan:     nv.phongBan,
        loaiLuong:    nv.loaiLuong ?? "co_ban",
        luongCB,
        heSoTC,
        // Ngày
        soNgayLvThang,
        ngayCong:      Math.round(ngayCong * 2) / 2, // làm tròn 0.5
        ngayDiLam,
        ngayDiMuon,
        ngayNghiPhep,
        ngayNghiLe,
        ngayVang,
        // Giờ TC
        tongTC,
        // Thành tiền
        luongChinh:   Math.round(luongChinh),
        pcAn:         Math.round(pcAn),
        pcChuyenCan:  Math.round(pcChuyenCan),
        luongTC:      Math.round(luongTC),
        tongLuong:    Math.round(tongLuong),
      };
    });

    return NextResponse.json({
      thang,
      soNgayLvThang,
      rows,
      tongCong: {
        luongChinh:  rows.reduce((s, r) => s + r.luongChinh, 0),
        pcAn:        rows.reduce((s, r) => s + r.pcAn, 0),
        pcChuyenCan: rows.reduce((s, r) => s + r.pcChuyenCan, 0),
        luongTC:     rows.reduce((s, r) => s + r.luongTC, 0),
        tongLuong:   rows.reduce((s, r) => s + r.tongLuong, 0),
      },
    });
  } catch (e: unknown) {
    console.error("[bang-luong GET]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
