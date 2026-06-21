"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Printer } from "lucide-react";

interface PhieuThuChi {
  id: string;
  ho: string;
  loai: "thu" | "chi";
  soTien: number;
  danhMuc: string;
  dienGiai: string;
  nguoiDeXuat: string | null;
  trangThai: string;
  ngay: string;
  thang: string;
}

interface TaiKhoanQuy {
  ho: string;
  tenHo: string;
  soDuDauKy: number;
  thang: string;
  daChot: boolean;
  ngayChot: string | null;
}

const DANH_MUC_LABEL: Record<string, string> = {
  doanh_thu_ban_hang: "Doanh thu bán hàng",
  chi_phi_san: "Chi phí sàn",
  luong:       "Lương & thưởng",
  van_phong:   "Văn phòng phẩm",
  nguyen_lieu: "Nguyên liệu",
  van_chuyen:  "Vận chuyển",
  dien_nuoc:   "Điện, nước",
  thue:        "Thuế & phí",
  khac:        "Khác",
};

function fmtSo(n: number) {
  return n.toLocaleString("vi-VN");
}

function fmtNgay(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function SoThuChiInContent() {
  const searchParams = useSearchParams();
  const ho    = searchParams.get("ho")    || "meisy";
  const thang = searchParams.get("thang") || "";

  const [phieus, setPhieus] = useState<PhieuThuChi[]>([]);
  const [taiKhoan, setTaiKhoan] = useState<TaiKhoanQuy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res  = await fetch(`/api/so-thu-chi/in?ho=${ho}&thang=${thang}`);
    const data = await res.json();
    setPhieus(Array.isArray(data.phieus) ? data.phieus : []);
    setTaiKhoan(data.taiKhoan ?? null);
    setLoading(false);
  }, [ho, thang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-stone-400 text-[14px]">
        Đang tải dữ liệu...
      </div>
    );
  }

  const tenHo    = taiKhoan?.tenHo || ho;
  const soDuDauKy = taiKhoan?.soDuDauKy ?? 0;

  let tongThu = 0, tongChi = 0;
  phieus.forEach(p => {
    if (p.loai === "thu") tongThu += p.soTien;
    else                  tongChi += p.soTien;
  });
  const soDuCuoiKy = soDuDauKy + tongThu - tongChi;

  // Running balance
  let running = soDuDauKy;
  const rows = phieus.map(p => {
    if (p.loai === "thu") running += p.soTien;
    else                  running -= p.soTien;
    return { ...p, soDuSauGD: running };
  });

  const [yy, mm] = thang.split("-");
  const thangLabel = `Tháng ${mm}/${yy}`;
  const ngayChot = taiKhoan?.ngayChot ? fmtNgay(taiKhoan.ngayChot) : fmtNgay(new Date().toISOString());

  return (
    <>
      {/* Nút in — ẩn khi print */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-[13px] font-medium shadow-lg hover:bg-rose-600 transition-colors"
        >
          <Printer size={14} /> In sổ
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-[13px] text-stone-500 shadow-lg hover:bg-stone-50 transition-colors"
        >
          Đóng
        </button>
      </div>

      {/* Trang in */}
      <div className="min-h-screen bg-white p-8 max-w-[900px] mx-auto font-[Arial,sans-serif]">

        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <p className="text-[13px] text-stone-500 mb-1">Hộ kinh doanh: <strong>{tenHo}</strong></p>
          <h1 className="text-[22px] font-bold text-stone-800 uppercase tracking-wide">
            SỔ THU CHI
          </h1>
          <p className="text-[14px] text-stone-600 mt-1">{thangLabel}</p>
          <div className="mt-2 flex justify-center gap-6 text-[12px] text-stone-400">
            <span>Ngày chốt: {ngayChot}</span>
            <span>Tổng phát sinh: {phieus.length} giao dịch</span>
          </div>
        </div>

        {/* Số dư tóm tắt */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Số dư đầu kỳ", value: soDuDauKy,  color: "text-stone-700" },
            { label: "Tổng thu",     value: tongThu,     color: "text-green-700" },
            { label: "Tổng chi",     value: tongChi,     color: "text-red-600"   },
            { label: "Số dư cuối kỳ", value: soDuCuoiKy, color: soDuCuoiKy >= 0 ? "text-emerald-700" : "text-red-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border border-stone-200 rounded-xl p-3 text-center">
              <p className="text-[10px] text-stone-400 uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-[16px] font-bold ${color}`}>{fmtSo(value)}</p>
              <p className="text-[10px] text-stone-400">đồng</p>
            </div>
          ))}
        </div>

        {/* Bảng chi tiết */}
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-stone-100">
              <th className="border border-stone-300 px-2 py-2 text-center w-[32px]">STT</th>
              <th className="border border-stone-300 px-2 py-2 text-center w-[72px]">Ngày</th>
              <th className="border border-stone-300 px-2 py-2 text-left">Diễn giải</th>
              <th className="border border-stone-300 px-2 py-2 text-left w-[110px]">Danh mục</th>
              <th className="border border-stone-300 px-2 py-2 text-left w-[80px]">Người ĐX</th>
              <th className="border border-stone-300 px-2 py-2 text-right w-[100px]">Thu (đ)</th>
              <th className="border border-stone-300 px-2 py-2 text-right w-[100px]">Chi (đ)</th>
              <th className="border border-stone-300 px-2 py-2 text-right w-[110px]">Số dư (đ)</th>
            </tr>
          </thead>
          <tbody>
            {/* Dòng số dư đầu kỳ */}
            <tr className="bg-stone-50">
              <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400">—</td>
              <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400"></td>
              <td className="border border-stone-200 px-2 py-1.5 font-semibold text-stone-600">Số dư đầu kỳ</td>
              <td className="border border-stone-200 px-2 py-1.5"></td>
              <td className="border border-stone-200 px-2 py-1.5"></td>
              <td className="border border-stone-200 px-2 py-1.5"></td>
              <td className="border border-stone-200 px-2 py-1.5"></td>
              <td className="border border-stone-200 px-2 py-1.5 text-right font-semibold text-stone-700">
                {fmtSo(soDuDauKy)}
              </td>
            </tr>

            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-stone-200 px-4 py-6 text-center text-stone-400">
                  Chưa có giao dịch nào
                </td>
              </tr>
            ) : (
              rows.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-stone-50/40"}>
                  <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-400">{i + 1}</td>
                  <td className="border border-stone-200 px-2 py-1.5 text-center text-stone-500">{fmtNgay(p.ngay)}</td>
                  <td className="border border-stone-200 px-2 py-1.5 text-stone-700">{p.dienGiai}</td>
                  <td className="border border-stone-200 px-2 py-1.5 text-stone-500">
                    {DANH_MUC_LABEL[p.danhMuc] ?? p.danhMuc}
                  </td>
                  <td className="border border-stone-200 px-2 py-1.5 text-stone-500 text-[11px]">
                    {p.nguoiDeXuat || "—"}
                  </td>
                  <td className="border border-stone-200 px-2 py-1.5 text-right text-green-700 font-medium">
                    {p.loai === "thu" ? fmtSo(p.soTien) : ""}
                  </td>
                  <td className="border border-stone-200 px-2 py-1.5 text-right text-red-600 font-medium">
                    {p.loai === "chi" ? fmtSo(p.soTien) : ""}
                  </td>
                  <td className="border border-stone-200 px-2 py-1.5 text-right text-stone-700 font-medium">
                    {fmtSo(p.soDuSauGD)}
                  </td>
                </tr>
              ))
            )}

            {/* Dòng tổng */}
            <tr className="bg-stone-100 font-bold">
              <td colSpan={5} className="border border-stone-300 px-2 py-2 text-right text-stone-600 uppercase text-[11px] tracking-wide">
                Tổng cộng
              </td>
              <td className="border border-stone-300 px-2 py-2 text-right text-green-700">{fmtSo(tongThu)}</td>
              <td className="border border-stone-300 px-2 py-2 text-right text-red-600">{fmtSo(tongChi)}</td>
              <td className={`border border-stone-300 px-2 py-2 text-right ${soDuCuoiKy >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {fmtSo(soDuCuoiKy)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Ghi chú */}
        <div className="mt-4 p-3 border border-stone-200 rounded-xl bg-stone-50 text-[11px] text-stone-400">
          <strong className="text-stone-500">Ghi chú:</strong> Sổ này chỉ bao gồm các khoản đã được duyệt.
          Đơn vị tiền tệ: đồng Việt Nam (VNĐ). {taiKhoan?.daChot ? `Đã chốt ngày ${ngayChot}.` : "Chưa chốt."}
        </div>

        {/* Chữ ký */}
        <div className="mt-10 grid grid-cols-3 gap-8 text-center text-[12px]">
          <div>
            <p className="font-semibold text-stone-600 mb-16">Người lập sổ</p>
            <div className="border-t border-stone-300 pt-2 text-stone-400">(Ký, ghi rõ họ tên)</div>
          </div>
          <div>
            <p className="font-semibold text-stone-600 mb-16">Kế toán</p>
            <div className="border-t border-stone-300 pt-2 text-stone-400">(Ký, ghi rõ họ tên)</div>
          </div>
          <div>
            <p className="font-semibold text-stone-600 mb-16">Chủ hộ kinh doanh</p>
            <div className="border-t border-stone-300 pt-2 text-stone-400">(Ký, đóng dấu)</div>
          </div>
        </div>

        {/* Ngày tháng */}
        <div className="mt-6 text-right text-[12px] text-stone-400 italic">
          Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
        </div>
      </div>

      {/* CSS cho print */}
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm 12mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

export default function SoThuChiInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-stone-400">Đang tải...</div>}>
      <SoThuChiInContent />
    </Suspense>
  );
}
