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
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/user-context";

type NavChild = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

type NavModule = {
  key: string;
  label: string;
  icon: React.ElementType;
  bg: string;       // icon badge bg
  text: string;     // icon badge text color
  href?: string;    // nếu không có children → link trực tiếp
  roles: string[];
  children?: NavChild[];
};

const MODULES: NavModule[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
    bg: "bg-blue-100", text: "text-blue-600",
    href: "/",
    roles: ["admin", "kho", "san_xuat"],
  },
  {
    key: "kho-sx",
    label: "Kho & Sản xuất",
    icon: Package,
    bg: "bg-orange-100", text: "text-orange-600",
    roles: ["admin", "kho", "san_xuat"],
    children: [
      { href: "/kho",      label: "Quản lý Kho", icon: Package,  roles: ["admin", "kho"] },
      { href: "/san-xuat", label: "Sản xuất",     icon: Scissors, roles: ["admin", "san_xuat"] },
    ],
  },
  {
    key: "cham-soc",
    label: "Chăm sóc KH",
    icon: RefreshCcw,
    bg: "bg-rose-100", text: "text-rose-600",
    roles: ["admin", "kho"],
    children: [
      { href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw, roles: ["admin", "kho"] },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Star,
    bg: "bg-yellow-100", text: "text-yellow-600",
    roles: ["admin"],
    children: [
      { href: "/koc", label: "KOC Booking", icon: Star, roles: ["admin"] },
    ],
  },
  {
    key: "quantri",
    label: "Quản trị",
    icon: Settings,
    bg: "bg-slate-100", text: "text-slate-600",
    roles: ["admin"],
    children: [
      { href: "/gia-ban",      label: "Giá bán SP",    icon: Calculator, roles: ["admin"] },
      { href: "/admin/users",  label: "Quản lý User",  icon: Users,      roles: ["admin"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useUser();

  // Tự động mở module chứa route hiện tại
  const defaultOpen = MODULES
    .filter(m => m.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")))
    .map(m => m.key);

  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set(defaultOpen));

  // Cập nhật khi pathname thay đổi
  useEffect(() => {
    const active = MODULES
      .filter(m => m.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")))
      .map(m => m.key);
    setOpenKeys(prev => new Set([...prev, ...active]));
  }, [pathname]);

  const toggle = (key: string) =>
    setOpenKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const visible = (roles: string[]) => !user || roles.includes(user.role);

  return (
    <aside className="min-h-screen w-56 bg-white border-r border-slate-200 flex flex-col shadow-sm flex-shrink-0">

      {/* ── Logo ── */}
      <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">Meisy</p>
          <p className="text-[11px] text-slate-400">Inhouse v1.0</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {MODULES.filter(m => visible(m.roles)).map(mod => {
          const Icon    = mod.icon;
          const isOpen  = openKeys.has(mod.key);
          const hasKids = !!mod.children?.length;

          // Module trực tiếp (không có children)
          if (!hasKids && mod.href) {
            const isActive = pathname === mod.href;
            return (
              <Link
                key={mod.key}
                href={mod.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-rose-50 text-rose-600 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.bg}`}>
                  <Icon size={14} className={mod.text} />
                </span>
                <span>{mod.label}</span>
              </Link>
            );
          }

          // Module có children
          const anyChildActive = mod.children?.some(
            c => pathname === c.href || pathname.startsWith(c.href + "/")
          );

          return (
            <div key={mod.key}>
              {/* Module header */}
              <button
                onClick={() => toggle(mod.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  anyChildActive
                    ? "bg-rose-50 text-rose-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.bg}`}>
                  <Icon size={14} className={mod.text} />
                </span>
                <span className="flex-1 text-left">{mod.label}</span>
                {isOpen
                  ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                  : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                }
              </button>

              {/* Sub-items */}
              {isOpen && (
                <div className="ml-3 mt-0.5 pl-4 border-l-2 border-slate-100 space-y-0.5">
                  {mod.children!.filter(c => visible(c.roles)).map(child => {
                    const CIcon    = child.icon;
                    const isActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? "bg-rose-50 text-rose-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <CIcon size={13} className="flex-shrink-0" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-2 py-3 border-t border-slate-100 space-y-1">
        {user && (
          <div className="px-3 py-2 rounded-xl bg-slate-50 mb-1">
            <p className="text-[12px] font-semibold text-slate-700 truncate">{user.name}</p>
            <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={15} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
