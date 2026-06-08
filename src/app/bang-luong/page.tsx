"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Printer, ChevronLeft, ChevronRight, Info, X } from "lucide-react";

type LuongRow = {
  nhanVienId:   string;
  maNV:         string;
  ten:          string;
  chucVu:       string | null;
  phongBan:     string | null;
  luongCB:      number;
  heSoTC:       number;
  soNgayLvThang: number;
  ngayCong:     number;
  ngayDiLam:    number;
  ngayDiMuon:   number;
  ngayNghiPhep: number;
  ngayNghiLe:   number;
  ngayVang:     number;
  tongTC:       number;
  luongChinh:   number;
  pcAn:         number;
  pcChuyenCan:  number;
  luongTC:      number;
  tongLuong:    number;
};

type TongCong = {
  luongChinh: number;
  pcAn: number;
  pcChuyenCan: number;
  luongTC: number;
  tongLuong: number;
};

type BangLuongData = {
  thang: string;
  soNgayLvThang: number;
  rows: LuongRow[];
  tongCong: TongCong;
};

type PhieuLuong = {
  row: LuongRow;
  thangLabel: string;
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtMoney = (n: number) =>
  n === 0 ? <span className="text-slate-300">—</span> : <>{fmt(n)}</>;

function getThangOptions() {
  const opts = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    opts.push({ val, label });
  }
  return opts;
}

function prevMonth(thang: string) {
  const [y, m] = thang.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function nextMonth(thang: string) {
  const [y, m] = thang.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function formatThangLabel(thang: string) {
  const [y, m] = thang.split("-").map(Number);
  return `Tháng ${m}/${y}`;
}

/* ─── Phiếu lương modal ─── */
function PhieuLuongModal({ phieu, onClose }: { phieu: PhieuLuong; onClose: () => void }) {
  const { row, thangLabel } = phieu;
  const handlePrint = () => window.print();

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #phieu-luong-in, #phieu-luong-in * { visibility: visible !important; }
          #phieu-luong-in { position: fixed; top: 0; left: 0; width: 100%; }
          @page { size: A5; margin: 12mm 14mm; }
        }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden"
        onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}>
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Phiếu lương cá nhân</h3>
            <div className="flex items-center gap-2">
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition">
                <Printer size={12} /> In phiếu
              </button>
              <button onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Preview content */}
          <div className="p-5 overflow-y-auto max-h-[80vh]">
            <PhieuLuongContent phieu={phieu} />
          </div>
        </div>
      </div>

      {/* Print target — always in DOM when modal open */}
      <div id="phieu-luong-in" className="hidden print:block">
        <PhieuLuongContent phieu={phieu} />
      </div>
    </>
  );
}

function PhieuLuongContent({ phieu }: { phieu: PhieuLuong }) {
  const { row, thangLabel } = phieu;
  const items = [
    { label: "Lương cơ bản",     val: row.luongCB,      note: "" },
    { label: "Ngày công chuẩn",  val: null,             note: "26 ngày/tháng", isNote: true },
    { label: "Ngày công thực tế",val: null,             note: `${row.ngayCong} ngày`, isNote: true },
    { label: "— Đi muộn",        val: null,             note: `${row.ngayDiMuon} ngày`, isNote: true },
    { label: "— Nghỉ phép",      val: null,             note: `${row.ngayNghiPhep} ngày`, isNote: true },
    { label: "— Vắng không phép",val: null,             note: `${row.ngayVang} ngày`, isNote: true },
    { label: "Lương chính",      val: row.luongChinh,   note: "" },
    { label: "PC ăn ca",         val: row.pcAn,         note: "" },
    { label: "PC chuyên cần",    val: row.pcChuyenCan,  note: "" },
    { label: "Tăng ca",          val: row.luongTC,      note: `${row.tongTC} giờ × ${fmt(row.heSoTC)}đ/giờ` },
  ];

  return (
    <div className="text-[12px] font-[sans-serif]">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="font-bold text-[15px] uppercase tracking-wide">PHIẾU LƯƠNG</p>
        <p className="text-slate-500 text-[11px] uppercase">{thangLabel}</p>
      </div>

      {/* NV info */}
      <div className="border border-slate-200 rounded-lg p-3 mb-4 space-y-1">
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 flex-shrink-0">Họ và tên:</span>
          <span className="font-semibold text-slate-800">{row.ten}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate-400 w-20 flex-shrink-0">Mã NV:</span>
          <span className="text-slate-700">{row.maNV}</span>
        </div>
        {row.chucVu && (
          <div className="flex gap-2">
            <span className="text-slate-400 w-20 flex-shrink-0">Chức vụ:</span>
            <span className="text-slate-700">{row.chucVu}</span>
          </div>
        )}
        {row.phongBan && (
          <div className="flex gap-2">
            <span className="text-slate-400 w-20 flex-shrink-0">Bộ phận:</span>
            <span className="text-slate-700">{row.phongBan}</span>
          </div>
        )}
      </div>

      {/* Chi tiết lương */}
      <table className="w-full border-collapse mb-4">
        <tbody>
          {items.map((it, i) => {
            if (it.isNote) {
              return (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1 pl-3 text-slate-400 text-[11px]">{it.label}</td>
                  <td className="py-1 text-right text-slate-500 text-[11px]">{it.note}</td>
                </tr>
              );
            }
            return (
              <tr key={i} className={`border-b border-slate-100 ${it.val === row.tongLuong ? "font-bold" : ""}`}>
                <td className="py-1.5 text-slate-600">{it.label}</td>
                <td className="py-1.5 text-right">
                  {it.val != null && it.val > 0 ? (
                    <span className="text-slate-800">{fmt(it.val)} đ</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                  {it.note && it.val != null && it.val > 0 && (
                    <span className="text-slate-400 text-[10px] ml-1">({it.note})</span>
                  )}
                </td>
              </tr>
            );
          })}
          {/* Tổng */}
          <tr className="bg-violet-50">
            <td className="py-2 font-bold text-slate-800 text-[13px]">THỰC LĨNH</td>
            <td className="py-2 text-right font-bold text-violet-700 text-[14px]">{fmt(row.tongLuong)} đ</td>
          </tr>
        </tbody>
      </table>

      {/* Ký tên */}
      <div className="grid grid-cols-2 gap-4 mt-6 text-center text-[11px]">
        <div>
          <p className="font-semibold uppercase tracking-wide mb-10">Người lập</p>
          <p className="border-t border-slate-300 pt-1 text-slate-400">(Ký, ghi rõ họ tên)</p>
        </div>
        <div>
          <p className="font-semibold uppercase tracking-wide mb-10">Người nhận</p>
          <p className="border-t border-slate-300 pt-1 text-slate-400">(Ký, ghi rõ họ tên)</p>
        </div>
      </div>

      <p className="text-center text-slate-300 text-[10px] mt-3">
        Ngày in: {new Date().toLocaleDateString("vi-VN")}
      </p>
    </div>
  );
}

/* ─── Main page ─── */
export default function BangLuongPage() {
  const now = new Date();
  const defaultThang = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [thang, setThang] = useState(defaultThang);
  const [data, setData] = useState<BangLuongData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterPhongBan, setFilterPhongBan] = useState("");
  const [phieuLuong, setPhieuLuong] = useState<PhieuLuong | null>(null);
  const thangOptions = useMemo(() => getThangOptions(), []);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bang-luong?thang=${thang}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [thang]);

  const phongBans = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.rows.map(r => r.phongBan ?? "").filter(Boolean))].sort();
  }, [data]);

  const rows = useMemo(() => {
    if (!data) return [];
    if (!filterPhongBan) return data.rows;
    return data.rows.filter(r => r.phongBan === filterPhongBan);
  }, [data, filterPhongBan]);

  const tongFiltered = useMemo(() => ({
    luongChinh:  rows.reduce((s, r) => s + r.luongChinh, 0),
    pcAn:        rows.reduce((s, r) => s + r.pcAn, 0),
    pcChuyenCan: rows.reduce((s, r) => s + r.pcChuyenCan, 0),
    luongTC:     rows.reduce((s, r) => s + r.luongTC, 0),
    tongLuong:   rows.reduce((s, r) => s + r.tongLuong, 0),
  }), [rows]);

  const handlePrint = () => window.print();

  return (
    <>
    {/* ── Print styles (bảng lương tổng) ── */}
    <style>{`
      @media print {
        body * { visibility: hidden !important; }
        #bang-luong-print, #bang-luong-print * { visibility: visible !important; }
        #bang-luong-print { position: fixed; top: 0; left: 0; width: 100%; }
        @page { size: A4 landscape; margin: 12mm 10mm; }
      }
    `}</style>

    {/* Phiếu lương cá nhân modal */}
    {phieuLuong && (
      <PhieuLuongModal
        phieu={phieuLuong}
        onClose={() => setPhieuLuong(null)}
      />
    )}

    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Bảng lương</h1>
          <p className="text-sm text-slate-400 mt-0.5">Tổng hợp lương từ dữ liệu chấm công</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Month nav */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setThang(prevMonth(thang))}
              className="px-2 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition">
              <ChevronLeft size={15} />
            </button>
            <select value={thang} onChange={e => setThang(e.target.value)}
              className="border-none outline-none text-sm font-medium text-slate-700 bg-transparent px-1 py-2 cursor-pointer">
              {thangOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
            </select>
            <button onClick={() => setThang(nextMonth(thang))}
              className="px-2 py-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition">
              <ChevronRight size={15} />
            </button>
          </div>
          {/* Filter phòng ban */}
          {phongBans.length > 0 && (
            <select value={filterPhongBan} onChange={e => setFilterPhongBan(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200">
              <option value="">Tất cả bộ phận</option>
              {phongBans.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          )}
          {/* Print */}
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition print:hidden">
            <Printer size={14} /> In bảng lương
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-[13px] text-blue-700 print:hidden">
        <Info size={14} className="flex-shrink-0 mt-0.5" />
        <span>Lương chính = <b>Lương CB ÷ 26 × Ngày công</b> &nbsp;·&nbsp; PC ăn tính theo ngày đi làm thực tế &nbsp;·&nbsp;
        PC chuyên cần mất khi có ngày vắng &nbsp;·&nbsp; Tăng ca = <b>Hệ số TC (đ/giờ) × Giờ tăng ca</b></span>
      </div>

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5 print:hidden">
          {[
            { label: "Nhân viên",       val: rows.length,                 unit: "người", cls: "text-slate-800" },
            { label: "Lương chính",     val: tongFiltered.luongChinh,     unit: "đ",     cls: "text-slate-700" },
            { label: "Phụ cấp",        val: tongFiltered.pcAn + tongFiltered.pcChuyenCan, unit: "đ", cls: "text-blue-700" },
            { label: "Tăng ca",         val: tongFiltered.luongTC,        unit: "đ",     cls: "text-amber-700" },
            { label: "Tổng chi lương",  val: tongFiltered.tongLuong,      unit: "đ",     cls: "text-violet-700" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className={`text-lg font-bold ${c.cls}`}>
                {c.unit === "người" ? c.val : fmt(c.val as number)}
              </p>
              {c.unit === "đ" && <p className="text-[11px] text-slate-400">đồng</p>}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-24 text-slate-400">Đang tính lương...</div>
      ) : !data || rows.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <p className="text-2xl mb-2">💰</p>
          <p>Chưa có dữ liệu lương {formatThangLabel(thang)}</p>
          <p className="text-sm mt-1">Cần nhập chấm công trước tại trang <b>Chấm công</b></p>
        </div>
      ) : (
        <div id="bang-luong-print" ref={printRef}>
          {/* Print header */}
          <div className="hidden print:block text-center mb-4">
            <p className="text-lg font-bold uppercase tracking-widest">BẢNG LƯƠNG</p>
            <p className="text-base font-semibold">{formatThangLabel(thang).toUpperCase()}</p>
            <p className="text-xs text-slate-500 mt-1">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-700 text-white">
                    <th rowSpan={2} className="px-3 py-2.5 text-left font-semibold w-6 border-r border-slate-600">STT</th>
                    <th rowSpan={2} className="px-3 py-2.5 text-left font-semibold border-r border-slate-600">Họ và tên</th>
                    <th rowSpan={2} className="px-3 py-2.5 text-left font-semibold border-r border-slate-600">Chức vụ</th>
                    <th rowSpan={2} className="px-3 py-2.5 text-right font-semibold border-r border-slate-600">Lương CB</th>
                    {/* Ngày công */}
                    <th colSpan={5} className="px-3 py-1.5 text-center font-semibold border-r border-slate-600 bg-slate-600 text-[12px]">
                      NGÀY CÔNG
                    </th>
                    <th rowSpan={2} className="px-3 py-2.5 text-right font-semibold border-r border-slate-600 text-[12px]">Giờ TC</th>
                    {/* Thu nhập */}
                    <th colSpan={4} className="px-3 py-1.5 text-center font-semibold border-r border-slate-600 bg-emerald-700 text-[12px]">
                      THU NHẬP
                    </th>
                    <th rowSpan={2} className="px-3 py-2.5 text-right font-semibold bg-emerald-800 text-emerald-100 text-[13px]">
                      THỰC LĨNH
                    </th>
                    <th rowSpan={2} className="px-2 py-2.5 text-center font-semibold text-[11px] print:hidden w-8">
                      In
                    </th>
                  </tr>
                  <tr className="bg-slate-600 text-white text-[11px]">
                    {/* Ngày công sub-headers */}
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium">Công<br/>thực tế</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium">Muộn</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium">Nghỉ<br/>phép</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium">Nghỉ<br/>lễ</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium text-red-300">Vắng</th>
                    {/* Thu nhập sub-headers */}
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium bg-emerald-700">Lương<br/>chính</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium bg-emerald-700">PC Ăn</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium bg-emerald-700">PC<br/>Chuyên cần</th>
                    <th className="px-2 py-1.5 text-right border-r border-slate-500 font-medium bg-emerald-700">Lương<br/>Tăng ca</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => (
                    <tr key={r.nhanVienId}
                      className={`${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-violet-50/40 transition`}>
                      <td className="px-3 py-2.5 text-slate-400 text-center text-[12px] border-r border-slate-100">{i + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-100">
                        {r.ten}
                        <span className="ml-1.5 text-[11px] text-slate-400 font-normal">{r.maNV}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 text-[12px] border-r border-slate-100">{r.chucVu ?? "—"}</td>
                      <td className="px-3 py-2.5 text-right font-medium text-slate-700 border-r border-slate-100">{fmt(r.luongCB)}</td>
                      {/* Ngày công */}
                      <td className="px-2 py-2.5 text-right text-slate-700 border-r border-slate-100 font-semibold">
                        {r.ngayCong > 0 ? r.ngayCong : <span className="text-slate-300">0</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right text-slate-500 border-r border-slate-100 text-[12px]">
                        {r.ngayDiMuon > 0 ? r.ngayDiMuon : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right text-blue-600 border-r border-slate-100 text-[12px]">
                        {r.ngayNghiPhep > 0 ? r.ngayNghiPhep : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right text-slate-500 border-r border-slate-100 text-[12px]">
                        {r.ngayNghiLe > 0 ? r.ngayNghiLe : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right border-r border-slate-100 text-[12px]">
                        {r.ngayVang > 0
                          ? <span className="text-red-500 font-semibold">{r.ngayVang}</span>
                          : <span className="text-slate-200">—</span>}
                      </td>
                      <td className="px-2 py-2.5 text-right text-amber-600 border-r border-slate-100 text-[12px]">
                        {r.tongTC > 0 ? r.tongTC : <span className="text-slate-200">—</span>}
                      </td>
                      {/* Thu nhập */}
                      <td className="px-3 py-2.5 text-right text-slate-700 border-r border-slate-100">{fmt(r.luongChinh)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-500 border-r border-slate-100 text-[12px]">
                        {fmtMoney(r.pcAn)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-500 border-r border-slate-100 text-[12px]">
                        {fmtMoney(r.pcChuyenCan)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-amber-700 border-r border-slate-100 text-[12px]">
                        {fmtMoney(r.luongTC)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-violet-700 bg-violet-50/50">
                        {fmt(r.tongLuong)}
                      </td>
                      {/* In phiếu cá nhân */}
                      <td className="px-2 py-2.5 text-center print:hidden">
                        <button
                          onClick={() => setPhieuLuong({ row: r, thangLabel: formatThangLabel(thang) })}
                          title="In phiếu lương cá nhân"
                          className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-300 hover:text-violet-600 transition">
                          <Printer size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Tổng cộng */}
                <tfoot>
                  <tr className="bg-slate-800 text-white font-bold text-[13px]">
                    <td colSpan={4} className="px-3 py-3 text-right uppercase tracking-wide text-[12px] text-slate-300">
                      Tổng cộng ({rows.length} người)
                    </td>
                    <td colSpan={6} className="px-3 py-3"></td>
                    <td className="px-3 py-3 text-right">{fmt(tongFiltered.luongChinh)}</td>
                    <td className="px-3 py-3 text-right text-[12px]">{fmt(tongFiltered.pcAn)}</td>
                    <td className="px-3 py-3 text-right text-[12px]">{fmt(tongFiltered.pcChuyenCan)}</td>
                    <td className="px-3 py-3 text-right text-[12px]">{fmt(tongFiltered.luongTC)}</td>
                    <td className="px-3 py-3 text-right text-emerald-300 text-base">{fmt(tongFiltered.tongLuong)}</td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ký tên (chỉ khi in) */}
          <div className="hidden print:grid grid-cols-3 gap-8 mt-10 text-center text-[12px]">
            <div>
              <p className="font-semibold uppercase text-[11px] tracking-wide mb-16">Người lập bảng</p>
              <p className="border-t border-slate-400 pt-1 text-slate-500">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-semibold uppercase text-[11px] tracking-wide mb-16">Kế toán trưởng</p>
              <p className="border-t border-slate-400 pt-1 text-slate-500">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-semibold uppercase text-[11px] tracking-wide mb-16">Giám đốc</p>
              <p className="border-t border-slate-400 pt-1 text-slate-500">(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
