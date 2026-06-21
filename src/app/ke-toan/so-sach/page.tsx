"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Printer, BookOpen } from "lucide-react";

type Ho = "meisy" | "nguyen_cong_uoc";

const HO_LABELS: Record<Ho, string> = {
  meisy: "Meisy",
  nguyen_cong_uoc: "Nguyễn Công Ước",
};

interface TiktokSPRow {
  id: string; thang: string; doanhThu: number; donHang: number;
  sanPham: { id: string; ten: string; sku: string } | null;
}

interface PhieuThuChi {
  id: string; ho: string; loai: "thu" | "chi"; soTien: number;
  danhMuc: string; dienGiai: string; thang: string; ngay: string;
  nguoiDeXuat: string | null; trangThai: string;
}

interface TaiKhoanQuy {
  ho: string; tenHo: string; soDuDauKy: number; thang: string;
  daChot: boolean; ngayChot: string | null;
}

function fmtNgay(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

interface ChiTietNhap {
  vatTuId: string; soLuongMua: number; donViMua: string; thanhTien: number;
  vatTu: { ten: string; donVi: string };
}
interface PhieuNhap { ngay: string; tongTien: number; chiTiet: ChiTietNhap[]; }

interface ChiTietXuat {
  vatTuId: string; soLuong: number; donGia: number;
  vatTu: { ten: string; donVi: string };
}
interface PhieuXuat { ngay: string; chiTiet: ChiTietXuat[]; }

function fmtSo(n: number) {
  return Math.round(n).toLocaleString("vi-VN");
}

function currentThang() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthRange(thang: string) {
  const [y, m] = thang.split("-").map(Number);
  const from = `${thang}-01`;
  const lastDay = new Date(y, m, 0).getDate();
  const to = `${thang}-${String(lastDay).padStart(2, "0")}`;
  return { from, to };
}

export default function SoSachPage() {
  const [tab, setTab] = useState<"s2b" | "s2c" | "s2d" | "s2e">("s2b");
  const [thang, setThang] = useState(currentThang());
  const [ho, setHo] = useState<Ho>("meisy");

  const [tiktokSP, setTiktokSP] = useState<TiktokSPRow[]>([]);
  const [phieus, setPhieus] = useState<PhieuThuChi[]>([]);
  const [phieusDaDuyet, setPhieusDaDuyet] = useState<PhieuThuChi[]>([]);
  const [taiKhoan, setTaiKhoan] = useState<TaiKhoanQuy | null>(null);
  const [nhapKho, setNhapKho] = useState<PhieuNhap[]>([]);
  const [xuatKho, setXuatKho] = useState<PhieuXuat[]>([]);
  const [loading, setLoading] = useState(true);

  // Inputs thủ công cho S2c (lưu theo localStorage theo hộ + tháng)
  const [chiPhiLuong, setChiPhiLuong] = useState("0");
  const [chiPhiKhauHao, setChiPhiKhauHao] = useState("0");
  const [chiPhiLaiVay, setChiPhiLaiVay] = useState("0");
  const [thueSuatGTGT, setThueSuatGTGT] = useState("1");
  const [thueSuatTNCN, setThueSuatTNCN] = useState("0.5");

  const manualKey = `meisy_sosach_manual_${ho}_${thang}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(manualKey) ?? "{}");
      setChiPhiLuong(saved.chiPhiLuong ?? "0");
      setChiPhiKhauHao(saved.chiPhiKhauHao ?? "0");
      setChiPhiLaiVay(saved.chiPhiLaiVay ?? "0");
      setThueSuatGTGT(saved.thueSuatGTGT ?? "1");
      setThueSuatTNCN(saved.thueSuatTNCN ?? "0.5");
    } catch {
      // ignore
    }
  }, [manualKey]);

  useEffect(() => {
    localStorage.setItem(manualKey, JSON.stringify({
      chiPhiLuong, chiPhiKhauHao, chiPhiLaiVay, thueSuatGTGT, thueSuatTNCN,
    }));
  }, [manualKey, chiPhiLuong, chiPhiKhauHao, chiPhiLaiVay, thueSuatGTGT, thueSuatTNCN]);

  useEffect(() => {
    if (ho === "meisy" && tab === "s2d") setTab("s2b");
  }, [ho, tab]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { from, to } = monthRange(thang);
    const [tiktokRes, sttcRes, sttcInRes, nhapRes, xuatRes] = await Promise.all([
      fetch(`/api/koc/tiktok-doanhthu?thang=${thang}`),
      fetch(`/api/so-thu-chi?thang=${thang}&ho=${ho}`),
      fetch(`/api/so-thu-chi/in?thang=${thang}&ho=${ho}`),
      fetch(`/api/ke-toan/nhap-kho?from=${from}&to=${to}`),
      fetch(`/api/ke-toan/xuat-kho?from=${from}&to=${to}`),
    ]);
    const tiktokData = await tiktokRes.json();
    const sttcData   = await sttcRes.json();
    const sttcInData  = await sttcInRes.json();
    const nhapData   = await nhapRes.json();
    const xuatData   = await xuatRes.json();

    setTiktokSP(Array.isArray(tiktokData.spData) ? tiktokData.spData : []);
    setPhieus(Array.isArray(sttcData.phieus) ? sttcData.phieus : []);
    setPhieusDaDuyet(Array.isArray(sttcInData.phieus) ? sttcInData.phieus : []);
    setTaiKhoan(sttcInData.taiKhoan ?? null);
    setNhapKho(Array.isArray(nhapData) ? nhapData : []);
    setXuatKho(Array.isArray(xuatData) ? xuatData : []);
    setLoading(false);
  }, [thang, ho]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── S2b: Doanh thu bán hàng ───────────────────────────────────────────
  // Doanh thu TikTok chỉ thuộc về hộ Meisy, không tính sang Nguyễn Công Ước
  const doanhThuTiktok = useMemo(
    () => ho === "meisy" ? tiktokSP.reduce((s, r) => s + r.doanhThu, 0) : 0,
    [tiktokSP, ho]
  );
  const donHangTiktok = useMemo(
    () => ho === "meisy" ? tiktokSP.reduce((s, r) => s + r.donHang, 0) : 0,
    [tiktokSP, ho]
  );
  const phieusDoanhThuKhac = useMemo(
    () => phieus.filter(p => p.loai === "thu" && p.danhMuc === "doanh_thu_ban_hang"),
    [phieus]
  );
  const doanhThuKhac = useMemo(
    () => phieusDoanhThuKhac.reduce((s, p) => s + p.soTien, 0),
    [phieusDoanhThuKhac]
  );
  const tongDoanhThu = doanhThuTiktok + doanhThuKhac;
  const thueGTGT = tongDoanhThu * (Number(thueSuatGTGT) || 0) / 100;

  // ─── S2c: Doanh thu, chi phí ────────────────────────────────────────────
  // Hộ Meisy mua hàng từ hộ Nguyễn Công Ước — tiền mua đã ghi nhận qua Sổ Thu Chi
  // nên KHÔNG cộng thêm chi phí NVL từ nhập kho (tránh tính trùng). Chỉ áp dụng cho Công Ước.
  const chiPhiNVL = useMemo(
    () => ho === "nguyen_cong_uoc" ? nhapKho.reduce((s, p) => s + p.tongTien, 0) : 0,
    [nhapKho, ho]
  );
  const chiPhiDichVuMuaNgoai = useMemo(
    () => phieus
      .filter(p => p.loai === "chi" && ["dien_nuoc", "van_phong", "van_chuyen"].includes(p.danhMuc))
      .reduce((s, p) => s + p.soTien, 0),
    [phieus]
  );
  const chiPhiSan = useMemo(
    () => phieus
      .filter(p => p.loai === "chi" && p.danhMuc === "chi_phi_san")
      .reduce((s, p) => s + p.soTien, 0),
    [phieus]
  );
  const chiPhiKhac = useMemo(
    () => phieus
      .filter(p => p.loai === "chi" && !["dien_nuoc", "van_phong", "van_chuyen", "chi_phi_san"].includes(p.danhMuc))
      .reduce((s, p) => s + p.soTien, 0),
    [phieus]
  );
  const tongChiPhi = chiPhiNVL + (Number(chiPhiLuong) || 0) + (Number(chiPhiKhauHao) || 0)
    + chiPhiDichVuMuaNgoai + chiPhiSan + (Number(chiPhiLaiVay) || 0) + chiPhiKhac;
  const chenhLech = tongDoanhThu - tongChiPhi;
  const thueTNCN = chenhLech > 0 ? chenhLech * (Number(thueSuatTNCN) || 0) / 100 : 0;

  // ─── S2d: Vật liệu, dụng cụ, SP, hàng hóa ───────────────────────────────
  const vatTuRows = useMemo(() => {
    const map = new Map<string, { ten: string; donVi: string; nhapSL: number; nhapTT: number; xuatSL: number; xuatTT: number }>();
    nhapKho.forEach(p => p.chiTiet.forEach(c => {
      const cur = map.get(c.vatTuId) ?? { ten: c.vatTu.ten, donVi: c.vatTu.donVi, nhapSL: 0, nhapTT: 0, xuatSL: 0, xuatTT: 0 };
      cur.nhapSL += c.soLuongMua;
      cur.nhapTT += c.thanhTien;
      map.set(c.vatTuId, cur);
    }));
    xuatKho.forEach(p => p.chiTiet.forEach(c => {
      const cur = map.get(c.vatTuId) ?? { ten: c.vatTu.ten, donVi: c.vatTu.donVi, nhapSL: 0, nhapTT: 0, xuatSL: 0, xuatTT: 0 };
      cur.xuatSL += c.soLuong;
      cur.xuatTT += c.soLuong * c.donGia;
      map.set(c.vatTuId, cur);
    }));
    return [...map.values()].sort((a, b) => a.ten.localeCompare(b.ten));
  }, [nhapKho, xuatKho]);

  const tongNhapTT = vatTuRows.reduce((s, r) => s + r.nhapTT, 0);
  const tongXuatTT = vatTuRows.reduce((s, r) => s + r.xuatTT, 0);

  // ─── S2e: Sổ chi tiết tiền ───────────────────────────────────────────────
  const soDuDauKy = taiKhoan?.soDuDauKy ?? 0;
  const tongThuTien = phieusDaDuyet.filter(p => p.loai === "thu").reduce((s, p) => s + p.soTien, 0);
  const tongChiTien = phieusDaDuyet.filter(p => p.loai === "chi").reduce((s, p) => s + p.soTien, 0);
  const soDuCuoiKy = soDuDauKy + tongThuTien - tongChiTien;
  const tienRows = useMemo(() => {
    let running = soDuDauKy;
    return phieusDaDuyet.map(p => {
      running += p.loai === "thu" ? p.soTien : -p.soTien;
      return { ...p, soDuSauGD: running };
    });
  }, [phieusDaDuyet, soDuDauKy]);

  const [yy, mm] = thang.split("-");
  const inp = "w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-[13px] text-right focus:outline-none focus:border-rose-300";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5 print:hidden">
        <div className="flex items-center gap-2.5">
          <BookOpen className="text-violet-500" size={22} />
          <div>
            <h1 className="text-[18px] font-bold text-stone-800">Sổ sách thuế Hộ kinh doanh</h1>
            <p className="text-[12px] text-stone-400">Theo Thông tư 152/2025/TT-BTC — tự động tổng hợp từ dữ liệu Meisy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={ho} onChange={e => setHo(e.target.value as Ho)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none">
            {(Object.entries(HO_LABELS) as [Ho, string][]).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
          <input type="month" value={thang} onChange={e => setThang(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none" />
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 transition-colors">
            <Printer size={14} /> In sổ
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-5 print:hidden">
        {[
          { key: "s2b", label: "S2b — Doanh thu" },
          { key: "s2c", label: "S2c — Doanh thu & Chi phí" },
          ...(ho === "nguyen_cong_uoc" ? [{ key: "s2d", label: "S2d — Vật tư, hàng hóa" }] : []),
          { key: "s2e", label: "S2e — Sổ chi tiết tiền" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${
              tab === t.key ? "bg-violet-100 text-violet-700" : "text-stone-400 hover:bg-stone-50"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-stone-400 py-16 text-[14px]">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="text-center mb-5">
            <p className="text-[12px] text-stone-500">Hộ kinh doanh: <strong>{HO_LABELS[ho]}</strong></p>
            <h2 className="text-[17px] font-bold text-stone-800 uppercase mt-1">
              {tab === "s2b" && "Sổ chi tiết doanh thu bán hàng hóa, dịch vụ"}
              {tab === "s2c" && "Sổ chi tiết doanh thu, chi phí"}
              {tab === "s2d" && "Sổ chi tiết vật liệu, dụng cụ, sản phẩm, hàng hóa"}
              {tab === "s2e" && "Sổ chi tiết tiền"}
            </h2>
            <p className="text-[12px] text-stone-400 mt-0.5">Kỳ kê khai: Tháng {mm}/{yy}</p>
          </div>

          {tab === "s2b" && (
            <>
              <table className="w-full border-collapse text-[13px] mb-4">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="border border-stone-200 px-3 py-2 text-left">Diễn giải</th>
                    <th className="border border-stone-200 px-3 py-2 text-right w-[120px]">Đơn hàng</th>
                    <th className="border border-stone-200 px-3 py-2 text-right w-[160px]">Số tiền (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-stone-200 px-3 py-2">
                      1. Doanh thu bán hàng qua TikTok
                      {ho === "nguyen_cong_uoc" && <span className="text-stone-400 text-[11px] block">Không áp dụng — doanh thu TikTok thuộc hộ Meisy</span>}
                    </td>
                    <td className="border border-stone-200 px-3 py-2 text-right">{donHangTiktok.toLocaleString()}</td>
                    <td className="border border-stone-200 px-3 py-2 text-right font-medium text-green-700">{fmtSo(doanhThuTiktok)}</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-200 px-3 py-2">2. Doanh thu khác (bán sỉ/lẻ — nhập từ Sổ Thu Chi)</td>
                    <td className="border border-stone-200 px-3 py-2 text-right text-stone-300">—</td>
                    <td className="border border-stone-200 px-3 py-2 text-right font-medium text-green-700">{fmtSo(doanhThuKhac)}</td>
                  </tr>
                  <tr className="bg-stone-100 font-bold">
                    <td className="border border-stone-200 px-3 py-2">Tổng cộng (1)</td>
                    <td className="border border-stone-200 px-3 py-2 text-right">{(donHangTiktok).toLocaleString()}</td>
                    <td className="border border-stone-200 px-3 py-2 text-right text-green-700">{fmtSo(tongDoanhThu)}</td>
                  </tr>
                  <tr>
                    <td className="border border-stone-200 px-3 py-2">
                      Thuế GTGT (
                      <input value={thueSuatGTGT} onChange={e => setThueSuatGTGT(e.target.value)}
                        className="w-12 border border-stone-200 rounded px-1 text-center print:hidden" />
                      <span className="print:inline hidden">{thueSuatGTGT}</span>
                      %)
                    </td>
                    <td className="border border-stone-200 px-3 py-2"></td>
                    <td className="border border-stone-200 px-3 py-2 text-right text-amber-700">{fmtSo(thueGTGT)}</td>
                  </tr>
                </tbody>
              </table>
              {doanhThuKhac === 0 && (
                <p className="text-[12px] text-stone-400 print:hidden">
                  Chưa có doanh thu nhập tay tháng này. Vào <strong>Sổ Thu Chi</strong> → tạo khoản <strong>Thu</strong>, danh mục <strong>“Doanh thu bán hàng”</strong> để cộng vào đây.
                </p>
              )}
            </>
          )}

          {tab === "s2c" && (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-stone-50">
                  <th className="border border-stone-200 px-3 py-2 text-left">Diễn giải</th>
                  <th className="border border-stone-200 px-3 py-2 text-right w-[180px]">Số tiền (đ)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="font-medium">
                  <td className="border border-stone-200 px-3 py-2">1. Doanh thu bán hàng hóa, dịch vụ</td>
                  <td className="border border-stone-200 px-3 py-2 text-right text-green-700">{fmtSo(tongDoanhThu)}</td>
                </tr>
                <tr className="font-medium">
                  <td className="border border-stone-200 px-3 py-2">2. Chi phí hợp lý</td>
                  <td className="border border-stone-200 px-3 py-2 text-right text-red-600">{fmtSo(tongChiPhi)}</td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">
                    a) NVL, vật liệu, hàng hóa (nhập kho trong kỳ)
                    {ho === "meisy" && <span className="text-stone-400 text-[11px] block">Không áp dụng — Meisy mua hàng từ Nguyễn Công Ước, đã ghi nhận qua Sổ Thu Chi</span>}
                  </td>
                  <td className="border border-stone-200 px-3 py-2 text-right">{fmtSo(chiPhiNVL)}</td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">b) Lương, tiền công, phụ cấp, BHXH</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">
                    <input value={chiPhiLuong} onChange={e => setChiPhiLuong(e.target.value)} className={inp + " print:hidden"} />
                    <span className="print:inline hidden">{fmtSo(Number(chiPhiLuong) || 0)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">c) Khấu hao tài sản cố định</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">
                    <input value={chiPhiKhauHao} onChange={e => setChiPhiKhauHao(e.target.value)} className={inp + " print:hidden"} />
                    <span className="print:inline hidden">{fmtSo(Number(chiPhiKhauHao) || 0)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">d) Dịch vụ mua ngoài (điện, nước, vận chuyển, văn phòng)</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">{fmtSo(chiPhiDichVuMuaNgoai)}</td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">đ) Chi phí sàn (hoa hồng, phí dịch vụ TMĐT)</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">{fmtSo(chiPhiSan)}</td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">e) Lãi vay vốn sản xuất, kinh doanh</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">
                    <input value={chiPhiLaiVay} onChange={e => setChiPhiLaiVay(e.target.value)} className={inp + " print:hidden"} />
                    <span className="print:inline hidden">{fmtSo(Number(chiPhiLaiVay) || 0)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2 pl-6">g) Chi khác (từ Sổ Thu Chi)</td>
                  <td className="border border-stone-200 px-3 py-2 text-right">{fmtSo(chiPhiKhac)}</td>
                </tr>
                <tr className="bg-stone-100 font-bold">
                  <td className="border border-stone-200 px-3 py-2">3. Chênh lệch (3 = 1 - 2)</td>
                  <td className={`border border-stone-200 px-3 py-2 text-right ${chenhLech >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtSo(chenhLech)}</td>
                </tr>
                <tr>
                  <td className="border border-stone-200 px-3 py-2">
                    4. Thuế TNCN phải nộp (4 = 3 ×
                    <input value={thueSuatTNCN} onChange={e => setThueSuatTNCN(e.target.value)} className="w-12 mx-1 border border-stone-200 rounded px-1 text-center print:hidden" />
                    <span className="print:inline hidden">{thueSuatTNCN}</span>
                    %)
                  </td>
                  <td className="border border-stone-200 px-3 py-2 text-right text-amber-700 font-medium">{fmtSo(thueTNCN)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "s2d" && (
            <table className="w-full border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-stone-50">
                  <th className="border border-stone-200 px-2 py-2 text-left">Tên vật liệu, dụng cụ, hàng hóa</th>
                  <th className="border border-stone-200 px-2 py-2 text-center w-[60px]">ĐVT</th>
                  <th className="border border-stone-200 px-2 py-2 text-right w-[80px]">SL nhập</th>
                  <th className="border border-stone-200 px-2 py-2 text-right w-[120px]">TT nhập (đ)</th>
                  <th className="border border-stone-200 px-2 py-2 text-right w-[80px]">SL xuất</th>
                  <th className="border border-stone-200 px-2 py-2 text-right w-[120px]">TT xuất (đ)</th>
                </tr>
              </thead>
              <tbody>
                {vatTuRows.length === 0 ? (
                  <tr><td colSpan={6} className="border border-stone-200 px-3 py-6 text-center text-stone-400">Không có phát sinh nhập/xuất kho trong kỳ</td></tr>
                ) : vatTuRows.map(r => (
                  <tr key={r.ten}>
                    <td className="border border-stone-200 px-2 py-1.5">{r.ten}</td>
                    <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400">{r.donVi}</td>
                    <td className="border border-stone-200 px-2 py-1.5 text-right">{r.nhapSL > 0 ? r.nhapSL.toLocaleString() : "—"}</td>
                    <td className="border border-stone-200 px-2 py-1.5 text-right text-green-700">{r.nhapTT > 0 ? fmtSo(r.nhapTT) : "—"}</td>
                    <td className="border border-stone-200 px-2 py-1.5 text-right">{r.xuatSL > 0 ? r.xuatSL.toLocaleString() : "—"}</td>
                    <td className="border border-stone-200 px-2 py-1.5 text-right text-red-600">{r.xuatTT > 0 ? fmtSo(r.xuatTT) : "—"}</td>
                  </tr>
                ))}
                <tr className="bg-stone-100 font-bold">
                  <td colSpan={3} className="border border-stone-200 px-2 py-2 text-right">Tổng cộng</td>
                  <td className="border border-stone-200 px-2 py-2 text-right text-green-700">{fmtSo(tongNhapTT)}</td>
                  <td className="border border-stone-200 px-2 py-2"></td>
                  <td className="border border-stone-200 px-2 py-2 text-right text-red-600">{fmtSo(tongXuatTT)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "s2e" && (
            <>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Số dư đầu kỳ", value: soDuDauKy, color: "text-stone-700" },
                  { label: "Tổng thu", value: tongThuTien, color: "text-green-700" },
                  { label: "Tổng chi", value: tongChiTien, color: "text-red-600" },
                  { label: "Số dư cuối kỳ", value: soDuCuoiKy, color: soDuCuoiKy >= 0 ? "text-emerald-700" : "text-red-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="border border-stone-200 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-[15px] font-bold ${color}`}>{fmtSo(value)}</p>
                  </div>
                ))}
              </div>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="border border-stone-200 px-2 py-2 text-center w-[32px]">STT</th>
                    <th className="border border-stone-200 px-2 py-2 text-center w-[72px]">Ngày</th>
                    <th className="border border-stone-200 px-2 py-2 text-left">Diễn giải</th>
                    <th className="border border-stone-200 px-2 py-2 text-right w-[100px]">Thu (đ)</th>
                    <th className="border border-stone-200 px-2 py-2 text-right w-[100px]">Chi (đ)</th>
                    <th className="border border-stone-200 px-2 py-2 text-right w-[110px]">Số dư (đ)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-stone-50">
                    <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400">—</td>
                    <td className="border border-stone-200 px-2 py-1.5"></td>
                    <td className="border border-stone-200 px-2 py-1.5 font-semibold text-stone-600">Số dư đầu kỳ</td>
                    <td className="border border-stone-200 px-2 py-1.5"></td>
                    <td className="border border-stone-200 px-2 py-1.5"></td>
                    <td className="border border-stone-200 px-2 py-1.5 text-right font-semibold">{fmtSo(soDuDauKy)}</td>
                  </tr>
                  {tienRows.length === 0 ? (
                    <tr><td colSpan={6} className="border border-stone-200 px-3 py-6 text-center text-stone-400">Chưa có giao dịch đã duyệt trong kỳ</td></tr>
                  ) : tienRows.map((p, i) => (
                    <tr key={p.id}>
                      <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400">{i + 1}</td>
                      <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-500">{fmtNgay(p.ngay)}</td>
                      <td className="border border-stone-200 px-2 py-1.5">{p.dienGiai}</td>
                      <td className="border border-stone-200 px-2 py-1.5 text-right text-green-700">{p.loai === "thu" ? fmtSo(p.soTien) : ""}</td>
                      <td className="border border-stone-200 px-2 py-1.5 text-right text-red-600">{p.loai === "chi" ? fmtSo(p.soTien) : ""}</td>
                      <td className="border border-stone-200 px-2 py-1.5 text-right font-medium">{fmtSo(p.soDuSauGD)}</td>
                    </tr>
                  ))}
                  <tr className="bg-stone-100 font-bold">
                    <td colSpan={3} className="border border-stone-200 px-2 py-2 text-right">Tổng cộng</td>
                    <td className="border border-stone-200 px-2 py-2 text-right text-green-700">{fmtSo(tongThuTien)}</td>
                    <td className="border border-stone-200 px-2 py-2 text-right text-red-600">{fmtSo(tongChiTien)}</td>
                    <td className={`border border-stone-200 px-2 py-2 text-right ${soDuCuoiKy >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtSo(soDuCuoiKy)}</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-[11px] text-stone-400 mt-2 print:hidden">
                Sổ này chỉ tính các khoản đã được duyệt trong Sổ Thu Chi. Số liệu đồng bộ với trang Sổ Thu Chi.
              </p>
            </>
          )}

          <div className="mt-8 grid grid-cols-2 gap-8 text-center text-[12px] print:mt-16">
            <div>
              <p className="font-semibold text-stone-600 mb-12">Người lập sổ</p>
              <div className="border-t border-stone-300 pt-2 text-stone-400">(Ký, ghi rõ họ tên)</div>
            </div>
            <div>
              <p className="font-semibold text-stone-600 mb-12">Người đại diện hộ kinh doanh</p>
              <div className="border-t border-stone-300 pt-2 text-stone-400">(Ký, đóng dấu nếu có)</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
