"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, RefreshCcw, Star,
  Scissors,
  CalendarDays, Calculator, BookOpen,
  CalendarCheck, Landmark, ClipboardList, ArrowRight,
  CheckCircle2, Settings, Users, DatabaseBackup,
  Banknote, QrCode, Clock, ChevronRight,
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
type ChildItem = { href: string; label: string; icon: React.ElementType };
type ModCard = {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  cardBorder: string;
  hoverBg: string;        // bg khi hover (đậm hơn card)
  stat?: () => { value: string | number; label: string; urgent?: boolean } | null;
  children?: ChildItem[];
};

export default function TongQuanPage() {
  const { user } = useUser();
  const [data, setData]         = useState<DashboardData | null>(null);
  const [sanXuat, setSanXuat]   = useState<SanXuatStats | null>(null);
  const [hoveredKey, setHovered] = useState<string | null>(null);

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
  const vnHour = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })).getHours();
  const greeting = vnHour < 12 ? "Chào buổi sáng" : vnHour < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const greetIcon = vnHour < 12 ? "🌅" : vnHour < 18 ? "☀️" : "🌙";

  const MODULES: ModCard[] = [
    // ── Quản lý Kho ─────────────────────────────────────────────────
    {
      href: "/kho", icon: Package,
      label: "Quản lý Kho", desc: "Kho hàng & đối soát",
      cardBg: "bg-amber-50", cardBorder: "border-amber-100", hoverBg: "bg-amber-100",
      iconBg: "bg-amber-200", iconColor: "text-amber-600",
      stat: () => data ? { value: data.kho.tongSanPham, label: "sản phẩm", urgent: data.kho.spSapHet > 0 } : null,
      children: [
        { href: "/kho",       label: "Kho hàng",           icon: Package },
        { href: "/fake-kho",  label: "Fake Kho",            icon: Package },
        { href: "/doi-soat",  label: "Đối soát hoàn trả",  icon: ClipboardList },
      ],
    },
    // ── Sản xuất ────────────────────────────────────────────────────
    {
      href: "/san-xuat", icon: Scissors,
      label: "Sản xuất", desc: "Theo dõi lô cắt & hoá đơn",
      cardBg: "bg-violet-50", cardBorder: "border-violet-100", hoverBg: "bg-violet-100",
      iconBg: "bg-violet-200", iconColor: "text-violet-600",
      stat: () => sanXuat ? { value: sanXuat.dangSanXuat, label: "lô đang chạy" } : null,
    },
    // ── Chăm sóc KH ─────────────────────────────────────────────────
    {
      href: "/doi-tra", icon: RefreshCcw,
      label: "Chăm sóc KH", desc: "Xử lý đổi trả & sự cố",
      cardBg: "bg-rose-50", cardBorder: "border-rose-100", hoverBg: "bg-rose-100",
      iconBg: "bg-rose-200", iconColor: "text-rose-500",
      stat: () => data ? { value: data.doiTra.chuaXuLy, label: "case chờ xử lý", urgent: data.doiTra.chuaXuLy > 0 } : null,
      children: [
        { href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw },
      ],
    },
    // ── Marketing ───────────────────────────────────────────────────
    {
      href: "/koc", icon: Star,
      label: "Marketing", desc: "Quảng bá & booking chiến dịch",
      cardBg: "bg-yellow-50", cardBorder: "border-yellow-100", hoverBg: "bg-yellow-100",
      iconBg: "bg-yellow-200", iconColor: "text-yellow-600",
      stat: () => data ? { value: data.koc.bookingDangChay, label: "booking đang chạy" } : null,
      children: [
        { href: "/koc", label: "KOC Booking", icon: Star },
      ],
    },
    // ── Cấu trúc chi phí ────────────────────────────────────────────
    {
      href: "/gia-ban", icon: Calculator,
      label: "Cấu trúc chi phí", desc: "Giá bán & định mức NPL",
      cardBg: "bg-emerald-50", cardBorder: "border-emerald-100", hoverBg: "bg-emerald-100",
      iconBg: "bg-emerald-200", iconColor: "text-emerald-600",
      stat: () => null,
    },
    // ── Kho NPL ─────────────────────────────────────────────────────
    {
      href: "/ke-toan/ton-kho", icon: Package,
      label: "Kho NPL", desc: "Nhập xuất & tồn nguyên phụ liệu",
      cardBg: "bg-slate-100", cardBorder: "border-slate-200", hoverBg: "bg-slate-200",
      iconBg: "bg-slate-300", iconColor: "text-slate-600",
      stat: () => null,
      children: [
        { href: "/ke-toan/nhap-kho",       label: "Nhập kho NPL",    icon: Package },
        { href: "/ke-toan/xuat-kho",       label: "Xuất kho NPL",    icon: Package },
        { href: "/ke-toan/ton-kho",        label: "Tồn kho NPL",     icon: ClipboardList },
        { href: "/ke-toan/quy-doi-don-vi", label: "Bảng quy đổi",   icon: ClipboardList },
        { href: "/ke-toan/dinh-muc",       label: "Định mức NPL",    icon: ClipboardList },
      ],
    },
    // ── Kế toán ─────────────────────────────────────────────────────
    {
      href: "/so-thu-chi", icon: BookOpen,
      label: "Kế toán", desc: "Sổ thu chi & công nợ NCC",
      cardBg: "bg-green-50", cardBorder: "border-green-100", hoverBg: "bg-green-100",
      iconBg: "bg-green-200", iconColor: "text-green-600",
      stat: () => null,
      children: [
        { href: "/so-thu-chi",        label: "Sổ Thu Chi",          icon: BookOpen },
        { href: "/ke-toan/cong-no",   label: "Công nợ NCC",         icon: Landmark },
        { href: "/ke-toan/so-sach",   label: "Sổ sách thuế HKD",   icon: BookOpen },
      ],
    },
    // ── Lịch & Công việc ────────────────────────────────────────────
    {
      href: "/calendar", icon: CalendarDays,
      label: "Lịch & Công việc", desc: "Lịch công ty & giao việc NV",
      cardBg: "bg-blue-50", cardBorder: "border-blue-100", hoverBg: "bg-blue-100",
      iconBg: "bg-blue-200", iconColor: "text-blue-600",
      stat: () => null,
      children: [
        { href: "/calendar",     label: "Lịch Công Ty",  icon: CalendarDays },
        { href: "/giao-viec",    label: "Giao việc",      icon: ClipboardList },
        { href: "/viec-cua-toi", label: "Việc của tôi",  icon: CheckCircle2 },
      ],
    },
    // ── Nhân sự ─────────────────────────────────────────────────────
    {
      href: "/cham-cong", icon: CalendarCheck,
      label: "Nhân sự", desc: "Chấm công, lương & lịch làm việc",
      cardBg: "bg-orange-50", cardBorder: "border-orange-100", hoverBg: "bg-orange-100",
      iconBg: "bg-orange-200", iconColor: "text-orange-600",
      stat: () => null,
      children: [
        { href: "/cham-cong",             label: "Chấm công",        icon: CalendarCheck },
        { href: "/bang-luong",            label: "Bảng lương",       icon: Banknote },
        { href: "/cham-cong/qr",          label: "Mã QR chấm công",  icon: QrCode },
        { href: "/cham-cong/ca-lam-viec", label: "Lịch làm việc",    icon: Clock },
        { href: "/lich-di-lam",           label: "Đăng ký lịch NV",  icon: CalendarCheck },
      ],
    },
    // ── Công Nợ & DT ────────────────────────────────────────────────
    {
      href: "/cong-no", icon: Landmark,
      label: "Công Nợ & DT", desc: "Theo dõi công nợ & doanh thu",
      cardBg: "bg-teal-50", cardBorder: "border-teal-100", hoverBg: "bg-teal-100",
      iconBg: "bg-teal-200", iconColor: "text-teal-600",
      stat: () => null,
    },
    // ── Backup & Restore ────────────────────────────────────────────
    {
      href: "/backup", icon: DatabaseBackup,
      label: "Backup & Restore", desc: "Xuất & nhập toàn bộ dữ liệu",
      cardBg: "bg-stone-100", cardBorder: "border-stone-200", hoverBg: "bg-stone-200",
      iconBg: "bg-stone-300", iconColor: "text-stone-600",
      stat: () => null,
    },
    // ── Quản trị ────────────────────────────────────────────────────
    {
      href: "/admin/users", icon: Settings,
      label: "Quản trị", desc: "Quản lý người dùng & phân quyền",
      cardBg: "bg-indigo-50", cardBorder: "border-indigo-100", hoverBg: "bg-indigo-100",
      iconBg: "bg-indigo-200", iconColor: "text-indigo-600",
      stat: () => null,
      children: [
        { href: "/admin/users", label: "Quản lý User", icon: Users },
      ],
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          const stat = mod.stat?.();
          const hasChildren = !!mod.children?.length;
          const isHovered = hoveredKey === mod.href;

          return (
            <div
              key={mod.href}
              className="relative"
              onMouseEnter={() => hasChildren ? setHovered(mod.href) : undefined}
              onMouseLeave={() => hasChildren ? setHovered(null) : undefined}
            >
              {/* ── Main card ── */}
              <Link href={mod.href}
                className={`group ${isHovered ? mod.hoverBg : mod.cardBg} border ${mod.cardBorder} rounded-2xl shadow-sm p-5
                  hover:shadow-md transition-all duration-200
                  ${isHovered ? "-translate-y-0.5" : "hover:-translate-y-0.5"}
                  flex flex-col items-center text-center gap-3`}>

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${mod.iconBg} mt-1`}>
                  <Icon size={28} className={mod.iconColor} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-[22px] font-bold text-slate-800 leading-tight group-hover:text-slate-900 transition-colors">
                    {mod.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{mod.desc}</p>
                </div>

                {/* Live stat */}
                {stat && (
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
                    ${stat.urgent
                      ? "bg-red-100 text-red-600 border border-red-200"
                      : "bg-white/70 text-slate-500 border border-white/80"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${stat.urgent ? "bg-red-400" : "bg-slate-300"}`} />
                    {stat.value} {stat.label}
                  </div>
                )}

                {/* Children indicator */}
                {hasChildren && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>{mod.children!.length} mục</span>
                    <ChevronRight size={10} />
                  </div>
                )}
              </Link>

              {/* ── Children dropdown (on hover) ── */}
              {hasChildren && isHovered && (
                <div
                  className={`absolute left-0 right-0 top-[calc(100%-8px)] z-30
                    ${mod.cardBg} border ${mod.cardBorder} rounded-b-2xl shadow-lg
                    overflow-hidden`}
                  onMouseEnter={() => setHovered(mod.href)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div className="py-1">
                    {mod.children!.map((child, i) => {
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2.5 px-4 py-2.5
                            hover:${mod.hoverBg} transition-colors duration-100
                            ${i < mod.children!.length - 1 ? `border-b ${mod.cardBorder}` : ""}`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${mod.iconBg} flex-shrink-0`}>
                            <ChildIcon size={13} className={mod.iconColor} />
                          </div>
                          <span className="text-[13px] font-medium text-slate-700">{child.label}</span>
                          <ArrowRight size={11} className="ml-auto text-slate-400" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
