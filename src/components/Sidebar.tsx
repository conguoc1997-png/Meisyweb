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
    bg: "bg-indigo-50", text: "text-indigo-400",
    href: "/tong-quan",
  },
  {
    key: "kho", moduleKey: "kho",
    label: "Quản lý Kho", icon: Package,
    bg: "bg-amber-50", text: "text-amber-500",
    children: [
      { href: "/kho",      label: "Kho hàng",           icon: Package,       moduleKey: "kho" },
      { href: "/doi-soat", label: "Đối soát hoàn trả",  icon: ClipboardList, moduleKey: "kho" },
    ],
  },
  {
    key: "san-xuat", moduleKey: "san-xuat",
    label: "Sản xuất", icon: Scissors,
    bg: "bg-teal-50", text: "text-teal-500",
    href: "/san-xuat",
  },
  {
    key: "cham-soc", moduleKey: "doi-tra",
    label: "Chăm sóc KH", icon: RefreshCcw,
    bg: "bg-rose-50", text: "text-rose-400",
    children: [
      { href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw, moduleKey: "doi-tra" },
    ],
  },
  {
    key: "marketing", moduleKey: "koc",
    label: "Marketing", icon: Star,
    bg: "bg-pink-50", text: "text-pink-400",
    children: [
      { href: "/koc", label: "KOC Booking", icon: Star, moduleKey: "koc" },
    ],
  },
  {
    key: "gia-ban", moduleKey: "gia-ban",
    label: "Giá bán SP", icon: Calculator,
    bg: "bg-emerald-50", text: "text-emerald-500",
    href: "/gia-ban",
  },
  {
    key: "ke-toan", moduleKey: "ke-toan",
    label: "Kế toán", icon: BookOpen,
    bg: "bg-violet-50", text: "text-violet-400",
    children: [
      { href: "/ke-toan/nhap-kho",  label: "Nhập kho NPL",   icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/xuat-kho",  label: "Xuất kho NPL",   icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/ton-kho",   label: "Tồn kho NPL",    icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/dinh-muc",  label: "Định mức NPL",   icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/cong-no",   label: "Công nợ NCC",    icon: BookOpen,      moduleKey: "ke-toan" },
    ],
  },
  {
    key: "quantri", moduleKey: "users",
    label: "Quản trị", icon: Settings,
    bg: "bg-stone-100", text: "text-stone-400",
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
      className={`min-h-screen flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out z-40
        bg-[#fdfaf8] border-r border-stone-100 shadow-[1px_0_16px_0_rgba(160,120,100,0.06)]
        ${expanded ? "w-60" : "w-[72px]"}`}
    >
      {/* ── Logo ── */}
      <div className={`py-5 border-b border-stone-100/80 flex items-center overflow-hidden
        ${expanded ? "px-4 gap-3" : "px-3 justify-center"}`}>
        <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={17} className="text-rose-400" />
        </div>
        {expanded && (
          <div className="overflow-hidden whitespace-nowrap">
            <p className="font-semibold text-stone-700 text-[15px] leading-none tracking-wide">Meisy</p>
            <p className="text-[10px] text-stone-400 mt-1 tracking-widest uppercase">Inhouse</p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden px-2">
        {MODULES.filter(m => visible(m.moduleKey)).map(mod => {
          const Icon          = mod.icon;
          const isOpen        = openKeys.has(mod.key);
          const hasKids       = !!mod.children?.length;
          const anyChildActive = mod.children?.some(
            c => pathname === c.href || pathname.startsWith(c.href + "/")
          );
          const isActive = !hasKids && mod.href
            ? (pathname === mod.href || pathname.startsWith(mod.href + "/"))
            : false;

          const iconBadge = (
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              transition-all duration-150 group-hover:shadow-sm ${mod.bg}`}>
              <Icon size={17} className={mod.text} />
            </span>
          );

          if (!hasKids && mod.href) {
            return (
              <Link
                key={mod.key}
                href={mod.href}
                title={!expanded ? mod.label : undefined}
                className={`group flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-all duration-150
                  ${isActive ? "bg-rose-50/70" : "hover:bg-stone-50"}
                  ${expanded ? "" : "justify-center"}`}
              >
                {iconBadge}
                {expanded && (
                  <span className={`text-[13px] whitespace-nowrap overflow-hidden font-medium
                    ${isActive ? "text-rose-500" : "text-stone-500 group-hover:text-stone-700"}`}>
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
                className={`group w-full flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-all duration-150
                  ${anyChildActive ? "bg-rose-50/70" : "hover:bg-stone-50"}
                  ${expanded ? "" : "justify-center"}`}
              >
                {iconBadge}
                {expanded && (
                  <>
                    <span className={`flex-1 text-[13px] text-left whitespace-nowrap font-medium
                      ${anyChildActive ? "text-rose-500" : "text-stone-500 group-hover:text-stone-700"}`}>
                      {mod.label}
                    </span>
                    {isOpen
                      ? <ChevronDown size={12} className="text-stone-300 flex-shrink-0" />
                      : <ChevronRight size={12} className="text-stone-300 flex-shrink-0" />
                    }
                  </>
                )}
              </button>

              {expanded && isOpen && (
                <div className="ml-[22px] mt-0.5 pl-3.5 space-y-0.5"
                  style={{ borderLeft: "1px solid #ede8e4" }}>
                  {mod.children!.filter(c => visible(c.moduleKey)).map(child => {
                    const CIcon     = child.icon;
                    const isCActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all
                          ${isCActive
                            ? "text-rose-500 bg-rose-50/60"
                            : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
                          }`}
                      >
                        <CIcon size={12} className="flex-shrink-0" />
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
        <div className="px-3 py-3 border-t border-stone-100/80">
          <div className="px-3 py-2 rounded-xl bg-rose-50/40">
            <p className="text-[12px] font-semibold text-stone-600 truncate">{user.name}</p>
            <p className="text-[10px] text-stone-400 tracking-wide uppercase mt-0.5">
              {user.role === "admin" ? "Admin" : "Nhân viên"}
            </p>
          </div>
        </div>
      )}
    </aside>

    {/* ── Nút đăng xuất cố định góc dưới trái ── */}
    <button
      onClick={handleLogout}
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl
        bg-[#fdfaf8] border border-stone-200 shadow-sm text-[13px]
        text-stone-400 hover:bg-rose-50/80 hover:text-rose-400 hover:border-rose-200 transition-all"
    >
      <LogOut size={14} />
      <span>Đăng xuất</span>
    </button>
    </>
  );
}
