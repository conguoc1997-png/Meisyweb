"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, RefreshCcw, Star, AlertTriangle,
  TrendingUp, ShoppingBag, Clock, Scissors,
  BarChart3, CalendarDays, Calculator, BookOpen,
  CalendarCheck, Landmark, ClipboardList, ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, LOAI_VAN_DE, TRANG_THAI_DOI_TRA, formatDateTime } from "@/lib/utils";
import { useUser } from "@/lib/user-context";

type DashboardData = {
  kho: { tongSanPham: number; tongTonKho: number; spSapHet: number };
  doiTra: { total: number; choXuLy: number; dangXuLy: number; chuaXuLy: number };
  koc: { tongChiPhiKOC: number; tongDoanhThuKOC: number; bookingDangChay: number; tongBooking: number };
  recentDoiTra: Array<{ id: string; maDoiTra: string; tenKhach: string; loaiVanDe: string; trangThai: string; createdAt: string }>;
  thangData: Array<{ label: string; soBooking: number; chiPhi: number; doanhThu: number; loiNhuan: number; soDoiTra: number }>;
};
type LoCatRaw = {
  trangThai: string; soLuongThieu: number | null; hangThucTe: number | null;
  hdMayDa: number | null; hdGiatViSinhDa: number | null; hdGiatMauDa: number | null;
};
type SanXuatStats = {
  tongLo: number; dangSanXuat: number; tongThieu: number;
  hoaDonMay: number; hoaDonViSinh: number; hoaDonMau: number;
};

// ── Module card definition ────────────────────────────────────────────
type ModCard = {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  stat?: () => { value: string | number; label: string; urgent?: boolean } | null;
};

export default function TongQuanPage() {
  const { user } = useUser();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [sanXuat, setSanXuat] = useState<SanXuatStats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
    Promise.all([
      fetch("/api/san-xuat/lo-cat").then(r => r.json()),
      fetch("/api/san-xuat/hoa-don-ton").then(r => r.json()),
    ]).then(([loList, hoaDon]: [LoCatRaw[], { may: number; giat_vi_sinh: number; giat_mau: number }]) => {
      const mayDa   = loList.reduce((s, l) => s + (l.hdMayDa ?? 0), 0);
      const vsinhDa = loList.reduce((s, l) => s + (l.hdGiatViSinhDa ?? 0), 0);
      const mauDa   = loList.reduce((s, l) => s + (l.hdGiatMauDa ?? 0), 0);
      setSanXuat({
        tongLo:       loList.length,
        dangSanXuat:  loList.filter(l => l.trangThai !== "da_nhap").length,
        tongThieu:    loList.reduce((s, l) => s + (l.hangThucTe != null ? Math.max(0, l.soLuongThieu ?? 0) : 0), 0),
        hoaDonMay:    hoaDon.may - mayDa,
        hoaDonViSinh: hoaDon.giat_vi_sinh - vsinhDa,
        hoaDonMau:    hoaDon.giat_mau - mauDa,
      });
    });
  }, []);

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Chào buổi sáng" : now.getHours() < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  const MODULES: ModCard[] = [
    {
      href: "/kho", icon: Package,
      label: "Kho hàng", desc: "Quản lý tồn kho sản phẩm",
      iconBg: "bg-amber-50", iconColor: "text-amber-500",
      stat: () => data ? { value: data.kho.tongSanPham, label: "sản phẩm", urgent: data.kho.spSapHet > 0 } : null,
    },
    {
      href: "/san-xuat", icon: Scissors,
      label: "Sản xuất", desc: "Theo dõi lô cắt & hoá đơn",
      iconBg: "bg-violet-50", iconColor: "text-violet-500",
      stat: () => sanXuat ? { value: sanXuat.dangSanXuat, label: "lô đang chạy" } : null,
    },
    {
      href: "/doi-tra", icon: RefreshCcw,
      label: "Chăm sóc KH", desc: "Xử lý đổi trả & sự cố",
      iconBg: "bg-rose-50", iconColor: "text-rose-400",
      stat: () => data ? { value: data.doiTra.chuaXuLy, label: "case chờ xử lý", urgent: data.doiTra.chuaXuLy > 0 } : null,
    },
    {
      href: "/koc", icon: Star,
      label: "KOC Booking", desc: "Quảng bá & booking chiến dịch",
      iconBg: "bg-amber-50", iconColor: "text-amber-400",
      stat: () => data ? { value: data.koc.bookingDangChay, label: "booking đang chạy" } : null,
    },
    {
      href: "/gia-ban", icon: Calculator,
      label: "Cấu trúc chi phí", desc: "Giá bán & định mức NPL",
      iconBg: "bg-emerald-50", iconColor: "text-emerald-500",
      stat: () => null,
    },
    {
      href: "/ke-toan/ton-kho", icon: Package,
      label: "Kho NPL", desc: "Nhập xuất & tồn nguyên phụ liệu",
      iconBg: "bg-slate-50", iconColor: "text-slate-500",
      stat: () => null,
    },
    {
      href: "/so-thu-chi", icon: BookOpen,
      label: "Sổ Thu Chi", desc: "Ghi nhận thu chi nội bộ",
      iconBg: "bg-green-50", iconColor: "text-green-500",
      stat: () => null,
    },
    {
      href: "/cong-no", icon: Landmark,
      label: "Công Nợ & DT", desc: "Theo dõi công nợ & doanh thu",
      iconBg: "bg-teal-50", iconColor: "text-teal-500",
      stat: () => null,
    },
    {
      href: "/calendar", icon: CalendarDays,
      label: "Lịch & Công việc", desc: "Lịch công ty & giao việc NV",
      iconBg: "bg-blue-50", iconColor: "text-blue-400",
      stat: () => null,
    },
    {
      href: "/cham-cong", icon: CalendarCheck,
      label: "Chấm công", desc: "Điểm danh & bảng lương NV",
      iconBg: "bg-orange-50", iconColor: "text-orange-400",
      stat: () => null,
    },
    {
      href: "/viec-cua-toi", icon: CheckCircle2,
      label: "Việc của tôi", desc: "Xem & cập nhật công việc được giao",
      iconBg: "bg-indigo-50", iconColor: "text-indigo-500",
      stat: () => null,
    },
    {
      href: "/lich-di-lam", icon: ClipboardList,
      label: "Đăng ký lịch", desc: "Đăng ký & quản lý lịch đi làm",
      iconBg: "bg-pink-50", iconColor: "text-pink-400",
      stat: () => null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] p-6 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 mb-1">{greeting}{user?.name ? `, ${user.name.split(" ").slice(-1)[0]}` : ""} 👋</p>
        <h1 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h1>
        <p className="text-sm text-slate-400 mt-1">
          {now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* ── Alerts ── */}
      {(data?.kho.spSapHet ?? 0) > 0 && (
        <Link href="/kho" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-3 hover:bg-red-100/60 transition group">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-600 flex-1">
            <span className="font-semibold">{data!.kho.spSapHet} sản phẩm</span> sắp hết hàng (tồn ≤ 5)
          </p>
          <ArrowRight size={14} className="text-red-300 group-hover:text-red-400 transition" />
        </Link>
      )}
      {(data?.doiTra.chuaXuLy ?? 0) > 0 && (
        <Link href="/doi-tra" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6 hover:bg-amber-100/60 transition group">
          <Clock size={16} className="text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 flex-1">
            <span className="font-semibold">{data!.doiTra.chuaXuLy} case đổi trả</span> chưa có mã vận đơn
          </p>
          <ArrowRight size={14} className="text-amber-300 group-hover:text-amber-400 transition" />
        </Link>
      )}

      {/* ── Module Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          const stat = mod.stat?.();
          return (
            <Link key={mod.href} href={mod.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mod.iconBg}`}>
                <Icon size={20} className={mod.iconColor} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                  {mod.label}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{mod.desc}</p>
              </div>

              {/* Live stat */}
              {stat && (
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit
                  ${stat.urgent
                    ? "bg-red-50 text-red-500 border border-red-200"
                    : "bg-gray-50 text-slate-500 border border-gray-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stat.urgent ? "bg-red-400" : "bg-gray-300"}`} />
                  {stat.value} {stat.label}
                </div>
              )}

              {/* Arrow */}
              <ArrowRight size={13} className="text-gray-200 group-hover:text-gray-400 transition-colors self-end mt-auto" />
            </Link>
          );
        })}
      </div>

      {/* ── KPI tháng này ── */}
      {data && (() => {
        const roiKOC = data.koc.tongChiPhiKOC > 0
          ? ((data.koc.tongDoanhThuKOC - data.koc.tongChiPhiKOC) / data.koc.tongChiPhiKOC * 100).toFixed(1)
          : "0";
        return (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Chỉ số tháng này</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Booking KOC", value: data.koc.tongBooking, sub: `${data.koc.bookingDangChay} đang chạy`, color: "text-amber-600" },
                { label: "Chi phí KOC", value: formatCurrency(data.koc.tongChiPhiKOC), sub: "tổng đầu tư", color: "text-slate-700" },
                { label: "Doanh thu KOC", value: formatCurrency(data.koc.tongDoanhThuKOC), sub: "ước tính", color: "text-emerald-600" },
                { label: "ROI KOC", value: `${roiKOC}%`, sub: "hiệu quả đầu tư", color: Number(roiKOC) >= 0 ? "text-emerald-600" : "text-red-500" },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                  <p className="text-[11px] text-slate-400 mb-1">{k.label}</p>
                  <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Đổi trả gần đây ── */}
      {data && data.recentDoiTra.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={14} className="text-rose-400" />
            <p className="text-sm font-semibold text-slate-700">Đổi trả gần đây</p>
            <Link href="/doi-tra" className="ml-auto text-xs text-rose-400 hover:text-rose-600 flex items-center gap-1 transition">
              Xem tất cả <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {data.recentDoiTra.map(dt => (
              <div key={dt.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50/70 hover:bg-gray-100/60 transition">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-300 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono text-rose-400">{dt.maDoiTra}</p>
                    <p className="text-sm text-slate-700">{dt.tenKhach}
                      <span className="text-[11px] text-slate-400 ml-1.5">{LOAI_VAN_DE[dt.loaiVanDe]?.label}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TRANG_THAI_DOI_TRA[dt.trangThai]?.color ?? "bg-slate-100 text-slate-500"}`}>
                    {TRANG_THAI_DOI_TRA[dt.trangThai]?.label ?? dt.trangThai}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(dt.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
