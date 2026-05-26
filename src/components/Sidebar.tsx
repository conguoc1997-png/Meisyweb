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
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@/lib/user-context";
import { parseModules } from "@/lib/auth";

type NavChild = {
  href: string;
  label: string;
  icon: React.ElementType;
  moduleKey: string; // module permission key
};

type NavModule = {
  key: string;
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  href?: string;
  moduleKey: string; // module permission key
  children?: NavChild[];
};

const MODULES: NavModule[] = [
  {
    key: "dashboard", moduleKey: "tong-quan",
    label: "Tổng quan", icon: LayoutDashboard,
    bg: "bg-gradient-to-br from-blue-500 to-blue-700", text: "text-white",
    href: "/tong-quan",
  },
  {
    key: "kho", moduleKey: "kho",
    label: "Quản lý Kho", icon: Package,
    bg: "bg-gradient-to-br from-orange-400 to-orange-600", text: "text-white",
    children: [
      { href: "/kho",      label: "Kho hàng",           icon: Package,       moduleKey: "kho" },
      { href: "/doi-soat", label: "Đối soát hoàn trả",  icon: ClipboardList, moduleKey: "kho" },
    ],
  },
  {
    key: "san-xuat", moduleKey: "san-xuat",
    label: "Sản xuất", icon: Scissors,
    bg: "bg-gradient-to-br from-teal-500 to-teal-700", text: "text-white",
    href: "/san-xuat",
  },
  {
    key: "cham-soc", moduleKey: "doi-tra",
    label: "Chăm sóc KH", icon: RefreshCcw,
    bg: "bg-gradient-to-br from-rose-400 to-rose-600", text: "text-white",
    children: [
      { href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw, moduleKey: "doi-tra" },
    ],
  },
  {
    key: "marketing", moduleKey: "koc",
    label: "Marketing", icon: Star,
    bg: "bg-gradient-to-br from-yellow-400 to-amber-500", text: "text-white",
    children: [
      { href: "/koc", label: "KOC Booking", icon: Star, moduleKey: "koc" },
    ],
  },
  {
    key: "gia-ban", moduleKey: "gia-ban",
    label: "Giá bán SP", icon: Calculator,
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-700", text: "text-white",
    href: "/gia-ban",
  },
  {
    key: "ke-toan", moduleKey: "ke-toan",
    label: "Kế toán", icon: BookOpen,
    bg: "bg-gradient-to-br from-indigo-500 to-indigo-700", text: "text-white",
    children: [
      { href: "/ke-toan/cong-no", label: "Công nợ", icon: BookOpen, moduleKey: "ke-toan" },
    ],
  },
  {
    key: "quantri", moduleKey: "users",
    label: "Quản trị", icon: Settings,
    bg: "bg-gradient-to-br from-slate-500 to-slate-700", text: "text-white",
    children: [
      { href: "/admin/users", label: "Quản lý User", icon: Users, moduleKey: "users" },
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
  const [expanded, setExpanded] = useState(false);

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

  const userModules = user ? parseModules(user.role) : [];
  const visible = (moduleKey: string) =>
    !user || user.role === "admin" || userModules.includes(moduleKey);

  return (
    <>
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-md flex-shrink-0 transition-all duration-200 ease-in-out z-40 ${
        expanded ? "w-60" : "w-[76px]"
      }`}
    >
      {/* ── Logo ── */}
      <div className={`py-4 border-b border-slate-100 flex items-center overflow-hidden ${expanded ? "px-4 gap-3" : "px-3 justify-center"}`}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <ShoppingBag size={22} className="text-white" />
        </div>
        {expanded && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-extrabold text-slate-800 text-lg leading-none tracking-tight">Meisy</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Inhouse v1.0</p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className={`flex-1 py-3 space-y-1 overflow-y-auto overflow-x-hidden ${expanded ? "px-2" : "px-2"}`}>
        {MODULES.filter(m => visible(m.moduleKey)).map(mod => {
          const Icon     = mod.icon;
          const isOpen   = openKeys.has(mod.key);
          const hasKids  = !!mod.children?.length;
          const anyChildActive = mod.children?.some(
            c => pathname === c.href || pathname.startsWith(c.href + "/")
          );
          const isActive = !hasKids && mod.href
            ? (pathname === mod.href || pathname.startsWith(mod.href + "/"))
            : false;

          const iconBadge = (
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${mod.bg}`}>
              <Icon size={22} className={mod.text} />
            </span>
          );

          if (!hasKids && mod.href) {
            return (
              <Link
                key={mod.key}
                href={mod.href}
                title={!expanded ? mod.label : undefined}
                className={`group flex items-center gap-3 px-1.5 py-1.5 rounded-xl font-medium transition-all ${
                  isActive ? "bg-rose-50" : "hover:bg-slate-50"
                } ${expanded ? "" : "justify-center"}`}
              >
                {iconBadge}
                {expanded && (
                  <span className={`text-sm whitespace-nowrap overflow-hidden ${isActive ? "text-rose-600" : "text-slate-600"}`}>
                    {mod.label}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <div key={mod.key}>
              <button
                onClick={() => expanded && toggle(mod.key)}
                title={!expanded ? mod.label : undefined}
                className={`group w-full flex items-center gap-3 px-1.5 py-1.5 rounded-xl font-medium transition-all ${
                  anyChildActive ? "bg-rose-50" : "hover:bg-slate-50"
                } ${expanded ? "" : "justify-center"}`}
              >
                {iconBadge}
                {expanded && (
                  <>
                    <span className={`flex-1 text-sm text-left whitespace-nowrap ${anyChildActive ? "text-rose-600" : "text-slate-600"}`}>
                      {mod.label}
                    </span>
                    {isOpen
                      ? <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
                      : <ChevronRight size={14} className="text-slate-400 flex-shrink-0" />
                    }
                  </>
                )}
              </button>

              {expanded && isOpen && (
                <div className="ml-4 mt-0.5 pl-4 border-l-2 border-slate-100 space-y-0.5">
                  {mod.children!.filter(c => visible(c.moduleKey)).map(child => {
                    const CIcon = child.icon;
                    const isCActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isCActive ? "bg-rose-50 text-rose-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <CIcon size={13} className="flex-shrink-0" />
                        <span className="whitespace-nowrap">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer (user info khi mở rộng) ── */}
      {expanded && user && (
        <div className="px-4 py-3 border-t border-slate-100">
          <p className="text-[12px] font-semibold text-slate-700 truncate">{user.name}</p>
          <p className="text-[11px] text-slate-400 capitalize">{user.role === "admin" ? "Admin" : "User"}</p>
        </div>
      )}
    </aside>

    {/* ── Nút đăng xuất cố định góc dưới trái ── */}
    <button
      onClick={handleLogout}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-md text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
    >
      <LogOut size={16} />
      <span>Đăng xuất</span>
    </button>
    </>
  );
}
