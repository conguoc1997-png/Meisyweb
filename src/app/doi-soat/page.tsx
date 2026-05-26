"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CheckCircle, Circle, Trash2, RefreshCw, Upload, Plus, Search, Filter, ClipboardList, AlertTriangle, PackageCheck, PackageX, X, FileSpreadsheet, ScanLine, PenLine } from "lucide-react";

type DonHoanTra = {
  id: string; maDon: string; san: string; tenSP: string; sku: string;
  soLuong: number; ngayTaoDon: string | null; lyDoHoan: string | null;
  trangThai: string; daDoiSoat: boolean; ghiChu: string | null;
  batchId: string | null; createdAt: string;
};

const SAN_LABEL: Record<string, string> = { shopee: "Shopee", tiktok: "TikTok", lazada: "Lazada", viettel: "Viettel Post" };
const SAN_COLOR: Record<string, string> = {
  shopee:  "bg-orange-100 text-orange-700",
  tiktok:  "bg-pink-100 text-pink-700",
  lazada:  "bg-blue-100 text-blue-700",
  viettel: "bg-red-100 text-red-700",
};
const TT_COLOR: Record<string, string> = {
  cho_ve:  "bg-yellow-100 text-yellow-700",
  da_ve:   "bg-green-100 text-green-700",
  loi:     "bg-red-100 text-red-700",
  huy:     "bg-slate-100 text-slate-500",
};
const TT_LABEL: Record<string, string> = {
  cho_ve: "Chờ về", da_ve: "Đã về", loi: "Lỗi / Thất lạc", huy: "Đã huỷ",
};

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN");
}

// ── Parse rows (dùng chung cho paste và Excel) ──
function parseRows(headers: string[], dataRows: string[][], san: string): Partial<DonHoanTra>[] {
  const norm = headers.map(h => h.trim().toLowerCase()
    .replace(/['"]/g, "")
    .replace(/mã đơn hàng|mã đơn|order id|orderid|mã đh|order no|order_id|orderno/gi, "ma_don")
    .replace(/tên sp|tên sản phẩm|product name|sản phẩm|product/gi, "ten_sp")
    .replace(/^sku$|mã sku|product sku|product_sku/gi, "sku")
    .replace(/số lượng|qty|quantity|sl|amount/gi, "so_luong")
    .replace(/ngày|date|thời gian|create|created/gi, "ngay")
    .replace(/lý do|reason|ghi chú|note|remark/gi, "ly_do")
  );

  const get = (row: string[], key: string) => {
    const idx = norm.findIndex(h => h.includes(key));
    return idx >= 0 ? (row[idx] ?? "").trim() : "";
  };

  const rows: Partial<DonHoanTra>[] = [];
  for (const cols of dataRows) {
    if (cols.every(c => !c?.trim())) continue;
    const maDon = get(cols, "ma_don") || cols[0]?.trim() || "";
    if (!maDon) continue;
    rows.push({
      maDon,
      san,
      tenSP:    get(cols, "ten_sp") || cols[1]?.trim() || "",
      sku:      get(cols, "sku")    || cols[2]?.trim() || "",
      soLuong:  parseInt(get(cols, "so_luong") || cols[3]) || 1,
      lyDoHoan: get(cols, "ly_do") || null,
    });
  }
  return rows;
}

// ── Parse paste từ Shopee/TikTok ──
function parsePaste(text: string, san: string): Partial<DonHoanTra>[] {
  const lines = text.trim().split("\n").filter(l => l.trim());
  if (lines.length === 0) return [];
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const rawHeaders = lines[0].split(sep).map(c => c.trim().replace(/^["']|["']$/g, ""));
  const hasHeader = rawHeaders.some(h =>
    /mã|order|sku|tên|product|qty|quantity|lý do|reason/i.test(h)
  );
  const headers   = hasHeader ? rawHeaders : rawHeaders.map((_, i) => String(i));
  const startRow  = hasHeader ? 1 : 0;
  const dataRows  = lines.slice(startRow).map(l => l.split(sep).map(c => c.trim().replace(/^["']|["']$/g, "")));
  return parseRows(headers, dataRows, san);
}

export default function DoiSoatPage() {
  const [dons, setDons] = useState<DonHoanTra[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterSan, setFilterSan] = useState("");
  const [filterTT, setFilterTT] = useState("");
  const [filterDoiSoat, setFilterDoiSoat] = useState<"" | "da" | "chua">(""); // "" | "da" | "chua"

  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [importSan, setImportSan] = useState("shopee");
  const [pasteText, setPasteText] = useState("");
  const [preview, setPreview] = useState<Partial<DonHoanTra>[]>([]);
  const [importing, setImporting] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Add single modal
  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState<"scan" | "manual">("scan");
  const [formAdd, setFormAdd] = useState({ maDon: "", san: "shopee", tenSP: "", sku: "", soLuong: "1", lyDoHoan: "" });
  const [saving, setSaving] = useState(false);

  // Scan-in-modal state
  type AddScanLog = { maDon: string; status: "added" | "dup" | "err"; ts: number };
  const [addScanInput, setAddScanInput] = useState("");
  const [addScanSan, setAddScanSan] = useState("shopee");
  const [addScanLog, setAddScanLog] = useState<AddScanLog[]>([]);
  const addScanRef = useRef<HTMLInputElement>(null);

  const handleAddScan = useCallback(async (raw: string) => {
    const maDon = raw.trim();
    if (!maDon) return;
    setAddScanInput("");
    // Kiểm tra trùng trong dons hiện tại
    const exists = dons.some(d => d.maDon.toLowerCase() === maDon.toLowerCase());
    if (exists) {
      setAddScanLog(prev => [{ maDon, status: "dup", ts: Date.now() }, ...prev].slice(0, 50));
      return;
    }
    try {
      const res = await fetch("/api/doi-soat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maDon, san: addScanSan }),
      });
      if (!res.ok) throw new Error();
      const newDon: DonHoanTra = await res.json();
      setDons(prev => [newDon, ...prev]);
      setAddScanLog(prev => [{ maDon, status: "added", ts: Date.now() }, ...prev].slice(0, 50));
    } catch {
      setAddScanLog(prev => [{ maDon, status: "err", ts: Date.now() }, ...prev].slice(0, 50));
    }
  }, [dons, addScanSan]);

  // Chọn nhiều để bulk action
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const toggleSelect = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleSelectAll = (ids: string[]) =>
    setSelected(prev => ids.every(id => prev.has(id)) ? new Set() : new Set(ids));

  const bulkDelete = async () => {
    if (!confirm(`Xóa ${selected.size} đơn đã chọn?`)) return;
    setBulkDeleting(true);
    const ids = Array.from(selected);
    setDons(prev => prev.filter(d => !selected.has(d.id)));
    setSelected(new Set());
    // 1 request duy nhất thay vì N request
    await fetch("/api/doi-soat", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setBulkDeleting(false);
  };

  const deleteAll = async () => {
    if (!confirm(`Xóa TẤT CẢ ${dons.length} đơn? Không thể hoàn tác.`)) return;
    setBulkDeleting(true);
    setDons([]);
    setSelected(new Set());
    await fetch("/api/doi-soat", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteAll: true }),
    });
    setBulkDeleting(false);
  };

  const bulkApprove = async () => {
    const ids = Array.from(selected);
    setDons(prev => prev.map(d => selected.has(d.id) ? { ...d, daDoiSoat: true, trangThai: "da_ve" } : d));
    setSelected(new Set());
    await Promise.all(ids.map(id => fetch(`/api/doi-soat/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daDoiSoat: true, trangThai: "da_ve" }),
    })));
  };

  // ── Quét mã vạch ──
  type ScanLog = { maDon: string; status: "ok" | "not_found" | "already"; ts: number };
  const SCAN_LOG_KEY = "doi-soat-scan-log";
  const [scanInput, setScanInput] = useState("");
  const [scanLog, setScanLog]     = useState<ScanLog[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(SCAN_LOG_KEY) ?? "[]"); } catch { return []; }
  });
  const [scanActive, setScanActive] = useState(false);
  const [showScanLog, setShowScanLog] = useState(false);
  const scanRef = useRef<HTMLInputElement>(null);

  // Lưu log vào localStorage mỗi khi thay đổi
  useEffect(() => {
    try { localStorage.setItem(SCAN_LOG_KEY, JSON.stringify(scanLog)); } catch {}
  }, [scanLog]);

  const handleScan = useCallback(async (raw: string) => {
    const maDon = raw.trim();
    if (!maDon) return;
    setScanInput("");

    const don = dons.find(d => d.maDon.toLowerCase() === maDon.toLowerCase());

    if (!don) {
      setScanLog(prev => [{ maDon, status: "not_found", ts: Date.now() }, ...prev].slice(0, 200));
      return;
    }
    if (don.daDoiSoat) {
      setScanLog(prev => [{ maDon, status: "already", ts: Date.now() }, ...prev].slice(0, 200));
      return;
    }
    setDons(prev => prev.map(d => d.id === don.id ? { ...d, daDoiSoat: true, trangThai: "da_ve" } : d));
    setScanLog(prev => [{ maDon, status: "ok", ts: Date.now() }, ...prev].slice(0, 200));
    await fetch(`/api/doi-soat/${don.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daDoiSoat: true, trangThai: "da_ve" }),
    });
  }, [dons]);

  // Inline edit ghiChu
  const [editingGCId, setEditingGCId] = useState<string | null>(null);
  const gcRef = useCallback((el: HTMLTextAreaElement | null) => { if (el) el.focus(); }, []);

  const fetchDons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/doi-soat");
      const data = await res.json();
      if (Array.isArray(data)) setDons(data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDons(); }, [fetchDons]);

  // Toggle đối soát
  const toggleDoiSoat = async (don: DonHoanTra) => {
    const newVal = !don.daDoiSoat;
    // Optimistic
    setDons(prev => prev.map(d => d.id === don.id ? { ...d, daDoiSoat: newVal, trangThai: newVal ? "da_ve" : "cho_ve" } : d));
    await fetch(`/api/doi-soat/${don.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daDoiSoat: newVal, trangThai: newVal ? "da_ve" : "cho_ve" }),
    });
  };

  // Đổi trạng thái
  const changeTrangThai = async (id: string, tt: string) => {
    setDons(prev => prev.map(d => d.id === id ? { ...d, trangThai: tt } : d));
    await fetch(`/api/doi-soat/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: tt }),
    });
  };

  // Lưu ghi chú
  const saveGhiChu = async (don: DonHoanTra, val: string) => {
    setEditingGCId(null);
    if (val === (don.ghiChu ?? "")) return;
    setDons(prev => prev.map(d => d.id === don.id ? { ...d, ghiChu: val || null } : d));
    await fetch(`/api/doi-soat/${don.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ghiChu: val || null }),
    });
  };

  // Xóa 1 đơn
  const deleteDon = async (id: string) => {
    setDons(prev => prev.filter(d => d.id !== id));
    await fetch(`/api/doi-soat/${id}`, { method: "DELETE" });
  };

  // Đọc file Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLoading(true);
    setPreview([]);
    setPasteText("");
    try {
      const XLSX = await import("xlsx");
      const buf  = await file.arrayBuffer();
      const wb   = XLSX.read(buf, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const raw: string[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      if (raw.length < 1) return;
      // Tìm hàng header thực sự (bỏ qua các dòng trắng đầu)
      let headerIdx = 0;
      for (let i = 0; i < Math.min(raw.length, 5); i++) {
        if (raw[i].some(c => /mã|order|sku|tên|product|qty|lý do|reason/i.test(String(c)))) {
          headerIdx = i; break;
        }
      }
      const headers  = raw[headerIdx].map(c => String(c));
      const dataRows = raw.slice(headerIdx + 1).map(r => r.map(c => String(c ?? "")));
      const rows = parseRows(headers, dataRows, importSan);
      setPreview(rows);
    } catch (err) {
      alert("Không đọc được file Excel. Vui lòng thử lại hoặc dùng Copy-Paste.");
      console.error(err);
    } finally {
      setFileLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Preview import (paste)
  const handleParse = () => {
    const rows = parsePaste(pasteText, importSan);
    setPreview(rows);
  };

  // Confirm import
  const handleImport = async () => {
    if (preview.length === 0) return;
    setImporting(true);
    try {
      await fetch("/api/doi-soat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preview),
      });
      setShowImport(false); setPasteText(""); setPreview([]);
      fetchDons();
    } finally { setImporting(false); }
  };

  // Thêm 1 đơn thủ công
  const handleAddOne = async () => {
    if (!formAdd.maDon.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/doi-soat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formAdd, soLuong: parseInt(formAdd.soLuong) || 1 }),
      });
      setShowAdd(false);
      setFormAdd({ maDon: "", san: "shopee", tenSP: "", sku: "", soLuong: "1", lyDoHoan: "" });
      fetchDons();
    } finally { setSaving(false); }
  };

  // Stats
  const stats = useMemo(() => {
    const total    = dons.length;
    const daVe     = dons.filter(d => d.daDoiSoat).length;
    const chuaVe   = dons.filter(d => !d.daDoiSoat && d.trangThai === "cho_ve").length;
    const loi      = dons.filter(d => d.trangThai === "loi").length;
    return { total, daVe, chuaVe, loi };
  }, [dons]);

  // Filtered
  const filtered = useMemo(() => dons.filter(d => {
    if (filterSan && d.san !== filterSan) return false;
    if (filterTT  && d.trangThai !== filterTT) return false;
    if (filterDoiSoat === "da"   && !d.daDoiSoat) return false;
    if (filterDoiSoat === "chua" &&  d.daDoiSoat) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!d.maDon.toLowerCase().includes(q) &&
          !d.sku.toLowerCase().includes(q) &&
          !d.tenSP.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [dons, filterSan, filterTT, filterDoiSoat, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList size={22} className="text-indigo-500" /> Đối soát hàng hoàn trả
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi và đối chiếu đơn hàng hoàn trả từ sàn</p>
        </div>
        <div className="flex items-center gap-2">
          {dons.length > 0 && (
            <button onClick={deleteAll} disabled={bulkDeleting}
              className="flex items-center gap-1.5 text-sm px-3 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
              <Trash2 size={15} /> Xóa tất cả
            </button>
          )}
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition">
            <Plus size={15} /> Thêm thủ công
          </button>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 text-sm px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition">
            <Upload size={15} /> Import từ sàn
          </button>
          <button onClick={fetchDons} disabled={loading}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
            <RefreshCw size={15} className={loading ? "animate-spin text-slate-400" : "text-slate-500"} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng đơn",    value: stats.total,   icon: ClipboardList,  color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Đã đối soát", value: stats.daVe,    icon: PackageCheck,   color: "text-green-600",  bg: "bg-green-50"  },
          { label: "Chờ về",      value: stats.chuaVe,  icon: PackageX,       color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Lỗi / Thất lạc", value: stats.loi,  icon: AlertTriangle,  color: "text-red-600",    bg: "bg-red-50"    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white shadow-sm`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            {stats.total > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {Math.round(s.value / stats.total * 100)}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Tìm mã đơn / SKU / tên SP..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm outline-none w-full" />
          {search && <button onClick={() => setSearch("")}><X size={13} className="text-slate-400 hover:text-slate-600" /></button>}
        </div>
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <select value={filterSan} onChange={e => setFilterSan(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
            <option value="">Tất cả sàn</option>
            <option value="shopee">Shopee</option>
            <option value="tiktok">TikTok</option>
            <option value="lazada">Lazada</option>
            <option value="viettel">Viettel Post</option>
          </select>
        </div>
        <select value={filterTT} onChange={e => setFilterTT(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(TT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterDoiSoat} onChange={e => setFilterDoiSoat(e.target.value as "" | "da" | "chua")}
          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white">
          <option value="">Tất cả</option>
          <option value="da">Đã đối soát ✓</option>
          <option value="chua">Chưa đối soát</option>
        </select>
        {(search || filterSan || filterTT || filterDoiSoat) && (
          <button onClick={() => { setSearch(""); setFilterSan(""); setFilterTT(""); setFilterDoiSoat(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded hover:bg-slate-100 transition">
            ✕ Xoá lọc
          </button>
        )}
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} / {dons.length} đơn</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="text-sm font-semibold text-indigo-700">Đã chọn {selected.size} đơn</span>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={bulkApprove}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition">
              <CheckCircle size={13} /> Đánh dấu đã về
            </button>
            <button onClick={bulkDelete} disabled={bulkDeleting}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition disabled:opacity-50">
              <Trash2 size={13} /> {bulkDeleting ? "Đang xóa..." : "Xóa đã chọn"}
            </button>
            <button onClick={() => setSelected(new Set())}
              className="text-xs px-2 py-1.5 text-indigo-500 hover:bg-indigo-100 rounded-lg transition">
              Bỏ chọn
            </button>
          </div>
        </div>
      )}

      {/* ── Thanh quét mã vạch ── */}
      <div className={`rounded-xl border-2 shadow-sm overflow-hidden transition-colors ${scanActive ? "border-indigo-400 bg-indigo-50/60" : "border-slate-200 bg-white"}`}>
        {/* Row chính */}
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {/* Toggle on/off */}
          <button
            onClick={() => {
              const next = !scanActive;
              setScanActive(next);
              if (next) setTimeout(() => scanRef.current?.focus(), 50);
            }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition border ${
              scanActive ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <line x1="7" y1="12" x2="17" y2="12"/>
            </svg>
            {scanActive ? "Đang quét" : "Quét mã vạch"}
          </button>

          {/* Input nhận scan */}
          <input ref={scanRef} type="text" value={scanInput}
            onChange={e => setScanInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleScan(scanInput); }}
            placeholder={scanActive ? "Đưa mã vạch vào đây — quét hoặc nhập tay rồi Enter..." : "Bấm 'Quét mã vạch' để bắt đầu"}
            disabled={!scanActive}
            className={`flex-1 min-w-[260px] text-sm px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono transition ${
              scanActive ? "border-indigo-300 bg-white" : "border-slate-200 bg-slate-50 text-slate-400"
            }`}
          />

          {/* Stats + nút xem log */}
          <div className="flex items-center gap-2 ml-auto">
            {scanLog.length > 0 && (
              <span className="text-xs text-slate-500 whitespace-nowrap">
                <span className="text-green-600 font-semibold">✓ {scanLog.filter(l => l.status === "ok").length}</span>
                {" · "}
                <span className="text-red-500 font-semibold">✗ {scanLog.filter(l => l.status === "not_found").length}</span>
                {" không tìm thấy"}
              </span>
            )}
            <button
              onClick={() => setShowScanLog(v => !v)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition ${
                showScanLog ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}>
              Lịch sử {scanLog.length > 0 && <span className="bg-indigo-500 text-white rounded-full text-[10px] px-1.5 py-px ml-0.5">{scanLog.length}</span>}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`ml-0.5 transition-transform ${showScanLog ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {scanLog.length > 0 && (
              <button onClick={() => { if (confirm("Xóa toàn bộ lịch sử quét?")) setScanLog([]); }}
                className="text-xs text-slate-300 hover:text-red-400 transition px-1">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown log — nhóm theo ngày */}
        {showScanLog && (
          <div className="border-t border-indigo-100 bg-white max-h-72 overflow-y-auto">
            {scanLog.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">Chưa có lịch sử quét nào</p>
            ) : (() => {
              // Nhóm theo ngày (key = "dd/mm/yyyy")
              const groups: { dateKey: string; dateLabel: string; items: typeof scanLog }[] = [];
              for (const l of scanLog) {
                const d = new Date(l.ts);
                const key = d.toLocaleDateString("vi-VN");
                const today = new Date().toLocaleDateString("vi-VN");
                const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("vi-VN");
                const label = key === today ? "Hôm nay" : key === yesterday ? "Hôm qua" : key;
                const g = groups.find(x => x.dateKey === key);
                if (g) g.items.push(l);
                else groups.push({ dateKey: key, dateLabel: label, items: [l] });
              }
              return groups.map(g => (
                <div key={g.dateKey}>
                  {/* Tiêu đề ngày */}
                  <div className="sticky top-0 z-10 bg-slate-50 border-y border-slate-100 px-4 py-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{g.dateLabel}</span>
                    <span className="text-[11px] text-slate-400">
                      <span className="text-green-600 font-semibold">{g.items.filter(l => l.status === "ok").length} soát</span>
                      {g.items.some(l => l.status === "not_found") && (
                        <> · <span className="text-red-500 font-semibold">{g.items.filter(l => l.status === "not_found").length} không thấy</span></>
                      )}
                    </span>
                  </div>
                  {/* Bảng các lần quét trong ngày */}
                  <table className="w-full text-xs">
                    <thead className="bg-white border-b border-slate-100">
                      <tr>
                        <th className="pl-4 pr-2 py-1.5 text-center text-slate-400 font-medium w-8">Tick</th>
                        <th className="px-2 py-1.5 text-left text-slate-400 font-medium">Mã đơn</th>
                        <th className="px-2 py-1.5 text-left text-slate-400 font-medium">Kết quả</th>
                        <th className="px-2 py-1.5 text-right text-slate-400 font-medium">Giờ</th>
                        <th className="pl-2 pr-4 py-1.5 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {g.items.map((l, i) => {
                        const timeStr = new Date(l.ts).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                        return (
                          <tr key={l.ts + i} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="pl-4 pr-2 py-2 text-center font-bold text-sm leading-none">
                              <span className={l.status === "ok" ? "text-green-500" : l.status === "already" ? "text-blue-400" : "text-red-400"}>
                                {l.status === "ok" ? "✓" : l.status === "already" ? "↩" : "✗"}
                              </span>
                            </td>
                            <td className="px-2 py-2 font-mono font-semibold text-slate-700">{l.maDon}</td>
                            <td className="px-2 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                l.status === "ok"       ? "bg-green-100 text-green-700"
                                : l.status === "already" ? "bg-blue-100 text-blue-600"
                                : "bg-red-100 text-red-600"
                              }`}>
                                {l.status === "ok" ? "Đã đối soát" : l.status === "already" ? "Đã soát trước đó" : "Không tìm thấy"}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-right text-slate-400 whitespace-nowrap tabular-nums">{timeStr}</td>
                            <td className="pl-2 pr-4 py-2 text-right">
                              {l.status !== "ok" && (
                                <button
                                  onClick={() => handleScan(l.maDon)}
                                  className="opacity-0 group-hover:opacity-100 text-[11px] px-2 py-0.5 rounded border border-indigo-200 text-indigo-500 hover:bg-indigo-50 transition whitespace-nowrap">
                                  Đối soát lại
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {/* Checkbox chọn tất cả */}
                <th className="px-3 py-3 w-10 text-center">
                  <input type="checkbox"
                    checked={filtered.length > 0 && filtered.every(d => selected.has(d.id))}
                    onChange={() => toggleSelectAll(filtered.map(d => d.id))}
                    className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-indigo-600 w-16">Đã về</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Mã đơn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Sàn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">SKU / Tên SP</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500">SL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Lý do hoàn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">Ghi chú</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Ngày tạo</th>
                <th className="px-2 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="text-center py-12 text-slate-400">
                  {loading ? "Đang tải..." : dons.length === 0 ? "Chưa có đơn hoàn trả nào. Import từ sàn để bắt đầu." : "Không tìm thấy đơn nào."}
                </td></tr>
              )}
              {filtered.map(don => (
                <tr key={don.id}
                  className={`hover:bg-slate-50 transition-colors ${selected.has(don.id) ? "bg-indigo-50/60" : don.daDoiSoat ? "bg-green-50/40" : ""}`}>
                  {/* Checkbox chọn */}
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" checked={selected.has(don.id)}
                      onChange={() => toggleSelect(don.id)}
                      className="w-4 h-4 rounded accent-indigo-600 cursor-pointer" />
                  </td>
                  {/* Tick đối soát */}
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleDoiSoat(don)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                        don.daDoiSoat
                          ? "bg-green-500 border-green-500 text-white shadow-sm"
                          : "border-slate-300 hover:border-green-400 bg-white"
                      }`}>
                      {don.daDoiSoat ? <CheckCircle size={15} /> : <Circle size={15} className="text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-700">{don.maDon}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SAN_COLOR[don.san] ?? "bg-slate-100 text-slate-600"}`}>
                      {SAN_LABEL[don.san] ?? don.san}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {don.sku && <p className="font-mono text-xs text-indigo-600 font-semibold">{don.sku}</p>}
                    {don.tenSP && <p className="text-xs text-slate-500 truncate max-w-[180px]" title={don.tenSP}>{don.tenSP}</p>}
                    {!don.sku && !don.tenSP && <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-bold text-slate-700">{don.soLuong}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px]">
                    {don.lyDoHoan ? <span className="truncate block" title={don.lyDoHoan}>{don.lyDoHoan}</span> : <span className="text-slate-300">—</span>}
                  </td>
                  {/* Trạng thái dropdown */}
                  <td className="px-4 py-3">
                    <select value={don.trangThai}
                      onChange={e => changeTrangThai(don.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer ${TT_COLOR[don.trangThai]}`}>
                      {Object.entries(TT_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  {/* Ghi chú inline */}
                  <td className="px-4 py-3 max-w-[160px]">
                    {editingGCId === don.id ? (
                      <textarea rows={2} ref={gcRef}
                        defaultValue={don.ghiChu ?? ""}
                        onBlur={e => saveGhiChu(don, e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") setEditingGCId(null); }}
                        className="w-full text-xs border border-indigo-300 rounded px-2 py-1 focus:outline-none resize-none"
                        placeholder="Ghi chú..." />
                    ) : (
                      <button onClick={() => setEditingGCId(don.id)}
                        className="text-xs text-left w-full hover:text-indigo-600 cursor-pointer">
                        {don.ghiChu
                          ? <span className="text-slate-600 line-clamp-2">{don.ghiChu}</span>
                          : <span className="text-slate-300 italic">+ ghi chú</span>}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-400">{fmtDate(don.createdAt)}</td>
                  <td className="px-2 py-3">
                    <button onClick={() => deleteDon(don.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Tiến độ đối soát</span>
              <span className="font-semibold">{stats.daVe} / {stats.total} đơn ({Math.round(stats.daVe / stats.total * 100)}%)</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.round(stats.daVe / stats.total * 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Modal Import ── */}
      {showImport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Upload size={18} className="text-indigo-500" /> Import đơn hoàn trả từ sàn
              </h2>
              <button onClick={() => { setShowImport(false); setPasteText(""); setPreview([]); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Sàn:</label>
                {["shopee", "tiktok", "lazada", "viettel"].map(s => (
                  <button key={s} onClick={() => setImportSan(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition border ${importSan === s ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {SAN_LABEL[s]}
                  </button>
                ))}
              </div>

              {/* Upload file Excel */}
              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-4 bg-indigo-50/40 text-center">
                <FileSpreadsheet size={28} className="mx-auto mb-2 text-indigo-400" />
                <p className="text-sm font-medium text-slate-700 mb-1">Upload file Excel từ sàn</p>
                <p className="text-xs text-slate-400 mb-3">Hỗ trợ .xlsx, .xls, .csv — hệ thống tự nhận cột</p>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden" id="file-excel-input" />
                <label htmlFor="file-excel-input"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${
                    fileLoading
                      ? "bg-slate-200 text-slate-400 cursor-wait"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}>
                  {fileLoading ? <><RefreshCw size={14} className="animate-spin" /> Đang đọc file...</> : <><Upload size={14} /> Chọn file Excel</>}
                </label>
              </div>

              {/* Hoặc paste text */}
              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
                  <div className="flex-1 border-t border-slate-200" />
                  <span className="mx-3 text-xs text-slate-400 bg-white px-1">hoặc Copy-Paste từ bảng</span>
                  <div className="flex-1 border-t border-slate-200" />
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Cột bắt buộc: <strong>Mã đơn</strong>. Tuỳ chọn: SKU, Tên SP, Số lượng, Lý do.
                </p>
                <textarea rows={6} value={pasteText}
                  onChange={e => { setPasteText(e.target.value); setPreview([]); }}
                  placeholder={"Mã đơn\tSKU\tTên SP\tSố lượng\tLý do\n2412345678\tCVN01TT\tÁo croptop\t1\tKhách đổi ý"}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none" />
              </div>

              <button onClick={handleParse} disabled={!pasteText.trim()}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition disabled:opacity-40">
                Phân tích dữ liệu ({pasteText.trim().split("\n").filter(Boolean).length} dòng)
              </button>

              {preview.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">
                    Xem trước — {preview.length} đơn sẽ được import:
                  </p>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left text-slate-500">Mã đơn</th>
                          <th className="px-3 py-2 text-left text-slate-500">SKU</th>
                          <th className="px-3 py-2 text-left text-slate-500">Tên SP</th>
                          <th className="px-3 py-2 text-center text-slate-500">SL</th>
                          <th className="px-3 py-2 text-left text-slate-500">Lý do</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {preview.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-mono font-semibold text-slate-700">{r.maDon}</td>
                            <td className="px-3 py-1.5 text-indigo-600">{r.sku || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-500 truncate max-w-[120px]">{r.tenSP || "—"}</td>
                            <td className="px-3 py-1.5 text-center">{r.soLuong}</td>
                            <td className="px-3 py-1.5 text-slate-400 truncate max-w-[100px]">{r.lyDoHoan || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={() => { setShowImport(false); setPasteText(""); setPreview([]); }}
                className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                Huỷ
              </button>
              <button onClick={handleImport} disabled={preview.length === 0 || importing}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                {importing ? "Đang import..." : `Import ${preview.length} đơn`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Thêm đơn (2 tab) ── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Plus size={18} className="text-indigo-500" /> Thêm đơn hoàn trả
              </h2>
              <button onClick={() => { setShowAdd(false); setAddScanLog([]); setAddScanInput(""); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              <button onClick={() => { setAddTab("scan"); setTimeout(() => addScanRef.current?.focus(), 50); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition border-b-2 ${
                  addTab === "scan"
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50/60"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>
                <ScanLine size={15} /> Quét mã
              </button>
              <button onClick={() => setAddTab("manual")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition border-b-2 ${
                  addTab === "manual"
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50/60"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}>
                <PenLine size={15} /> Nhập thủ công
              </button>
            </div>

            {/* Tab: Quét mã */}
            {addTab === "scan" && (
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {/* Chọn sàn */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Sàn:</span>
                  {["shopee", "tiktok", "lazada", "viettel"].map(s => (
                    <button key={s} onClick={() => setAddScanSan(s)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        addScanSan === s ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}>
                      {SAN_LABEL[s]}
                    </button>
                  ))}
                </div>

                {/* Input quét */}
                <div className={`rounded-xl border-2 p-3 transition-colors border-indigo-400 bg-indigo-50/50`}>
                  <p className="text-xs text-indigo-600 font-medium mb-2">Quét mã vạch đơn hàng — Enter để thêm</p>
                  <input
                    ref={addScanRef}
                    autoFocus
                    type="text"
                    value={addScanInput}
                    onChange={e => setAddScanInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleAddScan(addScanInput); }}
                    placeholder="Đưa mã vạch vào đây hoặc nhập tay rồi Enter..."
                    className="w-full text-sm font-mono px-3 py-2 rounded-lg border border-indigo-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Log thêm đơn */}
                {addScanLog.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-medium text-slate-600">
                        Kết quả — ✓ {addScanLog.filter(l => l.status === "added").length} đã thêm
                        {addScanLog.some(l => l.status === "dup") && ` · ↩ ${addScanLog.filter(l => l.status === "dup").length} trùng`}
                        {addScanLog.some(l => l.status === "err") && ` · ✗ ${addScanLog.filter(l => l.status === "err").length} lỗi`}
                      </p>
                      <button onClick={() => setAddScanLog([])}
                        className="text-xs text-slate-300 hover:text-slate-500 transition">xóa log</button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {addScanLog.map((l, i) => (
                        <div key={l.ts + i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono ${
                          l.status === "added" ? "bg-green-50 text-green-700"
                          : l.status === "dup" ? "bg-blue-50 text-blue-600"
                          : "bg-red-50 text-red-600"
                        }`}>
                          <span className="font-bold text-base leading-none">
                            {l.status === "added" ? "✓" : l.status === "dup" ? "↩" : "✗"}
                          </span>
                          <span className="flex-1">{l.maDon}</span>
                          <span className="text-[10px] opacity-60">
                            {l.status === "added" ? "Đã thêm" : l.status === "dup" ? "Đã tồn tại" : "Lỗi"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {addScanLog.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Quét hoặc nhập mã đơn rồi nhấn <kbd className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">Enter</kbd>
                  </p>
                )}
              </div>
            )}

            {/* Tab: Nhập thủ công */}
            {addTab === "manual" && (
              <>
                <div className="p-5 space-y-3 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Mã đơn *</label>
                      <input type="text" value={formAdd.maDon}
                        onChange={e => setFormAdd({...formAdd, maDon: e.target.value})}
                        autoFocus
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="2412345678" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Sàn</label>
                      <select value={formAdd.san} onChange={e => setFormAdd({...formAdd, san: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        <option value="shopee">Shopee</option>
                        <option value="tiktok">TikTok</option>
                        <option value="lazada">Lazada</option>
                        <option value="viettel">Viettel Post</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">SKU</label>
                      <input type="text" value={formAdd.sku}
                        onChange={e => setFormAdd({...formAdd, sku: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="CVN01TT" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Số lượng</label>
                      <input type="number" min={1} value={formAdd.soLuong}
                        onChange={e => setFormAdd({...formAdd, soLuong: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Tên sản phẩm</label>
                    <input type="text" value={formAdd.tenSP}
                      onChange={e => setFormAdd({...formAdd, tenSP: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Tên sản phẩm..." />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Lý do hoàn trả</label>
                    <input type="text" value={formAdd.lyDoHoan}
                      onChange={e => setFormAdd({...formAdd, lyDoHoan: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Khách đổi ý, hàng lỗi..." />
                  </div>
                </div>
                <div className="p-5 border-t border-slate-100 flex gap-3 justify-end">
                  <button onClick={() => { setShowAdd(false); setAddScanLog([]); setAddScanInput(""); }}
                    className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Huỷ</button>
                  <button onClick={handleAddOne} disabled={!formAdd.maDon.trim() || saving}
                    className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50">
                    {saving ? "Đang lưu..." : "Thêm đơn"}
                  </button>
                </div>
              </>
            )}

            {/* Footer cho tab quét mã */}
            {addTab === "scan" && (
              <div className="p-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => { setShowAdd(false); setAddScanLog([]); setAddScanInput(""); }}
                  className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
