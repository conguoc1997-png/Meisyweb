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
  CalendarCheck,
  DatabaseBackup,
  Banknote,
  Landmark,
  QrCode,
  Clock,
  CalendarDays,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/user-context";
import { parseModules } from "@/lib/auth";

type NavChild = {
  href: string;
  label: string;
  icon: React.ElementType;
  moduleKey: string;
};

type NavModule = {
  key: string;
  label: string;
  icon: React.ElementType;
  bg: string;
  text: string;
  href?: string;
  moduleKey: string;
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
      { href: "/kho",       label: "Kho hàng",           icon: Package,       moduleKey: "kho" },
      { href: "/fake-kho",  label: "Fake Kho",           icon: Package,       moduleKey: "kho" },
      { href: "/doi-soat",  label: "Đối soát hoàn trả",  icon: ClipboardList, moduleKey: "kho" },
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
    label: "Cấu trúc chi phí", icon: Calculator,
    bg: "bg-emerald-50", text: "text-emerald-500",
    href: "/gia-ban",
  },
  {
    key: "kho-npl", moduleKey: "ke-toan",
    label: "Kho NPL", icon: Package,
    bg: "bg-violet-50", text: "text-violet-400",
    children: [
      { href: "/ke-toan/nhap-kho",       label: "Nhập kho NPL",   icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/xuat-kho",       label: "Xuất kho NPL",   icon: Package,       moduleKey: "ke-toan" },
      { href: "/ke-toan/ton-kho",        label: "Tồn kho NPL",    icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/quy-doi-don-vi", label: "Bảng quy đổi",  icon: ClipboardList, moduleKey: "ke-toan" },
      { href: "/ke-toan/dinh-muc",       label: "Định mức NPL",   icon: ClipboardList, moduleKey: "ke-toan" },
    ],
  },
  {
    key: "ke-toan", moduleKey: "ke-toan",
    label: "Kế toán", icon: BookOpen,
    bg: "bg-emerald-50", text: "text-emerald-500",
    children: [
      { href: "/so-thu-chi",       label: "Sổ Thu Chi",       icon: Landmark,  moduleKey: "so-thu-chi" },
      { href: "/ke-toan/cong-no",  label: "Công nợ NCC",      icon: BookOpen,  moduleKey: "ke-toan" },
      { href: "/ke-toan/so-sach",  label: "Sổ sách thuế HKD", icon: BookOpen,  moduleKey: "ke-toan" },
    ],
  },
  {
    key: "calendar", moduleKey: "calendar",
    label: "Lịch & Công việc", icon: CalendarDays,
    bg: "bg-rose-50", text: "text-rose-400",
    children: [
      { href: "/calendar",     label: "Lịch Công Ty",  icon: CalendarDays,  moduleKey: "calendar" },
      { href: "/giao-viec",    label: "Giao việc",      icon: ClipboardList, moduleKey: "calendar" },
      { href: "/viec-cua-toi", label: "Việc của tôi",  icon: CheckCircle2,  moduleKey: "calendar" },
    ],
  },
  {
    key: "cham-cong", moduleKey: "cham-cong",
    label: "Nhân sự", icon: CalendarCheck,
    bg: "bg-orange-50", text: "text-orange-400",
    children: [
      { href: "/cham-cong",             label: "Chấm công",        icon: CalendarCheck, moduleKey: "cham-cong" },
      { href: "/bang-luong",            label: "Bảng lương",       icon: Banknote,      moduleKey: "cham-cong" },
      { href: "/cham-cong/qr",          label: "Mã QR chấm công",  icon: QrCode,        moduleKey: "cham-cong" },
      { href: "/cham-cong/ca-lam-viec", label: "Lịch làm việc",    icon: Clock,         moduleKey: "cham-cong" },
      { href: "/lich-di-lam",           label: "Đăng ký lịch NV",  icon: CalendarCheck, moduleKey: "cham-cong" },
    ],
  },
  {
    key: "cong-no", moduleKey: "cong-no",
    label: "Công Nợ & DT", icon: Landmark,
    bg: "bg-rose-50", text: "text-rose-500",
    href: "/cong-no",
  },
  {
    key: "backup", moduleKey: "users",
    label: "Backup & Restore", icon: DatabaseBackup,
    bg: "bg-emerald-50", text: "text-emerald-500",
    href: "/backup",
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

// Các route không hiện sidebar (trang công khai, mobile-only)
const NO_SIDEBAR_ROUTES = ["/checkin", "/login"];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user } = useUser();

  // Ẩn hoàn toàn trên các trang không cần sidebar
  if (NO_SIDEBAR_ROUTES.some(r => pathname === r || pathname.startsWith(r + "/"))) {
    return null;
  }

  const defaultOpen = MODULES
    .filter(m => m.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")))
    .map(m => m.key);

  const [openKeys,    setOpenKeys]    = useState<Set<string>>(new Set(defaultOpen));
  const [expanded,    setExpanded]    = useState(false);   // desktop hover
  const [mobileOpen,  setMobileOpen]  = useState(false);   // mobile toggle

  useEffect(() => {
    const active = MODULES
      .filter(m => m.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/")))
      .map(m => m.key);
    setOpenKeys(prev => new Set([...prev, ...active]));
    setMobileOpen(false); // đóng sidebar khi navigate trên mobile
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

  // ── Badge: số việc đang chờ của nhân viên ──
  const [pendingTasks, setPendingTasks] = useState(0);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (!user?.nhanVienId || fetchedRef.current) return;
    fetchedRef.current = true;
    fetch(`/api/giao-viec?nv=${user.nhanVienId}`)
      .then(r => r.json())
      .then((data: Array<{ assignments: Array<{ nhanVienId: string; trangThai: string }> }>) => {
        if (!Array.isArray(data)) return;
        const count = data.filter(t =>
          t.assignments.some(a => a.nhanVienId === user.nhanVienId && a.trangThai !== "hoan_thanh")
        ).length;
        setPendingTasks(count);
      })
      .catch(() => {});
  }, [user?.nhanVienId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Shared nav content (dùng cho cả mobile lẫn desktop) ───────────
  function NavContent({ isOpen: show }: { isOpen: boolean }) {
    return (
      <>
        {/* Logo */}
        <div className={`py-5 border-b border-stone-100/80 flex items-center overflow-hidden
          ${show ? "px-4 gap-3" : "px-3 justify-center"}`}>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={21} className="text-rose-400" />
          </div>
          {show && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="font-semibold text-stone-700 text-[16px] leading-none tracking-wide">Meisy</p>
              <p className="text-[10px] text-stone-400 mt-1 tracking-widest uppercase">Inhouse</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-1 overflow-y-auto overflow-x-hidden px-2">
          {MODULES.filter(m => visible(m.moduleKey)).map(mod => {
            const Icon           = mod.icon;
            const isModOpen      = openKeys.has(mod.key);
            const hasKids        = !!mod.children?.length;
            const anyChildActive = mod.children?.some(
              c => pathname === c.href || pathname.startsWith(c.href + "/")
            );
            const isActive = !hasKids && mod.href
              ? (pathname === mod.href || pathname.startsWith(mod.href + "/"))
              : false;

            const iconBadge = (
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                transition-all duration-150 group-hover:shadow-sm ${mod.bg}`}>
                <Icon size={21} className={mod.text} />
              </span>
            );

            if (!hasKids && mod.href) {
              return (
                <Link key={mod.key} href={mod.href}
                  title={!show ? mod.label : undefined}
                  className={`group flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-all duration-150
                    ${isActive ? "bg-rose-50/70" : "hover:bg-stone-50"}
                    ${show ? "" : "justify-center"}`}>
                  {iconBadge}
                  {show && (
                    <span className={`text-[13.5px] whitespace-nowrap overflow-hidden font-medium
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
                  onClick={() => show ? toggle(mod.key) : undefined}
                  title={!show ? mod.label : undefined}
                  className={`group w-full flex items-center gap-3 px-1.5 py-1.5 rounded-xl transition-all duration-150
                    ${anyChildActive ? "bg-rose-50/70" : "hover:bg-stone-50"}
                    ${show ? "" : "justify-center"}`}>
                  {iconBadge}
                  {show && (
                    <>
                      <span className={`flex-1 text-[13.5px] text-left whitespace-nowrap font-medium
                        ${anyChildActive ? "text-rose-500" : "text-stone-500 group-hover:text-stone-700"}`}>
                        {mod.label}
                      </span>
                      {isModOpen
                        ? <ChevronDown size={12} className="text-stone-300 flex-shrink-0" />
                        : <ChevronRight size={12} className="text-stone-300 flex-shrink-0" />}
                    </>
                  )}
                </button>

                {show && isModOpen && (
                  <div className="ml-[22px] mt-0.5 pl-3.5 space-y-0.5"
                    style={{ borderLeft: "1px solid #ede8e4" }}>
                    {mod.children!.filter(c => visible(c.moduleKey)).map(child => {
                      const CIcon     = child.icon;
                      const isCActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      const showBadge = child.href === "/viec-cua-toi" && pendingTasks > 0;
                      return (
                        <Link key={child.href} href={child.href}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all
                            ${isCActive ? "text-rose-500 bg-rose-50/60" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"}`}>
                          <CIcon size={12} className="flex-shrink-0" />
                          <span className="whitespace-nowrap flex-1">{child.label}</span>
                          {showBadge && (
                            <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                              {pendingTasks}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        {show && user && (
          <div className="px-3 py-3 border-t border-stone-100/80">
            <div className="px-3 py-2 rounded-xl bg-rose-50/40 flex items-center gap-2">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-stone-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-400 font-bold text-sm">
                  {user.name.split(" ").slice(-1)[0]?.[0] ?? "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-stone-600 truncate">{user.name}</p>
                <p className="text-[10px] text-stone-400 tracking-wide uppercase mt-0.5">
                  {user.role === "admin" ? "Admin" : "Nhân viên"}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* ── MOBILE: Hamburger button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-xl
          bg-white border border-stone-200 shadow-sm
          flex items-center justify-center text-stone-500 hover:bg-stone-50 transition">
        <Menu size={20} />
      </button>

      {/* ── MOBILE: Backdrop ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE: Sidebar overlay ── */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col
        bg-[#fdfaf8] border-r border-stone-100 shadow-2xl
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Close button */}
        <button onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg border border-stone-200
            flex items-center justify-center text-stone-400 hover:bg-stone-50 transition">
          <X size={16} />
        </button>
        <NavContent isOpen={true} />
      </aside>

      {/* ── DESKTOP: Sidebar hover-to-expand ── */}
      <aside
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        className={`hidden md:flex min-h-screen flex-col flex-shrink-0
          transition-all duration-200 ease-in-out z-40
          bg-[#fdfaf8] border-r border-stone-100
          shadow-[1px_0_16px_0_rgba(160,120,100,0.06)]
          ${expanded ? "w-64" : "w-[84px]"}`}>
        <NavContent isOpen={expanded} />
      </aside>

      {/* ── Nút đăng xuất (desktop) ── */}
      <button
        onClick={handleLogout}
        className="hidden md:flex fixed bottom-4 left-4 z-50 items-center gap-2 px-3 py-2 rounded-xl
          bg-[#fdfaf8] border border-stone-200 shadow-sm text-[13px]
          text-stone-400 hover:bg-rose-50/80 hover:text-rose-400 hover:border-rose-200 transition-all">
        <LogOut size={14} />
        <span>Đăng xuất</span>
      </button>
    </>
  );
}
