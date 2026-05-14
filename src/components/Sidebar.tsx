"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  RefreshCcw,
  Star,
  ShoppingBag,
  Scissors,
} from "lucide-react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/kho",
    label: "Quản lý Kho",
    icon: Package,
  },
  {
    href: "/san-xuat",
    label: "Sản xuất",
    icon: Scissors,
  },
  {
    href: "/doi-tra",
    label: "Đổi trả / Sự cố",
    icon: RefreshCcw,
  },
  {
    href: "/koc",
    label: "KOC Booking",
    icon: Star,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-rose-500" size={24} />
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Meisy Inhouse</p>
            <p className="text-xs text-slate-400">Quản lý TMĐT</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">v1.0 · Shopee & TikTok</p>
      </div>
    </aside>
  );
}
