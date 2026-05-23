"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, RefreshCcw, Star,
  Scissors, Calculator, Users, Settings,
  ChevronLeft, ArrowRight,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

type Child = { href: string; label: string; desc: string; icon: React.ElementType; color: string };
type Module = {
  key: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  gradient: string;       // Tailwind gradient
  iconBg: string;         // icon circle bg
  roles: string[];
  href?: string;          // nếu không có children
  children?: Child[];
};

const MODULES: Module[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    desc: "Dashboard & báo cáo",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-400/30",
    roles: ["admin", "kho", "san_xuat"],
    href: "/",          // dùng page này làm launcher → hiện sub mocked
  },
  {
    key: "kho-sx",
    label: "Kho & Sản xuất",
    desc: "Quản lý tồn kho và lô cắt",
    icon: Package,
    gradient: "from-orange-400 to-orange-500",
    iconBg: "bg-orange-300/30",
    roles: ["admin", "kho", "san_xuat"],
    children: [
      { href: "/kho",      label: "Quản lý Kho",  desc: "Tồn kho, nhập xuất",  icon: Package,  color: "bg-orange-100 text-orange-600" },
      { href: "/san-xuat", label: "Sản xuất",      desc: "Lô cắt, vải tồn",    icon: Scissors, color: "bg-amber-100 text-amber-600"  },
    ],
  },
  {
    key: "cham-soc",
    label: "Chăm sóc KH",
    desc: "Đổi trả, bù tiền, feedback",
    icon: RefreshCcw,
    gradient: "from-rose-400 to-rose-600",
    iconBg: "bg-rose-300/30",
    roles: ["admin", "kho"],
    children: [
      { href: "/doi-tra", label: "Đổi trả / Sự cố", desc: "Xử lý case đổi trả", icon: RefreshCcw, color: "bg-rose-100 text-rose-600" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    desc: "KOC, booking, hiệu quả",
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    iconBg: "bg-yellow-300/30",
    roles: ["admin"],
    children: [
      { href: "/koc", label: "KOC Booking", desc: "Quản lý KOC & chi phí", icon: Star, color: "bg-yellow-100 text-yellow-600" },
    ],
  },
  {
    key: "quantri",
    label: "Quản trị",
    desc: "Cài đặt, user, giá bán",
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    iconBg: "bg-slate-400/30",
    roles: ["admin"],
    children: [
      { href: "/gia-ban",     label: "Giá bán SP",   desc: "Bảng giá sản phẩm", icon: Calculator, color: "bg-slate-100 text-slate-600" },
      { href: "/admin/users", label: "Quản lý User", desc: "Tài khoản & phân quyền", icon: Users, color: "bg-indigo-100 text-indigo-600" },
    ],
  },
];

export default function LauncherPage() {
  const router = useRouter();
  const { user } = useUser();
  const [active, setActive] = useState<Module | null>(null);

  const visible = (roles: string[]) => !user || roles.includes(user.role);
  const mods = MODULES.filter(m => visible(m.roles));

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  // ── Sub-module view ──
  if (active) {
    const children = active.children?.filter(c => visible(["admin", "kho", "san_xuat"])) ?? [];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        {/* Back */}
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition"
        >
          <ChevronLeft size={16} />
          Quay lại
        </button>

        {/* Module header */}
        <div className={`inline-flex items-center gap-4 mb-8 px-5 py-3 rounded-2xl bg-gradient-to-r ${active.gradient} text-white shadow-lg`}>
          <active.icon size={24} />
          <div>
            <p className="font-bold text-lg leading-tight">{active.label}</p>
            <p className="text-white/70 text-sm">{active.desc}</p>
          </div>
        </div>

        {/* Sub-module grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {children.map(child => (
            <button
              key={child.href}
              onClick={() => router.push(child.href)}
              className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all text-left flex flex-col gap-4"
            >
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${child.color}`}>
                <child.icon size={22} />
              </span>
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-base leading-tight">{child.label}</p>
                <p className="text-slate-400 text-sm mt-1">{child.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-600 transition">
                Mở <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Main launcher grid ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Meisy Inhouse</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{dateStr}</p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {mods.map(mod => {
          const hasChildren = !!mod.children?.length;
          return (
            <button
              key={mod.key}
              onClick={() => {
                if (hasChildren) setActive(mod);
                else if (mod.href && mod.href !== "/") router.push(mod.href);
              }}
              className={`group relative bg-gradient-to-br ${mod.gradient} rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-left flex flex-col gap-5 overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />

              {/* Icon */}
              <span className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${mod.iconBg}`}>
                <mod.icon size={22} className="text-white" />
              </span>

              {/* Label */}
              <div className="relative">
                <p className="font-bold text-white text-lg leading-tight">{mod.label}</p>
                <p className="text-white/60 text-sm mt-1">{mod.desc}</p>
              </div>

              {/* Arrow */}
              {hasChildren && (
                <ArrowRight
                  size={18}
                  className="relative text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all mt-auto self-end"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
