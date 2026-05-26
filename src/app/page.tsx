"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, RefreshCcw, Star, AlertTriangle, TrendingUp, ShoppingBag, Clock, Scissors } from "lucide-react";
import { formatCurrency, formatDateTime, LOAI_VAN_DE, TRANG_THAI_DOI_TRA } from "@/lib/utils";

type DashboardData = {
  kho: { tongSanPham: number; tongTonKho: number; spSapHet: number };
  doiTra: { total: number; choXuLy: number; dangXuLy: number };
  koc: { tongChiPhiKOC: number; tongDoanhThuKOC: number; bookingDangChay: number; tongBooking: number };
  recentDoiTra: Array<{ id: string; maDoiTra: string; tenKhach: string; loaiVanDe: string; trangThai: string; createdAt: string }>;
};

type LoCat = {
  trangThai: string;
  soLuongThieu: number | null;
  hdMayDa: number | null;
  hdGiatViSinhDa: number | null;
  hdGiatMauDa: number | null;
};

type SanXuatStats = {
  tongLo: number;
  dangSanXuat: number;
  daNhanVe: number;
  tongThieu: number;
  hoaDonMay: number;
  hoaDonViSinh: number;
  hoaDonMau: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [sanXuat, setSanXuat] = useState<SanXuatStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    Promise.all([
      fetch("/api/san-xuat/lo-cat").then((r) => r.json()),
      fetch("/api/san-xuat/hoa-don-ton").then((r) => r.json()),
    ]).then(([loList, hoaDon]: [LoCat[], { may: number; giat_vi_sinh: number; giat_mau: number }]) => {
      const mayDa = loList.reduce((s: number, l: LoCat) => s + (l.hdMayDa ?? 0), 0);
      const vsinhDa = loList.reduce((s: number, l: LoCat) => s + (l.hdGiatViSinhDa ?? 0), 0);
      const mauDa = loList.reduce((s: number, l: LoCat) => s + (l.hdGiatMauDa ?? 0), 0);
      setSanXuat({
        tongLo: loList.length,
        dangSanXuat: loList.filter((l: LoCat) => l.trangThai !== "da_nhan").length,
        daNhanVe: loList.filter((l: LoCat) => l.trangThai === "da_nhan").length,
        tongThieu: loList.reduce((s: number, l: LoCat) => s + (l.soLuongThieu ?? 0), 0),
        hoaDonMay: hoaDon.may - mayDa,
        hoaDonViSinh: hoaDon.giat_vi_sinh - vsinhDa,
        hoaDonMau: hoaDon.giat_mau - mauDa,
      });
    });
  }, []);

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-slate-400 text-sm">Đang tải...</div>
      </div>
    );
  }

  const roiKOC = data.koc.tongChiPhiKOC > 0
    ? ((data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC) / data.koc.tongChiPhiKOC * 100).toFixed(1)
    : "0";

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Alert: SP sắp hết */}
      {data.kho.spSapHet > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-bold">{data.kho.spSapHet} sản phẩm</span> sắp hết hàng (tồn kho ≤ 5).{" "}
            <Link href="/kho" className="underline">Kiểm tra kho →</Link>
          </p>
        </div>
      )}

      {data.doiTra.choXuLy > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <Clock size={18} className="text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-700">
            <span className="font-bold">{data.doiTra.choXuLy} case đổi trả</span> đang chờ xử lý.{" "}
            <Link href="/doi-tra" className="underline">Xử lý ngay →</Link>
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Kho */}
        <Link href="/kho" className="bg-white rounded-xl p-5 border border-slate-200 hover:border-rose-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Quản lý Kho</p>
            <Package size={20} className="text-rose-400 group-hover:text-rose-500 transition" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng sản phẩm</span>
              <span className="font-bold text-slate-800">{data.kho.tongSanPham}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng tồn kho</span>
              <span className="font-bold text-slate-800">{data.kho.tongTonKho.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sắp hết hàng</span>
              <span className={`font-bold ${data.kho.spSapHet > 0 ? "text-red-600" : "text-green-600"}`}>{data.kho.spSapHet}</span>
            </div>
          </div>
        </Link>

        {/* Đổi trả */}
        <Link href="/doi-tra" className="bg-blue-50 rounded-xl p-5 border border-blue-100 hover:border-blue-300 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-700">Đổi trả / Sự cố</p>
            <RefreshCcw size={20} className="text-blue-400 group-hover:text-blue-600 transition" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng case</span>
              <span className="font-bold text-slate-800">{data.doiTra.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Chờ xử lý</span>
              <span className={`font-bold ${data.doiTra.choXuLy > 0 ? "text-yellow-600" : "text-slate-800"}`}>{data.doiTra.choXuLy}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đang xử lý</span>
              <span className="font-bold text-blue-600">{data.doiTra.dangXuLy}</span>
            </div>
          </div>
        </Link>

        {/* KOC */}
        <Link href="/koc" className="bg-white rounded-xl p-5 border border-slate-200 hover:border-rose-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">KOC Booking</p>
            <Star size={20} className="text-amber-400 group-hover:text-amber-500 transition" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tổng booking</span>
              <span className="font-bold text-slate-800">{data.koc.tongBooking}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đang chạy</span>
              <span className="font-bold text-green-600">{data.koc.bookingDangChay}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ROI tổng</span>
              <span className={`font-bold ${Number(roiKOC) >= 0 ? "text-green-600" : "text-red-600"}`}>{roiKOC}%</span>
            </div>
          </div>
        </Link>

        {/* Sản xuất */}
        <Link href="/san-xuat" className="bg-white rounded-xl p-5 border border-slate-200 hover:border-rose-200 hover:shadow-sm transition group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600">Sản xuất</p>
            <Scissors size={20} className="text-purple-400 group-hover:text-purple-500 transition" />
          </div>
          {sanXuat ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tổng lô cắt</span>
                <span className="font-bold text-slate-800">{sanXuat.tongLo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Đang sản xuất</span>
                <span className="font-bold text-blue-600">{sanXuat.dangSanXuat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tổng thiếu</span>
                <span className={`font-bold ${sanXuat.tongThieu > 0 ? "text-red-600" : "text-green-600"}`}>{sanXuat.tongThieu}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Đang tải...</p>
          )}
        </Link>
      </div>

      {/* Sản xuất - HĐ còn */}
      {sanXuat && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Scissors size={18} className="text-purple-500" />
            <h3 className="font-semibold text-slate-700">Hóa đơn sản xuất còn lại</h3>
            <Link href="/san-xuat" className="ml-auto text-xs text-rose-500 hover:underline">Xem chi tiết</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">HĐ May còn</p>
              <p className={`text-2xl font-bold ${sanXuat.hoaDonMay < 0 ? "text-red-600" : "text-purple-700"}`}>{sanXuat.hoaDonMay.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">HĐ Vi sinh còn</p>
              <p className={`text-2xl font-bold ${sanXuat.hoaDonViSinh < 0 ? "text-red-600" : "text-blue-700"}`}>{sanXuat.hoaDonViSinh.toLocaleString()}</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">HĐ Màu còn</p>
              <p className={`text-2xl font-bold ${sanXuat.hoaDonMau < 0 ? "text-red-600" : "text-amber-700"}`}>{sanXuat.hoaDonMau.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* KOC Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-500" />
            <h3 className="font-semibold text-slate-700">Hiệu quả KOC</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Tổng chi phí booking</span>
              <span className="font-bold text-slate-700">{formatCurrency(data.koc.tongChiPhiKOC)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Tổng doanh thu từ KOC</span>
              <span className="font-bold text-green-600">{formatCurrency(data.koc.tongDoanhThuKOC)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-sm text-slate-500">Lợi nhuận ước tính</span>
              <span className={`font-bold ${data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC)}
              </span>
            </div>
          </div>
        </div>

        {/* Recent đổi trả */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-blue-400" />
              <h3 className="font-semibold text-blue-700">Đổi trả gần đây</h3>
            </div>
            <Link href="/doi-tra" className="text-xs text-blue-500 hover:underline">Xem tất cả</Link>
          </div>
          {data.recentDoiTra.length === 0 ? (
            <p className="text-sm text-blue-300 text-center py-4">Chưa có case nào</p>
          ) : (
            <div className="space-y-2">
              {data.recentDoiTra.map((dt) => (
                <div key={dt.id} className="flex items-center justify-between py-1.5 border-b border-blue-100 last:border-0">
                  <div>
                    <p className="text-xs font-mono text-blue-500">{dt.maDoiTra}</p>
                    <p className="text-sm text-blue-800">{dt.tenKhach} · <span className="text-xs text-blue-400">{LOAI_VAN_DE[dt.loaiVanDe]?.label}</span></p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${TRANG_THAI_DOI_TRA[dt.trangThai]?.color ?? "bg-blue-100 text-blue-600"}`}>
                      {TRANG_THAI_DOI_TRA[dt.trangThai]?.label ?? dt.trangThai}
                    </span>
                    <p className="text-xs text-blue-300 mt-0.5">{formatDateTime(dt.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
