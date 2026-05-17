"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Scissors, CheckCircle, Clock, Pencil, History, X, ChevronDown, ChevronRight, Trash2, MoreVertical } from "lucide-react";
import { formatDate } from "@/lib/utils";

type VaiTon = {
  id: string; maVai: string; soMet: number; soCay: number; cayData: string | null;
  donVi: string; mauSac: string | null; xuong: string | null; ghiChu: string | null; updatedAt: string;
};

type LoCat = {
  id: string; ngay: string; hangCat: string; soSize: string | null; maVai: string | null;
  soMSoDo: number | null; soCay: number; cayData: string | null; soY: number | null; soM: number | null; tongSize: number | null;
  soLa: number | null; soLaThucTe: number | null; soSanPham: number | null;
  hangThucTe: number | null; soLuongThieu: number | null; xuongNhanHang: string | null;
  trangThai: string; xuong: string;
  daCat: boolean;
  hdMay: number | null; tonTruocMay: number | null; hdMayDa: boolean;
  coGiat: string | null;
  hdGiatViSinh: number | null; tonTruocGiatViSinh: number | null; hdGiatViSinhDa: boolean;
  hdGiatMau: number | null; tonTruocGiatMau: number | null; hdGiatMauDa: boolean;
  ghiChuMay: string | null; mauGiat: string | null;
  ghiChu: string | null;
};

const DEFAULT_XUONG = [{ key: "meisy", label: "Meisy" }, { key: "dung_linh", label: "Dũng Linh" }];
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

export default function SanXuatPage() {
  // ── Xưởng list (localStorage) ──
  const [xuongList, setXuongListRaw] = useState<{ key: string; label: string }[]>(() => {
    try { const s = localStorage.getItem("xuong_list"); return s ? JSON.parse(s) : DEFAULT_XUONG; } catch { return DEFAULT_XUONG; }
  });
  const [xuongAddInput, setXuongAddInput] = useState("");
  const setXuongList = (list: { key: string; label: string }[]) => {
    setXuongListRaw(list);
    try { localStorage.setItem("xuong_list", JSON.stringify(list)); } catch {}
  };
  const XUONG_LABEL: Record<string, string> = Object.fromEntries(xuongList.map(x => [x.key, x.label]));

  // ── Vải tồn ──
  const [vaiTons, setVaiTons] = useState<VaiTon[]>([]);
  const [showVaiTon, setShowVaiTon] = useState(true);
  const [modalVai, setModalVai] = useState<VaiTon | "new" | null>(null);
  const [vaiForm, setVaiForm] = useState({ maVai: "", donVi: "m", mauSac: "", xuong: "", ghiChu: "" });
  const [vaiCayRows, setVaiCayRows] = useState<{ soMet: string }[]>([{ soMet: "" }]);
  const [editingVaiMet, setEditingVaiMet] = useState<{ id: string; val: string } | null>(null);
  const [savingVai, setSavingVai] = useState(false);
  const [editingVaiXuong, setEditingVaiXuong] = useState<string | null>(null);
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

  const saveVai = async () => {
    if (savingVai) return;
    setSavingVai(true);
    try {
      const url = modalVai && modalVai !== "new" ? `/api/san-xuat/vai-ton/${modalVai.id}` : "/api/san-xuat/vai-ton";
      const method = modalVai && modalVai !== "new" ? "PATCH" : "POST";
      const cayData = vaiCayRows.map(r => ({ soMet: Number(r.soMet) || 0 }));
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...vaiForm, cayData }) });
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

  const [losCat, setLosCat] = useState<LoCat[]>([]);
  const [allLoCat, setAllLoCat] = useState<LoCat[]>([]);
  const [filterThang, setFilterThang] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [filterXuong, setFilterXuong] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
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

  // ── Size picker ──
  const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL"];
  type SzItem = { size: string; qty: number; checked: boolean };
  const [sizeItems, setSizeItems] = useState<SzItem[]>(SIZES.map(s => ({ size: s, qty: 1, checked: false })));

  const syncSizeToForm = (items: SzItem[]) => {
    const sel = items.filter(s => s.checked);
    const tongQty = sel.reduce((s, i) => s + i.qty, 0);
    setForm(f => ({
      ...f,
      soSize: sel.map(s => `${s.qty}${s.size}`).join("-"),
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
    if (s) s.split("-").forEach(part => {
      const m = part.match(/^(\d+)?([A-Za-z0-9]+)$/);
      if (m) {
        const qty = m[1] ? parseInt(m[1]) : 1;
        const sz = m[2].toUpperCase();
        const idx = result.findIndex(r => r.size === sz);
        if (idx >= 0) result[idx] = { ...result[idx], qty, checked: true };
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

  const updateCayRow = (idx: number, field: "soY" | "soM" | "soLaTT" | "mauGiat" | "ghiChuMay" | "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa", val: string | boolean) => {
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
    setLosCat(Array.isArray(data) ? data : []);
  };

  // Fetch ALL lo-cat (no filter) for global balance computation
  const fetchAllForBalance = async () => {
    const data = await fetch("/api/san-xuat/lo-cat").then(r => r.json());
    setAllLoCat(Array.isArray(data) ? data : []);
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

  const openAdd = () => {
    setForm({ ...emptyForm, ngay: new Date().toISOString().slice(0, 10) });
    setCayRows([emptyCayRow()]);
    setSizeItems(SIZES.map(s => ({ size: s, qty: 1, checked: false })));
    setSelectedVaiCayIdxs([]);
    setModalAdd(true);
  };

  const openEdit = (lo: LoCat) => {
    setForm({
      ngay: lo.ngay.slice(0, 10), xuong: lo.xuong, hangCat: lo.hangCat,
      soSize: lo.soSize ?? "", maVai: lo.maVai ?? "",
      soMSoDo: lo.soMSoDo != null ? String(lo.soMSoDo) : "",
      soCay: String(lo.soCay ?? 1),
      soY: lo.soY != null ? String(lo.soY) : "",
      soM: lo.soM != null ? String(lo.soM) : "",
      tongSize: lo.tongSize != null ? String(lo.tongSize) : "",
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
    setSizeItems(parseSizeStr(lo.soSize ?? ""));
    // Load cayRows from cayData
    const n = lo.soCay ?? 1;
    if (n > 1 && lo.cayData) {
      try { setCayRows(JSON.parse(lo.cayData).map((r: Partial<CayRow>) => ({ soY: r.soY ?? "", soM: r.soM ?? "", soLaTT: r.soLaTT ?? "", hangThucTe: r.hangThucTe != null ? String(r.hangThucTe) : "", mauGiat: r.mauGiat ?? "", ghiChuMay: r.ghiChuMay ?? "", hdMayDa: r.hdMayDa ?? false, hdGiatViSinhDa: r.hdGiatViSinhDa ?? false, hdGiatMauDa: r.hdGiatMauDa ?? false, daCat: r.daCat ?? false, trangThai: r.trangThai ?? "chua_nhap" }))); } catch { setCayRows(Array.from({ length: n }, emptyCayRow)); }
    } else {
      setCayRows([{ soY: lo.soY != null ? String(lo.soY) : "", soM: lo.soM != null ? String(lo.soM) : "", soLaTT: lo.soLaThucTe != null ? String(lo.soLaThucTe) : "", hangThucTe: lo.hangThucTe != null ? String(lo.hangThucTe) : "", mauGiat: lo.mauGiat ?? "", ghiChuMay: lo.ghiChuMay ?? "", hdMayDa: lo.hdMayDa, hdGiatViSinhDa: lo.hdGiatViSinhDa, hdGiatMauDa: lo.hdGiatMauDa, daCat: lo.daCat, trangThai: (lo.trangThai === "da_nhap" || lo.trangThai === "da_xuat") ? "da_nhap" : "chua_nhap" }]);
    }
    // Pre-load cây đã chọn từ tồn kho vải
    if (lo.maVai) {
      const matchedVai = vaiTons.find(v => v.maVai === lo.maVai);
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
      setSelectedVaiCayIdxs([]);
    }
    setModalEdit(lo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const soMTotal = numCay > 1
        ? cayRows.reduce((s, r) => s + (Number(r.soM) || 0), 0)
        : Number(form.soM) || 0;
      const payload = {
        ...form,
        soCay: numCay,
        cayData: numCay > 1 ? JSON.stringify(cayRows) : null,
        soM: soMTotal || form.soM,
        soY: numCay === 1 ? form.soY : null,
        soLa: soLa_calc || null,
        soSanPham: soSanPham_calc || null,
        soLuongThieu: soLuongThieu_calc,
      };
      const url = modalEdit ? `/api/san-xuat/lo-cat/${modalEdit.id}` : "/api/san-xuat/lo-cat";
      const method = modalEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error);
      const savedId: string | undefined = resJson.id;

      // Cập nhật tồn kho vải
      if (form.maVai) {
        const matchedVai = vaiTons.find(v => v.maVai === form.maVai);
        if (matchedVai) {
          let vCays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = [];
          if (matchedVai.cayData) { try { vCays = JSON.parse(matchedVai.cayData); } catch {} }
          if (vCays.length === 0) vCays = [{ soMet: matchedVai.soMet }];

          // Nếu SỬA: restore các cây cũ của lô này trước
          if (modalEdit) {
            vCays = vCays.map(c => {
              if (c.lotId !== modalEdit.id) return c;
              const { cut: _c, lotId: _l, lotCayIdx: _lci, soMetUsed, ...rest } = c;
              void _c; void _l; void _lci;
              let restoreM = soMetUsed ?? 0;
              if (!restoreM && modalEdit.cayData) {
                try { restoreM = Number((JSON.parse(modalEdit.cayData))[c.lotCayIdx ?? 0]?.soM) || 0; } catch {}
              }
              if (!restoreM && modalEdit.soCay === 1) restoreM = modalEdit.soM ?? 0;
              return { ...rest, soMet: c.soMet + restoreM };
            });
          }

          // Đánh dấu cây mới được chọn
          if (selectedVaiCayIdxs.length > 0 && savedId) {
            vCays = vCays.map((c, i) => {
              const selIdx = selectedVaiCayIdxs.indexOf(i);
              if (selIdx === -1) return c;
              const metersUsed = numCay === 1 ? (Number(form.soM) || 0) : (Number(cayRows[selIdx]?.soM) || 0);
              return { ...c, soMet: Math.max(0, c.soMet - metersUsed), soMetUsed: metersUsed, cut: true, lotId: savedId, lotCayIdx: selIdx };
            });
          }

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
      const parsed = JSON.parse(lo.cayData!);
      const cur = parsed[ci]?.trangThai ?? "chua_nhap";
      saveCayField(lo, ci, "trangThai", cur === "da_nhap" ? "chua_nhap" : "da_nhap");
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

  const saveNhanVe = async (lo: LoCat, val: string) => {
    setEditingNhanVe(null);
    const hangThucTe = val === "" ? null : Math.round(Number(val));
    const soLuongThieu = (lo.soSanPham != null && hangThucTe != null) ? lo.soSanPham - hangThucTe : null;
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, hangThucTe, soLuongThieu } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hangThucTe, soLuongThieu }),
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
      // Optimistic update
      setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, cayData: newCayData, soLaThucTe, soSanPham, soLuongThieu } : l));
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
      setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, cayData: newCayData, hangThucTe, soLuongThieu } : l));
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
        const { cut: _cut, lotId: _lotId, lotCayIdx: _lotCayIdx, ...rest } = c;
        void _cut; void _lotId; void _lotCayIdx;
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

  const deleteLoCat = (lo: LoCat) => {
    setOpenActionMenu(null);
    if (!confirm(`Xoá lô cắt "${lo.hangCat}" ngày ${formatDate(lo.ngay)}?`)) return;
    // Optimistic remove
    setLosCat(prev => prev.filter(l => l.id !== lo.id));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, { method: "DELETE" }).catch(() => fetchData());
  };

  const handleToggleHD = (lo: LoCat, field: "hdMayDa" | "hdGiatViSinhDa" | "hdGiatMauDa") => {
    const newVal = !lo[field];
    setLosCat(prev => prev.map(l => l.id === lo.id ? { ...l, [field]: newVal } : l));
    fetch(`/api/san-xuat/lo-cat/${lo.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newVal }),
    }).catch(() => fetchData());
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
  const tongSP  = losCat.reduce((s, l) => s + (l.soSanPham ?? 0), 0);
  const tongNhan = losCat.reduce((s, l) => s + (l.hangThucTe ?? 0), 0);
  const tongThieu = losCat.reduce((s, l) => s + Math.max(0, l.soLuongThieu ?? 0), 0);
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

      {/* Stats — 4 existing + 2 HoaDonTon */}
      <div className="grid grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-slate-800">{tongSP.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">{losCat.length} lô cắt</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Đã nhận về</p>
          <p className="text-2xl font-bold text-green-600">{tongNhan.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-4 border ${tongThieu > 0 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
          <p className="text-xs text-slate-500 mb-1">Tổng thiếu</p>
          <p className={`text-2xl font-bold ${tongThieu > 0 ? "text-red-600" : "text-green-600"}`}>{tongThieu.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Đã nhập</p>
          <p className="text-2xl font-bold text-blue-600">{daNhapCount}</p>
          <p className="text-xs text-slate-400 mt-1">/ {losCat.length} lô</p>
        </div>

        {/* HĐ May còn */}
        <div className={`rounded-xl p-4 border relative ${mayDuTong < 0 ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"}`}>
          <p className="text-xs text-slate-500 mb-1">HĐ May còn</p>
          <p className={`text-2xl font-bold ${mayDuTong < 0 ? "text-red-600" : "text-purple-700"}`}>{mayDuTong.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tổng: {hoaDonTon.may.toLocaleString()}</p>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={() => openHistory("may")} className="text-slate-300 hover:text-purple-500 transition" title="Lịch sử"><History size={13} /></button>
            <button onClick={() => { setEditTonVal(String(hoaDonTon.may)); setEditTonGhiChu(""); setModalTon("may"); }} className="text-slate-300 hover:text-purple-600 transition" title="Sửa"><Pencil size={13} /></button>
          </div>
        </div>

        {/* HĐ Vi sinh còn */}
        <div className={`rounded-xl p-4 border relative ${viSinhDuTong < 0 ? "bg-red-50 border-red-200" : "bg-teal-50 border-teal-200"}`}>
          <p className="text-xs text-slate-500 mb-1">HĐ Vi sinh còn</p>
          <p className={`text-2xl font-bold ${viSinhDuTong < 0 ? "text-red-600" : "text-teal-700"}`}>{viSinhDuTong.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tổng: {hoaDonTon.giat_vi_sinh.toLocaleString()}</p>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={() => openHistory("giat_vi_sinh")} className="text-slate-300 hover:text-teal-500 transition" title="Lịch sử"><History size={13} /></button>
            <button onClick={() => { setEditTonVal(String(hoaDonTon.giat_vi_sinh)); setEditTonGhiChu(""); setModalTon("giat_vi_sinh"); }} className="text-slate-300 hover:text-teal-600 transition" title="Sửa"><Pencil size={13} /></button>
          </div>
        </div>

        {/* HĐ Màu còn */}
        <div className={`rounded-xl p-4 border relative ${mauDuTong < 0 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
          <p className="text-xs text-slate-500 mb-1">HĐ Màu còn</p>
          <p className={`text-2xl font-bold ${mauDuTong < 0 ? "text-red-600" : "text-blue-700"}`}>{mauDuTong.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Tổng: {hoaDonTon.giat_mau.toLocaleString()}</p>
          <div className="absolute top-3 right-3 flex gap-1.5">
            <button onClick={() => openHistory("giat_mau")} className="text-slate-300 hover:text-blue-500 transition" title="Lịch sử"><History size={13} /></button>
            <button onClick={() => { setEditTonVal(String(hoaDonTon.giat_mau)); setEditTonGhiChu(""); setModalTon("giat_mau"); }} className="text-slate-300 hover:text-blue-600 transition" title="Sửa"><Pencil size={13} /></button>
          </div>
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
            onClick={e => { e.stopPropagation(); setVaiForm({ maVai: "", donVi: "m", mauSac: "", xuong: "", ghiChu: "" }); setVaiCayRows([{ soMet: "" }]); setModalVai("new"); }}
            className="flex items-center gap-1 text-xs bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition">
            <Plus size={12} /> Thêm vải
          </button>
        </div>

        {showVaiTon && (() => {
          // Tổng hợp theo xưởng
          const byXuong: Record<string, { soMet: number; donVi: string; count: number }> = {};
          vaiTons.forEach(v => {
            const key = v.xuong || "__chua_chon__";
            if (!byXuong[key]) byXuong[key] = { soMet: 0, donVi: v.donVi, count: 0 };
            byXuong[key].soMet += v.soMet;
            byXuong[key].count += 1;
          });
          return (
            <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap gap-3">
              {Object.entries(byXuong).map(([xuong, info]) => (
                <div key={xuong} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${xuong === "dung_linh" ? "bg-amber-50 border-amber-200" : xuong === "__chua_chon__" ? "bg-slate-50 border-slate-200" : "bg-rose-50 border-rose-200"}`}>
                  <span className={`font-semibold ${xuong === "dung_linh" ? "text-amber-700" : xuong === "__chua_chon__" ? "text-slate-500" : "text-rose-700"}`}>
                    {xuong === "__chua_chon__" ? "Chưa xác định" : (XUONG_LABEL[xuong] ?? xuong)}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-bold text-slate-700">{info.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} {info.donVi}</span>
                  <span className="text-slate-400 font-normal">({info.count} loại)</span>
                </div>
              ))}
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
                  {vaiTons.map(v => {
                    const hasCayData = v.soCay > 1 && v.cayData;
                    const isVaiExpanded = expandedVaiRows.has(v.id);
                    let cayDataParsed: { soMet: number; cut?: boolean }[] = [];
                    if (hasCayData) { try { cayDataParsed = JSON.parse(v.cayData!); } catch {} }
                    return (
                      <>
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-semibold text-slate-800">{v.maVai}</td>
                        <td className="px-3 py-2 text-slate-500">{v.mauSac ?? <span className="text-slate-300">—</span>}</td>
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
                          {v.soCay > 0 && (
                            hasCayData ? (
                              <button onClick={() => toggleVaiExpand(v.id)}
                                className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full hover:bg-rose-100 transition mx-auto">
                                {isVaiExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                {v.soCay} cây
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{v.soCay} cây</span>
                            )
                          )}
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
                        <td className="px-3 py-2 text-slate-400 italic">{v.ghiChu ?? ""}</td>
                        <td className="px-3 py-2 flex gap-2 items-center">
                          <button onClick={() => {
                            setVaiForm({ maVai: v.maVai, donVi: v.donVi, mauSac: v.mauSac ?? "", xuong: v.xuong ?? "", ghiChu: v.ghiChu ?? "" });
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
                          <td className={`px-4 py-1.5 text-[11px] font-semibold ${cay.cut ? "text-slate-400 line-through" : "text-slate-500"}`}>
                            └ Cây #{ci + 1}{cay.cut && " ✂️"}
                          </td>
                          <td colSpan={2}></td>
                          <td className="px-3 py-1.5 text-center text-[11px] text-slate-400">{ci + 1}</td>
                          <td className="px-3 py-1.5 text-right">
                            <span className={`text-[11px] font-bold ${cay.cut ? "text-slate-400 line-through" : cay.soMet <= 0 ? "text-red-500" : cay.soMet < 5 ? "text-amber-600" : "text-emerald-700"}`}>
                              {cay.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className={`px-3 py-1.5 text-[11px] ${cay.cut ? "text-slate-400 line-through" : "text-slate-400"}`}>{v.donVi}</td>
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
        <input
          list="filter-xuong-list"
          value={filterXuong}
          onChange={e => setFilterXuong(e.target.value)}
          placeholder="Lọc xưởng..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200 w-36"
        />
        <datalist id="filter-xuong-list">
          {[...new Set(losCat.map(l => l.xuong))].map(x => (
            <option key={x} value={x}>{XUONG_LABEL[x] ?? x}</option>
          ))}
        </datalist>
        <select value={filterTrangThai} onChange={e => setFilterTrangThai(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200">
          <option value="">Tất cả trạng thái</option>
          <option value="da_nhap">Đã nhập</option>
          <option value="chua_nhap">Chưa nhập</option>
        </select>
        {(filterThang || filterXuong || filterTrangThai) && (
          <button onClick={() => { setFilterThang(""); setFilterXuong(""); setFilterTrangThai(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-2 rounded-lg hover:bg-slate-100">✕ Xoá lọc</button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{losCat.length} lô cắt</span>
      </div>

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
          <table className="w-full text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-2 py-2.5 w-6"></th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Ngày</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Hàng cắt</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Size</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">T.Size</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Số M</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Lá KH</th>
                <th className="text-center px-2 py-2.5 text-emerald-600 font-medium text-[11px]">Đã cắt</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Lá TT</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Thiếu</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Ghi chú may</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Màu giặt</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium bg-orange-50 hidden">Số SP</th>
                <th className="text-right px-3 py-2.5 text-slate-500 font-medium">Nhận về</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Trạng thái</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">HĐ May</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Vi sinh</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Màu</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Xưởng</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {losCat.length === 0 ? (
                <tr>
                  <td colSpan={19} className="text-center py-16 text-slate-400">
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
                    <td className="px-3 py-2.5 text-slate-500">{lo.soSize ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{lo.tongSize ?? "—"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{lo.soM != null ? lo.soM.toFixed(2) : "—"}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{lo.soLa != null ? lo.soLa.toFixed(1) : "—"}</td>
                    {/* Đã cắt */}
                    <td className="px-2 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[10px] text-slate-400">{cayParsed.filter(c => c.daCat).length}/{cayParsed.length}</span>
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
                    {/* Thiếu — ngay sau Lá TT */}
                    <td className="px-3 py-2.5 text-right">
                      {(() => {
                        const val = cayThieuAgg ?? (lo.soSanPham != null ? lo.soSanPham - (lo.hangThucTe ?? 0) : null);
                        const laChenh = lo.soLaThucTe != null && lo.soLa != null ? lo.soLaThucTe - lo.soLa : null;
                        return (
                          <>
                            {val != null
                              ? <span className={`block ${val > 0 ? "text-red-600 font-bold" : "text-green-600 font-semibold"}`}>{val > 0 ? val.toLocaleString() : "0"}</span>
                              : <span className="text-slate-300">—</span>}
                            {laChenh != null && (
                              <span className={`text-[10px] px-1 py-0.5 rounded ${laChenh < -1.5 ? "bg-red-100 text-red-700" : laChenh < 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                {laChenh >= 0 ? `+${laChenh.toFixed(1)}` : laChenh.toFixed(1)} lá
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </td>
                    {/* Ghi chú may — chỉ hiện cho lô 1 cây; lô nhiều cây dùng per-cây */}
                    <td className="px-1.5 py-1 max-w-[150px]">
                      {!hasCay ? (editingGhiChuMay?.id === lo.id ? (
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
                          className="text-slate-600 hover:bg-slate-100 rounded px-2 py-1 text-xs w-full text-left transition truncate block max-w-[140px]"
                          title={lo.ghiChuMay ?? "Click để nhập ghi chú"}
                        >
                          {lo.ghiChuMay ?? <span className="text-slate-300">— nhập</span>}
                        </button>
                      )) : null}
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
                            ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${MAU_GIAT_CLS[lo.mauGiat] ?? "bg-slate-100 text-slate-600"}`}>{lo.mauGiat}</span>
                            : <span className="text-slate-300 text-xs">— chọn</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800 bg-orange-50 hidden">{lo.soSanPham?.toLocaleString() ?? "—"}</td>
                    <td className="px-1.5 py-1 text-right">
                      {editingNhanVe?.id === lo.id ? (
                        <input
                          type="number"
                          autoFocus
                          value={editingNhanVe.val}
                          onChange={e => setEditingNhanVe({ id: lo.id, val: e.target.value })}
                          onBlur={() => saveNhanVe(lo, editingNhanVe.val)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveNhanVe(lo, editingNhanVe.val);
                            if (e.key === "Escape") setEditingNhanVe(null);
                          }}
                          className="w-20 text-right border border-green-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 bg-green-50"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingNhanVe({ id: lo.id, val: lo.hangThucTe != null ? String(lo.hangThucTe) : "" })}
                          className="text-green-700 font-semibold hover:bg-green-50 rounded px-2 py-1 text-xs w-full text-right transition"
                          title="Click để nhập số nhận về"
                        >
                          {lo.hangThucTe?.toLocaleString() ?? <span className="text-slate-300 font-normal">— nhập</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[10px] text-slate-400">
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
                    {/* HĐ May checkbox */}
                    <td className="px-3 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[10px] text-slate-400">{cayParsed.filter(c => c.hdMayDa).length}/{cayParsed.length}</span>
                      ) : (
                        <button onClick={() => handleToggleHD(lo, "hdMayDa")}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition mx-auto ${lo.hdMayDa ? "bg-purple-500 border-purple-500 text-white" : "border-slate-300 hover:border-purple-400"}`}>
                          {lo.hdMayDa && <CheckCircle size={12} />}
                        </button>
                      )}
                    </td>
                    {/* Vi sinh checkbox */}
                    <td className="px-3 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[10px] text-slate-400">{cayParsed.filter(c => c.hdGiatViSinhDa).length}/{cayParsed.length}</span>
                      ) : (
                        <button onClick={() => handleToggleHD(lo, "hdGiatViSinhDa")}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition mx-auto ${lo.hdGiatViSinhDa ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 hover:border-teal-400"}`}>
                          {lo.hdGiatViSinhDa && <CheckCircle size={12} />}
                        </button>
                      )}
                    </td>
                    {/* Màu checkbox */}
                    <td className="px-3 py-2.5 text-center">
                      {hasCay ? (
                        <span className="text-[10px] text-slate-400">{cayParsed.filter(c => c.hdGiatMauDa).length}/{cayParsed.length}</span>
                      ) : (
                        <button onClick={() => handleToggleHD(lo, "hdGiatMauDa")}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition mx-auto ${lo.hdGiatMauDa ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 hover:border-blue-400"}`}>
                          {lo.hdGiatMauDa && <CheckCircle size={12} />}
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
                    const nhanVeCay = cay.hangThucTe != null ? cay.hangThucTe : null;
                    const thieuCay = spPerCay != null && nhanVeCay != null ? spPerCay - nhanVeCay : null;
                    return (
                      <tr key={`${lo.id}-cay-${ci}`} className="bg-slate-50/80 border-l-2 border-rose-200">
                        {/* col 1: expand */}
                        <td></td>
                        {/* col 2: Ngày — empty */}
                        <td></td>
                        {/* col 3: Hàng cắt — label */}
                        <td className="px-3 py-1.5 text-[11px] text-slate-400 font-semibold">└ Cây #{ci + 1}</td>
                        {/* col 4: Size — empty */}
                        <td></td>
                        {/* col 5: T.Size — empty */}
                        <td></td>
                        {/* col 6: Số M */}
                        <td className="px-3 py-1.5 text-right text-[11px] text-slate-600">{Number(cay.soM) > 0 ? Number(cay.soM).toFixed(2) : "—"}</td>
                        {/* col 6: Lá KH */}
                        <td className="px-3 py-1.5 text-right text-[11px] text-blue-600 font-semibold">{laKH != null ? laKH.toFixed(1) : "—"}</td>
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
                              className="w-14 text-right border border-rose-300 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCayLaTT({ id: lo.id, ci, val: cay.soLaTT ?? "" })}
                              className="text-rose-600 font-semibold hover:bg-rose-50 rounded px-2 py-0.5 text-[11px] w-full text-right transition"
                              title="Click để nhập lá thực tế"
                            >
                              {laTT != null ? laTT : <span className="text-slate-300 font-normal">—</span>}
                            </button>
                          )}
                        </td>
                        {/* col 9: Thiếu per-cây + chênh lệch lá */}
                        <td className="px-2 py-1.5 text-right">
                          {thieuCay != null && (
                            <span className={`text-[11px] px-1.5 py-0.5 rounded block mb-0.5 ${thieuCay > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {thieuCay > 0 ? thieuCay.toLocaleString() : "0"}
                            </span>
                          )}
                          {chenh != null && (
                            <span className={`text-[10px] px-1 py-0.5 rounded ${chenh < -1.5 ? "bg-red-100 text-red-700" : chenh < 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                              {chenh >= 0 ? `+${chenh.toFixed(1)}` : chenh.toFixed(1)} lá
                            </span>
                          )}
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
                              className="w-full border border-slate-300 rounded px-2 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-slate-300 bg-white"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCayGhiChu({ id: lo.id, ci, val: cay.ghiChuMay ?? "" })}
                              className="text-slate-500 hover:bg-slate-100 rounded px-2 py-0.5 text-[11px] w-full text-left transition truncate block max-w-[140px]"
                              title={cay.ghiChuMay ?? "Click để nhập"}
                            >
                              {cay.ghiChuMay ?? <span className="text-slate-300">— nhập</span>}
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
                              className="border border-slate-300 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-200 bg-white"
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
                                ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${MAU_GIAT_CLS[cay.mauGiat] ?? "bg-slate-100 text-slate-600"}`}>{cay.mauGiat}</span>
                                : <span className="text-slate-300 text-[11px]">— chọn</span>}
                            </button>
                          )}
                        </td>
                        {/* col 11: Số SP per cây */}
                        <td className="px-3 py-1.5 text-right text-[11px] font-bold text-slate-700 bg-orange-50 hidden">{spPerCay != null ? spPerCay.toLocaleString() : "—"}</td>
                        {/* col 12: Nhận về per-cây — inline edit */}
                        <td className="px-1 py-1 text-right">
                          {editingCayNhanVe?.id === lo.id && editingCayNhanVe.ci === ci ? (
                            <input
                              type="number"
                              autoFocus
                              value={editingCayNhanVe.val}
                              onChange={e => setEditingCayNhanVe({ id: lo.id, ci, val: e.target.value })}
                              onBlur={() => saveCayNhanVe(lo, ci, editingCayNhanVe.val)}
                              onKeyDown={e => {
                                if (e.key === "Enter") { e.preventDefault(); saveCayNhanVe(lo, ci, editingCayNhanVe.val); }
                                if (e.key === "Escape") setEditingCayNhanVe(null);
                              }}
                              className="w-14 text-right border border-green-300 rounded px-1 py-0.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-green-300 bg-green-50"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCayNhanVe({ id: lo.id, ci, val: nhanVeCay != null ? String(nhanVeCay) : "" })}
                              className="text-green-700 font-semibold hover:bg-green-50 rounded px-2 py-0.5 text-[11px] w-full text-right transition"
                              title="Click để nhập số nhận về"
                            >
                              {nhanVeCay != null ? nhanVeCay.toLocaleString() : <span className="text-slate-300 font-normal">—</span>}
                            </button>
                          )}
                        </td>
                        {/* col 14: Trạng thái per-cây toggle */}
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={() => toggleCayTrangThai(lo, ci)}
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium transition ${cay.trangThai === "da_nhap" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                            {cay.trangThai === "da_nhap" ? <CheckCircle size={8} /> : <Clock size={8} />}
                            {cay.trangThai === "da_nhap" ? "Đã nhập" : "Chưa nhập"}
                          </button>
                        </td>
                        {/* col 15: HĐ May per-cây */}
                        <td className="px-3 py-1.5 text-center">
                          <button onClick={() => toggleCayHD(lo, ci, "hdMayDa")}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition mx-auto ${cay.hdMayDa ? "bg-purple-500 border-purple-500 text-white" : "border-slate-300 hover:border-purple-400"}`}>
                            {cay.hdMayDa && <CheckCircle size={10} />}
                          </button>
                        </td>
                        {/* col 16: Vi sinh per-cây */}
                        <td className="px-3 py-1.5 text-center">
                          <button onClick={() => toggleCayHD(lo, ci, "hdGiatViSinhDa")}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition mx-auto ${cay.hdGiatViSinhDa ? "bg-teal-500 border-teal-500 text-white" : "border-slate-300 hover:border-teal-400"}`}>
                            {cay.hdGiatViSinhDa && <CheckCircle size={10} />}
                          </button>
                        </td>
                        {/* col 17: Màu per-cây */}
                        <td className="px-3 py-1.5 text-center">
                          <button onClick={() => toggleCayHD(lo, ci, "hdGiatMauDa")}
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition mx-auto ${cay.hdGiatMauDa ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300 hover:border-blue-400"}`}>
                            {cay.hdGiatMauDa && <CheckCircle size={10} />}
                          </button>
                        </td>
                        {/* cols 18-19 */}
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
                  <td colSpan={10} className="px-3 py-2 text-slate-500">Tổng</td>
                  <td className="px-3 py-2 text-right bg-orange-50 hidden">{tongSP.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-green-700">{tongNhan.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right text-red-600">{tongThieu > 0 ? tongThieu.toLocaleString() : <span className="text-green-600">0</span>}</td>
                  <td colSpan={5}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ═══ MODAL Vải tồn ═══ */}
      {modalVai && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-[440px]">
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
                    <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Quản lý danh sách xưởng</p>
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
            </div>
            <div className="flex gap-2 mt-5">
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
                      <label className="text-xs text-slate-600 mb-1 block">Xưởng cắt</label>
                      <select value={form.xuong} onChange={sf("xuong")} className={inp}>
                        <option value="">— Chọn xưởng —</option>
                        {xuongList.map(x => <option key={x.key} value={x.key}>{x.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Hàng cắt (SKU) *</label>
                      <input required value={form.hangCat} onChange={sf("hangCat")} className={inp}
                        list="hang-cat-list" placeholder="Nhập hoặc chọn mã hàng..." />
                      <datalist id="hang-cat-list">
                        {[...new Set(allLoCat.map(l => l.hangCat))].sort().map(h => (
                          <option key={h} value={h} />
                        ))}
                      </datalist>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Size & Số lượng mỗi size</label>
                      <div className="border border-slate-200 rounded-lg p-3">
                        <div className="flex flex-wrap gap-2">
                          {sizeItems.map(item => (
                            <div key={item.size} className="flex flex-col items-center gap-1">
                              <button type="button" onClick={() => toggleSize(item.size)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${item.checked ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}>
                                {item.size}
                              </button>
                              {item.checked && (
                                <input type="number" min="1" max="9" value={item.qty}
                                  onChange={e => setSizeQty(item.size, parseInt(e.target.value) || 1)}
                                  className="w-10 text-center border border-rose-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-300 bg-rose-50" />
                              )}
                            </div>
                          ))}
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
                        onChange={e => { setForm(f => ({ ...f, maVai: e.target.value })); setSelectedVaiCayIdxs([]); }}
                        className={inp} list="lo-cat-mavai-list" placeholder="Nhập hoặc chọn từ kho..." />
                      <datalist id="lo-cat-mavai-list">
                        {vaiTons.map(v => <option key={v.id} value={v.maVai}>{v.maVai}{v.mauSac ? ` — ${v.mauSac}` : ""} ({v.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} {v.donVi})</option>)}
                      </datalist>
                      {/* Chọn cây từ kho khi mã vải khớp */}
                      {(() => {
                        const matched = vaiTons.find(v => v.maVai === form.maVai);
                        if (!matched) return null;
                        let cays: { soMet: number; soMetUsed?: number; cut?: boolean; lotId?: string; lotCayIdx?: number }[] = [];
                        if (matched.cayData) { try { cays = JSON.parse(matched.cayData); } catch {} }
                        if (cays.length === 0) cays = [{ soMet: matched.soMet }];

                        // Lấy soM thực tế của cây: cây đã cắt dùng soMetUsed, còn lại dùng soMet
                        const getCaySoM = (c: typeof cays[0]) => c.soMetUsed ?? c.soMet;

                        const toggleCay = (ci: number) => {
                          const next = selectedVaiCayIdxs.includes(ci)
                            ? selectedVaiCayIdxs.filter(i => i !== ci)
                            : [...selectedVaiCayIdxs, ci].sort((a, b) => a - b);
                          setSelectedVaiCayIdxs(next);
                          const n = Math.max(1, next.length);
                          const newRows = next.length > 0
                            ? next.map(idx => ({
                                soY: "", soM: String(getCaySoM(cays[idx]) || ""),
                                soLaTT: "", hangThucTe: "", mauGiat: "", ghiChuMay: "",
                                hdMayDa: false, hdGiatViSinhDa: false, hdGiatMauDa: false, daCat: false, trangThai: "chua_nhap",
                              }))
                            : [emptyCayRow()];
                          setCayRows(newRows);
                          // Sync form.soM khi 1 cây
                          const soMVal = n === 1 && next.length === 1 ? String(getCaySoM(cays[next[0]]) || "") : "";
                          setForm(f => ({ ...f, soCay: String(n), ...(n === 1 ? { soM: soMVal } : {}) }));
                        };

                        const selectAll = () => {
                          const all = cays.map((_, i) => i);
                          setSelectedVaiCayIdxs(all);
                          setForm(f => ({ ...f, soCay: String(all.length) }));
                          setCayRows(cays.map(c => ({
                            soY: "", soM: String(getCaySoM(c) || ""),
                            soLaTT: "", hangThucTe: "", mauGiat: "", ghiChuMay: "",
                            hdMayDa: false, hdGiatViSinhDa: false, hdGiatMauDa: false, daCat: false, trangThai: "chua_nhap",
                          })));
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
                                  className="text-[10px] text-emerald-600 hover:underline">Chọn tất</button>
                                {selectedVaiCayIdxs.length > 0 && (
                                  <button type="button" onClick={clearAll}
                                    className="text-[10px] text-slate-400 hover:underline">Bỏ chọn</button>
                                )}
                              </div>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                              {cays.map((c, i) => {
                                const checked = selectedVaiCayIdxs.includes(i);
                                const isCut = !!c.cut;
                                return (
                                  <label key={i}
                                    className={`flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition
                                      ${checked ? "bg-emerald-50" : isCut ? "bg-red-50 hover:bg-red-100" : "hover:bg-slate-50"}`}>
                                    <div className="flex items-center gap-2">
                                      <input type="checkbox" checked={checked} onChange={() => toggleCay(i)}
                                        className="accent-emerald-600 w-3.5 h-3.5" />
                                      <span className={`font-medium ${checked ? "text-emerald-700" : isCut ? "text-red-400" : "text-slate-500"}`}>
                                        Cây #{i + 1}
                                      </span>
                                      {isCut && <span className="text-[9px] bg-red-100 text-red-500 px-1 py-0.5 rounded font-semibold">đã cắt</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className={`font-semibold ${checked ? "text-emerald-700" : isCut ? "text-red-400" : c.soMet < 5 ? "text-amber-600" : "text-emerald-700"}`}>
                                        {c.soMet.toLocaleString("vi-VN", { maximumFractionDigits: 2 })} {matched.donVi}
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
                          {form.soY && <span className="ml-1 text-blue-500 font-normal text-[10px]">= 0.9144×0.98×Y</span>}
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
                          ? <span className="ml-1 text-blue-500 font-normal text-[10px]">(tổng từng cây)</span>
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
                      <label className="text-xs text-slate-600 mb-1 block">Hàng nhận về thực tế</label>
                      <input type="number" value={form.hangThucTe} onChange={sf("hangThucTe")} className={inp} />
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
                      <span className="ml-2 text-[10px] font-normal text-slate-400 normal-case">Hiển thị vì trạng thái: Đã nhập</span>
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
