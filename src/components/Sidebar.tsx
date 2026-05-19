"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  RefreshCcw,
  Star,
  ShoppingBag,
  Scissors,
  LogOut,
  Calculator,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/kho", label: "Quản lý Kho", icon: Package },
  { href: "/san-xuat", label: "Sản xuất", icon: Scissors },
  { href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw },
  { href: "/koc", label: "KOC Booking", icon: Star },
  { href: "/gia-ban", label: "Giá bán sản phẩm", icon: Calculator },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`min-h-screen bg-white border-r border-slate-200 flex flex-col shadow-sm transition-all duration-200 ${expanded ? "w-60" : "w-[60px]"}`}
    >
      {/* Logo */}
      <div className="p-3 border-b border-slate-200 flex items-center gap-2 overflow-hidden">
        <ShoppingBag className="text-rose-500 flex-shrink-0" size={24} />
        {expanded && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-bold text-slate-800 text-sm leading-tight">Meisy Inhouse</p>
            <p className="text-xs text-slate-400">Quản lý TMĐT</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
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
              title={!expanded ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all overflow-hidden whitespace-nowrap ${
                isActive
                  ? "bg-rose-50 text-rose-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {expanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer + Logout */}
      <div className="p-2 border-t border-slate-200 space-y-1">
        <button
          onClick={handleLogout}
          title={!expanded ? "Đăng xuất" : undefined}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all overflow-hidden whitespace-nowrap"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {expanded && <span>Đăng xuất</span>}
        </button>
        {expanded && <p className="text-xs text-slate-400 text-center">v1.0 · Shopee & TikTok</p>}
      </div>
    </aside>
  );
}
