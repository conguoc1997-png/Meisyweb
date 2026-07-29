"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, Search, Package, Upload, CheckCircle, XCircle, FileSpreadsheet, AlertCircle, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type SanPham = {
  id: string;
  ten: string;
  sku: string;
  mauSac: string | null;
  size: string | null;
  giaNhap: number;
  giaBan: number;
  tonKho: number;
  nguon: string | null;
  tiktokProductId: string | null;
};

type NhapXuat = {
  id: string;
  loai: string;
  soLuong: number;
  ghiChu: string | null;
  createdAt: string;
  sanPham: { ten: string; sku: string };
};

type ModalType = "them-sp" | "nhap" | "xuat" | "sua" | null;

export default function KhoPage() {
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [lichSu, setLichSu] = useState<NhapXuat[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"san-pham" | "lich-su">("san-pham");

  // Form states
  const [formSP, setFormSP] = useState({ ten: "", sku: "", mauSac: "", size: [] as string[], giaNhap: "", giaBan: "", tonKho: "", nguon: "shopee" });
  const [formNX, setFormNX] = useState({ sanPhamId: "", soLuong: "", ghiChu: "", nguoiTao: "" });
  const [editSP, setEditSP] = useState<SanPham | null>(null);
  const [editingTikTokId, setEditingTikTokId] = useState<string | null>(null);
  const tikTokInputRef = useRef<HTMLInputElement>(null);
  const [formSua, setFormSua] = useState({ ten: "", sku: "", giaNhap: "", giaBan: "", mauSac: "", size: "", nguon: "" });

  type ImportRow = { rowIndex: number; sku: string; giaNhap: number | null; giaBan: number; coGia: boolean; isNew: boolean; existingId: string | null };
  const [importPreview, setImportPreview] = useState<ImportRow[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importDone, setImportDone] = useState<{ inserted: number; updated: number } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [syncingNhanh, setSyncingNhanh] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // SKU mapping modal
  type Suggestion = { nhanhBase: string; nhanhName: string; score: number; totalStock: number };
  type UnmatchedItem = { localSku: string; ten: string; mauSac: string | null; suggestions: Suggestion[] };
  type NhanhUnmatchedItem = { nhanhBase: string; nhanhName: string; totalStock: number; suggestions: Array<{ localSku: string; ten: string; score: number }> };
  const [showMapping, setShowMapping] = useState(false);
  const [mappingLoading, setMappingLoading] = useState(false);
  const [unmatchedList, setUnmatchedList] = useState<UnmatchedItem[]>([]);
  const [nhanhUnmatchedList, setNhanhUnmatchedList] = useState<NhanhUnmatchedItem[]>([]);
  const [mappingTab, setMappingTab] = useState<"local" | "nhanh">("nhanh");
  const [selectedMapping, setSelectedMapping] = useState<Record<string, string>>({});
  const [mappingSaving, setMappingSaving] = useState(false);

  // ── Sheet update states ───────────────────────────────────────────────────
  type SheetRow = {
    rowIndex: number; ten: string;
    giaNhap: number | null; giaBan: number | null;
    existingId: string | null; existingSku: string | null;
    oldGiaNhap: number | null; oldGiaBan: number | null;
    isNew: boolean;
  };
  const [modalSheet, setModalSheet] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [sheetPreview, setSheetPreview] = useState<SheetRow[]>([]);
  const [sheetConfirming, setSheetConfirming] = useState(false);
  const [sheetDone, setSheetDone] = useState<{ updated: number; inserted: number } | null>(null);

  const fetchSyncStatus = async () => {
    try {
      const res = await fetch("/api/nhanh/sync-status");
      const data = await res.json();
      setLastSync(data.lastSync ?? null);
    } catch { /* ignore */ }
  };

  const fetchData = async () => {
    try {
      const [sp, nx] = await Promise.all([
        fetch("/api/kho/san-pham").then((r) => r.json()),
        fetch("/api/kho/nhap-xuat").then((r) => r.json()),
      ]);
      // Sanitize: đảm bảo sku và size là string trước khi set state
      const spList: SanPham[] = (Array.isArray(sp) ? sp : sp.data ?? []).map((p: SanPham) => ({
        ...p,
        sku: String(p.sku ?? ""),
        size: p.size != null ? String(p.size) : null,
        mauSac: p.mauSac != null ? String(p.mauSac) : null,
      }));
      setSanPhams(spList);
      setLichSu(Array.isArray(nx) ? nx : []);
    } catch (e) {
      console.error("fetchData error", e);
    }
  };

  const handleSheetPreview = async () => {
    if (!sheetUrl.trim()) return;
    setSheetLoading(true); setSheetError(""); setSheetPreview([]); setSheetDone(null);
    try {
      const res = await fetch("/api/kho/update-sheet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSheetPreview(data.preview);
    } catch (err: unknown) { setSheetError(err instanceof Error ? err.message : "Lỗi"); }
    finally { setSheetLoading(false); }
  };

  const handleSheetConfirm = async () => {
    setSheetConfirming(true);
    try {
      const rows = sheetPreview.map(r => ({
        ten: r.ten,
        giaNhap: r.giaNhap,
        giaBan:  r.giaBan,
        existingId: r.existingId ?? null,
      }));
      const res = await fetch("/api/kho/update-sheet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSheetDone({ updated: data.updated, inserted: data.inserted });
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setSheetConfirming(false); }
  };

  useEffect(() => { fetchData(); fetchSyncStatus(); }, []);

  const filteredSP = sanPhams.filter(
    (sp) =>
      sp.ten.toLowerCase().includes(search.toLowerCase()) ||
      sp.sku.toLowerCase().includes(search.toLowerCase())
  );

  // Nhóm sản phẩm theo parent: ưu tiên tìm cha qua ten field (strip " - Size"),
  // fallback về strip size từ SKU
  const SIZES = ["5XL", "4XL", "3XL", "2XL", "XL", "XS", "L", "M", "S"];
  function stripSizeSuffix(sku: string, size: string): string {
    const upper = sku.toUpperCase();
    const sz = size.toUpperCase();
    if (upper.endsWith(sz)) return sku.slice(0, sku.length - sz.length);
    return sku;
  }

  // Map: tên cha → SKU cha (cho sản phẩm không có size)
  const parentNameMap = new Map<string, string>();
  for (const sp of filteredSP) {
    if (!sp.size) parentNameMap.set(sp.ten.trim(), sp.sku);
  }
  const skuSet = new Set(filteredSP.map(sp => sp.sku.toUpperCase()));

  const groupMap = new Map<string, SanPham[]>();
  for (const sp of filteredSP) {
    let key = sp.sku;
    if (sp.size && SIZES.includes(sp.size.toUpperCase())) {
      // 1. Tìm cha theo ten: "CVXOEDTHAN - S" → "CVXOEDTHAN"
      const baseName = sp.ten.replace(/\s*-\s*(5XL|4XL|3XL|2XL|XL|XS|[LMS])$/i, "").trim();
      const parentSku = parentNameMap.get(baseName);
      if (parentSku) {
        key = parentSku;
      } else {
        // 2. Fallback: strip size từ SKU (SKU theo chuẩn cũ)
        const base = stripSizeSuffix(sp.sku, sp.size);
        if (base !== sp.sku && skuSet.has(base.toUpperCase())) key = base;
      }
    }
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(sp);
  }

  const groups = Array.from(groupMap.entries()).map(([key, items]) => {
    const hasVariants = items.length > 1;
    // Khi có variants: chỉ cộng stock của các size variant, không cộng stock cha (tránh double-count)
    const totalTon = hasVariants
      ? items.filter(sp => sp.size).reduce((s, sp) => s + sp.tonKho, 0)
      : items.reduce((s, sp) => s + sp.tonKho, 0);
    return {
      key, items, hasVariants, totalTon,
      repr: items.find(sp => !sp.size) ?? items.find(sp => sp.sku.toUpperCase() === key.toUpperCase()) ?? items[0],
    };
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleThemSP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sizes = formSP.size;
      const toCreate = sizes.length === 0
        ? [{ ...formSP, size: "" }]
        : sizes.map(sz => ({
            ...formSP,
            size: sz,
            sku: formSP.sku + sz,
            ten: formSP.ten + " - " + sz,
          }));
      for (const sp of toCreate) {
        const res = await fetch("/api/kho/san-pham", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sp),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      setModal(null);
      setFormSP({ ten: "", sku: "", mauSac: "", size: [], giaNhap: "", giaBan: "", tonKho: "", nguon: "shopee" });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const handleNhapXuat = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/kho/nhap-xuat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formNX, loai: modal === "nhap" ? "nhap" : "xuat" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModal(null);
      setFormNX({ sanPhamId: "", soLuong: "", ghiChu: "", nguoiTao: "" });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally {
      setLoading(false);
    }
  };

  const saveTikTokId = async (sp: SanPham) => {
    const value = tikTokInputRef.current?.value ?? "";
    setEditingTikTokId(null);
    if (value === (sp.tiktokProductId ?? "")) return;
    await fetch(`/api/kho/san-pham/${sp.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sp, tiktokProductId: value || null }),
    });
    fetchData();
  };

  const openSua = (sp: SanPham) => {
    setFormSua({ ten: sp.ten, sku: sp.sku, giaNhap: String(sp.giaNhap), giaBan: String(sp.giaBan), mauSac: sp.mauSac || "", size: sp.size || "", nguon: sp.nguon || "" });
    setEditSP(sp);
    setModal("sua");
  };

  const handleSua = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`/api/kho/san-pham/${editSP!.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formSua),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModal(null); setEditSP(null);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const openMapping = async () => {
    setShowMapping(true);
    setMappingLoading(true);
    setUnmatchedList([]);
    setNhanhUnmatchedList([]);
    setSelectedMapping({});
    try {
      const res = await fetch("/api/nhanh/suggest-mapping");
      const data = await res.json();
      setUnmatchedList(data.unmatched ?? []);
      setNhanhUnmatchedList(data.nhanhUnmatched ?? []);
      setMappingTab((data.nhanhUnmatched ?? []).length > 0 ? "nhanh" : "local");
      // Pre-select top suggestion nếu score >= 0.8
      const preSelect: Record<string, string> = {};
      for (const item of (data.unmatched ?? [])) {
        if (item.suggestions[0]?.score >= 0.8) preSelect[item.localSku.toUpperCase()] = item.suggestions[0].nhanhBase;
      }
      // Pre-select cho nhanh→local
      for (const item of (data.nhanhUnmatched ?? [])) {
        if (item.suggestions[0]?.score >= 0.8) preSelect[item.suggestions[0].localSku.toUpperCase()] = item.nhanhBase;
      }
      setSelectedMapping(preSelect);
    } catch { /* ignore */ }
    finally { setMappingLoading(false); }
  };

  const saveMapping = async () => {
    setMappingSaving(true);
    try {
      await fetch("/api/nhanh/suggest-mapping", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mapping: selectedMapping }),
      });
      setShowMapping(false);
      alert("Đã lưu mapping. Bấm Đồng bộ Nhanh để cập nhật tồn kho.");
    } catch { alert("Lỗi lưu mapping"); }
    finally { setMappingSaving(false); }
  };

  const handleSyncNhanh = async () => {
    setSyncingNhanh(true);
    try {
      const res = await fetch("/api/nhanh/sync-products", { method: "POST" });
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 300)); }
      if (!res.ok) throw new Error((data.error as string)?.slice(0, 300) ?? "Lỗi server");
      let msg = (data.message as string) ?? "Đồng bộ thành công!";
      const noParent = data.nhanhNoParent as string[] | undefined;
      if (noParent && noParent.length > 0) {
        // Lấy unique base codes (bỏ size suffix)
        const sizes = ["5XL","4XL","3XL","2XL","XL","XS","L","M","S"];
        const bases = [...new Set(noParent.map(sku => {
          const up = sku.toUpperCase();
          for (const sz of sizes) if (up.endsWith(sz)) return sku.slice(0, sku.length - sz.length);
          return sku;
        }))];
        msg += `\n\n⚠️ ${noParent.length} variants Nhanh không có parent local (${bases.length} sản phẩm):\n` + bases.slice(0, 30).join(", ") + (bases.length > 30 ? `... (+${bases.length-30})` : "");
      }
      alert(msg);
      fetchData();
      fetchSyncStatus();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi đồng bộ");
    } finally {
      setSyncingNhanh(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportLoading(true); setImportPreview([]); setImportDone(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/kho/import-excel", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportPreview(data.preview);
      setShowImport(true);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi đọc file"); }
    finally { setImportLoading(false); e.target.value = ""; }
  };

  const handleImportConfirm = async () => {
    setImportLoading(true);
    try {
      const res = await fetch("/api/kho/import-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importPreview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportDone(data);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi import"); }
    finally { setImportLoading(false); }
  };

  const tongTonKho = sanPhams.reduce((s, sp) => s + sp.tonKho, 0);
  const spCanBo = sanPhams.filter((sp) => sp.tonKho <= 5).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Kho</h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi hàng hóa nhập xuất tồn kho</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-slate-800">{sanPhams.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Tổng tồn kho</p>
          <p className="text-2xl font-bold text-slate-800">{tongTonKho.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-4 border ${spCanBo > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200"}`}>
          <p className="text-xs text-slate-500 mb-1">SP sắp hết hàng (≤5)</p>
          <p className={`text-2xl font-bold ${spCanBo > 0 ? "text-red-600" : "text-slate-800"}`}>{spCanBo}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Tìm theo tên, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal("xuat")} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition">
            <ArrowUpCircle size={16} /> Xuất kho
          </button>
          <button onClick={() => setModal("nhap")} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition">
            <ArrowDownCircle size={16} /> Nhập kho
          </button>
          <label className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer ${importLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={16} className="text-slate-500" />
            {importLoading ? "Đang đọc..." : "Import Excel"}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
          </label>
          <button onClick={() => { setModalSheet(true); setSheetUrl(""); setSheetPreview([]); setSheetError(""); setSheetDone(null); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition">
            <FileSpreadsheet size={16} /> Cập nhật từ Sheet
          </button>
          <button onClick={openMapping}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-violet-50 text-violet-700 border border-violet-200 rounded-lg hover:bg-violet-100 transition">
            <RefreshCw size={16} /> Khớp SKU Nhanh
          </button>
          <div className="flex flex-col items-end gap-0.5">
            <button onClick={handleSyncNhanh} disabled={syncingNhanh}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition disabled:opacity-50">
              <RefreshCw size={16} className={syncingNhanh ? "animate-spin" : ""} />
              {syncingNhanh ? "Đang đồng bộ..." : "Đồng bộ Nhanh"}
            </button>
            {lastSync && (
              <span className="text-xs text-slate-400">
                Lần cuối: {new Date(lastSync).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}
              </span>
            )}
          </div>
          <button onClick={() => setModal("them-sp")} className="flex items-center gap-1.5 px-3 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
            <Plus size={16} /> Thêm SP
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(["san-pham", "lich-su"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${tab === t ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
            {t === "san-pham" ? "Danh sách sản phẩm" : "Lịch sử nhập/xuất"}
          </button>
        ))}
      </div>

      {/* Table - Sản phẩm */}
      {tab === "san-pham" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium w-8"></th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Sản phẩm</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Màu / Size</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nguồn</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">TikTok ID</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">Giá nhập</th>
                <th className="text-right px-4 py-3 text-green-600 font-medium">Giá bán</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">Tồn kho</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : groups.map(({ key, items, hasVariants, totalTon, repr }) => {
                const isExpanded = expandedGroups.has(key);
                const colorLabel = repr.mauSac || "—";
                return (
                  <>
                    {/* Row cha / row đơn */}
                    <tr
                      key={key}
                      className={`${hasVariants ? "cursor-pointer hover:bg-slate-50" : "hover:bg-slate-50"} ${repr.giaNhap === 0 && !hasVariants ? "bg-amber-50" : ""}`}
                      onClick={hasVariants ? () => toggleGroup(key) : undefined}
                    >
                      <td className="px-4 py-3 text-slate-400">
                        {hasVariants
                          ? (isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />)
                          : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{hasVariants ? repr.ten.replace(/\s*-\s*(5XL|4XL|3XL|2XL|XL|XS|[LMS])$/i, "") : repr.ten}</p>
                        <p className="text-xs text-slate-400 font-mono">{hasVariants ? key : repr.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {hasVariants
                          ? <span className="text-xs text-slate-500">{colorLabel} · <span className="font-medium">{items.filter(sp => sp.size).length} size</span></span>
                          : ([repr.mauSac, repr.size].filter(Boolean).join(" / ") || "—")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${repr.nguon === "shopee" ? "bg-orange-100 text-orange-700" : repr.nguon === "tiktok" ? "bg-pink-100 text-pink-700" : "bg-slate-100 text-slate-600"}`}>
                          {repr.nguon || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {!hasVariants && (editingTikTokId === repr.id ? (
                          <input autoFocus ref={tikTokInputRef} type="text" defaultValue={repr.tiktokProductId ?? ""}
                            onBlur={() => saveTikTokId(repr)}
                            onKeyDown={e => { if (e.key === "Enter") saveTikTokId(repr); if (e.key === "Escape") setEditingTikTokId(null); }}
                            className="w-full border border-violet-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-200" placeholder="VD: 1735566949..." />
                        ) : (
                          <button onClick={() => setEditingTikTokId(repr.id)}
                            className={`text-xs font-mono ${repr.tiktokProductId ? "text-violet-700 hover:underline" : "text-slate-300 hover:text-violet-400"}`}>
                            {repr.tiktokProductId ?? "+ Thêm ID"}
                          </button>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasVariants ? <span className="text-slate-300 text-xs">—</span>
                          : repr.giaNhap === 0
                            ? <span className="text-amber-500 text-xs font-medium">Chưa có giá</span>
                            : <span className="text-slate-600">{formatCurrency(repr.giaNhap)}</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasVariants ? <span className="text-slate-300 text-xs">—</span>
                          : repr.giaBan === 0
                            ? <span className="text-slate-300 text-xs">—</span>
                            : <span className="font-semibold text-green-600">{formatCurrency(repr.giaBan)}</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${totalTon <= 5 ? "text-red-600" : totalTon <= 20 ? "text-amber-600" : "text-green-600"}`}>
                          {totalTon}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                        {!hasVariants && <button onClick={() => openSua(repr)} className="text-xs text-rose-500 hover:underline">Sửa</button>}
                      </td>
                    </tr>

                    {/* Rows con (size variants) */}
                    {hasVariants && isExpanded && items.filter(sp => sp.size).map(sp => {
                      const sizeLabel = sp.size ?? "—";
                      return (
                        <tr key={sp.id} className={`bg-slate-50/70 hover:bg-slate-100/60 border-l-2 border-blue-200 ${sp.giaNhap === 0 ? "bg-amber-50/60" : ""}`}>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 pl-8">
                            <p className="text-xs text-slate-500 font-mono">{sp.sku}</p>
                          </td>
                          <td className="px-4 py-2">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                              {sizeLabel}
                            </span>
                          </td>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
                            {editingTikTokId === sp.id ? (
                              <input autoFocus ref={tikTokInputRef} type="text" defaultValue={sp.tiktokProductId ?? ""}
                                onBlur={() => saveTikTokId(sp)}
                                onKeyDown={e => { if (e.key === "Enter") saveTikTokId(sp); if (e.key === "Escape") setEditingTikTokId(null); }}
                                className="w-full border border-violet-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-200" />
                            ) : (
                              <button onClick={() => setEditingTikTokId(sp.id)}
                                className={`text-xs font-mono ${sp.tiktokProductId ? "text-violet-700 hover:underline" : "text-slate-300 hover:text-violet-400"}`}>
                                {sp.tiktokProductId ?? "+ Thêm ID"}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {sp.giaNhap === 0
                              ? <span className="text-amber-500 text-xs">Chưa có giá</span>
                              : <span className="text-slate-600 text-xs">{formatCurrency(sp.giaNhap)}</span>}
                          </td>
                          <td className="px-4 py-2 text-right">
                            {sp.giaBan === 0
                              ? <span className="text-slate-300 text-xs">—</span>
                              : <span className="text-green-600 text-xs font-semibold">{formatCurrency(sp.giaBan)}</span>}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-bold text-sm ${sp.tonKho <= 5 ? "text-red-600" : sp.tonKho <= 20 ? "text-amber-600" : "text-green-600"}`}>
                              {sp.tonKho}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button onClick={() => openSua(sp)} className="text-xs text-rose-500 hover:underline">Sửa</button>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table - Lịch sử */}
      {tab === "lich-su" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Thời gian</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Loại</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Sản phẩm</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">Số lượng</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lichSu.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-slate-400">Chưa có giao dịch nào</td></tr>
              ) : (
                lichSu.map((nx) => (
                  <tr key={nx.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatDateTime(nx.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 w-fit px-2 py-0.5 rounded text-xs font-medium ${nx.loai === "nhap" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {nx.loai === "nhap" ? <ArrowDownCircle size={12} /> : <ArrowUpCircle size={12} />}
                        {nx.loai === "nhap" ? "Nhập" : "Xuất"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{nx.sanPham.ten}</p>
                      <p className="text-xs text-slate-400">{nx.sanPham.sku}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{nx.soLuong}</td>
                    <td className="px-4 py-3 text-slate-500">{nx.ghiChu || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Thêm sản phẩm */}
      {modal === "them-sp" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Thêm sản phẩm</h2>
            </div>
            <form onSubmit={handleThemSP} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Tên sản phẩm *</label>
                  <input required value={formSP.ten} onChange={(e) => setFormSP({ ...formSP, ten: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">SKU *</label>
                  <input required value={formSP.sku} onChange={(e) => setFormSP({ ...formSP, sku: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Nguồn</label>
                  <select value={formSP.nguon} onChange={(e) => setFormSP({ ...formSP, nguon: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="shopee">Shopee</option>
                    <option value="tiktok">TikTok</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1.5 block">Size <span className="text-slate-400">(bỏ trống nếu không có size)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {["S","M","L","XL","2XL","3XL","4XL","5XL"].map(s => {
                      const checked = formSP.size.includes(s);
                      return (
                        <button type="button" key={s}
                          onClick={() => setFormSP({ ...formSP, size: checked ? formSP.size.filter(x => x !== s) : [...formSP.size, s] })}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${checked ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-600 border-slate-200 hover:border-rose-300"}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Màu sắc</label>
                  <select value={formSP.mauSac} onChange={(e) => setFormSP({ ...formSP, mauSac: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                    <option value="">— Chọn màu —</option>
                    {[
                      ["TRẮNG","TRG"],["ĐEN","DN"],["ĐEN THAN","DTHAN"],["XÁM","XAM"],["KHÓI","KHOI"],
                      ["ĐỎ","DO"],["CAM","CAM"],["VÀNG","VANG"],["VÀNG CHANH","VCHANH"],
                      ["XANH NHẠT","XN"],["XANH ĐẬM","XDAM"],["XANH ĐEN","XDEN"],["XANH NAVY","NAVY"],["XANH BABY","XBABY"],
                      ["XANH MUỐI TIÊU","MUOITIEU"],["TÍM","TIM"],["HỒNG","HONG"],
                      ["NÂU","NAU"],["BÒ","BO"],["KEM","KEM"],["NUDE","NUDE"],["BE","BE"],["KAKI","KAKI"],
                      ["CHẤM","CHAM"],["2 VIỀN","2VIEN"],["LỤA XANH ĐẬM","LTUAXDAM"],["LỤA XANH NHẠT","LTUAXN"],
                    ].map(([ten, vietTat]) => (
                      <option key={vietTat} value={ten}>{ten} ({vietTat})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá nhập (VNĐ)</label>
                  <input type="number" min="0" value={formSP.giaNhap} onChange={(e) => setFormSP({ ...formSP, giaNhap: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá bán (VNĐ)</label>
                  <input type="number" min="0" value={formSP.giaBan} onChange={(e) => setFormSP({ ...formSP, giaBan: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Tồn kho ban đầu</label>
                  <input type="number" min="0" value={formSP.tonKho} onChange={(e) => setFormSP({ ...formSP, tonKho: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {loading ? "Đang lưu..." : "Thêm sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nhập/Xuất */}
      {(modal === "nhap" || modal === "xuat") && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className={`p-5 border-b border-slate-200 ${modal === "nhap" ? "bg-green-50" : "bg-amber-50"}`}>
              <h2 className="font-bold text-slate-800">{modal === "nhap" ? "Nhập kho" : "Xuất kho"}</h2>
            </div>
            <form onSubmit={handleNhapXuat} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Sản phẩm *</label>
                <select required value={formNX.sanPhamId} onChange={(e) => setFormNX({ ...formNX, sanPhamId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                  <option value="">-- Chọn sản phẩm --</option>
                  {sanPhams.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.ten} ({sp.sku}) — tồn: {sp.tonKho}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Số lượng *</label>
                <input required type="number" min="1" value={formNX.soLuong} onChange={(e) => setFormNX({ ...formNX, soLuong: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Người thực hiện</label>
                <input value={formNX.nguoiTao} onChange={(e) => setFormNX({ ...formNX, nguoiTao: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <input value={formNX.ghiChu} onChange={(e) => setFormNX({ ...formNX, ghiChu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className={`flex-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${modal === "nhap" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                  {loading ? "Đang lưu..." : modal === "nhap" ? "Nhập kho" : "Xuất kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Import Excel */}
      {showImport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Preview Import Sản phẩm</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {importPreview.filter(r => r.isNew).length} mới &nbsp;·&nbsp;
                  {importPreview.filter(r => !r.isNew).length} cập nhật &nbsp;·&nbsp;
                  {importPreview.filter(r => !r.coGia).length} chưa có giá
                </p>
              </div>
              {importDone && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} /> Thêm {importDone.inserted} · Cập nhật {importDone.updated}
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">SKU</th>
                    <th className="text-right px-4 py-2.5 text-slate-500 font-medium text-xs">Giá xuất (Giá nhập)</th>
                    <th className="text-center px-4 py-2.5 text-slate-500 font-medium text-xs">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreview.map(row => (
                    <tr key={row.rowIndex} className={!row.coGia ? "bg-amber-50" : "bg-white"}>
                      <td className="px-4 py-2 font-mono text-xs text-slate-700">{row.sku}</td>
                      <td className="px-4 py-2 text-right text-xs">
                        {row.coGia
                          ? <span className="text-slate-700">{row.giaNhap!.toLocaleString("vi-VN")} ₫</span>
                          : <span className="text-amber-600 flex items-center gap-1 justify-end"><XCircle size={12} /> Chưa có giá</span>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {row.isNew
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Mới</span>
                          : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Cập nhật</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importPreview.some(r => !r.coGia) && (
              <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                ⚠️ {importPreview.filter(r => !r.coGia).length} SKU chưa có giá (#N/A) — sẽ import với giá = 0, có thể sửa sau.
              </div>
            )}

            <div className="flex gap-2 p-5 border-t border-slate-200">
              <button onClick={() => { setShowImport(false); setImportPreview([]); setImportDone(null); }}
                className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                {importDone ? "Đóng" : "Huỷ"}
              </button>
              {!importDone && (
                <button onClick={handleImportConfirm} disabled={importLoading || !importPreview.length}
                  className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2">
                  {importLoading ? "Đang import..." : <><Upload size={14} /> Import {importPreview.length} sản phẩm</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa sản phẩm */}
      {modal === "sua" && editSP && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Sửa thông tin sản phẩm</h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{editSP.sku}</p>
            </div>
            <form onSubmit={handleSua} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Tên sản phẩm *</label>
                  <input required value={formSua.ten} onChange={e => setFormSua({ ...formSua, ten: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá nhập (VNĐ)</label>
                  <input type="number" min="0" value={formSua.giaNhap} onChange={e => setFormSua({ ...formSua, giaNhap: e.target.value })}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${Number(formSua.giaNhap) === 0 ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}
                    placeholder="Nhập giá..." />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá bán (VNĐ)</label>
                  <input type="number" min="0" value={formSua.giaBan} onChange={e => setFormSua({ ...formSua, giaBan: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Size</label>
                  <input value={formSua.size} onChange={e => setFormSua({ ...formSua, size: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Màu sắc</label>
                  <input value={formSua.mauSac} onChange={e => setFormSua({ ...formSua, mauSac: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModal(null); setEditSP(null); }} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Khớp SKU Nhanh ─────────────────────────────────────────── */}
      {showMapping && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Khớp SKU với Nhanh.vn</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn mã tương ứng để đồng bộ tồn kho chính xác</p>
              </div>
              <button onClick={() => setShowMapping(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-5 pt-3 border-b border-slate-100">
              <button onClick={() => setMappingTab("nhanh")}
                className={`px-4 py-1.5 text-sm rounded-t-lg font-medium transition ${mappingTab === "nhanh" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                Nhanh → Local {nhanhUnmatchedList.length > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{nhanhUnmatchedList.length}</span>}
              </button>
              <button onClick={() => setMappingTab("local")}
                className={`px-4 py-1.5 text-sm rounded-t-lg font-medium transition ${mappingTab === "local" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                Local → Nhanh {unmatchedList.length > 0 && <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unmatchedList.length}</span>}
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {mappingLoading && <p className="text-center text-slate-400 py-8">Đang phân tích...</p>}

              {/* Tab: Nhanh → Local (Nhanh base chưa có parent local) */}
              {!mappingLoading && mappingTab === "nhanh" && (
                nhanhUnmatchedList.length === 0
                  ? <p className="text-center text-slate-400 py-8">Tất cả sản phẩm Nhanh đã có parent local</p>
                  : nhanhUnmatchedList.map(item => (
                    <div key={item.nhanhBase} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 font-mono">{item.nhanhBase}</p>
                          {item.nhanhName && <p className="text-xs text-slate-400 mt-0.5">{item.nhanhName}</p>}
                          <p className="text-xs text-blue-600 mt-0.5">Tồn Nhanh: {item.totalStock}</p>
                        </div>
                        <span className="text-xs text-slate-400 mt-1">Chọn SP local:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.suggestions.map(sg => {
                          const isSelected = selectedMapping[sg.localSku.toUpperCase()] === item.nhanhBase;
                          return (
                            <button key={sg.localSku}
                              onClick={() => setSelectedMapping(prev => ({ ...prev, [sg.localSku.toUpperCase()]: item.nhanhBase }))}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition text-left ${
                                isSelected ? "bg-violet-600 text-white border-violet-600"
                                  : sg.score >= 1.0 ? "bg-violet-50 border-violet-300 text-violet-800 hover:bg-violet-100"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"
                              }`}>
                              <div className="font-mono font-semibold">{sg.localSku}</div>
                              <div className="text-xs opacity-80 mt-0.5">{sg.ten}</div>
                              <div className="text-xs opacity-60 mt-0.5">{sg.score >= 1.0 ? "✓ Khớp tên" : `${Math.round(sg.score * 100)}%`}</div>
                            </button>
                          );
                        })}
                        <button onClick={() => setSelectedMapping(prev => {
                          const n = {...prev};
                          item.suggestions.forEach(sg => delete n[sg.localSku.toUpperCase()]);
                          return n;
                        })} className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-400 hover:bg-slate-50">Bỏ qua</button>
                      </div>
                    </div>
                  ))
              )}

              {/* Tab: Local → Nhanh */}
              {!mappingLoading && mappingTab === "local" && (
                unmatchedList.length === 0
                  ? <p className="text-center text-slate-400 py-8">Tất cả SKU local đã được khớp</p>
                  : unmatchedList.map(item => (
                    <div key={item.localSku} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-slate-800 font-mono">{item.localSku}</p>
                          <p className="text-xs text-slate-400">{item.ten}{item.mauSac ? ` · ${item.mauSac}` : ""}</p>
                        </div>
                        <span className="ml-auto text-xs text-slate-400">Chọn mã Nhanh:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.suggestions.map(sg => {
                          const isSelected = selectedMapping[item.localSku.toUpperCase()] === sg.nhanhBase;
                          return (
                            <button key={sg.nhanhBase}
                              onClick={() => setSelectedMapping(prev => ({ ...prev, [item.localSku.toUpperCase()]: sg.nhanhBase }))}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition text-left ${
                                isSelected ? "bg-violet-600 text-white border-violet-600"
                                  : sg.score >= 1.0 ? "bg-violet-50 border-violet-300 text-violet-800 hover:bg-violet-100"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"
                              }`}>
                              <div className="font-mono font-semibold">{sg.nhanhBase}</div>
                              {sg.nhanhName && <div className="text-xs opacity-80 mt-0.5">{sg.nhanhName}</div>}
                              <div className="text-xs opacity-60 mt-0.5">{sg.score >= 1.0 ? "✓ Khớp tên" : `${Math.round(sg.score * 100)}%`} · {sg.totalStock} tồn</div>
                            </button>
                          );
                        })}
                        <button onClick={() => setSelectedMapping(prev => { const n = {...prev}; delete n[item.localSku.toUpperCase()]; return n; })}
                          className="px-3 py-1.5 rounded-lg text-sm border border-slate-200 text-slate-400 hover:bg-slate-50">Bỏ qua</button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex gap-2 p-5 border-t border-slate-200">
              <button onClick={() => setShowMapping(false)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
              <button onClick={saveMapping} disabled={mappingSaving || Object.keys(selectedMapping).length === 0}
                className="flex-1 px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50">
                {mappingSaving ? "Đang lưu..." : `Lưu ${Object.keys(selectedMapping).length} mapping`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cập nhật từ Sheet ───────────────────────────────────────── */}
      {modalSheet && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-emerald-600" /> Thêm / Cập nhật sản phẩm từ Google Sheet
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Cột B = Tên &nbsp;·&nbsp; Cột H = Giá nhập &nbsp;·&nbsp; Cột I = Giá bán</p>
              </div>
              <button onClick={() => setModalSheet(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>

            {/* URL input */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text" placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl} onChange={e => { setSheetUrl(e.target.value); setSheetError(""); setSheetPreview([]); setSheetDone(null); }}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <button onClick={handleSheetPreview} disabled={!sheetUrl.trim() || sheetLoading}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                  {sheetLoading ? <><span className="animate-spin inline-block">⟳</span> Đang tải...</> : "Xem trước"}
                </button>
              </div>
              {sheetError && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle size={12} /> {sheetError}</p>
              )}
              <p className="mt-1.5 text-xs text-slate-400">Share sheet quyền <strong>"Anyone with the link"</strong> trước khi dán link.</p>
            </div>

            {/* Preview table */}
            {sheetPreview.length > 0 && (
              <>
                <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    <span className="text-blue-600 font-semibold">{sheetPreview.filter(r => !r.isNew).length}</span> cập nhật &nbsp;·&nbsp;
                    <span className="text-green-600 font-semibold">{sheetPreview.filter(r => r.isNew).length}</span> thêm mới
                    &nbsp;·&nbsp; tổng {sheetPreview.length} dòng
                  </p>
                  {sheetDone && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                      <CheckCircle size={14} /> Cập nhật {sheetDone.updated} · Thêm mới {sheetDone.inserted}
                    </span>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Tên (cột B)</th>
                        <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">SP khớp (SKU)</th>
                        <th className="text-right px-4 py-2.5 text-slate-500 font-medium text-xs">Giá nhập mới (H)</th>
                        <th className="text-right px-4 py-2.5 text-green-600 font-medium text-xs">Giá bán mới (I)</th>
                        <th className="text-center px-4 py-2.5 text-slate-500 font-medium text-xs w-24">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sheetPreview.map(row => (
                        <tr key={row.rowIndex} className={row.isNew ? "bg-green-50 hover:bg-green-100/50" : "bg-white hover:bg-slate-50"}>
                          <td className="px-4 py-2 text-sm font-medium text-slate-800">{row.ten}</td>
                          <td className="px-4 py-2 text-xs text-slate-500">
                            {row.isNew
                              ? <span className="text-green-600 italic">Sản phẩm mới</span>
                              : <span className="font-mono text-slate-600">{row.existingSku}</span>}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold text-slate-700">
                            {row.giaNhap != null ? row.giaNhap.toLocaleString("vi-VN") + " ₫" : "—"}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold text-green-600">
                            {row.giaBan != null ? row.giaBan.toLocaleString("vi-VN") + " ₫" : "—"}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {row.isNew
                              ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Thêm mới</span>
                              : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Cập nhật</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2 p-5 border-t border-slate-200">
                  <button onClick={() => setModalSheet(false)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                    {sheetDone ? "Đóng" : "Huỷ"}
                  </button>
                  {!sheetDone && (
                    <button onClick={handleSheetConfirm}
                      disabled={sheetConfirming || sheetPreview.length === 0}
                      className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {sheetConfirming
                        ? <><span className="animate-spin inline-block">⟳</span> Đang xử lý...</>
                        : <><CheckCircle size={14} /> Xác nhận {sheetPreview.length} sản phẩm</>}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
