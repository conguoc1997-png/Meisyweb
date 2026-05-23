"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, RefreshCcw, Star,
  Scissors, Calculator, Users, Settings,
  ChevronLeft, ArrowRight,
  BarChart3, TrendingUp, PieChart,
  Box, Ruler, Layers,
  MessageCircle, HeadphonesIcon, Heart,
  Megaphone, Zap, Target,
  Shield, Key, Lock,
} from "lucide-react";
import { useUser } from "@/lib/user-context";

type Child = {
  href: string; label: string; desc: string;
  icon: React.ElementType; color: string; textColor: string;
  decoIcons?: React.ElementType[];
};
type Module = {
  key: string; label: string; desc: string;
  icon: React.ElementType;
  gradient: string;
  decoIcons: React.ElementType[];   // background decoration icons
  roles: string[];
  href?: string;
  children?: Child[];
};

const MODULES: Module[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    desc: "Dashboard & báo cáo",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-blue-700",
    decoIcons: [BarChart3, TrendingUp, PieChart],
    roles: ["admin", "kho", "san_xuat"],
  },
  {
    key: "kho-sx",
    label: "Kho & Sản xuất",
    desc: "Tồn kho, lô cắt, vải",
    icon: Package,
    gradient: "from-orange-400 to-orange-600",
    decoIcons: [Box, Scissors, Layers],
    roles: ["admin", "kho", "san_xuat"],
    children: [
      {
        href: "/kho", label: "Quản lý Kho", desc: "Tồn kho, nhập xuất sản phẩm",
        icon: Package, color: "bg-orange-100", textColor: "text-orange-600",
        decoIcons: [Box, Layers, Ruler],
      },
      {
        href: "/san-xuat", label: "Sản xuất", desc: "Lô cắt, vải tồn, hóa đơn",
        icon: Scissors, color: "bg-amber-100", textColor: "text-amber-600",
        decoIcons: [Ruler, Layers, Package],
      },
    ],
  },
  {
    key: "cham-soc",
    label: "Chăm sóc KH",
    desc: "Đổi trả, bù tiền, feedback",
    icon: RefreshCcw,
    gradient: "from-rose-400 to-rose-600",
    decoIcons: [MessageCircle, HeadphonesIcon, Heart],
    roles: ["admin", "kho"],
    children: [
      {
        href: "/doi-tra", label: "Đổi trả / Sự cố", desc: "Xử lý case đổi trả & bù tiền",
        icon: RefreshCcw, color: "bg-rose-100", textColor: "text-rose-600",
        decoIcons: [MessageCircle, Heart, HeadphonesIcon],
      },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    desc: "KOC, booking, hiệu quả",
    icon: Star,
    gradient: "from-yellow-400 to-amber-500",
    decoIcons: [Megaphone, Target, Zap],
    roles: ["admin"],
    children: [
      {
        href: "/koc", label: "KOC Booking", desc: "Quản lý KOC & chi phí booking",
        icon: Star, color: "bg-yellow-100", textColor: "text-yellow-600",
        decoIcons: [Megaphone, Target, TrendingUp],
      },
    ],
  },
  {
    key: "quantri",
    label: "Quản trị",
    desc: "User, giá bán, cài đặt",
    icon: Settings,
    gradient: "from-slate-500 to-slate-700",
    decoIcons: [Shield, Key, Lock],
    roles: ["admin"],
    children: [
      {
        href: "/gia-ban", label: "Giá bán SP", desc: "Bảng giá sản phẩm",
        icon: Calculator, color: "bg-slate-100", textColor: "text-slate-600",
        decoIcons: [BarChart3, TrendingUp, PieChart],
      },
      {
        href: "/admin/users", label: "Quản lý User", desc: "Tài khoản & phân quyền",
        icon: Users, color: "bg-indigo-100", textColor: "text-indigo-600",
        decoIcons: [Shield, Key, Lock],
      },
    ],
  },
];

// Vị trí cố định cho 3 deco icons
const DECO_POS = [
  "absolute right-4 top-4 opacity-20",
  "absolute right-10 bottom-4 opacity-10",
  "absolute right-20 top-1/2 -translate-y-1/2 opacity-10",
];

export default function LauncherPage() {
  const router   = useRouter();
  const { user } = useUser();
  const [active, setActive] = useState<Module | null>(null);

  const visible = (roles: string[]) => !user || roles.includes(user.role);
  const mods    = MODULES.filter(m => visible(m.roles));

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });

  /* ─── Sub-module view ─── */
  if (active) {
    const children = (active.children ?? []).filter(() => visible(["admin","kho","san_xuat"]));
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <button
          onClick={() => setActive(null)}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8 transition"
        >
          <ChevronLeft size={16} /> Quay lại
        </button>

        {/* Module header pill */}
        <div className={`inline-flex items-center gap-4 mb-8 px-5 py-3 rounded-2xl bg-gradient-to-r ${active.gradient} text-white shadow-lg`}>
          <active.icon size={22} />
          <div>
            <p className="font-bold text-base leading-tight">{active.label}</p>
            <p className="text-white/70 text-xs">{active.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {children.map(child => (
            <button
              key={child.href}
              onClick={() => router.push(child.href)}
              className="group relative bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all text-left flex flex-col gap-4 overflow-hidden"
            >
              {/* deco icons */}
              {(child.decoIcons ?? []).map((D, i) => (
                <D key={i} size={40} className={`${DECO_POS[i]} ${child.textColor}`} />
              ))}

              <span className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${child.color}`}>
                <child.icon size={22} className={child.textColor} />
              </span>
              <div className="relative flex-1">
                <p className="font-bold text-slate-800 text-base leading-tight">{child.label}</p>
                <p className="text-slate-400 text-sm mt-1">{child.desc}</p>
              </div>
              <span className="relative flex items-center gap-1 text-xs text-slate-400 group-hover:text-slate-600 transition">
                Mở <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ─── Main launcher grid ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Meisy Inhouse</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{dateStr}</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
        {mods.map(mod => {
          const hasChildren = !!mod.children?.length;
          return (
            <button
              key={mod.key}
              onClick={() => { if (hasChildren) setActive(mod); }}
              className={`group relative bg-gradient-to-br ${mod.gradient} rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col gap-5 overflow-hidden min-h-[160px] ${!hasChildren ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Decoration circles */}
              <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute right-4 -bottom-8 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />

              {/* Deco icons */}
              {mod.decoIcons.map((D, i) => (
                <D key={i} size={36} className={`pointer-events-none ${DECO_POS[i]} text-white`} />
              ))}

              {/* Primary icon */}
              <span className="relative w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <mod.icon size={24} className="text-white" />
              </span>

              {/* Label */}
              <div className="relative flex-1">
                <p className="font-bold text-white text-lg leading-tight">{mod.label}</p>
                <p className="text-white/60 text-sm mt-1">{mod.desc}</p>
              </div>

              {hasChildren && (
                <ArrowRight
                  size={18}
                  className="relative text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all self-end"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
