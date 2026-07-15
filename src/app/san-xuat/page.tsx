"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Scissors, CheckCircle, Clock, Pencil, History, X, ChevronDown, ChevronRight, Trash2, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

type SanPham = { id: string; sku: string; ten: string };

type VaiTon = {
  id: string; maVai: string; soMet: number; soCay: number; cayData: string | null;
  donVi: string; mauSac: string | null; xuong: string | null; ghiChu: string | null; updatedAt: string;
  tenNCC: string | null; soHoaDon: string | null; chiPhiThucNhap: number | null;
  soTienHoaDon: number | null; vatPct: number | null; tinhNoTheo: string; congNoNccId: string | null;
};

type LoCat = {
  id: string; ngay: string; hangCat: string; soSize: string | null; maVai: string | null;
  soMSoDo: number | null; soCay: number; cayData: string | null; soY: number | null; soM: number | null; tongSize: number | null;
  soLa: number | null; soLaThucTe: number | null; soSanPham: number | null;
  hangThucTe: number | null; ngayNhanHang: string | null; soLuongThieu: number | null; xuongNhanHang: string | null;
  loaiHang: string | null;
  trangThai: string; xuong: string;
  daCat: boolean;
  hdMay: number | null; tonTruocMay: number | null; hdMayDa: boolean;
  coGiat: string | null;
  hdGiatViSinh: number | null; tonTruocGiatViSinh: number | null; hdGiatViSinhDa: boolean;
  hdGiatMau: number | null; tonTruocGiatMau: number | null; hdGiatMauDa: boolean;
  ghiChuMay: string | null; mauGiat: string | null;
  xuatHoaDonDa: boolean;
  ghiChu: string | null;
};

const DEFAULT_XUONG = [{ key: "meisy", label: "Meisy" }, { key: "dung_linh", label: "Dũng Linh" }];
const LOAI_HANG_OPTIONS = [
  { value: "dai_thuong", label: "Dài thường" },
  { value: "dai_kieu",   label: "Dài kiểu" },
  { value: "short",      label: "Short" },
];
const LOAI_HANG_LABEL: Record<string, string> = {
  dai_thuong: "Dài thường",
  dai_kieu:   "Dài kiểu",
  short:      "Short",
};
const MAU_GIAT_OPTIONS = ["NHẠT", "ĐẬM", "VI SINH", "KHÓI", "CHÀM"];
const MAU_GIAT_CLS: Record<string, string> = {
  "NHẠT":    "bg-sky-100 text-sky-700",
  "ĐẬM":     "bg-indigo-100 text-indigo-700",
  "VI SINH": "bg-teal-100 text-teal-700",
  "KHÓI":    "bg-slate-200 text-slate-600",
  "CHÀM":    "bg-blue-900/20 text-blue-900",
};
const emptyForm = {
  ngay: new Date().toISOString().slice(0, 10),
  loaiHang: "dai_thuong",
  xuong: "meisy", hangCat: "", soSize: "", maVai: "",
  soMSoDo: "", soCay: "1", soY: "", soM: "", tongSize: "",
  soLaThucTe: "", hangThucTe: "", xuongNhanHang: "", trangThai: "chua_nhap",
  hdMay: "", tonTruocMay: "",
  coGiat: "",
  hdGiatViSinh: "", tonTruocGiatViSinh: "",
  hdGiatMau: "", tonTruocGiatMau: "",
  ghiChuMay: "", mauGiat: "",
  ghiChu: "",
};

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200";
const inpRo = "w-full border border-slate-100 bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-500 select-none";

// Chuẩn hoá trangThai của lô từ cayData (chạy 1 lần khi fetch, không cần tính lại trong render)
// Nếu tất cả cây đã "da_nhap" mà parent vẫn "chua_nhap" → tự sửa + patch DB ngầm
const normalizeLo = (lo: LoCat): LoCat => {
  if (lo.trangThai === "da_nhap" || !lo.cayData) return lo;
  try {
    const parsed: { trangThai?: string }[] = JSON.parse(lo.cayData);
    if (parsed.length > 0 && parsed.every(c => c.trangThai === "da_nhap")) {
      // Patch DB ngầm (fire-and-forget) để giữ sạch data
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trangThai: "da_nhap" }),
      }).catch(() => {});
      return { ...lo, trangThai: "da_nhap" };
    }
  } catch { /* ignore */ }
  return lo;
};

export default function SanXuatPage() {
  // ── Xưởng list (localStorage) ──
  const [xuongList, setXuongListRaw] = useState<{ key: string; label: string }[]>(() => {
    try { const s = localStorage.getItem("xuong_list"); return s ? JSON.parse(s) : DEFAULT_XUONG; } catch { return DEFAULT_XUONG; }
  });
  const [xuongAddInput, setXuongAddInput] = useState("");
  const [showXuongManage, setShowXuongManage] = useState(false);
  useEffect(() => {
    fetch("/api/nha-cung-cap").then(r => r.json()).then(d => setNccList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  const setXuongList = (list: { key: string; label: string }[]) => {
    setXuongListRaw(list);
    try { localStorage.setItem("xuong_list", JSON.stringify(list)); } catch {}
  };
  const XUONG_LABEL: Record<string, string> = Object.fromEntries(xuongList.map(x => [x.key, x.label]));

  // ── Vải tồn ──
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [vaiTons, setVaiTons] = useState<VaiTon[]>([]);
  const [showVaiTon, setShowVaiTon] = useState(false);
  const [modalVai, setModalVai] = useState<VaiTon | "new" | null>(null);
  const [vaiForm, setVaiForm] = useState({ maVai: "", donVi: "m", mauSac: "", xuong: "", ghiChu: "", tenNCC: "", soHoaDon: "", chiPhiThucNhap: "", soTienHoaDon: "", vatPct: "", tinhNoTheo: "thuc_te" });
  const [vaiCayRows, setVaiCayRows] = useState<{ soMet: string }[]>([{ soMet: "" }]);
  const [nccList, setNccList] = useState<{ id: string; ten: string }[]>([]);
  const [showAddNCC, setShowAddNCC] = useState(false);
  const [newNccName, setNewNccName] = useState("");
  const [editingVaiMet, setEditingVaiMet] = useState<{ id: string; val: string } | null>(null);
  const [savingVai, setSavingVai] = useState(false);
  const [editingVaiXuong, setEditingVaiXuong] = useState<string | null>(null);
  const [filterVaiXuong, setFilterVaiXuong] = useState<string>("");
  const [expandedVaiRows, setExpandedVaiRows] = useState<Set<string>>(new Set());
  const toggleVaiExpand = (id: string) => setExpandedVaiRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const fetchVaiTon = async () => {
    const data = await fetch("/api/san-xuat/vai-ton").then(r => r.json());
    setVaiTons(Array.isArray(data) ? data : []);
  };

  const handleAddNCC = async () => {
    if (!newNccName.trim()) return;
    const res = await fetch("/api/nha-cung-cap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ten: newNccName.trim() }),
    });
    if (res.ok) {
      const ncc = await res.json();
      setNccList(prev => [...prev, ncc].sort((a, b) => a.ten.localeCompare(b.ten)));
      setVaiForm(f => ({ ...f, tenNCC: ncc.ten }));
      setNewNccName("");
      setShowAddNCC(false);
    }
  };

  const saveVai = async () => {
    if (savingVai) return;
    setSavingVai(true);
    try {
      const url = modalVai && modalVai !== "new" ? `/api/san-xuat/vai-ton/${modalVai.id}` : "/api/san-xuat/vai-ton";
      const method = modalVai && modalVai !== "new" ? "PATCH" : "POST";
      const cayData = vaiCayRows.map(r => ({ soMet: Number(r.soMet) || 0 }));
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...vaiForm, cayData }) });
      setModalVai(null);
      setVaiForm({ maVai: "", donVi: "m", mauSac: "", xuong: "", ghiChu: "", tenNCC: "", soHoaDon: "", chiPhiThucNhap: "", soTienHoaDon: "", vatPct: "", tinhNoTheo: "thuc_te" });
      setVaiCayRows([{ soMet: "" }]);
      fetchVaiTon();
    } finally {
      setSavingVai(false);
    }
  };

  // Cộng số mét mới vào entry vải đã tồn tại
  const congVaoVai = async (target: VaiTon) => {
    if (savingVai) return;
    setSavingVai(true);
    try {
      let existingCays: { soMet: number; cut?: boolean; lotId?: string; lotCayIdx?: number; soMetUsed?: number }[] = [];
      if (target.cayData) { try { existingCays = JSON.parse(target.cayData); } catch {} }
      if (existingCays.length === 0) existingCays = [{ soMet: target.soMet }];
      const newCays = vaiCayRows.map(r => ({ soMet: Number(r.soMet) || 0 }));
      const mergedCays = [...existingCays, ...newCays];
      const newSoMet = mergedCays.reduce((s, c) => s + (c.soMet ?? 0), 0);
      await fetch(`/api/san-xuat/vai-ton/${target.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: mergedCays, soMet: newSoMet, soCay: mergedCays.length }),
      });
      setModalVai(null); fetchVaiTon();
    } finally {
      setSavingVai(false);
    }
  };

  const deleteVai = async (id: string) => {
    if (!confirm("Xoá loại vải này?")) return;
    await fetch(`/api/san-xuat/vai-ton/${id}`, { method: "DELETE" });
    fetchVaiTon();
  };

  const saveVaiMet = async (v: VaiTon, val: string) => {
    setEditingVaiMet(null);
    await fetch(`/api/san-xuat/vai-ton/${v.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ soMet: Number(val) || 0 }) });
    fetchVaiTon();
  };

  const [xuatKhoLoading, setXuatKhoLoading] = useState<Set<string>>(new Set());
  const [hoanTacLoading, setHoanTacLoading] = useState<Set<string>>(new Set());
  const [losCat, setLosCat] = useState<LoCat[]>([]);
  const [allLoCat, setAllLoCat] = useState<LoCat[]>([]);
  const [filterThang, setFilterThang] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterXuong, setFilterXuong] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  const [activeMainTab, setActiveMainTab] = useState<"lo-cat" | "hoa-don">("lo-cat");
  const [modalAdd, setModalAdd] = useState(false);
  const [modalEdit, setModalEdit] = useState<LoCat | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [hoaDonTon, setHoaDonTon] = useState({ may: 0, giat_vi_sinh: 0, giat_mau: 0 });
  const [modalTon, setModalTon] = useState<"may" | "giat_vi_sinh" | "giat_mau" | null>(null);
  const [editTonVal, setEditTonVal] = useState("");
  const [editTonGhiChu, setEditTonGhiChu] = useState("");
  const [editingNhanVe, setEditingNhanVe] = useState<{ id: string; val: string } | null>(null);
  const [editingLaTT, setEditingLaTT] = useState<{ id: string; val: string } | null>(null);
  const [editingCayLaTT, setEditingCayLaTT] = useState<{ id: string; ci: number; val: string } | null>(null);
  const [editingGhiChuMay, setEditingGhiChuMay] = useState<{ id: string; val: string } | null>(null);
  const [editingMauGiat, setEditingMauGiat] = useState<string | null>(null);
  const [selectedVaiId, setSelectedVaiId] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => setExpandedRows(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  type CayRow = { soY: string; soM: string; soLaTT: string; hangThucTe: string; mauGiat: string; ghiChuMay: string; hdMayDa: boolean; hdGiatViSinhDa: boolean; hdGiatMauDa: boolean; daCat: boolean; trangThai: string };
  const emptyCayRow = (): CayRow => ({ soY: "", soM: "", soLaTT: "", hangThucTe: "", mauGiat: "", ghiChuMay: "", hdMayDa: false, hdGiatViSinhDa: false, hdGiatMauDa: false, daCat: false, trangThai: "chua_nhap" });
  const [cayRows, setCayRows] = useState<CayRow[]>([emptyCayRow()]);
  const [editingCayGhiChu, setEditingCayGhiChu] = useState<{ id: string; ci: number; val: string } | null>(null);
  const [editingCayNhanVe, setEditingCayNhanVe] = useState<{ id: string; ci: number; val: string } | null>(null);
  const [selectedVaiCayIdxs, setSelectedVaiCayIdxs] = useState<number[]>([]);
  const [editingCayMau, setEditingCayMau] = useState<{ id: string; ci: number } | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  // ── SKU combobox ──
  const [showSkuDropdown, setShowSkuDropdown] = useState(false);
  const [skuSearch, setSkuSearch] = useState("");

  // ── Size picker ──
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL", "XXXXXL"];
  type SzItem = { size: string; qty: number; checked: boolean };
  const [sizeItems, setSizeItems] = useState<SzItem[]>(SIZES.map(s => ({ size: s, qty: 1, checked: false })));
  const [addingSize, setAddingSize] = useState(false);
  const [newSizeName, setNewSizeName] = useState("");
  const addCustomSize = () => {
    const sz = newSizeName.trim().toUpperCase();
    if (!sz || sizeItems.some(s => s.size === sz)) { setAddingSize(false); setNewSizeName(""); return; }
    setSizeItems(prev => {
      const next = [...prev, { size: sz, qty: 1, checked: true }];
      syncSizeToForm(next); return next;
    });
    setAddingSize(false); setNewSizeName("");
  };

  // Format 1 size thành chuỗi: size bắt đầu bằng số (4XL, 5XL) dùng "qty*size" để tránh ambiguous
  const fmtSizeItem = (s: SzItem) => /^\d/.test(s.size) ? `${s.qty}*${s.size}` : `${s.qty}${s.size}`;

  const buildSoSize = (items: SzItem[]) =>
    items.filter(s => s.checked).map(fmtSizeItem).join("-");

  const syncSizeToForm = (items: SzItem[]) => {
    const sel = items.filter(s => s.checked);
    const tongQty = sel.reduce((s, i) => s + i.qty, 0);
    setForm(f => ({
      ...f,
      soSize: buildSoSize(items),
      tongSize: tongQty > 0 ? String(tongQty) : "",
    }));
  };
  const toggleSize = (size: string) => setSizeItems(prev => {
    const next = prev.map(s => s.size === size ? { ...s, checked: !s.checked } : s);
    syncSizeToForm(next); return next;
  });
  const setSizeQty = (size: string, qty: number) => setSizeItems(prev => {
    const next = prev.map(s => s.size === size ? { ...s, qty: Math.max(1, qty) } : s);
    syncSizeToForm(next); return next;
  });
  const parseSizeStr = (s: string): SzItem[] => {
    const result = SIZES.map(sz => ({ size: sz, qty: 1, checked: false }));
    if (!s) return result;
    s.split("-").forEach(part => {
      // Format mới: "qty*size" (dùng cho size bắt đầu bằng số như 4XL, 5XL)
      if (part.includes("*")) {
        const [qtyStr, sz] = part.split("*", 2);
        const qty = parseInt(qtyStr) || 1;
        const sizeName = sz.toUpperCase();
        const idx = result.findIndex(r => r.size === sizeName);
        if (idx >= 0) result[idx] = { ...result[idx], qty, checked: true };
        else result.push({ size: sizeName, qty, checked: true });
        return;
      }
      // Format cũ: thử match known sizes từ dài đến ngắn để tránh "24XL" → 4XL=2
      const knownSizes = [...SIZES].sort((a, b) => b.length - a.length);
      let matched = false;
      for (const knownSz of knownSizes) {
        if (part.toUpperCase().endsWith(knownSz)) {
          const qtyStr = part.slice(0, part.length - knownSz.length);
          if (qtyStr === "" || /^\d+$/.test(qtyStr)) {
            const qty = qtyStr ? parseInt(qtyStr) : 1;
            const idx = result.findIndex(r => r.size === knownSz);
            if (idx >= 0) result[idx] = { ...result[idx], qty, checked: true };
            else result.push({ size: knownSz, qty, checked: true });
            matched = true;
            break;
          }
        }
      }
      // Fallback: custom size với letter-only regex
      if (!matched) {
        const m = part.match(/^(\d+)([A-Za-z][A-Za-z0-9]*)$|^([A-Za-z][A-Za-z0-9]*)$/);
        if (m) {
          const qty = m[1] ? parseInt(m[1]) : 1;
          const sz = (m[2] || m[3]).toUpperCase();
          const idx = result.findIndex(r => r.size === sz);
          if (idx >= 0) result[idx] = { ...result[idx], qty, checked: true };
          else result.push({ size: sz, qty, checked: true });
        }
      }
    });
    return result;
  };
  type HDHistory = { id: string; loaiHD: string; soTonCu: number; soTonMoi: number; ghiChu: string | null; createdAt: string };
  const [modalHistory, setModalHistory] = useState<"may" | "giat_vi_sinh" | "giat_mau" | null>(null);
  const [historyData, setHistoryData] = useState<HDHistory[]>([]);

  const sf = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  // Số Y → tự tính Số M
  const handleSoYChange = (val: string) => {
    const y = Number(val);
    const calcM = y > 0 ? (0.9144 * 0.98 * y).toFixed(2) : "";
    setForm(f => ({ ...f, soY: val, soM: calcM }));
  };

  // Multi-cây helpers
  const numCay = Math.max(1, Number(form.soCay) || 1);

  const handleSoCayChange = (n: number) => {
    setForm(f => ({ ...f, soCay: String(n) }));
    setCayRows(prev => Array.from({ length: n }, (_, i) => prev[i] ?? emptyCayRow()));
    setSelectedVaiCayIdxs([]); // manual change clears fabric selection
  };

  const updateCayRow = (idx: number, field: "soY" | "soM" | "soLaTT" | "hangThucTe" | "mauGiat" | "ghiChuMay" | "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa", val: string | boolean) => {
    setCayRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === "soY") {
        const y = Number(val);
        next[idx].soM = y > 0 ? (0.9144 * 0.98 * y).toFixed(2) : next[idx].soM;
      }
      // Sync tổng soLaTT → form.soLaThucTe
      if (field === "soLaTT") {
        const total = next.reduce((s, r) => s + (Number(r.soLaTT) || 0), 0);
        setForm(f => ({ ...f, soLaThucTe: total > 0 ? String(total) : "" }));
      }
      return next;
    });
  };

  // Derived
  const soLa_calc = useMemo(() => {
    const sdd = Number(form.soMSoDo);
    if (!sdd) return "";
    if (numCay === 1) {
      const m = Number(form.soM);
      return m > 0 ? (m / sdd).toFixed(2) : "";
    }
    const total = cayRows.reduce((s, r) => {
      const m = Number(r.soM);
      return m > 0 ? s + m / sdd : s;
    }, 0);
    return total > 0 ? total.toFixed(2) : "";
  }, [form.soM, form.soMSoDo, numCay, cayRows]);

  const soSanPham_calc = useMemo(() => {
    const la = Number(form.soLaThucTe), ts = Number(form.tongSize);
    return la > 0 && ts > 0 ? la * ts : 0;
  }, [form.soLaThucTe, form.tongSize]);

  const soBienSoLa = useMemo(() => {
    if (!soLa_calc || !form.soLaThucTe) return null;
    return Number(form.soLaThucTe) - Number(soLa_calc);
  }, [soLa_calc, form.soLaThucTe]);

  // suppress unused warning
  void soBienSoLa;

  const soLuongThieu_calc = soSanPham_calc - (Number(form.hangThucTe) || 0);
  const hangThucTe_num = Number(form.hangThucTe) || 0;

  // Fetch filtered data (for display)
  const fetchData = async () => {
    const p = new URLSearchParams();
    if (filterThang) p.set("thang", filterThang);
    if (filterXuong) p.set("xuong", filterXuong);
    if (filterTrangThai) p.set("trangThai", filterTrangThai);
    const data = await fetch(`/api/san-xuat/lo-cat?${p}`).then(r => r.json());
    setLosCat(Array.isArray(data) ? data.map(normalizeLo) : []);
  };

  // Fetch ALL lo-cat (no filter) for global balance computation
  const fetchAllForBalance = async () => {
    const data = await fetch("/api/san-xuat/lo-cat").then(r => r.json());
    setAllLoCat(Array.isArray(data) ? data.map(normalizeLo) : []);
  };

  // Fetch HoaDonTon global totals
  const fetchHoaDonTon = async () => {
    const data = await fetch("/api/san-xuat/hoa-don-ton").then(r => r.json());
    setHoaDonTon({ may: data.may ?? 0, giat_vi_sinh: data.giat_vi_sinh ?? 0, giat_mau: data.giat_mau ?? 0 });
  };

  const openHistory = async (loai: "may" | "giat_vi_sinh" | "giat_mau") => {
    const data = await fetch(`/api/san-xuat/hoa-don-ton?history=${loai}`).then(r => r.json());
    setHistoryData(Array.isArray(data) ? data : []);
    setModalHistory(loai);
  };

  useEffect(() => { fetchData(); fetchHoaDonTon(); fetchAllForBalance(); }, [filterThang, filterXuong, filterTrangThai]);
  useEffect(() => { fetchVaiTon(); }, []);
  useEffect(() => {
    fetch("/api/kho/san-pham").then(r => r.json()).then(d => setSanPhams(Array.isArray(d) ? d : []));
  }, []);
  useEffect(() => {
    fetch("/api/nha-cung-cap").then(r => r.json()).then(d => Array.isArray(d) ? setNccList(d) : null);
  }, []);
  // Close action menu when clicking outside
  useEffect(() => {
    if (!openActionMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-action-menu]")) setOpenActionMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openActionMenu]);

  // Global running balances
  const calcUsed = (field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa") =>
    allLoCat.reduce((s, l) => {
      if (l.soCay > 1 && l.cayData) {
        try {
          const cays: (Partial<CayRow> & { hdMayDa?: boolean; hdGiatViSinhDa?: boolean; hdGiatMauDa?: boolean })[] = JSON.parse(l.cayData);
          return s + cays.reduce((cs, c) => c[field] ? cs + Math.round((Number(c.soLaTT) || 0) * (l.tongSize ?? 0)) : cs, 0);
        } catch { return s; }
      }
      return s + (l[field] ? (l.hangThucTe ?? 0) : 0);
    }, 0);

  const mayDuTong = useMemo(() => hoaDonTon.may - calcUsed("hdMayDa"), [allLoCat, hoaDonTon.may]);
  const viSinhDuTong = useMemo(() => hoaDonTon.giat_vi_sinh - calcUsed("hdGiatViSinhDa"), [allLoCat, hoaDonTon.giat_vi_sinh]);
  const mauDuTong = useMemo(() => hoaDonTon.giat_mau - calcUsed("hdGiatMauDa"), [allLoCat, hoaDonTon.giat_mau]);

  // Danh sách SKU: kết hợp sanPhams + hangCat đã dùng trong allLoCat, dedup + sort
  const skuOptions = useMemo(() => {
    const set = new Set<string>();
    sanPhams.forEach(sp => sp.sku && set.add(sp.sku.trim()));
    allLoCat.forEach(lo => lo.hangCat && set.add(lo.hangCat.trim()));
    return [...set].sort();
  }, [sanPhams, allLoCat]);

  const openAdd = () => {
    setForm({ ...emptyForm, ngay: new Date().toISOString().slice(0, 10) });
    setCayRows([emptyCayRow()]);
    setSizeItems(SIZES.map(s => ({ size: s, qty: 1, checked: false })));
    setSelectedVaiCayIdxs([]);
    setSelectedVaiId("");
    setSkuSearch(""); setShowSkuDropdown(false);
    setModalAdd(true);
  };

  const openEdit = (lo: LoCat) => {
    // Parse soSize → set cả sizeItems và form.soSize đồng thời (tránh race condition)
    const parsedSizes = parseSizeStr(lo.soSize ?? "");
    const newSoSize = buildSoSize(parsedSizes);
    const newTongSize = String(parsedSizes.filter(s => s.checked).reduce((sum, i) => sum + i.qty, 0)) || "";
    setSizeItems(parsedSizes);  // set sizeItems TRƯỚC để không bị trigger useEffect cũ
    setForm({
      ngay: lo.ngay.slice(0, 10), loaiHang: lo.loaiHang ?? "dai_thuong", xuong: lo.xuong, hangCat: lo.hangCat,
      soSize: newSoSize, maVai: lo.maVai ?? "",
      soMSoDo: lo.soMSoDo != null ? String(lo.soMSoDo) : "",
      soCay: String(lo.soCay ?? 1),
      soY: lo.soY != null ? String(lo.soY) : "",
      soM: lo.soM != null ? String(lo.soM) : "",
      tongSize: newTongSize || (lo.tongSize != null ? String(lo.tongSize) : ""),
      soLaThucTe: lo.soLaThucTe != null ? String(lo.soLaThucTe) : "",
      hangThucTe: lo.hangThucTe != null ? String(lo.hangThucTe) : "",
      xuongNhanHang: lo.xuongNhanHang ?? "",
      trangThai: (lo.trangThai === "da_xuat" || lo.trangThai === "da_nhap") ? "da_nhap" : "chua_nhap",
      hdMay: lo.hdMay != null ? String(lo.hdMay) : "",
      tonTruocMay: lo.tonTruocMay != null ? String(lo.tonTruocMay) : "",
      coGiat: lo.coGiat ?? "",
      hdGiatViSinh: lo.hdGiatViSinh != null ? String(lo.hdGiatViSinh) : "",
      tonTruocGiatViSinh: lo.tonTruocGiatViSinh != null ? String(lo.tonTruocGiatViSinh) : "",
      hdGiatMau: lo.hdGiatMau != null ? String(lo.hdGiatMau) : "",
      tonTruocGiatMau: lo.tonTruocGiatMau != null ? String(lo.tonTruocGiatMau) : "",
      ghiChuMay: lo.ghiChuMay ?? "",
      mauGiat: lo.mauGiat ?? "",
      ghiChu: lo.ghiChu ?? "",
    });
    // Load cayRows from cayData
    const n = lo.soCay ?? 1;
    if (n > 1 && lo.cayData) {
      try { setCayRows(JSON.parse(lo.cayData).map((r: Partial<CayRow>) => ({ soY: r.soY ?? "", soM: r.soM ?? "", soLaTT: r.soLaTT ?? "", hangThucTe: r.hangThucTe != null ? String(r.hangThucTe) : "", mauGiat: r.mauGiat ?? "", ghiChuMay: r.ghiChuMay ?? "", hdMayDa: r.hdMayDa ?? false, hdGiatViSinhDa: r.hdGiatViSinhDa ?? false, hdGiatMauDa: r.hdGiatMauDa ?? false, daCat: r.daCat ?? false, trangThai: r.trangThai ?? "chua_nhap" }))); } catch { setCayRows(Array.from({ length: n }, emptyCayRow)); }
    } else {
      setCayRows([{ soY: lo.soY != null ? String(lo.soY) : "", soM: lo.soM != null ? String(lo.soM) : "", soLaTT: lo.soLaThucTe != null ? String(lo.soLaThucTe) : "", hangThucTe: lo.hangThucTe != null ? String(lo.hangThucTe) : "", mauGiat: lo.mauGiat ?? "", ghiChuMay: lo.ghiChuMay ?? "", hdMayDa: lo.hdMayDa, hdGiatViSinhDa: lo.hdGiatViSinhDa, hdGiatMauDa: lo.hdGiatMauDa, daCat: lo.daCat, trangThai: (lo.trangThai === "da_nhap" || lo.trangThai === "da_xuat") ? "da_nhap" : "chua_nhap" }]);
    }
    // Pre-load cây đã chọn từ tồn kho vải
    if (lo.maVai) {
      // Tìm đúng vải bằng lotId để phân biệt cùng mã khác màu
      const matchedVai = vaiTons.find(v => v.cayData && (() => { try { return JSON.parse(v.cayData!).some((c: { lotId?: string }) => c.lotId === lo.id); } catch { return false; } })())
        || vaiTons.find(v => v.maVai === lo.maVai);
      setSelectedVaiId(matchedVai?.id ?? "");
      if (matchedVai?.cayData) {
        try {
          const vCays: { soMet: number; cut?: boolean; lotId?: string }[] = JSON.parse(matchedVai.cayData);
          const preSelected = vCays.map((c, i) => c.lotId === lo.id ? i : -1).filter(i => i >= 0);
          setSelectedVaiCayIdxs(preSelected);
        } catch { setSelectedVaiCayIdxs([]); }
      } else {
        setSelectedVaiCayIdxs([]);
      }
    } else {
      setSelectedVaiId("");
      setSelectedVaiCayIdxs([]);
    }
    setSkuSearch(""); setShowSkuDropdown(false);
    setModalEdit(lo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const soMTotal = numCay > 1
        ? cayRows.reduce((s, r) => s + (Number(r.soM) || 0), 0)
        : Number(form.soM) || 0;
      // Khi nhiều cây: tổng nhận về = tổng từng cây; 1 cây: dùng form.hangThucTe
      const hangThucTeTotal = numCay > 1
        ? (() => {
            const total = cayRows.reduce((s, r) => s + (Number(r.hangThucTe) || 0), 0);
            return total > 0 ? String(total) : "";
          })()
        : form.hangThucTe;
      const soLuongThieuFinal = soSanPham_calc > 0 && hangThucTeTotal
        ? soSanPham_calc - Number(hangThucTeTotal)
        : soLuongThieu_calc;
      // Luôn regenerate soSize từ sizeItems để tránh lưu chuỗi sai vào DB
      const savedSoSize = buildSoSize(sizeItems) || form.soSize;
      const payload = {
        ...form,
        soSize: savedSoSize,
        hangThucTe: hangThucTeTotal,
        soCay: numCay,
        cayData: numCay > 1 ? JSON.stringify(cayRows.map(r => ({
          ...r,
          // Normalize hangThucTe: "" → null, số → number để tránh blank button trên main table
          hangThucTe: r.hangThucTe !== "" ? Number(r.hangThucTe) : null,
        }))) : null,
        soM: soMTotal || form.soM,
        soY: numCay === 1 ? form.soY : null,
        soLa: soLa_calc || null,
        soSanPham: soSanPham_calc || null,
        soLuongThieu: soLuongThieuFinal,
      };
      const url = modalEdit ? `/api/san-xuat/lo-cat/${modalEdit.id}` : "/api/san-xuat/lo-cat";
      const method = modalEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error);
      const savedId: string | undefined = resJson.id;

      // Cập nhật tồn kho vải
      if (form.maVai) {
        const matchedVai = vaiTons.find(v => v.id === selectedVaiId) || vaiTons.find(v => v.maVai === form.maVai);
        if (matchedVai) {
          let vCays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = [];
          if (matchedVai.cayData) { try { vCays = JSON.parse(matchedVai.cayData); } catch {} }
          if (vCays.length === 0) vCays = [{ soMet: matchedVai.soMet }];

          // Nếu SỬA: restore các cây cũ của lô này trước
          if (modalEdit) {
            const isYardVaiRestore = matchedVai.donVi === "yard";
            vCays = vCays.map(c => {
              if (c.lotId !== modalEdit.id) return c;
              const { cut: _c, lotId: _l, lotCayIdx: _lci, soMetUsed, ...rest } = c;
              void _c; void _l; void _lci;
              let restoreM = soMetUsed ?? 0;
              if (!restoreM && modalEdit.cayData) {
                const restoreField = isYardVaiRestore ? "soY" : "soM";
                try { restoreM = Number((JSON.parse(modalEdit.cayData))[c.lotCayIdx ?? 0]?.[restoreField]) || 0; } catch {}
              }
              if (!restoreM && modalEdit.soCay === 1) restoreM = (isYardVaiRestore ? modalEdit.soY : modalEdit.soM) ?? 0;
              return { ...rest, soMet: c.soMet + restoreM };
            });
          }

          // Đánh dấu cây mới được chọn
          const isYardVai = matchedVai.donVi === "yard";
          if (selectedVaiCayIdxs.length > 0 && savedId) {
            // Có chọn cây cụ thể → trừ từng cây
            vCays = vCays.map((c, i) => {
              const selIdx = selectedVaiCayIdxs.indexOf(i);
              if (selIdx === -1) return c;
              const amountUsed = isYardVai
                ? (numCay === 1 ? (Number(form.soY) || 0) : (Number(cayRows[selIdx]?.soY) || 0))
                : (numCay === 1 ? (Number(form.soM) || 0) : (Number(cayRows[selIdx]?.soM) || 0));
              return { ...c, soMet: Math.max(0, c.soMet - amountUsed), soMetUsed: amountUsed, cut: true, lotId: savedId, lotCayIdx: selIdx };
            });
          } else if (!modalEdit && savedId) {
            // Không chọn cây → fallback: trừ thẳng vào soMet tổng của cây đầu tiên chưa cắt
            const amountUsed = isYardVai
              ? (Number(form.soY) || 0)
              : (soMTotal || Number(form.soM) || 0);
            if (amountUsed > 0) {
              let deducted = false;
              vCays = vCays.map(c => {
                if (deducted || c.cut) return c;
                deducted = true;
                return { ...c, soMet: Math.max(0, c.soMet - amountUsed), soMetUsed: amountUsed, cut: true, lotId: savedId, lotCayIdx: 0 };
              });
            }
          }

          // Luôn giữ lại record vải — cây đã dùng hiện gạch ngang (cut:true) trong bảng,
          // KHÔNG xoá record dù tất cả cây đã được gán vào lô cắt. Chỉ xoá khi người dùng
          // bấm xoá tay, để tránh mất dấu vải khi lô cắt chưa thực sự "Đã cắt".
          await fetch(`/api/san-xuat/vai-ton/${matchedVai.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cayData: vCays }),
          });
          fetchVaiTon();
        }
      }

      setModalAdd(false); setModalEdit(null);
      fetchData();
      fetchAllForBalance();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const saveCayField = async (lo: LoCat, ci: number, field: string, val: string | boolean) => {
    setEditingCayGhiChu(null);
    setEditingCayMau(null);
    try {
      const parsed = JSON.parse(lo.cayData!);
      parsed[ci] = { ...parsed[ci], [field]: val };
      const newCayData = JSON.stringify(parsed);
      // Optimistic update
      setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, cayData: newCayData } : l));
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData }),
      }).catch(() => fetchData()); // chỉ refetch nếu lỗi
    } catch { /* ignore */ }
  };

  const toggleCayTrangThai = (lo: LoCat, ci: number) => {
    try {
      const parsed: { trangThai?: string }[] = JSON.parse(lo.cayData!);
      const cur = parsed[ci]?.trangThai ?? "chua_nhap";
      const nextCay = cur === "da_nhap" ? "chua_nhap" : "da_nhap";

      // Cập nhật per-cây
      parsed[ci] = { ...parsed[ci], trangThai: nextCay };
      const newCayData = JSON.stringify(parsed);

      // Kiểm tra tất cả cây đã nhập chưa
      const allDaNhap = parsed.every(c => c.trangThai === "da_nhap");
      const newLoTrangThai = allDaNhap ? "da_nhap" : "chua_nhap";

      // Optimistic update
      setLosCat(prev => prev.map(l =>
        l.id === lo.id ? { ...l, cayData: newCayData, trangThai: newLoTrangThai } : l
      ));


      // Lưu cayData + trangThai lô cùng lúc
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData, trangThai: newLoTrangThai }),
      }).catch(() => fetchData());
    } catch { /* ignore */ }
  };

  const toggleCayHD = (lo: LoCat, ci: number, field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa") => {
    try {
      const parsed = JSON.parse(lo.cayData!);
      saveCayField(lo, ci, field, !parsed[ci][field]);
    } catch { /* ignore */ }
  };

  const saveGhiChuMay = async (lo: LoCat, val: string) => {
    setEditingGhiChuMay(null);
    const ghiChuMay = val.trim() || null;
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, ghiChuMay } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ghiChuMay }),
    }).catch(() => fetchData());
  };

  const saveMauGiat = async (lo: LoCat, val: string) => {
    setEditingMauGiat(null);
    const mauGiat = val || null;
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, mauGiat } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mauGiat }),
    }).catch(() => fetchData());
  };

  const saveLoaiHang = (lo: LoCat, val: string) => {
    const loaiHang = val || "dai_thuong";
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, loaiHang } : l));
    setAllLoCat(prev => prev.map(l => l.id === lo.id ? { ...l, loaiHang } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loaiHang }),
    }).catch(() => fetchData());
  };

  const saveNhanVe = async (lo: LoCat, val: string) => {
    setEditingNhanVe(null);
    const hangThucTe = val === "" ? null : Math.round(Number(val));
    const soLuongThieu = (lo.soSanPham != null && hangThucTe != null) ? lo.soSanPham - hangThucTe : null;
    // Tự động ghi ngày nhận khi lần đầu điền (không ghi đè nếu đã có)
    const ngayNhanHang = hangThucTe != null && !lo.ngayNhanHang
      ? new Date().toISOString()
      : (hangThucTe == null ? null : lo.ngayNhanHang);
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, hangThucTe, soLuongThieu, ngayNhanHang } : l));
    setAllLoCat(prev => prev.map(l => l.id === lo.id ? { ...l, hangThucTe, soLuongThieu, ngayNhanHang } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hangThucTe, soLuongThieu, ngayNhanHang }),
    }).catch(() => fetchData());
  };

  // Inline-edit Lá TT cho lô 1 cây
  const saveLaTT = async (lo: LoCat, val: string) => {
    setEditingLaTT(null);
    const soLaThucTe = val === "" ? null : Math.round(Number(val));
    const soSanPham = (soLaThucTe != null && lo.tongSize != null) ? soLaThucTe * lo.tongSize : null;
    const soLuongThieu = (soSanPham != null && lo.hangThucTe != null) ? soSanPham - lo.hangThucTe : null;
    // Optimistic update: hiển thị ngay không cần chờ server
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, soLaThucTe, soSanPham, soLuongThieu } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soLaThucTe, soSanPham, soLuongThieu }),
    }).catch(() => fetchData());
  };

  // Inline-edit Lá TT per-cây trong lô nhiều cây → cũng cập nhật tổng soLaThucTe
  const saveCayLaTT = async (lo: LoCat, ci: number, val: string) => {
    setEditingCayLaTT(null);
    try {
      const parsed = JSON.parse(lo.cayData!);
      parsed[ci] = { ...parsed[ci], soLaTT: val };
      const totalLaTT = parsed.reduce((s: number, c: { soLaTT?: string }) => s + (Number(c.soLaTT) || 0), 0);
      const soLaThucTe = totalLaTT > 0 ? Math.round(totalLaTT) : null;
      const soSanPham = (soLaThucTe != null && lo.tongSize != null) ? soLaThucTe * lo.tongSize : null;
      // Tính hangThucTe aggregate từ parsed (không dùng lo.hangThucTe có thể stale)
      const anyHTFilled = parsed.some((c: { hangThucTe?: number | null }) => c.hangThucTe != null);
      const hangThucTeAgg = anyHTFilled
        ? parsed.reduce((s: number, c: { hangThucTe?: number | null }) => s + (c.hangThucTe != null ? c.hangThucTe : 0), 0)
        : lo.hangThucTe;
      const soLuongThieu = (soSanPham != null && hangThucTeAgg != null) ? soSanPham - hangThucTeAgg : null;
      const newCayData = JSON.stringify(parsed);
      // Optimistic update — cả losCat lẫn allLoCat để tongThieu tính đúng
      const upd2 = (l: LoCat) => l.id === lo.id ? { ...l, cayData: newCayData, soLaThucTe, soSanPham, soLuongThieu } : l;
      setLosCat(prev => prev.map(upd2));
      setAllLoCat(prev => prev.map(upd2));
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData, soLaThucTe, soSanPham, soLuongThieu }),
      }).catch(() => fetchData());
    } catch { fetchData(); }
  };

  // Inline-edit Nhận về per-cây → tổng auto tính lên main row
  const saveCayNhanVe = (lo: LoCat, ci: number, val: string) => {
    setEditingCayNhanVe(null);
    try {
      const parsed = JSON.parse(lo.cayData!);
      const htVal = val === "" ? null : Math.round(Number(val));
      parsed[ci] = { ...parsed[ci], hangThucTe: htVal };
      const totalHT = parsed.reduce((s: number, c: { hangThucTe?: number | null }) =>
        s + (c.hangThucTe != null ? c.hangThucTe : 0), 0);
      // Nếu ít nhất 1 cây đã nhập hangThucTe → aggregate = totalHT (kể cả 0)
      const anyFilled = parsed.some((c: { hangThucTe?: number | null }) => c.hangThucTe != null);
      const hangThucTe = anyFilled ? totalHT : null;
      const soLuongThieu = (lo.soSanPham != null && hangThucTe != null) ? lo.soSanPham - hangThucTe : null;
      const newCayData = JSON.stringify(parsed);
      const upd = (l: LoCat) => l.id === lo.id ? { ...l, cayData: newCayData, hangThucTe, soLuongThieu } : l;
      setLosCat(prev => prev.map(upd));
      setAllLoCat(prev => prev.map(upd));   // ← fix: allLoCat cũng cập nhật → tongThieu đúng
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData, hangThucTe, soLuongThieu }),
      }).catch(() => fetchData());
    } catch { /* ignore */ }
  };

  // Hoàn tác cây đã cắt → khôi phục số mét vào kho vải
  const hoantacVaiCay = async (vai: VaiTon, cayIdx: number) => {
    if (!vai.cayData) return;
    try {
      const cays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = JSON.parse(vai.cayData);
      const cay = cays[cayIdx];
      if (!cay || !cay.cut) return;
      if (!confirm(`Hoàn tác cây #${cayIdx + 1}? Số mét sẽ được khôi phục vào kho vải.`)) return;
      // Ưu tiên soMetUsed, fallback lookup lô cắt
      let originalSoM = cay.soMetUsed ?? 0;
      if (!originalSoM && cay.lotId) {
        const linkedLo = [...losCat, ...allLoCat].find(l => l.id === cay.lotId);
        if (linkedLo) {
          if (linkedLo.soCay > 1 && linkedLo.cayData) {
            try {
              const loCays = JSON.parse(linkedLo.cayData);
              originalSoM = Number(loCays[cay.lotCayIdx ?? 0]?.soM) || 0;
            } catch { /* ignore */ }
          } else {
            originalSoM = linkedLo.soM ?? 0;
          }
        }
      }
      const newCays = cays.map((c, i) => {
        if (i !== cayIdx) return c;
        const { cut: _cut, lotId: _lotId, lotCayIdx: _lotCayIdx, soMetUsed: _soMetUsed, ...rest } = c;
        void _cut; void _lotId; void _lotCayIdx; void _soMetUsed;
        return { ...rest, soMet: c.soMet + originalSoM };
      });
      setVaiTons(prev => prev.map(v => v.id === vai.id ? { ...v, cayData: JSON.stringify(newCays) } : v));
      await fetch(`/api/san-xuat/vai-ton/${vai.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCays }),
      });
      fetchVaiTon();
    } catch { /* ignore */ }
  };

  const deleteLoCat = async (lo: LoCat) => {
    setOpenActionMenu(null);
    if (!confirm(`Xoá lô cắt "${lo.hangCat}" ngày ${formatDate(lo.ngay)}?\nCác cây vải liên quan sẽ được hoàn tác về kho.`)) return;
    // Optimistic remove
    setLosCat(prev => prev.filter(l => l.id !== lo.id));
    try {
      await fetch(`/api/san-xuat/lo-cat/${lo.id}`, { method: "DELETE" });
      fetchVaiTon(); // refresh kho vải sau khi hoàn tác
    } catch {
      fetchData();
    }
  };

  const handleToggleHD = (lo: LoCat, field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa" | "xuatHoaDonDa") => {
    const newVal = !lo[field];
    const update = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, [field]: newVal } : l);
    setLosCat(update); setAllLoCat(update);
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newVal }),
    }).catch(() => fetchData());

  };

  const handleHoanTac = async (lo: LoCat) => {
    if (!confirm(`Hoàn tác xuất kho cho lô "${lo.hangCat}"?\nTồn kho NPL sẽ được hoàn trả lại.`)) return;
    setHoanTacLoading(prev => new Set(prev).add(lo.id));
    // Optimistic update ngay lập tức
    const update = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: false } : l);
    setLosCat(update); setAllLoCat(update);
    try {
      const res = await fetch("/api/ke-toan/xuat-kho/hoan-tac", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loCatId: lo.id }),
      }).then(r => r.json());
      if (!res.ok) {
        // Rollback nếu lỗi
        const rollback = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: true } : l);
        setLosCat(rollback); setAllLoCat(rollback);
        alert(`⚠️ Hoàn tác: ${res.error ?? "Lỗi không xác định"}`);
      }
    } catch {
      const rollback = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: true } : l);
      setLosCat(rollback); setAllLoCat(rollback);
      alert("⚠️ Lỗi kết nối khi hoàn tác");
    } finally {
      setHoanTacLoading(prev => { const s = new Set(prev); s.delete(lo.id); return s; });
    }
  };

  const handleXuatKho = async (lo: LoCat) => {
    setXuatKhoLoading(prev => new Set(prev).add(lo.id));
    // Optimistic update ngay lập tức
    const update = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: true } : l);
    setLosCat(update); setAllLoCat(update);
    try {
      // API tu-dinh-muc tự set xuatHoaDonDa=true (atomic) — không cần PATCH riêng
      const res = await fetch("/api/ke-toan/xuat-kho/tu-dinh-muc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loCatId: lo.id }),
      }).then(r => r.json());
      if (!res.ok) {
        // Rollback chỉ khi API trả về lỗi thực sự
        const rollback = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: false } : l);
        setLosCat(rollback); setAllLoCat(rollback);
        alert(`⚠️ Xuất kho: ${res.error ?? "Lỗi không xác định"}`);
      }
    } catch {
      const rollback = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, xuatHoaDonDa: false } : l);
      setLosCat(rollback); setAllLoCat(rollback);
      alert("⚠️ Lỗi kết nối khi xuất kho");
    } finally {
      setXuatKhoLoading(prev => { const s = new Set(prev); s.delete(lo.id); return s; });
    }
  };

  // Dùng cho tab Xuất HĐ: tick lô multi-cây sẽ toggle toàn bộ cây cùng lúc
  const handleHDTabToggle = (lo: LoCat, field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa" | "xuatHoaDonDa") => {
    if (field === "xuatHoaDonDa" || lo.soCay <= 1 || !lo.cayData) {
      handleToggleHD(lo, field);
      return;
    }
    try {
      const parsed: Record<string, unknown>[] = JSON.parse(lo.cayData);
      const allChecked = parsed.every(c => c[field]);
      const newCayData = JSON.stringify(parsed.map(c => ({ ...c, [field]: !allChecked })));
      const newLoVal = !allChecked;
      const update = (prev: LoCat[]) => prev.map(l => l.id === lo.id ? { ...l, cayData: newCayData, [field]: newLoVal } : l);
      setLosCat(update); setAllLoCat(update);
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData, [field]: newLoVal }),
      }).catch(() => fetchData());
    } catch { handleToggleHD(lo, field); }
  };

  // Trạng thái hiển thị checkbox cho multi-cây trong tab HĐ
  const getCayHDState = (lo: LoCat, field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa") => {
    if (lo.soCay <= 1 || !lo.cayData) return lo[field] ? "all" : "none";
    try {
      const parsed: Record<string, unknown>[] = JSON.parse(lo.cayData);
      const checked = parsed.filter(c => c[field]).length;
      if (checked === 0) return "none";
      if (checked === parsed.length) return "all";
      return "partial";
    } catch { return "none"; }
  };

  const handleQuickStatus = (lo: LoCat) => {
    const next = lo.trangThai === "da_nhap" ? "chua_nhap" : "da_nhap";
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, trangThai: next } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: next }),
    }).catch(() => fetchData());
  };

  // Toggle "Đã cắt" cho lô 1 cây — xoá cây tương ứng khỏi tồn kho vải
  const toggleDaCat = (lo: LoCat) => {
    const newVal = !lo.daCat;
    // Optimistic update ngay lập tức
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, daCat: newVal } : l));
    // Fire-and-forget PATCH loCat
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daCat: newVal }),
    }).catch(() => fetchData());
    // Xoá cây khỏi tồn kho vải (background, không block UI)
    if (newVal && lo.maVai) {
      const matchedVai = vaiTons.find(v => v.maVai === lo.maVai);
      if (matchedVai && matchedVai.cayData) {
        try {
          const cays: { soMet: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = JSON.parse(matchedVai.cayData);
          const newCays = cays.filter(c => !(c.lotId === lo.id));
          if (newCays.length < cays.length) {
            setVaiTons(prev => prev.map(v => v.id === matchedVai.id ? { ...v, cayData: JSON.stringify(newCays) } : v));
            fetch(`/api/san-xuat/vai-ton/${matchedVai.id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cayData: newCays }),
            }).catch(() => fetchVaiTon());
          }
        } catch { /* ignore */ }
      }
    }
  };

  // Toggle "Đã cắt" cho từng cây trong lô nhiều cây
  const toggleCayDaCat = (lo: LoCat, ci: number) => {
    if (!lo.cayData) return;
    try {
      const parsed: (Partial<CayRow> & { lotId?: string; lotCayIdx?: number })[] = JSON.parse(lo.cayData);
      const newDaCat = !parsed[ci]?.daCat;
      parsed[ci] = { ...parsed[ci], daCat: newDaCat };
      const newCayData = JSON.stringify(parsed);
      // Optimistic update ngay lập tức
      setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, cayData: newCayData } : l));
      fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cayData: newCayData }),
      }).catch(() => fetchData());
      // Xoá cây khỏi tồn kho vải (background)
      if (newDaCat && lo.maVai) {
        const matchedVai = vaiTons.find(v => v.maVai === lo.maVai);
        if (matchedVai && matchedVai.cayData) {
          const vaiCays: { soMet: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = JSON.parse(matchedVai.cayData);
          const newVaiCays = vaiCays.filter(c => !(c.lotId === lo.id && c.lotCayIdx === ci));
          if (newVaiCays.length < vaiCays.length) {
            setVaiTons(prev => prev.map(v => v.id === matchedVai.id ? { ...v, cayData: JSON.stringify(newVaiCays) } : v));
            fetch(`/api/san-xuat/vai-ton/${matchedVai.id}`, {
              method: "PATCH", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cayData: newVaiCays }),
            }).catch(() => fetchVaiTon());
          }
        }
      }
    } catch { /* ignore */ }
  };

  // Stats
  // tongSP: tính theo tháng CẮT (losCat đã filter theo ngay)
  const tongSP = losCat.reduce((s, l) => s + (l.soSanPham ?? 0), 0);
  const tongSP_byLoai = useMemo(() => {
    const map: Record<string, number> = {};
    for (const l of losCat) {
      const key = l.loaiHang ?? "dai_thuong";
      map[key] = (map[key] ?? 0) + (l.soSanPham ?? 0);
    }
    return map;
  }, [losCat]);

  // tongNhan + tongThieu: tính theo tháng NHẬN (ngayNhanHang), filter từ allLoCat
  const { tongNhan, tongThieu, tongNhan_byLoai } = useMemo(() => {
    let rows = allLoCat;
    if (filterXuong) rows = rows.filter(l => l.xuong === filterXuong);
    if (filterThang) {
      const [y, m] = filterThang.split("-").map(Number);
      rows = rows.filter(l => {
        if (l.hangThucTe == null) return false; // chưa điền nhận về → bỏ qua
        // Ưu tiên ngayNhanHang; nếu chưa có (dữ liệu cũ) fallback sang ngay cắt
        const dateStr = l.ngayNhanHang ?? l.ngay;
        if (!dateStr) return false;
        const d = new Date(dateStr);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }
    const byLoai: Record<string, number> = {};
    for (const l of rows) {
      const key = l.loaiHang ?? "dai_thuong";
      byLoai[key] = (byLoai[key] ?? 0) + (l.hangThucTe ?? 0);
    }
    return {
      tongNhan: rows.reduce((s, l) => s + (l.hangThucTe ?? 0), 0),
      // Tính thiếu live từ soSanPham − hangThucTe (không dùng soLuongThieu có thể null ở dữ liệu cũ)
      tongThieu: rows.reduce((s, l) => {
        if (l.hangThucTe == null) return s;
        const sp = l.soSanPham ?? (l.soLaThucTe != null && l.tongSize != null ? l.soLaThucTe * l.tongSize : null);
        if (sp == null) return s;
        return s + Math.max(0, sp - l.hangThucTe);
      }, 0),
      tongNhan_byLoai: byLoai,
    };
  }, [allLoCat, filterThang, filterXuong]);
  const daNhapCount = losCat.filter(l => l.trangThai === "da_nhap").length;

  const thangOptions = useMemo(() => {
    const opts = []; const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push({ val: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` });
    }
    return opts;
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Scissors size={22} className="text-rose-500" /> Sản xuất
        </h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý lô cắt và theo dõi tiến độ sản xuất</p>
      </div>

      {/* Stats xưởng filter */}
      <div className="flex items-center gap-2 mb-3 relative">
        <span className="text-xs text-slate-400 font-medium">Lọc xưởng:</span>
        <button onClick={() => setFilterXuong("")}
          className={`text-xs px-3 py-1 rounded-full border transition font-medium ${filterXuong === "" ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
          Tất cả
        </button>
        {xuongList.map(x => (
          <button key={x.key} onClick={() => setFilterXuong(x.key)}
            className={`text-xs px-3 py-1 rounded-full border transition font-medium ${filterXuong === x.key
              ? x.key === "dung_linh" ? "bg-amber-500 text-white border-amber-500" : "bg-rose-500 text-white border-rose-500"
              : x.key === "dung_linh" ? "bg-white text-amber-600 border-amber-200 hover:border-amber-400" : "bg-white text-rose-500 border-rose-200 hover:border-rose-400"
            }`}>
            {x.label}
          </button>
        ))}
        <button onClick={() => setShowXuongManage(s => !s)} title="Thêm/quản lý xưởng"
          className="w-6 h-6 flex items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 hover:border-rose-300 hover:text-rose-500 transition">
          <Plus size={12} />
        </button>
        {filterXuong && <span className="text-[14px] text-slate-400 ml-1">· Đang xem: <strong className="text-slate-600">{XUONG_LABEL[filterXuong] ?? filterXuong}</strong></span>}

        {showXuongManage && (
          <div className="absolute top-full left-0 mt-1 z-20 w-64 border border-slate-200 rounded-lg p-2.5 bg-white shadow-lg">
            <p className="text-[12px] text-slate-400 mb-1.5 font-medium">Quản lý danh sách xưởng</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {xuongList.map(x => (
                <span key={x.key} className="flex items-center gap-1 text-xs bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                  {x.label}
                  <button type="button" onClick={() => setXuongList(xuongList.filter(i => i.key !== x.key))}
                    className="text-slate-300 hover:text-red-500 transition ml-0.5"><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                autoFocus
                value={xuongAddInput}
                onChange={e => setXuongAddInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && xuongAddInput.trim()) {
                    e.preventDefault();
                    const key = xuongAddInput.trim().toLowerCase().replace(/\s+/g, "_");
                    if (!xuongList.find(x => x.key === key)) setXuongList([...xuongList, { key, label: xuongAddInput.trim() }]);
                    setXuongAddInput("");
                  }
                }}
                placeholder="Tên xưởng mới..."
                className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200 bg-white" />
              <button type="button"
                onClick={() => {
                  if (!xuongAddInput.trim()) return;
                  const key = xuongAddInput.trim().toLowerCase().replace(/\s+/g, "_");
                  if (!xuongList.find(x => x.key === key)) setXuongList([...xuongList, { key, label: xuongAddInput.trim() }]);
                  setXuongAddInput("");
                }}
                className="px-2 py-1 bg-rose-500 text-white rounded text-xs hover:bg-rose-600 transition">
                <Plus size={11} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats — 4 ô chính */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-slate-800">{tongSP.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{losCat.length} lô · {filterThang ? <span className="text-rose-400">tháng cắt</span> : "tất cả"}</p>
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
            {[{ key: "dai_thuong", label: "Dài thường", cls: "text-slate-500" },
              { key: "dai_kieu",   label: "Dài kiểu",   cls: "text-purple-600" },
              { key: "short",      label: "Short",       cls: "text-sky-600"    }
            ].map(({ key, label, cls }) => tongSP_byLoai[key] ? (
              <div key={key} className="flex justify-between items-center text-[12px]">
                <span className={`${cls} font-medium`}>{label}</span>
                <span className="text-slate-600 font-semibold">{(tongSP_byLoai[key] ?? 0).toLocaleString()}</span>
              </div>
            ) : null)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Đã nhận về</p>
          <p className="text-2xl font-bold text-green-600">{tongNhan.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{filterThang ? <span className="text-green-500">tháng nhận</span> : "tất cả"}</p>
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-0.5">
            {[{ key: "dai_thuong", label: "Dài thường", cls: "text-slate-500" },
              { key: "dai_kieu",   label: "Dài kiểu",   cls: "text-purple-600" },
              { key: "short",      label: "Short",       cls: "text-sky-600"    }
            ].map(({ key, label, cls }) => tongNhan_byLoai[key] ? (
              <div key={key} className="flex justify-between items-center text-[12px]">
                <span className={`${cls} font-medium`}>{label}</span>
                <span className="text-green-700 font-semibold">{(tongNhan_byLoai[key] ?? 0).toLocaleString()}</span>
              </div>
            ) : null)}
          </div>
        </div>
        <div className={`rounded-xl p-4 border ${tongThieu > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <p className="text-xs text-slate-500 mb-1">Tổng thiếu</p>
          <p className={`text-2xl font-bold ${tongThieu > 0 ? "text-red-600" : "text-green-600"}`}>{tongThieu.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{filterThang ? <span className={tongThieu > 0 ? "text-red-400" : "text-slate-400"}>tháng nhận</span> : "tất cả"}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Đã nhập</p>
          <p className="text-2xl font-bold text-blue-600">{daNhapCount}</p>
          <p className="text-xs text-slate-400 mt-1">/ {losCat.length} lô</p>
        </div>
      </div>

      {/* ═══ TỒN KHO VẢI ═══ */}
      <div className="bg-white rounded-xl border border-slate-200 mb-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 cursor-pointer select-none"
          onClick={() => setShowVaiTon(v => !v)}>
          <div className="flex items-center gap-2">
            {showVaiTon ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            <span className="font-semibold text-sm text-slate-700">Tồn kho vải</span>
            <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{vaiTons.length} loại</span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setVaiForm({ maVai: "", donVi: "m", mauSac: "", xuong: "", ghiChu: "", tenNCC: "", soHoaDon: "", chiPhiThucNhap: "", soTienHoaDon: "", vatPct: "", tinhNoTheo: "thuc_te" }); setVaiCayRows([{ soMet: "" }]); setShowAddNCC(false); setNewNccName(""); setModalVai("new"); }}
            className="flex items-center gap-1 text-xs bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition">
            <Plus size={12} /> Thêm vải
          </button>
        </div>

        {showVaiTon && (() => {
          // Tổng hợp theo xưởng
          const byXuong: Record<string, { soMet: number; donVi: string; count: number; soCay: number }> = {};
          vaiTons.forEach(v => {
            const key = v.xuong || "__chua_chon__";
            if (!byXuong[key]) byXuong[key] = { soMet: 0, donVi: v.donVi, count: 0, soCay: 0 };
            byXuong[key].soMet += v.soMet;
            byXuong[key].count += 1;
            const vCayParsed = (() => { try { return v.cayData ? JSON.parse(v.cayData) : []; } catch { return []; } })();
            const uncutCount = vCayParsed.length > 0 ? vCayParsed.filter((c: { cut?: boolean }) => !c.cut).length : (v.soCay ?? 1);
            byXuong[key].soCay += uncutCount;
          });
          return (
            <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap gap-2 items-center">
              {/* Nút Tất cả */}
              <button onClick={() => setFilterVaiXuong("")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition font-medium ${filterVaiXuong === "" ? "bg-slate-700 text-white border-slate-700" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-100"}`}>
                Tất cả
                <span className={`font-normal ${filterVaiXuong === "" ? "text-slate-300" : "text-slate-400"}`}>({vaiTons.length} loại)</span>
              </button>
              {Object.entries(byXuong).map(([xuong, info]) => {
                const isActive = filterVaiXuong === xuong;
                const colorActive = xuong === "dung_linh" ? "bg-amber-500 text-white border-amber-500" : xuong === "__chua_chon__" ? "bg-slate-500 text-white border-slate-500" : "bg-rose-500 text-white border-rose-500";
                const colorInactive = xuong === "dung_linh" ? "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-400" : xuong === "__chua_chon__" ? "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400" : "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400";
                return (
                  <button key={xuong} onClick={() => setFilterVaiXuong(isActive ? "" : xuong)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition font-medium ${isActive ? colorActive : colorInactive}`}>
                    <span>{xuong === "__chua_chon__" ? "Chưa xác định" : (XUONG_LABEL[xuong] ?? xuong)}</span>
                    <span className={`font-normal ${isActive ? "opacity-70" : "text-slate-400"}`}>·</span>
                    <span className="font-bold">{info.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} {info.donVi}</span>
                    <span className={`font-normal ${isActive ? "opacity-70" : "text-slate-400"}`}>({info.count} loại · {info.soCay} cây)</span>
                  </button>
                );
              })}
              {vaiTons.length === 0 && <span className="text-xs text-slate-400">Chưa có dữ liệu</span>}
            </div>
          );
        })()}

        {showVaiTon && (
          <div className="overflow-x-auto">
            {vaiTons.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">Chưa có vải nào — nhấn "+ Thêm vải" để bắt đầu</p>
            ) : (
              <table className="w-full text-xs whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-2 text-slate-500 font-medium">Mã / Tên vải</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium">Màu sắc</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium">Xưởng</th>
                    <th className="text-center px-3 py-2 text-slate-500 font-medium">Số cây</th>
                    <th className="text-right px-3 py-2 text-slate-500 font-medium">Tổng mét tồn</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium">Đơn vị</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-medium">Ghi chú</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vaiTons.filter(v => !filterVaiXuong || (v.xuong || "__chua_chon__") === filterVaiXuong).map(v => {
                    const hasCayData = v.soCay > 1 && v.cayData;
                    const isVaiExpanded = expandedVaiRows.has(v.id);
                    let cayDataParsed: { soMet: number; soMetUsed?: number; cut?: boolean }[] = [];
                    // Parse cayData for ALL vải (not just soCay>1) so cut status shows for single-cây
                    if (v.cayData) { try { cayDataParsed = JSON.parse(v.cayData!); } catch {} }
                    return (
                      <>
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-semibold text-slate-800">{v.maVai}</td>
                        <td className="px-3 py-2 font-bold text-[1.2em] text-slate-700">{v.mauSac ?? <span className="text-slate-300 font-normal text-sm">—</span>}</td>
                        <td className="px-2 py-1 text-center">
                          {editingVaiXuong === v.id ? (
                            <select autoFocus
                              defaultValue={v.xuong ?? ""}
                              onChange={async e => {
                                setEditingVaiXuong(null);
                                await fetch(`/api/san-xuat/vai-ton/${v.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ xuong: e.target.value || null }) });
                                fetchVaiTon();
                              }}
                              onBlur={() => setEditingVaiXuong(null)}
                              className="border border-slate-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200 bg-white">
                              <option value="">— Chưa chọn —</option>
                              {xuongList.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                            </select>
                          ) : (
                            <button onClick={() => setEditingVaiXuong(v.id)} className="hover:opacity-80 transition" title="Click để chọn xưởng">
                              {v.xuong
                                ? <span className={`px-1.5 py-0.5 rounded text-xs ${v.xuong === "dung_linh" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{XUONG_LABEL[v.xuong] ?? v.xuong}</span>
                                : <span className="text-slate-300 text-xs">— chọn</span>}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {(() => {
                            // Dùng cayDataParsed.length nếu có, tránh lệch với v.soCay
                            const totalCay = cayDataParsed.length > 0 ? cayDataParsed.length : (v.soCay ?? 0);
                            const cutCount = cayDataParsed.filter((c: { cut?: boolean }) => c.cut).length;
                            const remainingCay = totalCay - cutCount;
                            const hasAnyCut = cutCount > 0;
                            const cayLabel = hasAnyCut ? (
                              <><span className="line-through opacity-50 mr-0.5">{totalCay}</span><span>{remainingCay}</span></>
                            ) : (
                              <>{totalCay}</>
                            );
                            const badgeClass = totalCay === 0
                              ? "text-slate-400 bg-slate-100"
                              : hasAnyCut ? "text-rose-500 bg-rose-50"
                              : "text-rose-600 bg-rose-50";
                            return hasCayData ? (
                              <button onClick={() => toggleVaiExpand(v.id)}
                                className={`flex items-center gap-1 text-[18px] font-bold px-2.5 py-0.5 rounded-full hover:bg-rose-100 transition mx-auto ${badgeClass}`}>
                                {isVaiExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                                {cayLabel}
                              </button>
                            ) : (
                              <span className={`text-[18px] font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                                {cayLabel}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {editingVaiMet?.id === v.id ? (
                            <input autoFocus type="number" step="0.01" value={editingVaiMet.val}
                              onChange={e => setEditingVaiMet({ id: v.id, val: e.target.value })}
                              onBlur={() => saveVaiMet(v, editingVaiMet.val)}
                              onKeyDown={e => { if (e.key === "Enter") saveVaiMet(v, editingVaiMet.val); if (e.key === "Escape") setEditingVaiMet(null); }}
                              className="w-24 text-right border border-blue-300 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-blue-50" />
                          ) : (
                            <button onClick={() => setEditingVaiMet({ id: v.id, val: String(v.soMet) })}
                              className={`font-bold hover:bg-blue-50 rounded px-2 py-0.5 transition ${v.soMet <= 0 ? "text-red-500" : v.soMet < 10 ? "text-amber-600" : "text-blue-700"}`}>
                              {v.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                            </button>
                          )}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{v.donVi}</td>
                        <td className="px-3 py-2 text-slate-400 italic">
                          {v.ghiChu ?? ""}
                          {v.congNoNccId && (
                            <Link href="/cong-no" className="ml-2 text-amber-600 hover:underline not-italic font-medium">
                              💰 Xem công nợ
                            </Link>
                          )}
                        </td>
                        <td className="px-3 py-2 flex gap-2 items-center">
                          <button onClick={() => {
                            setVaiForm({ maVai: v.maVai, donVi: v.donVi, mauSac: v.mauSac ?? "", xuong: v.xuong ?? "", ghiChu: v.ghiChu ?? "", tenNCC: "", soHoaDon: "", chiPhiThucNhap: "", soTienHoaDon: "", vatPct: "", tinhNoTheo: "thuc_te" });
                            try { setVaiCayRows(v.cayData ? JSON.parse(v.cayData).map((c: {soMet: number}) => ({ soMet: String(c.soMet) })) : [{ soMet: String(v.soMet) }]); }
                            catch { setVaiCayRows([{ soMet: String(v.soMet) }]); }
                            setModalVai(v);
                          }}
                            className="text-rose-500 hover:underline">Sửa</button>
                          <button onClick={() => deleteVai(v.id)} className="text-slate-300 hover:text-red-500 transition"><X size={12} /></button>
                        </td>
                      </tr>
                      {/* Per-cây detail rows */}
                      {hasCayData && isVaiExpanded && cayDataParsed.map((cay, ci) => (
                        <tr key={`${v.id}-vai-cay-${ci}`}
                          className={`border-l-2 ${cay.cut ? "bg-slate-100/80 border-slate-300 opacity-60" : "bg-emerald-50/60 border-emerald-300"}`}>
                          <td className={`px-4 py-1.5 text-[14px] font-semibold ${cay.cut ? "text-slate-400 line-through" : "text-slate-500"}`}>
                            └ Cây #{ci + 1}{cay.cut && " ✂️"}
                          </td>
                          <td colSpan={2}></td>
                          <td className="px-3 py-1.5 text-center text-[14px] text-slate-400">{ci + 1}</td>
                          <td className="px-3 py-1.5 text-right">
                            <span className={`text-[14px] font-bold ${cay.cut ? "text-slate-400 line-through" : cay.soMet <= 0 ? "text-red-500" : cay.soMet < 5 ? "text-amber-600" : "text-emerald-700"}`}>
                              {(cay.cut ? (cay.soMet + (cay.soMetUsed ?? 0)) : cay.soMet).toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className={`px-3 py-1.5 text-[14px] ${cay.cut ? "text-slate-400 line-through" : "text-slate-400"}`}>{v.donVi}</td>
                          <td colSpan={2}></td>
                        </tr>
                      ))}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Filter + Actions */}
      <div className="flex items-center gap-3 mb-4">
        <select value={filterThang} onChange={e => setFilterThang(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200">
          <option value="">Tất cả tháng</option>
          {thangOptions.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <select value={filterXuong} onChange={e => setFilterXuong(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200">
          <option value="">Tất cả xưởng</option>
          {[...new Set(losCat.map(l => l.xuong).filter(Boolean))].map(x => (
            <option key={x} value={x}>{XUONG_LABEL[x] ?? x}</option>
          ))}
        </select>
        <div className="flex gap-1">
          {([["", "Tất cả"], ["chua_nhap", "⏳ Chưa nhập"], ["da_nhap", "✓ Đã nhập"]] as const).map(([val, label]) => (
            <button key={val} onClick={() => setFilterTrangThai(val)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition font-medium ${filterTrangThai === val ? (val === "chua_nhap" ? "bg-amber-500 text-white border-amber-500" : val === "da_nhap" ? "bg-green-600 text-white border-green-600" : "bg-slate-700 text-white border-slate-700") : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
              {label}
            </button>
          ))}
        </div>
        {(filterThang || filterXuong || filterTrangThai) && (
          <button onClick={() => { setFilterThang(""); setFilterXuong(""); setFilterTrangThai(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-2 rounded-lg hover:bg-slate-100">✕ Xoá lọc</button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{losCat.length} lô cắt</span>
      </div>

      {/* Main tabs: Lô Cắt | Xuất Hóa Đơn */}
      {(() => {
        const hoaDonCount = allLoCat.filter(l => l.trangThai === "da_nhap").length;
        return (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveMainTab("lo-cat")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeMainTab === "lo-cat" ? "bg-rose-500 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              ✂️ Lô Cắt
            </button>
            <button
              onClick={() => setActiveMainTab("hoa-don")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${activeMainTab === "hoa-don" ? "bg-blue-500 text-white shadow-sm" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              📄 Xuất Hóa Đơn
              {hoaDonCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeMainTab === "hoa-don" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>
                  {hoaDonCount}
                </span>
              )}
            </button>
          </div>
        );
      })()}

      {activeMainTab === "lo-cat" && <>
      {/* Table header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">Lô cắt</span>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
          <Plus size={13} /> Thêm lô cắt
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[15px] whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 py-2.5 w-6"></th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Ngày</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Hàng cắt</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Tên vải</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Size</th>
                <th className="text-right px-2 py-2.5 text-slate-500 font-medium">T.Size</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Số M</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Số Y</th>
                <th className="text-right px-2 py-2.5 text-slate-500 font-medium">Lá KH</th>
                <th className="text-center px-2 py-2.5 text-emerald-600 font-medium text-[14px]">Đã cắt</th>
                <th className="text-right px-2 py-2.5 text-slate-500 font-medium">Lá TT</th>
                <th className="text-right px-2 py-2.5 text-slate-500 font-medium">SP / Lá</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium min-w-[260px]">Ghi chú may</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Màu giặt</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium bg-orange-50 hidden">Số SP</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Nhận về</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Loại hàng</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Trạng thái</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Xưởng</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {losCat.length === 0 ? (
                <tr>
                  <td colSpan={20} className="text-center py-16 text-slate-400">
                    <Scissors size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Chưa có lô cắt nào</p>
                    <button onClick={openAdd} className="mt-3 text-rose-500 hover:underline text-sm">+ Thêm lô cắt đầu tiên</button>
                  </td>
                </tr>
              ) : losCat.map(lo => {
                const thieu = lo.soLuongThieu ?? 0;
                const hasCay = lo.soCay > 1 && lo.cayData;
                type CayParsed = { soY: string; soM: string; soLaTT: string; hangThucTe?: number; mauGiat?: string; ghiChuMay?: string; hdMayDa?: boolean; hdGiatViSinhDa?: boolean; hdGiatMauDa?: boolean; daCat?: boolean; trangThai?: string };
                const cayParsed: CayParsed[] = hasCay ? (() => { try { return JSON.parse(lo.cayData!); } catch { return []; } })() : [];
                // Tổng Thiếu từ per-cây (dùng cho multi-cây khi lo.soLuongThieu chưa có)
                const cayThieuAgg: number | null = (() => {
                  if (!hasCay || cayParsed.length === 0) return null;
                  const anyHTFilled = cayParsed.some(c => c.hangThucTe != null);
                  if (!anyHTFilled) return null;
                  return cayParsed.reduce((s, c) => {
                    const laTT = c.soLaTT !== "" && c.soLaTT != null ? Number(c.soLaTT) : null;
                    const sp = laTT != null && lo.tongSize != null ? laTT * lo.tongSize : 0;
                    return s + (sp - (c.hangThucTe ?? 0));
                  }, 0);
                })();
                const isExpanded = expandedRows.has(lo.id);
                return (
                  <>
                  <tr key={lo.id} className={`hover:bg-slate-50 ${lo.trangThai === "da_nhap" ? "opacity-70" : ""}`}>
                    <td className="px-2 py-2.5 text-center">
                      {hasCay && (
                        <button onClick={() => toggleExpand(lo.id)} className="text-slate-400 hover:text-rose-500 transition">
                          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">{formatDate(lo.ngay)}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{lo.hangCat}</td>
                    <td className="px-3 py-2.5 text-slate-500">{lo.maVai ?? "—"}</td>
                    <td className="px-3 py-2.5 text-slate-500">{lo.soSize ?? "—"}</td>
                    <td className="px-2 py-2.5 text-right text-slate-500">{lo.tongSize ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600 font-medium">
                      {lo.soM != null ? lo.soM.toFixed(2) : <span className="text-slate-300 font-normal">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">
                      {lo.soY != null ? lo.soY.toFixed(2) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-2 py-2.5 text-right text-slate-500">{lo.soLa != null ? lo.soLa.toFixed(1) : "—"}</td>
                    {/* Đã cắt */}
                    <td className="px-2 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[13px] text-slate-400">{cayParsed.filter(c => c.daCat).length}/{cayParsed.length}</span>
                      ) : (
                        <button onClick={() => toggleDaCat(lo)}
                          disabled={lo.soLaThucTe == null}
                          title={lo.soLaThucTe == null ? "Cần điền Lá TT trước" : ""}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition mx-auto ${lo.daCat ? "bg-emerald-500 border-emerald-500 text-white" : lo.soLaThucTe != null ? "border-slate-300 hover:border-emerald-400" : "border-slate-200 opacity-40 cursor-not-allowed"}`}>
                          {lo.daCat && <CheckCircle size={12} />}
                        </button>
                      )}
                    </td>
                    {/* Lá TT — inline edit cho lô 1 cây, read-only cho nhiều cây */}
                    <td className="px-1.5 py-1 text-right">
                      {!hasCay ? (
                        editingLaTT?.id === lo.id ? (
                          <input
                            type="number"
                            autoFocus
                            value={editingLaTT.val}
                            onChange={e => setEditingLaTT({ id: lo.id, val: e.target.value })}
                            onBlur={() => saveLaTT(lo, editingLaTT.val)}
                            onKeyDown={e => {
                              if (e.key === "Enter") { e.preventDefault(); saveLaTT(lo, editingLaTT.val); }
                              if (e.key === "Escape") setEditingLaTT(null);
                            }}
                            className="w-16 text-right border border-rose-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 bg-rose-50"
                          />
                        ) : (
                          <button
                            onClick={() => setEditingLaTT({ id: lo.id, val: lo.soLaThucTe != null ? String(lo.soLaThucTe) : "" })}
                            className="text-rose-700 font-semibold hover:bg-rose-50 rounded px-2 py-1 text-xs w-full text-right transition"
                            title="Click để nhập số lá thực tế"
                          >
                            {lo.soLaThucTe ?? <span className="text-slate-300 font-normal">— nhập</span>}
                          </button>
                        )
                      ) : (
                        <span className="text-slate-600 text-xs px-2">{lo.soLaThucTe ?? "—"}</span>
                      )}
                    </td>
                    {/* SP cắt được + lá chênh */}
                    <td className="px-3 py-2.5 text-right">
                      {(() => {
                        const soSP = lo.soSanPham != null ? lo.soSanPham : null;
                        const laChenh = lo.soLaThucTe != null && lo.soLa != null ? lo.soLaThucTe - lo.soLa : null;
                        return (
                          <>
                            {soSP != null
                              ? <span className="block text-slate-800 font-bold">{soSP.toLocaleString()}</span>
                              : <span className="text-slate-300">—</span>}
                            {/* Nếu có soMSoDo → hiện chênh; không thì hiện laTT đơn thuần */}
                            {laChenh != null ? (
                              <span className={`text-[13px] px-1 py-0.5 rounded ${laChenh < -1.5 ? "bg-red-100 text-red-700" : laChenh < 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                {laChenh >= 0 ? `+${laChenh.toFixed(1)}` : laChenh.toFixed(1)} lá
                              </span>
                            ) : lo.soLaThucTe != null ? (
                              <span className="text-[13px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">{lo.soLaThucTe} lá</span>
                            ) : null}
                          </>
                        );
                      })()}
                    </td>
                    {/* Ghi chú may — ghi chú chung cấp lô, luôn hiện dù 1 hay nhiều cây */}
                    <td className="px-1.5 py-1 min-w-[260px]">
                      {editingGhiChuMay?.id === lo.id ? (
                        <input
                          autoFocus
                          value={editingGhiChuMay.val}
                          onChange={e => setEditingGhiChuMay({ id: lo.id, val: e.target.value })}
                          onBlur={() => saveGhiChuMay(lo, editingGhiChuMay.val)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveGhiChuMay(lo, editingGhiChuMay.val);
                            if (e.key === "Escape") setEditingGhiChuMay(null);
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingGhiChuMay({ id: lo.id, val: lo.ghiChuMay ?? "" })}
                          className="text-rose-600 font-bold hover:bg-rose-50 rounded px-2 py-1 text-sm w-full text-left transition block"
                          title={lo.ghiChuMay ?? "Click để nhập ghi chú"}
                        >
                          {lo.ghiChuMay ?? <span className="text-slate-300 font-normal text-xs">— nhập</span>}
                        </button>
                      )}
                    </td>
                    {/* Màu giặt — inline select */}
                    <td className="px-1.5 py-1 text-center">
                      {editingMauGiat === lo.id ? (
                        <select
                          autoFocus
                          defaultValue={lo.mauGiat ?? ""}
                          onChange={e => saveMauGiat(lo, e.target.value)}
                          onBlur={() => setEditingMauGiat(null)}
                          className="border border-slate-300 rounded px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                        >
                          <option value="">—</option>
                          {MAU_GIAT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingMauGiat(lo.id)}
                          className="hover:opacity-80 transition"
                          title="Click để chọn màu giặt"
                        >
                          {lo.mauGiat
                            ? <span className={`px-2 py-0.5 rounded-full text-[13px] font-semibold ${MAU_GIAT_CLS[lo.mauGiat] ?? "bg-slate-100 text-slate-600"}`}>{lo.mauGiat}</span>
                            : <span className="text-slate-300 text-xs">— chọn</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800 bg-orange-50 hidden">{lo.soSanPham?.toLocaleString() ?? "—"}</td>
                    <td className="px-1.5 py-1 text-right">
                      {hasCay ? (
                        /* Lô nhiều cây: hiện tổng read-only + thiếu */
                        <>
                          <span className="text-green-700 font-semibold text-sm px-1 block">
                            {lo.hangThucTe != null ? lo.hangThucTe.toLocaleString() : <span className="text-slate-300 text-xs font-normal">—</span>}
                          </span>
                          {lo.hangThucTe != null && lo.soSanPham != null && (() => {
                            const thieu = lo.soSanPham - lo.hangThucTe;
                            return thieu !== 0 ? (
                              <span className={`text-[12px] font-medium ${thieu > 0 ? "text-red-500" : "text-green-500"}`}>
                                {thieu > 0 ? `-${thieu.toLocaleString()}` : `+${Math.abs(thieu).toLocaleString()}`}
                              </span>
                            ) : <span className="text-[12px] text-green-500">✓</span>;
                          })()}
                        </>
                      ) : (
                        /* Lô 1 cây: ô input xanh cố định + thiếu */
                        <>
                          <input
                            type="number"
                            min="0"
                            defaultValue={lo.hangThucTe != null ? String(lo.hangThucTe) : ""}
                            key={`nv-${lo.id}-${lo.hangThucTe}`}
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            onBlur={e => saveNhanVe(lo, e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                            placeholder="0"
                            style={{ pointerEvents: "all", position: "relative", zIndex: 10 }}
                            className="w-16 text-right border border-green-300 rounded px-1 py-0.5 text-[14px] font-semibold text-green-700 focus:outline-none focus:ring-1 focus:ring-green-400 bg-green-50"
                          />
                          {lo.hangThucTe != null && lo.soSanPham != null && (() => {
                            const thieu = lo.soSanPham - lo.hangThucTe;
                            return thieu !== 0 ? (
                              <span className={`text-[12px] font-medium block mt-0.5 ${thieu > 0 ? "text-red-500" : "text-green-500"}`}>
                                {thieu > 0 ? `-${thieu.toLocaleString()}` : `+${Math.abs(thieu).toLocaleString()}`}
                              </span>
                            ) : <span className="text-[12px] text-green-500 block mt-0.5">✓</span>;
                          })()}
                        </>
                      )}
                    </td>
                    {/* Loại hàng — inline select */}
                    <td className="px-1.5 py-1 text-center">
                      <select
                        value={lo.loaiHang ?? "dai_thuong"}
                        onChange={e => saveLoaiHang(lo, e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className={`border rounded px-1.5 py-0.5 text-[12px] font-medium focus:outline-none focus:ring-1 cursor-pointer ${
                          lo.loaiHang === "short"    ? "bg-sky-50 border-sky-200 text-sky-700 focus:ring-sky-300" :
                          lo.loaiHang === "dai_kieu" ? "bg-purple-50 border-purple-200 text-purple-700 focus:ring-purple-300" :
                                                       "bg-slate-100 border-slate-200 text-slate-600 focus:ring-slate-300"
                        }`}
                      >
                        {LOAI_HANG_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[13px] text-slate-400">
                          {cayParsed.filter(c => c.trangThai === "da_nhap").length}/{cayParsed.length} nhập
                        </span>
                      ) : (
                        <button onClick={() => handleQuickStatus(lo)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition ${lo.trangThai === "da_nhap" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                          {lo.trangThai === "da_nhap" ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {lo.trangThai === "da_nhap" ? "Đã nhập" : "Chưa nhập"}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${lo.xuong === "dung_linh" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {XUONG_LABEL[lo.xuong] ?? lo.xuong}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 flex items-center gap-2">
                      <button onClick={() => openEdit(lo)} className="text-rose-500 hover:underline">Sửa</button>
                      <button onClick={() => deleteLoCat(lo)} className="text-slate-300 hover:text-red-500 transition" title="Xoá lô cắt"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                  {/* Expanded cây rows */}
                  {hasCay && isExpanded && cayParsed.map((cay, ci) => {
                    const sdd = lo.soMSoDo ?? 0;
                    const laKH = sdd > 0 && Number(cay.soM) > 0 ? Number(cay.soM) / sdd : null;
                    const laTT = cay.soLaTT !== "" && cay.soLaTT != null ? Number(cay.soLaTT) : null;
                    const chenh = laKH != null && laTT != null ? laTT - laKH : null;
                    const spPerCay = laTT != null && lo.tongSize != null ? laTT * lo.tongSize : null;
                    const nhanVeCay = (cay.hangThucTe != null && cay.hangThucTe !== "") ? cay.hangThucTe : null;
                    const thieuCay = spPerCay != null && nhanVeCay != null ? spPerCay - nhanVeCay : null;
                    return (
                      <tr key={`${lo.id}-cay-${ci}`} className="bg-slate-50/80 border-l-2 border-rose-200">
                        {/* col 1: expand */}
                        <td></td>
                        {/* col 2: Ngày — empty */}
                        <td></td>
                        {/* col 3: Hàng cắt — label */}
                        <td className="px-3 py-1.5 text-[14px] text-slate-400 font-semibold">└ Cây #{ci + 1}</td>
                        {/* col 3b: Tên vải — empty */}
                        <td></td>
                        {/* col 4: Size — empty */}
                        <td></td>
                        {/* col 5: T.Size — empty */}
                        <td></td>
                        {/* col 6: Số M */}
                        <td className="px-3 py-1.5 text-right text-[14px] text-slate-600">{Number(cay.soM) > 0 ? Number(cay.soM).toFixed(2) : "—"}</td>
                        {/* col 6b: Số Y — per-cây lưu soY riêng nếu có */}
                        <td className="px-3 py-1.5 text-right text-[14px] text-slate-400">{Number(cay.soY) > 0 ? Number(cay.soY).toFixed(2) : "—"}</td>
                        {/* col 7: Lá KH */}
                        <td className="px-3 py-1.5 text-right text-[14px] text-blue-600 font-semibold">{laKH != null ? laKH.toFixed(1) : "—"}</td>
                        {/* col 7: Đã cắt per-cây */}
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={() => toggleCayDaCat(lo, ci)}
                            disabled={laTT == null}
                            title={laTT == null ? "Cần điền Lá TT trước" : ""}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition mx-auto ${cay.daCat ? "bg-emerald-500 border-emerald-500 text-white" : laTT != null ? "border-slate-300 hover:border-emerald-400" : "border-slate-200 opacity-40 cursor-not-allowed"}`}>
                            {cay.daCat && <CheckCircle size={10} />}
                          </button>
                        </td>
                        {/* col 8: Lá TT per-cây — inline edit */}
                        <td className="px-1 py-1 text-right">
                          {editingCayLaTT?.id === lo.id && editingCayLaTT.ci === ci ? (
                            <input
                              type="number"
                              autoFocus
                              value={editingCayLaTT.val}
                              onChange={e => setEditingCayLaTT({ id: lo.id, ci, val: e.target.value })}
                              onBlur={() => saveCayLaTT(lo, ci, editingCayLaTT.val)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { e.preventDefault(); saveCayLaTT(lo, ci, editingCayLaTT.val); }
                                if (e.key === "Escape") setEditingCayLaTT(null);
                              }}
                              className="w-14 text-right border border-rose-300 rounded px-1 py-0.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCayLaTT({ id: lo.id, ci, val: cay.soLaTT ?? "" })}
                              className="text-rose-600 font-semibold hover:bg-rose-50 rounded px-2 py-0.5 text-[14px] w-full text-right transition"
                              title="Click để nhập lá thực tế"
                            >
                              {laTT != null ? laTT : <span className="text-slate-300 font-normal">—</span>}
                            </button>
                          )}
                        </td>
                        {/* col 9: Thiếu per-cây + chênh lệch lá */}
                        <td className="px-2 py-1.5 text-right">
                          {spPerCay != null && (
                            <span className="text-[14px] font-bold text-slate-800 block">
                              {spPerCay.toLocaleString()}
                            </span>
                          )}
                          {/* Có soMSoDo → hiện chênh có màu; không thì hiện laTT đơn thuần */}
                          {chenh != null ? (
                            <span className={`text-[13px] px-1 py-0.5 rounded ${chenh < -1.5 ? "bg-red-100 text-red-700" : chenh < 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {chenh >= 0 ? `+${chenh.toFixed(1)}` : chenh.toFixed(1)} lá
                            </span>
                          ) : laTT != null ? (
                            <span className="text-[13px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">{laTT} lá</span>
                          ) : null}
                        </td>
                        {/* col 10: Ghi chú may — per-cây inline edit */}
                        <td className="px-1.5 py-1 max-w-[150px]">
                          {editingCayGhiChu?.id === lo.id && editingCayGhiChu.ci === ci ? (
                            <input
                              autoFocus
                              value={editingCayGhiChu.val}
                              onChange={e => setEditingCayGhiChu({ id: lo.id, ci, val: e.target.value })}
                              onBlur={() => saveCayField(lo, ci, "ghiChuMay", editingCayGhiChu.val)}
                              onKeyDown={e => {
                                if (e.key === "Enter") saveCayField(lo, ci, "ghiChuMay", editingCayGhiChu.val);
                                if (e.key === "Escape") setEditingCayGhiChu(null);
                              }}
                              className="w-full border border-slate-300 rounded px-2 py-0.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCayGhiChu({ id: lo.id, ci, val: cay.ghiChuMay ?? "" })}
                              className="text-rose-600 font-bold hover:bg-rose-50 rounded px-2 py-0.5 text-[15px] w-full text-left transition truncate block max-w-[140px]"
                              title={cay.ghiChuMay ?? "Click để nhập"}
                            >
                              {cay.ghiChuMay ?? <span className="text-slate-300 font-normal text-xs">— nhập</span>}
                            </button>
                          )}
                        </td>
                        {/* col 9: Màu giặt — per-cây inline select */}
                        <td className="px-1.5 py-1 text-center">
                          {editingCayMau?.id === lo.id && editingCayMau.ci === ci ? (
                            <select
                              autoFocus
                              defaultValue={cay.mauGiat ?? ""}
                              onChange={e => saveCayField(lo, ci, "mauGiat", e.target.value)}
                              onBlur={() => setEditingCayMau(null)}
                              className="border border-slate-300 rounded px-1 py-0.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-rose-200 bg-white"
                            >
                              <option value="">—</option>
                              {MAU_GIAT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          ) : (
                            <button
                              onClick={() => setEditingCayMau({ id: lo.id, ci })}
                              className="hover:opacity-80 transition"
                              title="Click để chọn màu giặt"
                            >
                              {cay.mauGiat
                                ? <span className={`px-2 py-0.5 rounded-full text-[13px] font-semibold ${MAU_GIAT_CLS[cay.mauGiat] ?? "bg-slate-100 text-slate-600"}`}>{cay.mauGiat}</span>
                                : <span className="text-slate-300 text-[14px]">— chọn</span>}
                            </button>
                          )}
                        </td>
                        {/* col 11: Số SP per cây */}
                        <td className="px-3 py-1.5 text-right text-[14px] font-bold text-slate-700 bg-orange-50 hidden">{spPerCay != null ? spPerCay.toLocaleString() : "—"}</td>
                        {/* col 12: Nhận về per-cây — inline edit */}
                        <td className="px-1 py-1">
                          <input
                            type="number"
                            min="0"
                            defaultValue={nhanVeCay != null ? String(nhanVeCay) : ""}
                            key={`nvcay-${lo.id}-${ci}-${nhanVeCay}`}
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => e.stopPropagation()}
                            onBlur={e => saveCayNhanVe(lo, ci, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLInputElement).blur(); }
                            }}
                            placeholder="0"
                            style={{ pointerEvents: "all", position: "relative", zIndex: 10 }}
                            className="w-16 text-right border border-green-300 rounded px-1 py-0.5 text-[14px] font-semibold text-green-700 focus:outline-none focus:ring-1 focus:ring-green-400 bg-green-50"
                          />
                          {nhanVeCay != null && spPerCay != null && (() => {
                            const thieu = spPerCay - Number(nhanVeCay);
                            return thieu !== 0 ? (
                              <span className={`text-[12px] font-medium block mt-0.5 text-right ${thieu > 0 ? "text-red-500" : "text-green-500"}`}>
                                {thieu > 0 ? `-${thieu.toLocaleString()}` : `+${Math.abs(thieu).toLocaleString()}`}
                              </span>
                            ) : <span className="text-[12px] text-green-500 block mt-0.5 text-right">✓</span>;
                          })()}
                        </td>
                        {/* col: Loại hàng — empty for cây rows */}
                        <td></td>
                        {/* col 14: Trạng thái per-cây toggle */}
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={() => toggleCayTrangThai(lo, ci)}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[13px] font-medium transition ${cay.trangThai === "da_nhap" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {cay.trangThai === "da_nhap" ? <CheckCircle size={8} /> : <Clock size={8} />}
                            {cay.trangThai === "da_nhap" ? "Đã nhập" : "Chưa nhập"}
                          </button>
                        </td>
                        {/* cols 15-16 */}
                        <td colSpan={2}></td>
                      </tr>
                    );
                  })}
                  </>
                );
              })}
            </tbody>
            {losCat.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-xs">
                <tr>
                  <td colSpan={14} className="px-3 py-2 text-slate-500">Tổng</td>
                  <td className="px-3 py-2 text-right text-green-700">{tongNhan.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-600">{tongThieu > 0 ? tongThieu.toLocaleString() : <span className="text-green-600">0</span>}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      </>}

      {/* ═══ TAB: XUẤT HÓA ĐƠN ═══ */}
      {activeMainTab === "hoa-don" && (() => {
        const hoaDonRows = allLoCat.filter(l => l.trangThai === "da_nhap").sort((a, b) => {
          const da = a.ngay ? new Date(a.ngay).getTime() : 0;
          const db = b.ngay ? new Date(b.ngay).getTime() : 0;
          return db - da;
        });
        return (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-700">Hóa đơn đã nhận ({hoaDonRows.length})</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[15px] whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Ngày</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Tên hàng cắt</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Size</th>
                      <th className="text-right px-4 py-2.5 text-slate-500 font-medium">Số lượng</th>
                      <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Xưởng</th>
                      <th className="text-center px-4 py-2.5 text-slate-500 font-medium text-xs">Xuất Kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hoaDonRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-slate-400">
                          <p className="text-2xl mb-2">📄</p>
                          <p>Chưa có lô nào được đánh dấu "Đã nhận"</p>
                        </td>
                      </tr>
                    ) : hoaDonRows.map(lo => {
                      const soLuong = lo.hangThucTe ?? lo.soSanPham ?? 0;
                      const mayState    = getCayHDState(lo, "hdMayDa");
                      const viSinhState = getCayHDState(lo, "hdGiatViSinhDa");
                      const mauState    = getCayHDState(lo, "hdGiatMauDa");
                      const mkCb = (state: string, color: string, onClick: () => void) => (
                        <button onClick={onClick}
                          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition mx-auto ${
                            state === "all"     ? `${color} border-transparent` :
                            state === "partial" ? "bg-white border-amber-400" : "bg-white border-slate-300 hover:border-slate-400"
                          }`}>
                          {state === "all"     && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          {state === "partial" && <div className="w-2.5 h-0.5 bg-amber-400 rounded" />}
                        </button>
                      );
                      return (
                        <tr key={lo.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">
                            {lo.ngay ? new Date(lo.ngay).toLocaleDateString("vi-VN") : "—"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{lo.hangCat ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">{lo.soSize ?? "—"}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-700">
                            {soLuong > 0 ? soLuong.toLocaleString() : <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{lo.xuong ? (XUONG_LABEL[lo.xuong] ?? lo.xuong) : "—"}</td>
                          <td className="px-4 py-3 text-center">
                            {lo.xuatHoaDonDa ? (
                              <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Đã xuất
                                </span>
                                <button
                                  onClick={() => handleHoanTac(lo)}
                                  disabled={hoanTacLoading.has(lo.id)}
                                  title="Hoàn tác xuất kho"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-400 hover:text-rose-500 text-xs transition disabled:opacity-40">
                                  {hoanTacLoading.has(lo.id) ? (
                                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/></svg>
                                  ) : (
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/></svg>
                                  )}
                                  Hoàn tác
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleXuatKho(lo)}
                                disabled={xuatKhoLoading.has(lo.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition">
                                {xuatKhoLoading.has(lo.id) ? (
                                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="10"/></svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                )}
                                Xuất kho
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {hoaDonRows.length > 0 && (
                    <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-sm">
                      <tr>
                        <td colSpan={3} className="px-4 py-2.5 text-slate-500">Tổng</td>
                        <td className="px-4 py-2.5 text-right text-emerald-700">
                          {hoaDonRows.reduce((s, l) => s + (l.hangThucTe ?? l.soSanPham ?? 0), 0).toLocaleString()}
                        </td>
                        <td colSpan={5}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ MODAL Vải tồn ═══ */}
      {modalVai && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[440px] max-h-[90vh] flex flex-col">
            <div className="p-6 overflow-y-auto flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{modalVai === "new" ? "Thêm vải" : "Sửa vải"}</h3>
              <button onClick={() => setModalVai(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Mã / Tên vải *</label>
                <input value={vaiForm.maVai} onChange={e => setVaiForm(f => ({ ...f, maVai: e.target.value }))}
                  className={inp} placeholder="VD: Vải cotton trắng, MV001..." autoFocus />
              </div>

              {/* Hiển thị mã vải trùng để cộng vào */}
              {modalVai === "new" && vaiForm.maVai.trim() && (() => {
                const matches = vaiTons.filter(v => v.maVai.trim().toLowerCase() === vaiForm.maVai.trim().toLowerCase());
                if (matches.length === 0) return null;
                return (
                  <div className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50">
                    <div className="px-3 py-2 bg-amber-100 border-b border-amber-200 flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-amber-700">⚠ Mã "{vaiForm.maVai}" đã tồn tại — chọn để cộng vào hoặc thêm mới bên dưới</span>
                    </div>
                    <div className="divide-y divide-amber-100">
                      {matches.map(m => {
                        let mCays: { soMet: number }[] = [];
                        if (m.cayData) { try { mCays = JSON.parse(m.cayData); } catch {} }
                        const newTotal = vaiCayRows.reduce((s, r) => s + (Number(r.soMet) || 0), 0);
                        return (
                          <div key={m.id} className="flex items-center justify-between px-3 py-2">
                            <div className="text-xs">
                              <span className="font-semibold text-slate-700">{m.maVai}</span>
                              {m.mauSac && <span className="ml-1.5 text-slate-500">{m.mauSac}</span>}
                              {m.xuong && <span className="ml-1.5 text-slate-400">· {XUONG_LABEL[m.xuong] ?? m.xuong}</span>}
                              <div className="text-slate-400 mt-0.5">
                                Tồn: <strong className="text-blue-700">{m.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {m.donVi}</strong>
                                {mCays.length > 0 && <span className="ml-1">· {mCays.length} cây</span>}
                                {newTotal > 0 && <span className="ml-1 text-emerald-600">→ cộng thêm {newTotal.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {m.donVi} = <strong>{(m.soMet + newTotal).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {m.donVi}</strong></span>}
                              </div>
                            </div>
                            <button type="button" onClick={() => congVaoVai(m)}
                              disabled={savingVai || newTotal <= 0}
                              className="ml-2 flex-shrink-0 text-[14px] font-semibold bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                              Cộng vào
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Bảng từng cây */}
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Số cây & Số mét mỗi cây</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-1.5 text-left text-slate-400 font-medium w-12">Cây</th>
                        <th className="px-3 py-1.5 text-slate-500 font-medium">Số mét</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {vaiCayRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-3 py-1.5 text-slate-400 font-semibold">#{i + 1}</td>
                          <td className="px-2 py-1.5">
                            <input type="number" step="0.01" min="0" value={row.soMet}
                              onChange={e => setVaiCayRows(prev => prev.map((r, j) => j === i ? { soMet: e.target.value } : r))}
                              placeholder="0.00"
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200" />
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            {vaiCayRows.length > 1 && (
                              <button type="button" onClick={() => setVaiCayRows(prev => prev.filter((_, j) => j !== i))}
                                className="text-slate-300 hover:text-red-400 transition"><X size={12} /></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-100">
                      <tr>
                        <td className="px-3 py-1.5 text-slate-500 font-semibold text-xs" colSpan={1}>Tổng</td>
                        <td className="px-3 py-1.5 font-bold text-blue-700 text-xs">
                          {vaiCayRows.reduce((s, r) => s + (Number(r.soMet) || 0), 0).toFixed(2)} {vaiForm.donVi}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {/* Thêm cây — dưới bảng để dễ nhấn dù có nhiều cây */}
                <button type="button" onClick={() => setVaiCayRows(r => [...r, { soMet: "" }])}
                  className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-rose-500 border border-dashed border-rose-300 rounded-lg py-1.5 hover:bg-rose-50 transition">
                  <Plus size={11} /> Thêm cây
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Đơn vị</label>
                <select value={vaiForm.donVi} onChange={e => setVaiForm(f => ({ ...f, donVi: e.target.value }))} className={inp}>
                  <option value="m">Mét (m)</option>
                  <option value="yard">Yard</option>
                  <option value="kg">Kg</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Màu sắc</label>
                  <input value={vaiForm.mauSac} onChange={e => setVaiForm(f => ({ ...f, mauSac: e.target.value }))}
                    className={inp} placeholder="VD: Trắng, Đen..." />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Tồn tại xưởng</label>
                  <input
                    list="vai-xuong-list"
                    value={vaiForm.xuong}
                    onChange={e => setVaiForm(f => ({ ...f, xuong: e.target.value }))}
                    className={inp} placeholder="Nhập hoặc chọn..." />
                  <datalist id="vai-xuong-list">
                    {xuongList.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                  </datalist>
                  {/* Quản lý xưởng */}
                  <div className="mt-2 border border-slate-100 rounded-lg p-2 bg-slate-50">
                    <p className="text-[13px] text-slate-400 mb-1.5 font-medium">Quản lý danh sách xưởng</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {xuongList.map(x => (
                        <span key={x.key} className="flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-full px-2 py-0.5">
                          {x.label}
                          <button type="button" onClick={() => setXuongList(xuongList.filter(i => i.key !== x.key))}
                            className="text-slate-300 hover:text-red-500 transition ml-0.5"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={xuongAddInput}
                        onChange={e => setXuongAddInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && xuongAddInput.trim()) {
                            e.preventDefault();
                            const key = xuongAddInput.trim().toLowerCase().replace(/\s+/g, "_");
                            if (!xuongList.find(x => x.key === key)) setXuongList([...xuongList, { key, label: xuongAddInput.trim() }]);
                            setXuongAddInput("");
                          }
                        }}
                        placeholder="Tên xưởng mới..."
                        className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200 bg-white" />
                      <button type="button"
                        onClick={() => {
                          if (!xuongAddInput.trim()) return;
                          const key = xuongAddInput.trim().toLowerCase().replace(/\s+/g, "_");
                          if (!xuongList.find(x => x.key === key)) setXuongList([...xuongList, { key, label: xuongAddInput.trim() }]);
                          setXuongAddInput("");
                        }}
                        className="px-2 py-1 bg-rose-500 text-white rounded text-xs hover:bg-rose-600 transition">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <input value={vaiForm.ghiChu} onChange={e => setVaiForm(f => ({ ...f, ghiChu: e.target.value }))}
                  className={inp} placeholder="Ghi chú thêm..." />
              </div>

              {/* ─── NCC & Công nợ (chỉ hiện khi thêm mới) ─── */}
              {modalVai === "new" && (
                <div className="border-t border-slate-100 pt-3 space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Nhà cung cấp &amp; Công nợ</p>

                  {/* Chọn NCC */}
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Nhà cung cấp</label>
                    {!showAddNCC ? (
                      <div className="flex gap-1.5">
                        <select value={vaiForm.tenNCC} onChange={e => setVaiForm(f => ({ ...f, tenNCC: e.target.value }))} className={`${inp} flex-1`}>
                          <option value="">— Không có —</option>
                          {nccList.map(n => <option key={n.id} value={n.ten}>{n.ten}</option>)}
                        </select>
                        <button type="button" onClick={() => setShowAddNCC(true)}
                          className="px-2.5 py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-500 hover:border-rose-300 hover:text-rose-500 transition whitespace-nowrap">
                          + NCC mới
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input autoFocus value={newNccName} onChange={e => setNewNccName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddNCC(); } }}
                          className={`${inp} flex-1`} placeholder="Tên nhà cung cấp mới..." />
                        <button type="button" onClick={handleAddNCC} className="px-2.5 py-1.5 bg-rose-500 text-white rounded-lg text-xs hover:bg-rose-600 transition">Lưu</button>
                        <button type="button" onClick={() => { setShowAddNCC(false); setNewNccName(""); }} className="px-2.5 py-1.5 border rounded-lg text-xs text-slate-400 hover:text-slate-600 transition">Huỷ</button>
                      </div>
                    )}
                  </div>

                  {/* Chi tiết công nợ — chỉ hiện khi đã chọn NCC */}
                  {vaiForm.tenNCC && (
                    <>
                      {/* Số HĐ */}
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Số hoá đơn <span className="text-slate-400">(không bắt buộc)</span></label>
                        <input value={vaiForm.soHoaDon} onChange={e => setVaiForm(f => ({ ...f, soHoaDon: e.target.value }))}
                          className={inp} placeholder="VD: HD-2024-001" />
                      </div>

                      {/* Chi phí thực + Tiền HĐ */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Chi phí thực tế <span className="text-rose-400">*</span></label>
                          <input type="number" value={vaiForm.chiPhiThucNhap} onChange={e => setVaiForm(f => ({ ...f, chiPhiThucNhap: e.target.value }))}
                            className={inp} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600 mb-1 block">Tiền hoá đơn <span className="text-slate-400">(nếu có)</span></label>
                          <input type="number" value={vaiForm.soTienHoaDon} onChange={e => setVaiForm(f => ({ ...f, soTienHoaDon: e.target.value }))}
                            className={inp} placeholder="0" />
                        </div>
                      </div>

                      {/* VAT */}
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">VAT</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {["", "8", "10"].map(v => (
                            <button key={v} type="button" onClick={() => setVaiForm(f => ({ ...f, vatPct: v }))}
                              className={`px-3 py-1.5 text-xs rounded-lg border transition ${vaiForm.vatPct === v ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                              {v === "" ? "Không VAT" : `${v}%`}
                            </button>
                          ))}
                          <input type="number" value={!["", "8", "10"].includes(vaiForm.vatPct) ? vaiForm.vatPct : ""}
                            onChange={e => setVaiForm(f => ({ ...f, vatPct: e.target.value }))}
                            className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200"
                            placeholder="Khác %" />
                        </div>
                      </div>

                      {/* Tính nợ theo */}
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Tính nợ theo</label>
                        <div className="flex gap-2">
                          {[{ k: "thuc_te", l: "Thực tế" }, { k: "hoa_don", l: "Hoá đơn" }].map(o => (
                            <button key={o.k} type="button" onClick={() => setVaiForm(f => ({ ...f, tinhNoTheo: o.k }))}
                              className={`flex-1 py-1.5 text-xs rounded-lg border transition ${vaiForm.tinhNoTheo === o.k ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}>
                              {o.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview nợ */}
                      {(vaiForm.chiPhiThucNhap || vaiForm.soTienHoaDon) && (() => {
                        const thuc     = parseFloat(vaiForm.chiPhiThucNhap) || 0;
                        const hd       = parseFloat(vaiForm.soTienHoaDon)   || 0;
                        const vat      = parseFloat(vaiForm.vatPct)         || 0;
                        const hdVat    = hd > 0 ? hd * (1 + vat / 100)     : 0;
                        const no       = vaiForm.tinhNoTheo === "hoa_don"   ? hdVat : thuc;
                        const chenh    = hdVat - thuc;
                        return (
                          <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2.5 text-xs space-y-1">
                            {thuc > 0 && <div className="flex justify-between text-slate-500"><span>Thực tế:</span><span className="font-semibold text-slate-700">{thuc.toLocaleString("vi-VN")} ₫</span></div>}
                            {hd > 0 && <div className="flex justify-between text-slate-500"><span>HĐ{vat > 0 ? ` + ${vat}% VAT` : ""}:</span><span className="font-semibold">{hdVat.toLocaleString("vi-VN")} ₫</span></div>}
                            {thuc > 0 && hd > 0 && chenh !== 0 && (
                              <div className={`flex justify-between text-xs ${chenh > 0 ? "text-amber-600" : "text-green-600"}`}>
                                <span>Chênh lệch:</span>
                                <span>{chenh > 0 ? "+" : ""}{chenh.toLocaleString("vi-VN")} ₫</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold border-t border-rose-200 pt-1 mt-1 text-rose-700">
                              <span>→ Ghi nợ NCC:</span><span>{no.toLocaleString("vi-VN")} ₫</span>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}
            </div>
            {modalVai !== "new" && typeof modalVai === "object" && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={async () => {
                    if (!confirm("Xoá hẳn mã vải này khỏi tồn kho?")) return;
                    const target = modalVai as VaiTon;
                    await fetch(`/api/san-xuat/vai-ton/${target.id}`, { method: "DELETE" });
                    setModalVai(null);
                    fetchVaiTon();
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                  🗑 Xoá mã vải này khỏi tồn kho
                </button>
              </div>
            )}
          </div>
          {/* Nút cố định ở dưới, không scroll */}
          <div className="flex gap-2 px-6 py-4 border-t border-slate-100 bg-white rounded-b-xl">
              <button onClick={() => setModalVai(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Huỷ</button>
              <button onClick={saveVai} disabled={!vaiForm.maVai || savingVai}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600 disabled:opacity-50">
                {savingVai ? "Đang lưu..." : modalVai === "new" ? "Thêm" : "Lưu"}
              </button>
          </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL HoaDonTon edit ═══ */}
      {modalTon && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">
                Cập nhật — {modalTon === "may" ? "HĐ May" : modalTon === "giat_vi_sinh" ? "HĐ Vi sinh" : "HĐ Màu"}
              </h3>
              <button onClick={() => setModalTon(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <label className="text-xs text-slate-500 mb-1 block">Số tồn mới</label>
            <input type="number" value={editTonVal} onChange={e => setEditTonVal(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Nhập số tồn" autoFocus />
            <label className="text-xs text-slate-500 mb-1 block">Ghi chú (lý do sửa)</label>
            <input value={editTonGhiChu} onChange={e => setEditTonGhiChu(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="VD: Nhập thêm 500 hóa đơn tháng 5..." />
            <div className="flex gap-2">
              <button onClick={() => setModalTon(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50">Huỷ</button>
              <button onClick={async () => {
                await fetch("/api/san-xuat/hoa-don-ton", {
                  method: "PATCH", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: modalTon, soTon: editTonVal, ghiChu: editTonGhiChu })
                });
                setModalTon(null);
                fetchHoaDonTon();
                fetchAllForBalance();
              }} className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm hover:bg-rose-600">
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL LỊCH SỬ HoaDonTon ═══ */}
      {modalHistory && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History size={16} className="text-rose-500" />
                Lịch sử — {modalHistory === "may" ? "HĐ May" : modalHistory === "giat_vi_sinh" ? "HĐ Vi sinh" : "HĐ Màu"}
              </h3>
              <button onClick={() => setModalHistory(null)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {historyData.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">Chưa có lịch sử</p>
              ) : (
                <div className="space-y-2">
                  {historyData.map(h => (
                    <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-slate-500">{new Date(h.createdAt).toLocaleString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500">{h.soTonCu.toLocaleString()}</span>
                          <span className="text-slate-400">→</span>
                          <span className={`font-bold ${h.soTonMoi > h.soTonCu ? "text-green-600" : "text-red-600"}`}>{h.soTonMoi.toLocaleString()}</span>
                          <span className={`text-xs ${h.soTonMoi > h.soTonCu ? "text-green-500" : "text-red-500"}`}>
                            ({h.soTonMoi > h.soTonCu ? "+" : ""}{(h.soTonMoi - h.soTonCu).toLocaleString()})
                          </span>
                        </div>
                        {h.ghiChu && <p className="text-xs text-slate-500 mt-0.5 italic">"{h.ghiChu}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL ADD/EDIT lô cắt ═══ */}
      {(modalAdd || modalEdit) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold text-slate-800">{modalEdit ? "Sửa lô cắt" : "Thêm lô cắt mới"}</h2>
              <button type="button" onClick={() => { setModalAdd(false); setModalEdit(null); }}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-5 space-y-5">

                {/* ── THÔNG TIN CƠ BẢN ── */}
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">Thông tin cơ bản</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Ngày *</label>
                      <input required type="date" value={form.ngay} onChange={sf("ngay")} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Loại hàng</label>
                      <select value={form.loaiHang} onChange={sf("loaiHang")} className={inp}>
                        {LOAI_HANG_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Xưởng cắt</label>
                      <select value={form.xuong} onChange={sf("xuong")} className={inp}>
                        <option value="">— Chọn xưởng —</option>
                        {xuongList.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                      </select>
                    </div>
                    <div className="relative">
                      <label className="text-xs text-slate-600 mb-1 block">Hàng cắt (SKU) *</label>
                      <div className="relative">
                        <input
                          required
                          value={form.hangCat}
                          onChange={e => { setForm(f => ({ ...f, hangCat: e.target.value })); setSkuSearch(e.target.value); setShowSkuDropdown(true); }}
                          onFocus={() => { setSkuSearch(""); setShowSkuDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowSkuDropdown(false), 150)}
                          className={inp}
                          placeholder="Nhập hoặc chọn mã hàng..."
                          autoComplete="off"
                        />
                        {showSkuDropdown && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                            {skuOptions
                              .filter(s => !skuSearch || s.toLowerCase().includes(skuSearch.toLowerCase()))
                              .map(sku => (
                                <button
                                  key={sku}
                                  type="button"
                                  onMouseDown={() => { setForm(f => ({ ...f, hangCat: sku })); setShowSkuDropdown(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-rose-50 hover:text-rose-700 transition-colors ${form.hangCat === sku ? "bg-rose-50 text-rose-700 font-semibold" : "text-slate-700"}`}
                                >
                                  {sku}
                                </button>
                              ))
                            }
                            {skuOptions.filter(s => !skuSearch || s.toLowerCase().includes(skuSearch.toLowerCase())).length === 0 && (
                              <div className="px-3 py-2 text-xs text-slate-400 italic">Không tìm thấy — nhập tay để tạo mới</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Size & Số lượng mỗi size</label>
                      <div className="border border-slate-200 rounded-lg p-3">
                        <div className="flex flex-wrap gap-2 items-start">
                          {sizeItems.map(item => (
                            <div key={item.size} className="flex flex-col items-center gap-1">
                              <button type="button" onClick={() => toggleSize(item.size)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${item.checked ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}>
                                {item.size}
                              </button>
                              {item.checked && (
                                <input type="number" min="1" max="999" value={item.qty}
                                  onChange={e => setSizeQty(item.size, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center border border-rose-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50" />
                              )}
                            </div>
                          ))}
                          {/* Nút thêm size tùy chỉnh */}
                          {addingSize ? (
                            <div className="flex items-center gap-1">
                              <input
                                autoFocus
                                value={newSizeName}
                                onChange={e => setNewSizeName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } if (e.key === "Escape") { setAddingSize(false); setNewSizeName(""); } }}
                                placeholder="VD: 5XL"
                                className="w-14 text-center border border-indigo-300 rounded-lg px-1 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              />
                              <button type="button" onClick={addCustomSize}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-indigo-500 text-white hover:bg-indigo-600 transition">✓</button>
                              <button type="button" onClick={() => { setAddingSize(false); setNewSizeName(""); }}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition">✕</button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setAddingSize(true)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition">
                              + Size
                            </button>
                          )}
                        </div>
                        {sizeItems.some(s => s.checked) && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-700">{form.soSize}</span>
                            <span className="ml-auto text-xs text-slate-400">Tổng: <span className="font-semibold text-slate-700">{sizeItems.filter(s => s.checked).reduce((a, i) => a + i.qty, 0)}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Mã vải / Khó</label>
                      <input value={form.maVai}
                        onChange={e => {
                          const val = e.target.value;
                          // Chỉ tìm trong vải của xưởng đang chọn
                          const vaiXuong = vaiTons.filter(v => !v.xuong || v.xuong === form.xuong);
                          const found = vaiXuong.find(v => `${v.maVai}${v.mauSac ? ` — ${v.mauSac}` : ""}` === val)
                            || vaiXuong.find(v => v.maVai === val);
                          setForm(f => ({ ...f, maVai: found?.maVai ?? val }));
                          setSelectedVaiId(found?.id ?? "");
                          setSelectedVaiCayIdxs([]);
                        }}
                        className={inp} list="lo-cat-mavai-list" placeholder="Nhập hoặc chọn từ kho..." />
                      <datalist id="lo-cat-mavai-list">
                        {vaiTons.filter(v => !v.xuong || v.xuong === form.xuong).map(v => {
                          const label = `${v.maVai}${v.mauSac ? ` — ${v.mauSac}` : ""}`;
                          return <option key={v.id} value={label}>{label} ({v.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} {v.donVi})</option>;
                        })}
                      </datalist>
                      {/* Chọn cây từ kho khi mã vải khớp */}
                      {(() => {
                        const vaiXuong = vaiTons.filter(v => !v.xuong || v.xuong === form.xuong);
                        const matched = vaiXuong.find(v => v.id === selectedVaiId) || vaiXuong.find(v => v.maVai === form.maVai);
                        if (!matched) return null;
                        let cays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = [];
                        if (matched.cayData) { try { cays = JSON.parse(matched.cayData); } catch {} }
                        if (cays.length === 0) cays = [{ soMet: matched.soMet }];

                        // Lấy soM thực tế của cây: cây đã cắt dùng soMetUsed, còn lại dùng soMet
                        const getCaySoM = (c: typeof cays[0]) => c.soMetUsed ?? c.soMet;
                        const isYard = matched.donVi === "yard";

                        // Tạo cayRow phù hợp với đơn vị vải (yard → soY, m → soM)
                        const makeCayRow = (val: number) => {
                          if (isYard) {
                            const soY = val > 0 ? String(val) : "";
                            const soM = val > 0 ? (0.9144 * 0.98 * val).toFixed(2) : "";
                            return { soY, soM, soLaTT: "", hangThucTe: "", mauGiat: "", ghiChuMay: "", hdMayDa: false, hdGiatViSinhDa: false, hdGiatMauDa: false, daCat: false, trangThai: "chua_nhap" };
                          }
                          return { soY: "", soM: val > 0 ? String(val) : "", soLaTT: "", hangThucTe: "", mauGiat: "", ghiChuMay: "", hdMayDa: false, hdGiatViSinhDa: false, hdGiatMauDa: false, daCat: false, trangThai: "chua_nhap" };
                        };

                        const toggleCay = (ci: number) => {
                          const next = selectedVaiCayIdxs.includes(ci)
                            ? selectedVaiCayIdxs.filter(i => i !== ci)
                            : [...selectedVaiCayIdxs, ci].sort((a, b) => a - b);
                          setSelectedVaiCayIdxs(next);
                          const n = Math.max(1, next.length);
                          const newRows = next.length > 0
                            ? next.map(idx => makeCayRow(getCaySoM(cays[idx])))
                            : [emptyCayRow()];
                          setCayRows(newRows);
                          // Sync form.soM khi 1 cây
                          if (n === 1 && next.length === 1) {
                            const val = getCaySoM(cays[next[0]]);
                            const soM = isYard && val > 0 ? (0.9144 * 0.98 * val).toFixed(2) : String(val || "");
                            setForm(f => ({ ...f, soCay: String(n), soM }));
                          } else {
                            setForm(f => ({ ...f, soCay: String(n) }));
                          }
                        };

                        const selectAll = () => {
                          // Chỉ chọn các cây CHƯA cắt
                          const available = cays.map((c, i) => ({ c, i })).filter(({ c }) => !c.cut);
                          const all = available.map(({ i }) => i);
                          setSelectedVaiCayIdxs(all);
                          setForm(f => ({ ...f, soCay: String(all.length || 1) }));
                          setCayRows(available.length > 0 ? available.map(({ c }) => makeCayRow(getCaySoM(c))) : [emptyCayRow()]);
                        };

                        const clearAll = () => {
                          setSelectedVaiCayIdxs([]);
                          setForm(f => ({ ...f, soCay: "1" }));
                          setCayRows([emptyCayRow()]);
                        };

                        const selectedTotal = selectedVaiCayIdxs.reduce((s, i) => s + getCaySoM(cays[i] ?? { soMet: 0 }), 0);

                        return (
                          <div className="mt-2 border border-emerald-200 rounded-lg overflow-hidden">
                            <div className="bg-emerald-50 px-3 py-2 flex items-center justify-between gap-2">
                              <div>
                                <span className="text-xs font-semibold text-emerald-700">{matched.maVai}</span>
                                {matched.mauSac && <span className="text-xs text-slate-500 ml-1.5">{matched.mauSac}</span>}
                                <span className="text-xs text-slate-400 ml-1.5">· {cays.length} cây · {matched.xuong ? (XUONG_LABEL[matched.xuong] ?? matched.xuong) : "—"}</span>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <button type="button" onClick={selectAll}
                                  className="text-[13px] text-emerald-600 hover:underline">Chọn tất</button>
                                {selectedVaiCayIdxs.length > 0 && (
                                  <button type="button" onClick={clearAll}
                                    className="text-[13px] text-slate-400 hover:underline">Bỏ chọn</button>
                                )}
                              </div>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                              {cays.map((c, i) => {
                                const checked = selectedVaiCayIdxs.includes(i);
                                const isCut = !!c.cut;
                                return (
                                  <label key={i}
                                    className={`flex items-center justify-between px-3 py-1.5 text-xs transition
                                      ${isCut ? "bg-red-50 cursor-not-allowed opacity-60" : checked ? "bg-emerald-50 cursor-pointer" : "hover:bg-slate-50 cursor-pointer"}`}>
                                    <div className="flex items-center gap-2">
                                      <input type="checkbox" checked={checked} disabled={isCut} onChange={() => !isCut && toggleCay(i)}
                                        className="accent-emerald-600 w-3.5 h-3.5 disabled:cursor-not-allowed" />
                                      <span className={`font-medium ${checked ? "text-emerald-700" : isCut ? "text-red-400 line-through" : "text-slate-500"}`}>
                                        Cây #{i + 1}
                                      </span>
                                      {isCut && <span className="text-[9px] bg-red-100 text-red-500 px-1 py-0.5 rounded font-semibold">đã cắt</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold ${checked ? "text-emerald-700" : isCut ? "text-red-400 line-through" : getCaySoM(c) < 5 ? "text-amber-600" : "text-emerald-700"}`}>
                                        {getCaySoM(c).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {matched.donVi}
                                      </span>
                                      {isCut && (
                                        <button type="button"
                                          onClick={e => { e.preventDefault(); hoantacVaiCay(matched, i); }}
                                          className="text-[9px] bg-white border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 px-1.5 py-0.5 rounded transition font-semibold"
                                          title="Hoàn tác — khôi phục số mét vào kho">
                                          ↩ Hoàn tác
                                        </button>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="bg-slate-50 px-3 py-1.5 flex justify-between border-t border-slate-100">
                              {selectedVaiCayIdxs.length > 0 ? (
                                <>
                                  <span className="text-xs text-emerald-600 font-semibold">✓ Đã chọn {selectedVaiCayIdxs.length} cây · {selectedTotal.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {matched.donVi}</span>
                                  <span className="text-xs text-slate-400">→ Số cây cắt: <strong className="text-slate-700">{selectedVaiCayIdxs.length}</strong></span>
                                </>
                              ) : (
                                <>
                                  <span className="text-xs text-slate-400">Tổng tồn: <strong className="text-slate-600">{matched.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {matched.donVi}</strong></span>
                                  <span className="text-xs text-slate-400">Tick cây để chọn</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Ghi chú may <span className="text-slate-400 font-normal">(kiểu cách)</span></label>
                      <input value={form.ghiChuMay} onChange={sf("ghiChuMay")} placeholder="VD: Cổ bo, tay dài..." className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Màu giặt</label>
                      <select value={form.mauGiat} onChange={sf("mauGiat")} className={inp}>
                        <option value="">— Chưa chọn —</option>
                        {MAU_GIAT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── SỐ LIỆU VẢI & CẮT ── */}
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">Số liệu vải & Cắt</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">

                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Số m sơ đồ</label>
                      <input type="number" step="0.01" value={form.soMSoDo} onChange={sf("soMSoDo")} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Tổng size <span className="text-slate-400 font-normal">(tự tính từ size picker)</span></label>
                      <div className={`${inpRo} font-bold text-slate-700`}>{form.tongSize ? `${form.tongSize} size` : "—"}</div>
                    </div>

                    {/* Số cây cắt */}
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Số cây cắt</label>
                      <div className="flex gap-1.5">
                        {[1,2,3,4,5,6].map(n => (
                          <button key={n} type="button"
                            onClick={() => handleSoCayChange(n)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold border transition ${numCay === n ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}
                          >{n}</button>
                        ))}
                      </div>
                    </div>

                    {/* === 1 cây: giao diện cũ === */}
                    {numCay === 1 && (<>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">
                          Số Y <span className="ml-1 text-slate-400 font-normal">(tự tính Số M)</span>
                        </label>
                        <input type="number" step="0.01" value={form.soY}
                          onChange={e => handleSoYChange(e.target.value)} className={inp} />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">
                          Số M (mét vải)
                          {form.soY && <span className="ml-1 text-blue-500 font-normal text-[13px]">= 0.9144×0.98×Y</span>}
                        </label>
                        <input type="number" step="0.01" value={form.soM} onChange={sf("soM")} className={inp} />
                      </div>
                    </>)}

                    {/* === Nhiều cây: bảng từng cây === */}
                    {numCay > 1 && (
                      <div className="col-span-2">
                        <div className="rounded-lg border border-slate-200 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="px-2 py-2 text-left text-slate-500 font-medium w-10">Cây</th>
                                <th className="px-2 py-2 text-slate-500 font-medium">Số Y</th>
                                <th className="px-2 py-2 text-slate-500 font-medium">Số M</th>
                                <th className="px-2 py-2 text-right text-slate-500 font-medium">Lá KH</th>
                                <th className="px-2 py-2 text-center text-rose-500 font-medium">Lá TT</th>
                                <th className="px-2 py-2 text-right text-slate-500 font-medium">Chênh</th>
                                <th className="px-2 py-2 text-center text-green-600 font-medium">Nhận về</th>
                                <th className="px-2 py-2 text-slate-500 font-medium">Ghi chú</th>
                                <th className="px-2 py-2 text-slate-500 font-medium">Màu giặt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {cayRows.map((row, i) => {
                                const sdd = Number(form.soMSoDo);
                                const laKH = sdd > 0 && Number(row.soM) > 0 ? Number(row.soM) / sdd : null;
                                const laTT = row.soLaTT !== "" ? Number(row.soLaTT) : null;
                                const chenh = laKH != null && laTT != null ? laTT - laKH : null;
                                const chenhColor = chenh == null ? "" : chenh < -1.5 ? "text-red-600 font-bold" : chenh < 0 ? "text-amber-600 font-semibold" : "text-green-600 font-semibold";
                                return (
                                  <tr key={i} className="hover:bg-slate-50">
                                    <td className="px-2 py-2 font-semibold text-slate-400 text-xs">#{i + 1}</td>
                                    <td className="px-1.5 py-1.5">
                                      <input type="number" step="0.01" value={row.soY}
                                        onChange={e => updateCayRow(i, "soY", e.target.value)}
                                        placeholder="Yards" className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200" />
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                      <input type="number" step="0.01" value={row.soM}
                                        onChange={e => updateCayRow(i, "soM", e.target.value)}
                                        placeholder="Mét" className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200" />
                                    </td>
                                    <td className="px-2 py-2 text-right font-semibold text-blue-600 text-xs">{laKH != null ? laKH.toFixed(1) : "—"}</td>
                                    <td className="px-1.5 py-1.5">
                                      <input type="number" step="0.1" value={row.soLaTT}
                                        onChange={e => updateCayRow(i, "soLaTT", e.target.value)}
                                        placeholder="Nhập" className="w-full border border-rose-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50 text-center" />
                                    </td>
                                    <td className={`px-2 py-2 text-right text-xs ${chenhColor}`}>
                                      {chenh != null ? (chenh >= 0 ? `+${chenh.toFixed(1)}` : chenh.toFixed(1)) : "—"}
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                      <input type="number" min="0" value={row.hangThucTe}
                                        onChange={e => updateCayRow(i, "hangThucTe", e.target.value)}
                                        placeholder="SP" className="w-full border border-green-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-300 bg-green-50 text-center" />
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                      <input value={row.ghiChuMay}
                                        onChange={e => updateCayRow(i, "ghiChuMay", e.target.value)}
                                        placeholder="Ghi chú..." className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-slate-200" />
                                    </td>
                                    <td className="px-1.5 py-1.5">
                                      <select value={row.mauGiat}
                                        onChange={e => updateCayRow(i, "mauGiat", e.target.value)}
                                        className="w-full border border-slate-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200">
                                        <option value="">—</option>
                                        {MAU_GIAT_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                      </select>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-slate-50 border-t border-slate-200">
                              <tr>
                                <td colSpan={2} className="px-2 py-2 text-slate-500 font-semibold text-xs">Tổng</td>
                                <td className="px-2 py-2 text-xs font-bold text-slate-700">
                                  {cayRows.reduce((s, r) => s + (Number(r.soM) || 0), 0).toFixed(2)} m
                                </td>
                                <td className="px-2 py-2 text-right text-xs font-bold text-blue-700">{soLa_calc || "—"} lá</td>
                                <td className="px-2 py-2 text-center text-xs font-bold text-rose-700">
                                  {cayRows.reduce((s, r) => s + (Number(r.soLaTT) || 0), 0) > 0
                                    ? cayRows.reduce((s, r) => s + (Number(r.soLaTT) || 0), 0).toFixed(1)
                                    : "—"}
                                </td>
                                <td className="px-2 py-2 text-right text-xs font-bold">
                                  {(() => {
                                    const totalKH = Number(soLa_calc);
                                    const totalTT = cayRows.reduce((s, r) => s + (Number(r.soLaTT) || 0), 0);
                                    if (!totalKH || !totalTT) return "—";
                                    const d = totalTT - totalKH;
                                    return <span className={d < -1.5 ? "text-red-600" : d < 0 ? "text-amber-600" : "text-green-600"}>{d >= 0 ? `+${d.toFixed(1)}` : d.toFixed(1)}</span>;
                                  })()}
                                </td>
                                <td className="px-2 py-2 text-center text-xs font-bold text-green-700">
                                  {(() => {
                                    const total = cayRows.reduce((s, r) => s + (Number(r.hangThucTe) || 0), 0);
                                    return total > 0 ? total.toLocaleString() : "—";
                                  })()}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Số lá kế hoạch
                        <span className="ml-1 text-slate-400 font-normal">(= M ÷ sơ đồ)</span>
                      </label>
                      <input readOnly value={soLa_calc} className={inpRo} />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        Số lá thực tế
                        {numCay > 1
                          ? <span className="ml-1 text-blue-500 font-normal text-[13px]">(tổng từng cây)</span>
                          : <span className="text-rose-400"> *thủ công</span>}
                      </label>
                      {numCay > 1
                        ? <div className={`${inpRo} font-bold text-rose-700`}>{form.soLaThucTe || "—"}</div>
                        : <input type="number" value={form.soLaThucTe} onChange={sf("soLaThucTe")} className={inp} />}
                    </div>

                    {/* Số lá thiếu */}
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">
                        Số lá thiếu
                        <span className="ml-1 text-slate-400 font-normal">(= lá thực tế − lá kế hoạch)</span>
                      </label>
                      {soLa_calc && form.soLaThucTe ? (() => {
                        const diff = Number(form.soLaThucTe) - Number(soLa_calc);
                        const isNghiemTrong = diff < -1.5;
                        const isThieuNhe   = diff < 0 && diff >= -1.5;
                        const bgCls = isNghiemTrong ? "bg-red-50 border-red-400"
                                    : isThieuNhe    ? "bg-amber-50 border-amber-300"
                                    : diff > 0      ? "bg-blue-50 border-blue-200"
                                    :                 "bg-green-50 border-green-200";
                        const diffColor = isNghiemTrong ? "text-red-600"
                                        : isThieuNhe   ? "text-amber-600"
                                        : "text-green-600";
                        const badge = isNghiemTrong ? "bg-red-100 text-red-700"
                                    : isThieuNhe   ? "bg-amber-100 text-amber-700"
                                    : diff > 0     ? "bg-blue-100 text-blue-700"
                                    :                "bg-green-100 text-green-700";
                        const label = isNghiemTrong ? "Thiếu vải nghiêm trọng"
                                    : isThieuNhe   ? "Thiếu nhẹ"
                                    : diff > 0     ? "Dư vải"
                                    :               "Vừa đủ";
                        return (
                          <div className={`rounded-lg px-4 py-3 flex items-center gap-3 border ${bgCls}`}>
                            <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-slate-400 mb-0.5">Kế hoạch</p>
                                <p className="font-bold text-slate-700">{Number(soLa_calc).toFixed(1)} lá</p>
                              </div>
                              <div>
                                <p className="text-slate-400 mb-0.5">Thực tế</p>
                                <p className="font-bold text-slate-700">{form.soLaThucTe} lá</p>
                              </div>
                              <div>
                                <p className="text-slate-400 mb-0.5">Chênh lệch</p>
                                <p className={`font-bold text-base ${diffColor}`}>
                                  {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} lá
                                </p>
                              </div>
                            </div>
                            <div className={`text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 ${badge}`}>
                              {label}
                            </div>
                          </div>
                        );
                      })() : (
                        <div className={inpRo}>— (cần điền cả lá KH và lá TT)</div>
                      )}
                    </div>

                    {/* Số sản phẩm */}
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Số sản phẩm
                        <span className="ml-1 text-slate-400 font-normal">(= lá TT × tổng size)</span>
                      </label>
                      <div className={`${inpRo} font-bold text-slate-800 text-base`}>
                        {soSanPham_calc > 0 ? soSanPham_calc.toLocaleString() : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── GIAO NHẬN ── */}
                <div>
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">Giao nhận</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">
                        Hàng nhận về thực tế
                        {numCay > 1 && <span className="ml-1 text-green-500 font-normal text-[13px]">(tổng từng cây)</span>}
                      </label>
                      {numCay > 1 ? (
                        <div className={`${inpRo} font-bold text-green-700`}>
                          {(() => {
                            const total = cayRows.reduce((s, r) => s + (Number(r.hangThucTe) || 0), 0);
                            return total > 0 ? total.toLocaleString() : "— (nhập từng cây ở bảng trên)";
                          })()}
                        </div>
                      ) : (
                        <input type="number" value={form.hangThucTe} onChange={sf("hangThucTe")} className={inp} />
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Số lượng thiếu
                        <span className="ml-1 text-slate-400 font-normal">(= SP - nhận về)</span>
                      </label>
                      <div className={`${inpRo} ${soLuongThieu_calc > 0 ? "!text-red-600 font-bold" : "!text-green-600 font-bold"}`}>
                        {form.hangThucTe && soSanPham_calc > 0
                          ? (soLuongThieu_calc > 0 ? `-${soLuongThieu_calc}` : "✓ Đủ hàng")
                          : "—"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Trạng thái</label>
                      <select value={form.trangThai} onChange={sf("trangThai")} className={inp}>
                        <option value="chua_nhap">Chưa nhập</option>
                        <option value="da_nhap">Đã nhập</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── HOÁ ĐƠN — chỉ hiện khi "Đã nhập" ── */}
                {form.trangThai === "da_nhap" && (
                  <div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-3 pb-1 border-b border-slate-100">
                      Hoá đơn
                      <span className="ml-2 text-[13px] font-normal text-slate-400 normal-case">Hiển thị vì trạng thái: Đã nhập</span>
                    </p>
                    <div className="space-y-4">

                      {/* HĐ May */}
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-700 mb-3">🧵 HĐ May</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div className="col-span-2">
                            <label className="text-xs text-slate-500 mb-1 block">HĐ May hiện còn</label>
                            <div className="bg-purple-50 rounded-lg px-3 py-2 text-sm font-bold text-purple-700 border border-purple-100">
                              {mayDuTong.toLocaleString()} {mayDuTong < 0 ? "⚠️ Âm tồn" : ""}
                            </div>
                          </div>
                          {hangThucTe_num > 0 && (
                            <div className="col-span-2">
                              <label className="text-xs text-slate-500 mb-1 block">Sau xuất lô này (dự kiến)</label>
                              <div className={`rounded-lg px-3 py-2 text-sm font-bold ${(mayDuTong - hangThucTe_num) < 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                                {(mayDuTong - hangThucTe_num).toLocaleString()} {(mayDuTong - hangThucTe_num) < 0 ? "⚠️" : ""}
                              </div>
                            </div>
                          )}
                          <div>
                            <label className="text-xs text-slate-600 mb-1 block">Số HĐ may</label>
                            <input type="number" value={form.hdMay} onChange={sf("hdMay")} className={inp} />
                          </div>
                        </div>
                      </div>

                      {/* Có giặt */}
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Có giặt không?</label>
                        <select value={form.coGiat} onChange={sf("coGiat")} className={inp}>
                          <option value="">— Chưa chọn —</option>
                          <option value="co">Có</option>
                          <option value="khong">Không</option>
                        </select>
                      </div>

                      {/* HĐ Giặt — chỉ hiện khi "Có" */}
                      {form.coGiat === "co" && (
                        <div className="space-y-3">
                          {/* HĐ Vi sinh */}
                          <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                            <p className="text-xs font-semibold text-teal-700 mb-3">🫧 HĐ Vi sinh</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Vi sinh hiện còn</label>
                                <div className={`rounded-lg px-3 py-2 text-sm font-bold border ${viSinhDuTong < 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-teal-50 text-teal-700 border-teal-100"}`}>
                                  {viSinhDuTong.toLocaleString()} {viSinhDuTong < 0 ? "⚠️ Âm tồn" : ""}
                                </div>
                              </div>
                              {hangThucTe_num > 0 && (
                                <div className="col-span-2">
                                  <label className="text-xs text-slate-500 mb-1 block">Sau xuất (dự kiến)</label>
                                  <div className={`rounded-lg px-3 py-2 text-sm font-bold ${(viSinhDuTong - hangThucTe_num) < 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                                    {(viSinhDuTong - hangThucTe_num).toLocaleString()} {(viSinhDuTong - hangThucTe_num) < 0 ? "⚠️" : ""}
                                  </div>
                                </div>
                              )}
                              <div className="col-span-2">
                                <label className="text-xs text-slate-600 mb-1 block">Số HĐ vi sinh</label>
                                <input type="number" value={form.hdGiatViSinh} onChange={sf("hdGiatViSinh")} className={inp} />
                              </div>
                            </div>
                          </div>
                          {/* HĐ Màu */}
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p className="text-xs font-semibold text-blue-700 mb-3">🎨 HĐ Màu</p>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                              <div className="col-span-2">
                                <label className="text-xs text-slate-500 mb-1 block">Màu hiện còn</label>
                                <div className={`rounded-lg px-3 py-2 text-sm font-bold border ${mauDuTong < 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                                  {mauDuTong.toLocaleString()} {mauDuTong < 0 ? "⚠️ Âm tồn" : ""}
                                </div>
                              </div>
                              {hangThucTe_num > 0 && (
                                <div className="col-span-2">
                                  <label className="text-xs text-slate-500 mb-1 block">Sau xuất (dự kiến)</label>
                                  <div className={`rounded-lg px-3 py-2 text-sm font-bold ${(mauDuTong - hangThucTe_num) < 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-700 border border-green-100"}`}>
                                    {(mauDuTong - hangThucTe_num).toLocaleString()} {(mauDuTong - hangThucTe_num) < 0 ? "⚠️" : ""}
                                  </div>
                                </div>
                              )}
                              <div className="col-span-2">
                                <label className="text-xs text-slate-600 mb-1 block">Số HĐ giặt màu</label>
                                <input type="number" value={form.hdGiatMau} onChange={sf("hdGiatMau")} className={inp} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ghi chú */}
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                  <input value={form.ghiChu} onChange={sf("ghiChu")} className={inp} />
                </div>

              </div>

              {/* Footer */}
              <div className="flex gap-2 p-5 border-t border-slate-200 flex-shrink-0">
                <button type="button" onClick={() => { setModalAdd(false); setModalEdit(null); }}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {loading ? "Đang lưu..." : modalEdit ? "Lưu thay đổi" : "Thêm lô cắt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
