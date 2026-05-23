"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, RefreshCcw, Star, AlertTriangle,
  TrendingUp, ShoppingBag, Clock, Scissors,
  BarChart3, PieChart, CalendarDays, ChevronDown,
} from "lucide-react";
import { formatCurrency, formatDateTime, LOAI_VAN_DE, TRANG_THAI_DOI_TRA } from "@/lib/utils";

type ThangRow = { label: string; soBooking: number; chiPhi: number; doanhThu: number; loiNhuan: number; soDoiTra: number };

type DashboardData = {
  kho: { tongSanPham: number; tongTonKho: number; spSapHet: number };
  doiTra: { total: number; choXuLy: number; dangXuLy: number; chuaXuLy: number };
  koc: { tongChiPhiKOC: number; tongDoanhThuKOC: number; bookingDangChay: number; tongBooking: number };
  recentDoiTra: Array<{ id: string; maDoiTra: string; tenKhach: string; loaiVanDe: string; trangThai: string; createdAt: string }>;
  thangData: ThangRow[];
};

type LoCatRaw = {
  trangThai: string; soLuongThieu: number | null; hangThucTe: number | null;
  hdMayDa: number | null; hdGiatViSinhDa: number | null; hdGiatMauDa: number | null;
};

type SanXuatStats = {
  tongLo: number; dangSanXuat: number; daNhanVe: number;
  tongThieu: number; hoaDonMay: number; hoaDonViSinh: number; hoaDonMau: number;
};

const StatCard = ({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color?: string }) => (
  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
    <p className="text-xs text-slate-400 mb-1">{title}</p>
    <p className={`text-2xl font-extrabold ${color ?? "text-slate-800"}`}>{typeof value === "number" ? value.toLocaleString() : value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

type FilterKey = "tat_ca" | "hom_nay" | "7_ngay" | "thang_nay" | "thang_truoc" | "tuy_chinh";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "tat_ca",      label: "Tất cả" },
  { key: "hom_nay",     label: "Hôm nay" },
  { key: "7_ngay",      label: "7 ngày qua" },
  { key: "thang_nay",   label: "Tháng này" },
  { key: "thang_truoc", label: "Tháng trước" },
  { key: "tuy_chinh",   label: "Tùy chỉnh" },
];

function getDateRange(key: FilterKey, customFrom?: string, customTo?: string): { from?: string; to?: string } {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  if (key === "hom_nay") {
    const s = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const e = new Date(s); e.setDate(e.getDate() + 1);
    return { from: fmt(s), to: fmt(e) };
  }
  if (key === "7_ngay") {
    const s = new Date(now); s.setDate(s.getDate() - 6);
    return { from: fmt(new Date(s.getFullYear(), s.getMonth(), s.getDate())), to: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)) };
  }
  if (key === "thang_nay") {
    const s = new Date(now.getFullYear(), now.getMonth(), 1);
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from: fmt(s), to: fmt(e) };
  }
  if (key === "thang_truoc") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: fmt(s), to: fmt(e) };
  }
  if (key === "tuy_chinh") {
    return { from: customFrom, to: customTo ? fmt(new Date(new Date(customTo).getTime() + 86400000)) : undefined };
  }
  return {};
}

export default function TongQuanPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [sanXuat, setSanXuat] = useState<SanXuatStats | null>(null);
  const [filter, setFilter]   = useState<FilterKey>("tat_ca");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo]     = useState("");

  const fetchDashboard = (f: FilterKey, cf?: string, ct?: string) => {
    const range = getDateRange(f, cf, ct);
    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to)   params.set("to",   range.to);
    const url = "/api/dashboard" + (params.toString() ? "?" + params.toString() : "");
    fetch(url).then(r => r.json()).then(setData);
  };

  useEffect(() => {
    fetchDashboard("tat_ca");
    Promise.all([
      fetch("/api/san-xuat/lo-cat").then(r => r.json()),
      fetch("/api/san-xuat/hoa-don-ton").then(r => r.json()),
    ]).then(([loList, hoaDon]: [LoCatRaw[], { may: number; giat_vi_sinh: number; giat_mau: number }]) => {
      const mayDa   = loList.reduce((s, l) => s + (l.hdMayDa   ?? 0), 0);
      const vsinhDa = loList.reduce((s, l) => s + (l.hdGiatViSinhDa ?? 0), 0);
      const mauDa   = loList.reduce((s, l) => s + (l.hdGiatMauDa   ?? 0), 0);
      setSanXuat({
        tongLo:       loList.length,
        dangSanXuat:  loList.filter(l => l.trangThai !== "da_nhap").length,
        daNhanVe:     loList.filter(l => l.hangThucTe != null).length,
        tongThieu:    loList.reduce((s, l) => s + (l.hangThucTe != null ? Math.max(0, l.soLuongThieu ?? 0) : 0), 0),
        hoaDonMay:    hoaDon.may - mayDa,
        hoaDonViSinh: hoaDon.giat_vi_sinh - vsinhDa,
        hoaDonMau:    hoaDon.giat_mau - mauDa,
      });
    });
  }, []);

  if (!data) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <p className="text-slate-400 text-sm">Đang tải...</p>
    </div>
  );

  const roiKOC = data.koc.tongChiPhiKOC > 0
    ? ((data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC) / data.koc.tongChiPhiKOC * 100).toFixed(1)
    : "0";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-500" /> Tổng quan
          </h1>
          <p className="text-slate-400 text-sm mt-1">Báo cáo hoạt động kinh doanh</p>
        </div>

        {/* ── Bộ lọc thời gian ── */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5 shadow-sm">
            {FILTER_OPTIONS.filter(o => o.key !== "tuy_chinh").map(o => (
              <button
                key={o.key}
                onClick={() => { setFilter(o.key); fetchDashboard(o.key); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === o.key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}>
                {o.label}
              </button>
            ))}
            {/* Tùy chỉnh */}
            <button
              onClick={() => setFilter("tuy_chinh")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
                filter === "tuy_chinh"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}>
              <CalendarDays size={12} /> Tùy chỉnh
            </button>
          </div>

          {/* Date picker khi chọn Tùy chỉnh */}
          {filter === "tuy_chinh" && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="text-xs text-slate-600 border-0 outline-none bg-transparent" />
              <span className="text-slate-300 text-xs">→</span>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="text-xs text-slate-600 border-0 outline-none bg-transparent" />
              <button
                onClick={() => fetchDashboard("tuy_chinh", customFrom, customTo)}
                disabled={!customFrom && !customTo}
                className="ml-1 px-2.5 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 transition">
                Lọc
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {data.kho.spSapHet > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-bold">{data.kho.spSapHet} sản phẩm</span> sắp hết hàng (tồn kho ≤ 5).{" "}
            <Link href="/kho" className="underline">Kiểm tra kho →</Link>
          </p>
        </div>
      )}
      {data.doiTra.chuaXuLy > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock size={18} className="text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-700">
            <span className="font-bold">{data.doiTra.chuaXuLy} case đổi trả</span> chưa có mã vận đơn.{" "}
            <Link href="/doi-tra" className="underline">Xử lý ngay →</Link>
          </p>
        </div>
      )}

      {/* ── Section: Kho ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Package size={16} className="text-orange-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Kho hàng</h2>
          <Link href="/kho" className="ml-auto text-xs text-rose-500 hover:underline">Chi tiết →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Tổng sản phẩm" value={data.kho.tongSanPham} />
          <StatCard title="Tổng tồn kho" value={data.kho.tongTonKho} />
          <StatCard title="Sắp hết hàng" value={data.kho.spSapHet} color={data.kho.spSapHet > 0 ? "text-red-600" : "text-green-600"} />
        </div>
      </div>

      {/* ── Section: Sản xuất ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Scissors size={16} className="text-purple-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Sản xuất</h2>
          <Link href="/san-xuat" className="ml-auto text-xs text-rose-500 hover:underline">Chi tiết →</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatCard title="Tổng lô cắt"    value={sanXuat?.tongLo    ?? "—"} />
          <StatCard title="Đang sản xuất"  value={sanXuat?.dangSanXuat ?? "—"} color="text-blue-600" />
          <StatCard title="Tổng thiếu"     value={sanXuat?.tongThieu   ?? "—"} color={(sanXuat?.tongThieu ?? 0) > 0 ? "text-red-600" : "text-green-600"} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="HĐ May còn"     value={sanXuat?.hoaDonMay    ?? "—"} color={(sanXuat?.hoaDonMay    ?? 0) < 0 ? "text-red-600" : "text-purple-700"} sub="hóa đơn may" />
          <StatCard title="HĐ Vi sinh còn" value={sanXuat?.hoaDonViSinh ?? "—"} color={(sanXuat?.hoaDonViSinh ?? 0) < 0 ? "text-red-600" : "text-teal-700"}   sub="hóa đơn vi sinh" />
          <StatCard title="HĐ Màu còn"     value={sanXuat?.hoaDonMau    ?? "—"} color={(sanXuat?.hoaDonMau    ?? 0) < 0 ? "text-red-600" : "text-amber-700"}   sub="hóa đơn màu" />
        </div>
      </div>

      {/* ── Section: Đổi trả + KOC ── */}
      {/* Header row — cùng chiều cao, đường kẻ dọc giữa */}
      <div className="grid grid-cols-2 gap-5 mb-3">
        <div className="flex items-center gap-2">
          <RefreshCcw size={16} className="text-rose-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Đổi trả / Sự cố</h2>
          <Link href="/doi-tra" className="ml-auto text-xs text-rose-500 hover:underline">Chi tiết →</Link>
        </div>
        <div className="flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">KOC</h2>
          <Link href="/koc" className="ml-auto text-xs text-rose-500 hover:underline">Chi tiết →</Link>
        </div>
      </div>
      {/* Stat cards — 2 cột độc lập khớp với header */}
      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <StatCard title="Tổng case"  value={data.doiTra.total} />
          <StatCard title="Chưa xử lý" value={data.doiTra.chuaXuLy} color={data.doiTra.chuaXuLy > 0 ? "text-yellow-600" : "text-slate-800"} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <StatCard title="Tổng booking" value={data.koc.tongBooking} />
          <StatCard title="Đang chạy"    value={data.koc.bookingDangChay} color="text-green-600" />
          <StatCard title="ROI tổng"     value={`${roiKOC}%`} color={Number(roiKOC) >= 0 ? "text-green-600" : "text-red-600"} />
        </div>
      </div>

      {/* ── Đổi trả gần đây (trái) + Hiệu quả KOC (phải) ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* TRÁI: Đổi trả — khớp với header "Đổi trả / Sự cố" bên trái */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-rose-400" />
              <h3 className="font-semibold text-slate-700 text-sm">Đổi trả gần đây</h3>
            </div>
            <Link href="/doi-tra" className="text-xs text-rose-500 hover:underline">Xem tất cả</Link>
          </div>
          {data.recentDoiTra.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Chưa có case nào</p>
          ) : (
            <div className="space-y-1.5">
              {data.recentDoiTra.map(dt => {
                const rowColor: Record<string, string> = {
                  doi_size:     "border-l-4 border-l-blue-300 bg-blue-50/60",
                  gui_nham:     "border-l-4 border-l-purple-300 bg-purple-50/60",
                  hang_loi:     "border-l-4 border-l-red-300 bg-red-50/60",
                  don_hang_loi: "border-l-4 border-l-orange-300 bg-orange-50/60",
                };
                return (
                  <div key={dt.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${rowColor[dt.loaiVanDe] ?? "bg-slate-50/60"}`}>
                    <div>
                      <p className="text-xs font-mono text-rose-500">{dt.maDoiTra}</p>
                      <p className="text-sm text-slate-700">{dt.tenKhach} · <span className="text-xs text-slate-400">{LOAI_VAN_DE[dt.loaiVanDe]?.label}</span></p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${TRANG_THAI_DOI_TRA[dt.trangThai]?.color ?? "bg-slate-100 text-slate-600"}`}>
                        {TRANG_THAI_DOI_TRA[dt.trangThai]?.label ?? dt.trangThai}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(dt.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PHẢI: Hiệu quả KOC — khớp với header "KOC" bên phải */}
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-green-500" />
            <h3 className="font-semibold text-slate-700 text-sm">Hiệu quả KOC</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Chi phí booking</span>
              <span className="font-bold text-slate-700">{formatCurrency(data.koc.tongChiPhiKOC)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Doanh thu KOC</span>
              <span className="font-bold text-green-600">{formatCurrency(data.koc.tongDoanhThuKOC)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-500">Lợi nhuận ước tính</span>
              <span className={`font-bold ${data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tổng kết theo tháng ── */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays size={16} className="text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Tổng kết theo tháng</h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-slate-500 font-medium text-xs">Tháng</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Booking KOC</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Chi phí KOC</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Doanh thu KOC</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Lợi nhuận KOC</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs">Đổi trả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.thangData.map((t, i) => {
                const isCurrentMonth = i === data.thangData.length - 1;
                return (
                  <tr key={t.label} className={isCurrentMonth ? "bg-indigo-50/60" : "hover:bg-slate-50"}>
                    <td className="px-5 py-3 font-semibold text-slate-700">
                      {t.label}
                      {isCurrentMonth && <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">Hiện tại</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {t.soBooking > 0 ? <span className="font-medium">{t.soBooking}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {t.chiPhi > 0 ? formatCurrency(t.chiPhi) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.doanhThu > 0
                        ? <span className="text-green-600 font-medium">{formatCurrency(t.doanhThu)}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.chiPhi > 0 || t.doanhThu > 0
                        ? <span className={`font-semibold ${t.loiNhuan >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {t.loiNhuan >= 0 ? "+" : ""}{formatCurrency(t.loiNhuan)}
                          </span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.soDoiTra > 0
                        ? <span className="text-rose-500 font-medium">{t.soDoiTra}</span>
                        : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
