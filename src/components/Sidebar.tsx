"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, RefreshCcw, Star, ShoppingBag, Scissors,
  LogOut, Calculator, Users, Settings, ClipboardList, BookOpen,
  CalendarCheck, DatabaseBackup, Banknote, Landmark, QrCode, Clock,
  ChevronDown, Menu, X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/user-context";
import { parseModules } from "@/lib/auth";

type NavChild = { href: string; label: string; icon: React.ElementType; moduleKey: string };
type NavModule = {
  key: string; label: string; icon: React.ElementType;
  href?: string; moduleKey: string; children?: NavChild[];
  color: string; // tailwind text color class
};

const MODULES: NavModule[] = [
  { key: "dashboard", moduleKey: "tong-quan", label: "Tổng quan",       icon: LayoutDashboard, href: "/tong-quan",   color: "text-indigo-500" },
  { key: "kho",       moduleKey: "kho",        label: "Kho",             icon: Package,         color: "text-amber-500",
    children: [
      { href: "/kho",      label: "Kho hàng",         icon: Package,       moduleKey: "kho" },
      { href: "/fake-kho", label: "Fake Kho",          icon: Package,       moduleKey: "kho" },
      { href: "/doi-soat", label: "Đối soát hoàn trả", icon: ClipboardList, moduleKey: "kho" },
    ],
  },
  { key: "san-xuat",  moduleKey: "san-xuat",   label: "Sản xuất",       icon: Scissors,        href: "/san-xuat",   color: "text-teal-500" },
  { key: "cham-soc",  moduleKey: "doi-tra",    label: "CSKH",           icon: RefreshCcw,      color: "text-rose-400",
    children: [{ href: "/doi-tra", label: "Đổi trả / Sự cố", icon: RefreshCcw, moduleKey: "doi-tra" }],
  },
  { key: "marketing", moduleKey: "koc",        label: "Marketing",      icon: Star,            color: "text-pink-400",
    children: [{ href: "/koc", label: "KOC Booking", icon: Star, moduleKey: "koc" }],
  },
  { key: "gia-ban",   moduleKey: "gia-ban",    label: "Chi phí",        icon: Calculator,      href: "/gia-ban",    color: "text-emerald-500" },
  { key: "ke-toan",   moduleKey: "ke-toan",    label: "Kế toán",        icon: BookOpen,        color: "text-violet-500",
    children: [
      { href: "/ke-toan/nhap-kho",       label: "Nhập kho NPL",    icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/xuat-kho",       label: "Xuất kho NPL",    icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/ton-kho",        label: "Tồn kho NPL",     icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/quy-doi-don-vi", label: "Bảng quy đổi",   icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/dinh-muc",       label: "Định mức NPL",    icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/cong-no",        label: "Công nợ NCC",     icon: BookOpen,      moduleKey: "ke-toan" },
      { href: "/ke-toan/so-sach",        label: "Sổ sách thuế HKD",icon: BookOpen,      moduleKey: "ke-toan" },
    ],
  },
  { key: "cham-cong", moduleKey: "cham-cong",  label: "Nhân sự",        icon: CalendarCheck,   color: "text-orange-400",
    children: [
      { href: "/cham-cong",             label: "Chấm công",        icon: CalendarCheck, moduleKey: "cham-cong" },
      { href: "/bang-luong",            label: "Bảng lương",       icon: Banknote,      moduleKey: "cham-cong" },
      { href: "/cham-cong/qr",          label: "Mã QR chấm công",  icon: QrCode,        moduleKey: "cham-cong" },
      { href: "/cham-cong/ca-lam-viec", label: "Lịch làm việc",    icon: Clock,         moduleKey: "cham-cong" },
    ],
  },
  { key: "so-thu-chi",moduleKey: "so-thu-chi", label: "Thu Chi",        icon: Landmark,        href: "/so-thu-chi", color: "text-emerald-600" },
  { key: "cong-no",   moduleKey: "cong-no",    label: "Công Nợ",        icon: Landmark,        href: "/cong-no",    color: "text-rose-500" },
  { key: "backup",    moduleKey: "users",       label: "Backup",         icon: DatabaseBackup,  href: "/backup",     color: "text-emerald-500" },
  { key: "quantri",   moduleKey: "users",       label: "Quản trị",       icon: Settings,        color: "text-stone-400",
    children: [{ href: "/admin/users", label: "Quản lý User", icon: Users, moduleKey: "users" }],
  },
];

export default function Navbar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const { user }  = useUser();
  const [openKey, setOpenKey]   = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown khi click ngoài
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu khi chuyển trang
  useEffect(() => { setMobileOpen(false); setOpenKey(null); }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const userModules = user ? parseModules(user.role) : [];
  const visible = (moduleKey: string) =>
    !user || user.role === "admin" || userModules.includes(moduleKey);

  function isActive(mod: NavModule) {
    if (mod.href) return pathname === mod.href || pathname.startsWith(mod.href + "/");
    return mod.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")) ?? false;
  }

  const visibleMods = MODULES.filter(m => visible(m.moduleKey));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
      <nav ref={navRef} className="flex items-center h-14 px-4 gap-1">

        {/* Logo */}
        <Link href="/tong-quan" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
            <ShoppingBag size={16} className="text-rose-500" />
          </div>
          <span className="font-bold text-stone-700 text-[15px] tracking-wide">Meisy</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5 flex-1 overflow-x-auto no-scrollbar">
          {visibleMods.map(mod => {
            const Icon    = mod.icon;
            const active  = isActive(mod);
            const hasKids = !!mod.children?.length;
            const isOpen  = openKey === mod.key;

            if (!hasKids && mod.href) {
              return (
                <Link key={mod.key} href={mod.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium
                    whitespace-nowrap transition-all
                    ${active
                      ? "bg-rose-50 text-rose-500"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                    }`}>
                  <Icon size={14} className={active ? "text-rose-400" : mod.color} />
                  {mod.label}
                </Link>
              );
            }

            return (
              <div key={mod.key} className="relative">
                <button
                  onClick={() => setOpenKey(isOpen ? null : mod.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium
                    whitespace-nowrap transition-all
                    ${active
                      ? "bg-rose-50 text-rose-500"
                      : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                    }`}>
                  <Icon size={14} className={active ? "text-rose-400" : mod.color} />
                  {mod.label}
                  <ChevronDown size={11} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-stone-100
                    rounded-xl shadow-lg py-1.5 min-w-[180px] z-50">
                    {mod.children!.filter(c => visible(c.moduleKey)).map(child => {
                      const CIcon    = child.icon;
                      const cActive  = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link key={child.href} href={child.href}
                          className={`flex items-center gap-2.5 px-4 py-2 text-[13px] transition-all
                            ${cActive
                              ? "text-rose-500 bg-rose-50/60"
                              : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                            }`}>
                          <CIcon size={13} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: user + logout */}
        <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-50">
              <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                <span className="text-rose-500 text-[10px] font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[13px] text-stone-600 font-medium">{user.name}</span>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] text-stone-400
              hover:bg-rose-50 hover:text-rose-500 transition-all">
            <LogOut size={14} />
            Ra
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button className="md:hidden ml-auto p-2 rounded-lg text-stone-400 hover:bg-stone-50"
          onClick={() => setMobileOpen(o => !o)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white max-h-[80vh] overflow-y-auto">
          {visibleMods.map(mod => {
            const Icon   = mod.icon;
            const active = isActive(mod);
            const hasKids = !!mod.children?.length;

            if (!hasKids && mod.href) {
              return (
                <Link key={mod.key} href={mod.href}
                  className={`flex items-center gap-3 px-5 py-3 text-sm border-b border-stone-50
                    ${active ? "text-rose-500 bg-rose-50/50" : "text-stone-600"}`}>
                  <Icon size={16} className={active ? "text-rose-400" : mod.color} />
                  {mod.label}
                </Link>
              );
            }

            return (
              <div key={mod.key}>
                <button onClick={() => setOpenKey(openKey === mod.key ? null : mod.key)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm border-b border-stone-50
                    ${active ? "text-rose-500 bg-rose-50/50" : "text-stone-600"}`}>
                  <Icon size={16} className={active ? "text-rose-400" : mod.color} />
                  <span className="flex-1 text-left">{mod.label}</span>
                  <ChevronDown size={12} className={`transition-transform ${openKey === mod.key ? "rotate-180" : ""}`} />
                </button>
                {openKey === mod.key && mod.children?.filter(c => visible(c.moduleKey)).map(child => {
                  const CIcon   = child.icon;
                  const cActive = pathname === child.href || pathname.startsWith(child.href + "/");
                  return (
                    <Link key={child.href} href={child.href}
                      className={`flex items-center gap-3 px-8 py-2.5 text-sm border-b border-stone-50
                        ${cActive ? "text-rose-500 bg-rose-50/50" : "text-stone-500"}`}>
                      <CIcon size={13} />
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            );
          })}

          {/* Mobile logout */}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-rose-400">
            <LogOut size={16} />
            Đăng xuất {user ? `(${user.name})` : ""}
          </button>
        </div>
      )}
    </header>
  );
}
