"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, RefreshCcw, Star,
  Scissors,
  CalendarDays, Calculator, BookOpen,
  CalendarCheck, Landmark, ClipboardList, ArrowRight,
  CheckCircle2,
} from "lucide-react";
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
  // Giờ Việt Nam (UTC+7)
  const vnHour = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })).getHours();
  const greeting = vnHour < 12 ? "Chào buổi sáng" : vnHour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const greetIcon = vnHour < 12 ? "🌅" : vnHour < 18 ? "☀️" : "🌙";
  const displayName = user?.name ? user.name.split(" ").slice(-1)[0] : "";

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
      <div className="flex items-center gap-5 mb-8">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name}
              className="w-28 h-28 rounded-3xl object-cover shadow-md border-2 border-white ring-2 ring-slate-100" />
          ) : (
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
              <span className="text-white text-4xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          )}
        </div>
        {/* Text */}
        <div>
          <p className="text-sm text-slate-400 mb-0.5">Tổng quan hệ thống</p>
          <h1 className="text-3xl font-bold text-slate-800">
            {greeting}{user?.name ? `, ${user.name}` : ""} {greetIcon}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })}
          </p>
        </div>
      </div>

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

    </div>
  );
}
