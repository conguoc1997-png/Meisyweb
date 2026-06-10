"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X, Trash2, Eye, AlertCircle, CheckCircle, Layers, Package } from "lucide-react";

type VatTu = { id: string; ma: string; ten: string; donVi: string; nhom: string | null; loai: string };
type TonKho = { soLuong: number; giaTrungBinh: number };
type SanPham = { id: string; ten: string; sku: string; mauSac: string | null; size: string | null; tonKho: number };

type SuggestRow = {
  type: "vai" | "phu_lieu";
  vatTuId: string | null;
  vatTu: (VatTu & { tonKho?: TonKho }) | null;
  maVai?: string;
  soLuong: number;
  donGia: number;
  ghiChu: string;
  source: "lo_cat" | "dinh_muc";
};

type XuatRow = {
  type: "vai" | "phu_lieu";
  vatTuId: string;
  vatTu?: VatTu;
  soLuong: number;
  donGia: number;
  ghiChu: string;
  source?: string;
  warned?: boolean; // vatTuId chưa map được
};

type LoCat = {
  id: string; hangCat: string; maVai: string | null;
  soSanPham: number | null; hangThucTe: number | null; ngay: string;
  soM: number | null; soCay: number;
};

type PhieuXuat = {
  id: string; soPhieu: string; ngay: string; hangCat: string | null;
  soSanPham: number; lyDo: string; ghiChu: string | null; loCatId: string | null;
  chiTiet: { id: string; vatTuId: string; soLuong: number; donGia: number; thanhTien: number; ghiChu: string | null; vatTu?: VatTu }[];
  createdAt: string;
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");

function genSoPhieu() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `XK${y}${m}${d}-${Date.now().toString().slice(-6)}`;
}

export default function XuatKhoPage() {
  const [phieus, setPhieus]   = useState<PhieuXuat[]>([]);
  const [vatTus, setVatTus]   = useState<(VatTu & { tonKho?: TonKho })[]>([]);
  const [loCats, setLoCats]   = useState<LoCat[]>([]);
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [modal, setModal]     = useState<"create" | "view" | null>(null);
  const [selected, setSelected] = useState<PhieuXuat | null>(null);

  // Form
  const [xuatMode, setXuatMode] = useState<"lo_cat" | "san_pham">("lo_cat");
  const [spSearch, setSpSearch] = useState("");
  const [selectedSP, setSelectedSP] = useState<{ ten: string; totalTon: number } | null>(null);
  const [form, setForm] = useState({
    soPhieu: genSoPhieu(),
    ngay: new Date().toISOString().slice(0, 10),
    loCatId: "",
    hangCat: "",
    soSanPham: "",
    lyDo: "san_xuat",
    ghiChu: "",
    nguoiTao: "",
  });
  const [rows, setRows]         = useState<XuatRow[]>([]);
  const [suggestLoad, setSuggestLoad] = useState(false);
  const [saving, setSaving]     = useState(false);
  // per-row vat-tu search state
  const [vtSearch, setVtSearch] = useState<string[]>([]);
  const [addingRow, setAddingRow] = useState(false);
  const [addVTSearch, setAddVTSearch] = useState("");
  const [addRow, setAddRow]     = useState<Partial<XuatRow>>({ type: "phu_lieu", soLuong: 0, donGia: 0, ghiChu: "" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, v, l, sp] = await Promise.all([
        fetch("/api/ke-toan/xuat-kho").then(r => r.json()),
        fetch("/api/ke-toan/vat-tu").then(r => r.json()),
        fetch("/api/san-xuat/lo-cat?limit=300").then(r => r.json()).catch(() => []),
        fetch("/api/kho/san-pham").then(r => r.json()).catch(() => []),
      ]);
      setPhieus(Array.isArray(p) ? p : []);
      setVatTus(Array.isArray(v) ? v : []);
      const loData = Array.isArray(l) ? l : (Array.isArray(l?.data) ? l.data : []);
      setLoCats(loData);
      setSanPhams(Array.isArray(sp) ? sp : []);
    } catch (e) {
      console.error("fetchAll xuat-kho:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => phieus.filter(p => {
    const s = search.toLowerCase();
    return !s || p.soPhieu.toLowerCase().includes(s) || (p.hangCat || "").toLowerCase().includes(s);
  }), [phieus, search]);

  // Chọn lô cắt → gọi suggest API
  async function onSelectLo(loCatId: string) {
    setForm(f => ({ ...f, loCatId }));
    if (!loCatId) { setRows([]); setVtSearch([]); return; }

    setSuggestLoad(true);
    const res = await fetch(`/api/ke-toan/xuat-kho/suggest?loCatId=${loCatId}`);
    setSuggestLoad(false);
    if (!res.ok) return;

    const data = await res.json();
    setForm(f => ({
      ...f,
      hangCat: data.lo.hangCat || "",
      soSanPham: String(data.soSanPham || ""),
    }));

    const newRows: XuatRow[] = (data.rows as SuggestRow[]).map(r => ({
      type: r.type,
      vatTuId: r.vatTuId || "__UNMAPPED__",
      vatTu: r.vatTu || undefined,
      soLuong: r.soLuong,
      donGia: r.donGia,
      ghiChu: r.ghiChu,
      source: r.source,
      warned: !r.vatTuId,
    }));
    setRows(newRows);
    setVtSearch(newRows.map(() => ""));
  }

  // Khi số sản phẩm thay đổi trong chế độ sản phẩm → tải lại suggest
  async function onSoSanPhamSP(soSP: string) {
    setForm(f => ({ ...f, soSanPham: soSP }));
    const hangCat = form.hangCat;
    const spNum = parseFloat(soSP) || 0;
    if (!hangCat || spNum <= 0) return;

    setSuggestLoad(true);
    const res = await fetch(`/api/ke-toan/xuat-kho/suggest?hangCat=${encodeURIComponent(hangCat)}&soSanPham=${spNum}`);
    setSuggestLoad(false);
    if (!res.ok) return;

    const data = await res.json();
    const newRows: XuatRow[] = (data.rows as SuggestRow[]).map(r => ({
      type: r.type,
      vatTuId: r.vatTuId || "__UNMAPPED__",
      vatTu: r.vatTu || undefined,
      soLuong: r.soLuong,
      donGia: r.donGia,
      ghiChu: r.ghiChu,
      source: r.source,
      warned: !r.vatTuId,
    }));
    setRows(newRows);
    setVtSearch(newRows.map(() => ""));
  }

  function updateRow(i: number, patch: Partial<XuatRow>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
    setVtSearch(prev => prev.filter((_, idx) => idx !== i));
  }

  function commitAddRow() {
    if (!addRow.vatTuId || !addRow.soLuong) return;
    const vt = vatTus.find(v => v.id === addRow.vatTuId);
    setRows(prev => [...prev, {
      type: addRow.type || "phu_lieu",
      vatTuId: addRow.vatTuId!,
      vatTu: vt,
      soLuong: addRow.soLuong || 0,
      donGia: addRow.donGia || 0,
      ghiChu: addRow.ghiChu || "",
      source: "manual",
    }]);
    setVtSearch(prev => [...prev, ""]);
    setAddRow({ type: "phu_lieu", soLuong: 0, donGia: 0, ghiChu: "" });
    setAddVTSearch("");
    setAddingRow(false);
  }

  async function handleCreate() {
    const validRows = rows.filter(r => r.vatTuId && r.vatTuId !== "__UNMAPPED__" && r.soLuong > 0);
    if (!form.soPhieu || !form.ngay || validRows.length === 0) return;
    setSaving(true);
    const res = await fetch("/api/ke-toan/xuat-kho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        soSanPham: parseFloat(form.soSanPham) || 0,
        chiTiet: validRows,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setModal(null);
      resetForm();
      fetchAll();
    }
  }

  function resetForm() {
    setForm({ soPhieu: genSoPhieu(), ngay: new Date().toISOString().slice(0, 10), loCatId: "", hangCat: "", soSanPham: "", lyDo: "san_xuat", ghiChu: "", nguoiTao: "" });
    setRows([]); setVtSearch([]);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá phiếu này? Sẽ hoàn ngược tồn kho.")) return;
    await fetch(`/api/ke-toan/xuat-kho/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const tongTien = rows.filter(r => r.vatTuId !== "__UNMAPPED__").reduce((s, r) => s + r.soLuong * r.donGia, 0);
  const vaiRows  = rows.filter(r => r.type === "vai");
  const phuRows  = rows.filter(r => r.type === "phu_lieu");
  const hasUnmapped = rows.some(r => r.warned);

  const filtVTAdd = vatTus.filter(v => {
    const q = addVTSearch.toLowerCase();
    return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
  });

  const stats = useMemo(() => ({
    total: filtered.length,
    tongTien: filtered.reduce((s, p) => s + p.chiTiet.reduce((a, c) => a + c.thanhTien, 0), 0),
    loaiHang: new Set(filtered.map(p => p.hangCat).filter(Boolean)).size,
  }), [filtered]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Xuất Kho NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vải lấy từ số liệu thực tế lô cắt · Phụ liệu tính từ định mức</p>
        </div>
        <button onClick={() => { setModal("create"); resetForm(); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
          <Plus size={16} /> Tạo phiếu xuất
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Số phiếu xuất</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Giá trị NPL đã xuất</p>
          <p className="text-2xl font-bold text-indigo-700">{fmt(stats.tongTien)}₫</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Loại hàng</p>
          <p className="text-2xl font-bold text-teal-700">{stats.loaiHang}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="relative w-56">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm số phiếu, loại hàng..."
          className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-300" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Số phiếu</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Ngày</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Loại hàng</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Số SP</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Giá trị xuất</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Ghi chú</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chưa có phiếu xuất nào</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-indigo-700 font-medium">{p.soPhieu}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(p.ngay)}</td>
                <td className="px-4 py-3">
                  {p.hangCat && <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">{p.hangCat}</span>}
                </td>
                <td className="px-4 py-3 text-right">{p.soSanPham > 0 ? fmt(p.soSanPham) : "—"}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(p.chiTiet.reduce((s, c) => s + c.thanhTien, 0))}₫</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.ghiChu || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(p); setModal("view"); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── CREATE MODAL ── */}
      {modal === "create" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-6 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Tạo phiếu xuất kho NPL</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Thông tin phiếu ── */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số phiếu *</label>
                  <input value={form.soPhieu} onChange={e => setForm(f => ({ ...f, soPhieu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày xuất *</label>
                  <input type="date" value={form.ngay} onChange={e => setForm(f => ({ ...f, ngay: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Người tạo</label>
                  <input value={form.nguoiTao} onChange={e => setForm(f => ({ ...f, nguoiTao: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>

                {/* ── Chế độ xuất ── */}
                <div className="col-span-3">
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden w-fit">
                    <button onClick={() => { setXuatMode("lo_cat"); setRows([]); setVtSearch([]); setSelectedSP(null); setSpSearch(""); setForm(f => ({ ...f, loCatId: "", hangCat: "", soSanPham: "" })); }}
                      className={`px-4 py-2 text-sm font-medium transition-colors ${xuatMode === "lo_cat" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                      📋 Theo lô cắt
                    </button>
                    <button onClick={() => { setXuatMode("san_pham"); setRows([]); setVtSearch([]); setForm(f => ({ ...f, loCatId: "", hangCat: "", soSanPham: "" })); }}
                      className={`px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${xuatMode === "san_pham" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                      📦 Theo sản phẩm
                    </button>
                  </div>
                </div>

                {xuatMode === "lo_cat" ? (
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-slate-500 block mb-1">
                      Chọn lô cắt
                      <span className="ml-1.5 text-indigo-400 font-normal">— tự điền vải từ lô + phụ liệu từ định mức</span>
                    </label>
                    <select value={form.loCatId} onChange={e => onSelectLo(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      <option value="">— Chọn lô cắt —</option>
                      {loCats.map(l => (
                        <option key={l.id} value={l.id}>
                          {fmtDate(l.ngay)} · {l.hangCat}
                          {l.maVai ? ` · ${l.maVai}` : ""}
                          {` · ${l.hangThucTe ?? l.soSanPham ?? "?"} sp`}
                          {l.soM ? ` · ${l.soM}m` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="col-span-2 relative">
                      <label className="text-xs font-medium text-slate-500 block mb-1">
                        Chọn sản phẩm từ kho
                        <span className="ml-1.5 text-indigo-400 font-normal">— tự tính NPL từ định mức</span>
                      </label>
                      <input value={selectedSP ? selectedSP.ten : spSearch}
                        onChange={e => { setSpSearch(e.target.value); setSelectedSP(null); setForm(f => ({ ...f, hangCat: "", soSanPham: "" })); setRows([]); }}
                        placeholder="Tìm tên sản phẩm..."
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      {!selectedSP && spSearch && (() => {
                        const q = spSearch.toLowerCase();
                        const uniqueNames = [...new Set(sanPhams.map(s => s.ten))].filter(n => n.toLowerCase().includes(q));
                        if (!uniqueNames.length) return null;
                        return (
                          <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto mt-1">
                            {uniqueNames.slice(0, 12).map(name => {
                              const spItems = sanPhams.filter(s => s.ten === name);
                              const totalTon = spItems.reduce((s, sp) => s + sp.tonKho, 0);
                              return (
                                <button key={name} onClick={() => {
                                  setSelectedSP({ ten: name, totalTon });
                                  setSpSearch("");
                                  setForm(f => ({ ...f, hangCat: name }));
                                }} className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 border-b border-slate-50 last:border-0">
                                  <p className="text-sm font-medium text-slate-800">{name}</p>
                                  <p className="text-xs text-slate-400">{spItems.length} màu/size · tồn {totalTon} sp</p>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })()}
                      {selectedSP && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs text-slate-500">Tồn kho: <strong>{selectedSP.totalTon} sp</strong></span>
                          <button onClick={() => { setSelectedSP(null); setSpSearch(""); setForm(f => ({ ...f, hangCat: "", soSanPham: "" })); setRows([]); }}
                            className="text-xs text-red-400 hover:text-red-600">✕ Đổi</button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 block mb-1">Số sản phẩm xuất *</label>
                      <input type="number" min={1} value={form.soSanPham}
                        onChange={e => onSoSanPhamSP(e.target.value)}
                        disabled={!form.hangCat}
                        placeholder={form.hangCat ? "Nhập số lượng..." : "Chọn SP trước"}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-40" />
                      {form.hangCat && !rows.length && !suggestLoad && parseFloat(form.soSanPham) > 0 && (
                        <p className="text-xs text-amber-500 mt-1">⚠ Chưa có định mức cho &quot;{form.hangCat}&quot;</p>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                  <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>

              {/* Loading suggest */}
              {suggestLoad && (
                <div className="text-center py-6 text-indigo-500 text-sm animate-pulse">Đang tải dữ liệu lô cắt...</div>
              )}

              {/* ── Warning: vải chưa map ── */}
              {hasUnmapped && !suggestLoad && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Mã vải chưa liên kết với vật tư</p>
                    <p className="text-xs mt-0.5">Vui lòng chọn vật tư thủ công cho dòng vải bên dưới, hoặc thêm vật tư vải vào Tồn kho NPL với mã khớp với mã vải lô cắt.</p>
                  </div>
                </div>
              )}

              {/* ── SECTION: VẢI ── */}
              {!suggestLoad && vaiRows.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                    <h3 className="text-sm font-bold text-slate-700">Vải</h3>
                    <span className="text-xs text-slate-400">— số liệu thực tế từ lô cắt</span>
                  </div>
                  <div className="rounded-xl border border-teal-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-teal-50 text-left">
                          <th className="px-4 py-2 text-xs font-medium text-teal-700">Vật tư vải</th>
                          <th className="px-4 py-2 text-xs font-medium text-teal-700 text-right w-28">Số mét</th>
                          <th className="px-4 py-2 text-xs font-medium text-teal-700 text-right w-28">Giá vốn/m</th>
                          <th className="px-4 py-2 text-xs font-medium text-teal-700 text-right w-28">Thành tiền</th>
                          <th className="px-4 py-2 text-xs font-medium text-teal-700">Ghi chú</th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => {
                          if (row.type !== "vai") return null;
                          const selVT = vatTus.find(v => v.id === row.vatTuId) || row.vatTu;
                          const filtVTs = vatTus.filter(v => {
                            const q = (vtSearch[i] || "").toLowerCase();
                            return v.loai === "vai" && (!q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q));
                          });
                          return (
                            <tr key={i} className={`border-t border-teal-50 ${row.warned ? "bg-amber-50/40" : "bg-white"}`}>
                              <td className="px-4 py-2">
                                {row.warned ? (
                                  <div className="relative">
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <AlertCircle size={12} className="text-amber-500" />
                                      <span className="text-xs text-amber-600">Mã vải: <strong>{row.vatTu === null && row.ghiChu}</strong></span>
                                    </div>
                                    <input value={vtSearch[i] || ""}
                                      onChange={e => { const ns = [...vtSearch]; ns[i] = e.target.value; setVtSearch(ns); }}
                                      placeholder="Tìm vật tư vải để liên kết..."
                                      className="w-full border border-amber-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-300" />
                                    {vtSearch[i] && filtVTs.length > 0 && (
                                      <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                                        {filtVTs.map(v => (
                                          <button key={v.id} className="w-full text-left px-3 py-2 text-xs hover:bg-teal-50 flex gap-2"
                                            onClick={() => {
                                              updateRow(i, { vatTuId: v.id, vatTu: v, donGia: v.tonKho?.giaTrungBinh ?? 0, warned: false });
                                              const ns = [...vtSearch]; ns[i] = ""; setVtSearch(ns);
                                            }}>
                                            <span className="font-mono text-slate-400">{v.ma}</span>
                                            <span>{v.ten}</span>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-medium text-slate-700">{selVT?.ten || row.vatTuId}</p>
                                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <CheckCircle size={9} className="text-teal-500" /> từ lô cắt · {selVT?.ma}
                                    </p>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <input type="number" min={0} step="0.1" value={row.soLuong || ""}
                                  onChange={e => updateRow(i, { soLuong: parseFloat(e.target.value) || 0 })}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-teal-300" />
                              </td>
                              <td className="px-4 py-2">
                                <input type="number" min={0} value={row.donGia || ""}
                                  onChange={e => updateRow(i, { donGia: parseFloat(e.target.value) || 0 })}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-teal-300" />
                              </td>
                              <td className="px-4 py-2 text-right text-xs font-semibold text-teal-700">
                                {fmt(row.soLuong * row.donGia)}₫
                              </td>
                              <td className="px-4 py-2">
                                <input value={row.ghiChu} onChange={e => updateRow(i, { ghiChu: e.target.value })}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-300" />
                              </td>
                              <td className="px-2 py-2">
                                <button onClick={() => removeRow(i)} className="p-1 text-slate-300 hover:text-red-500"><X size={12} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── SECTION: PHỤ LIỆU ── */}
              {!suggestLoad && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <h3 className="text-sm font-bold text-slate-700">Phụ liệu</h3>
                      {phuRows.length > 0 && (
                        <span className="text-xs text-slate-400">— tính từ định mức × số SP</span>
                      )}
                    </div>
                    <button onClick={() => setAddingRow(true)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                      <Plus size={12} /> Thêm phụ liệu
                    </button>
                  </div>

                  {phuRows.length === 0 && !addingRow && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                      {form.loCatId
                        ? "Chưa có định mức phụ liệu cho loại hàng này — thêm thủ công hoặc cài định mức trước"
                        : "Chọn lô cắt để tự điền từ định mức, hoặc thêm thủ công"}
                    </div>
                  )}

                  {phuRows.length > 0 && (
                    <div className="rounded-xl border border-orange-100 overflow-hidden mb-2">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-orange-50 text-left">
                            <th className="px-4 py-2 text-xs font-medium text-orange-700">Vật tư</th>
                            <th className="px-4 py-2 text-xs font-medium text-orange-700 text-right w-28">Số lượng</th>
                            <th className="px-4 py-2 text-xs font-medium text-orange-700 w-14">ĐV</th>
                            <th className="px-4 py-2 text-xs font-medium text-orange-700 text-right w-28">Giá vốn</th>
                            <th className="px-4 py-2 text-xs font-medium text-orange-700 text-right w-28">Thành tiền</th>
                            <th className="px-4 py-2 text-xs font-medium text-orange-700">Ghi chú</th>
                            <th className="w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, i) => {
                            if (row.type !== "phu_lieu") return null;
                            const selVT = vatTus.find(v => v.id === row.vatTuId) || row.vatTu;
                            return (
                              <tr key={i} className="border-t border-orange-50 bg-white">
                                <td className="px-4 py-2">
                                  <p className="font-medium text-slate-700">{selVT?.ten || row.vatTuId}</p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                    <CheckCircle size={9} className="text-orange-400" /> định mức · {selVT?.ma}
                                  </p>
                                </td>
                                <td className="px-4 py-2">
                                  <input type="number" min={0} step="0.1" value={row.soLuong || ""}
                                    onChange={e => updateRow(i, { soLuong: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-orange-300" />
                                </td>
                                <td className="px-4 py-2 text-xs text-slate-500">{selVT?.donVi || "—"}</td>
                                <td className="px-4 py-2">
                                  <input type="number" min={0} value={row.donGia || ""}
                                    onChange={e => updateRow(i, { donGia: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-orange-300" />
                                </td>
                                <td className="px-4 py-2 text-right text-xs font-semibold text-orange-700">
                                  {fmt(row.soLuong * row.donGia)}₫
                                </td>
                                <td className="px-4 py-2">
                                  <input value={row.ghiChu} onChange={e => updateRow(i, { ghiChu: e.target.value })}
                                    className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-300" />
                                </td>
                                <td className="px-2 py-2">
                                  <button onClick={() => removeRow(i)} className="p-1 text-slate-300 hover:text-red-500"><X size={12} /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Thêm dòng phụ liệu thủ công */}
                  {addingRow && (
                    <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
                      <p className="text-xs font-semibold text-slate-600">Thêm phụ liệu thủ công</p>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-2 relative">
                          <label className="text-xs text-slate-400 block mb-1">Vật tư *</label>
                          <input value={addVTSearch || (vatTus.find(v => v.id === addRow.vatTuId) ? `${vatTus.find(v => v.id === addRow.vatTuId)!.ma} – ${vatTus.find(v => v.id === addRow.vatTuId)!.ten}` : "")}
                            onChange={e => { setAddVTSearch(e.target.value); if (!e.target.value) setAddRow(r => ({ ...r, vatTuId: undefined })); }}
                            placeholder="Tìm vật tư..."
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                          {addVTSearch && filtVTAdd.length > 0 && (
                            <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                              {filtVTAdd.map(v => (
                                <button key={v.id} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2"
                                  onClick={() => {
                                    setAddRow(r => ({ ...r, vatTuId: v.id, donGia: (v as VatTu & { tonKho?: TonKho }).tonKho?.giaTrungBinh ?? 0 }));
                                    setAddVTSearch("");
                                  }}>
                                  <span className="font-mono text-slate-400">{v.ma}</span>
                                  <span>{v.ten}</span>
                                  <span className="text-slate-400 ml-auto">{v.donVi}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Số lượng *</label>
                          <input type="number" min={0} step="0.1" value={addRow.soLuong || ""}
                            onChange={e => setAddRow(r => ({ ...r, soLuong: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Giá vốn</label>
                          <input type="number" min={0} value={addRow.donGia || ""}
                            onChange={e => setAddRow(r => ({ ...r, donGia: parseFloat(e.target.value) || 0 }))}
                            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => { setAddingRow(false); setAddVTSearch(""); }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">Huỷ</button>
                        <button onClick={commitAddRow} disabled={!addRow.vatTuId || !addRow.soLuong}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50">
                          + Thêm vào phiếu
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tổng */}
              {rows.length > 0 && (
                <div className="flex justify-between items-center bg-slate-50 rounded-xl px-5 py-3">
                  <div className="flex gap-6 text-sm">
                    <span className="text-slate-500">
                      Vải: <strong className="text-teal-700">{fmt(vaiRows.reduce((s, r) => s + r.soLuong * r.donGia, 0))}₫</strong>
                    </span>
                    <span className="text-slate-500">
                      Phụ liệu: <strong className="text-orange-700">{fmt(phuRows.reduce((s, r) => s + r.soLuong * r.donGia, 0))}₫</strong>
                    </span>
                  </div>
                  <div className="text-base font-bold text-indigo-700">
                    Tổng: {fmt(tongTien)}₫
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleCreate} disabled={saving || rows.filter(r => r.vatTuId !== "__UNMAPPED__" && r.soLuong > 0).length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                <Layers size={15} />
                {saving ? "Đang xuất..." : "Xuất kho"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-mono">{selected.soPhieu}</h2>
                <p className="text-xs text-slate-400">{fmtDate(selected.ngay)} · {selected.hangCat || "—"} · {selected.soSanPham > 0 ? `${fmt(selected.soSanPham)} sp` : ""}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              {/* Vải */}
              {selected.chiTiet.filter(c => c.vatTu?.loai === "vai").length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-teal-600 mb-1 flex items-center gap-1"><Package size={11} /> Vải</p>
                  {selected.chiTiet.filter(c => c.vatTu?.loai === "vai").map((r, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-t border-teal-50 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">{r.vatTu?.ten || r.vatTuId}</span>
                        <span className="text-xs text-slate-400 ml-2">{r.soLuong} m</span>
                      </div>
                      <span className="font-semibold text-teal-700">{fmt(r.thanhTien)}₫</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Phụ liệu */}
              {selected.chiTiet.filter(c => c.vatTu?.loai !== "vai").length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-orange-600 mb-1 flex items-center gap-1"><Package size={11} /> Phụ liệu</p>
                  {selected.chiTiet.filter(c => c.vatTu?.loai !== "vai").map((r, i) => (
                    <div key={i} className="flex justify-between py-1.5 border-t border-orange-50 text-sm">
                      <div>
                        <span className="font-medium text-slate-700">{r.vatTu?.ten || r.vatTuId}</span>
                        <span className="text-xs text-slate-400 ml-2">{fmt(r.soLuong)} {r.vatTu?.donVi}</span>
                      </div>
                      <span className="font-semibold text-orange-700">{fmt(r.thanhTien)}₫</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-slate-200 font-bold text-base">
                <span className="text-slate-700">Tổng giá trị NPL xuất</span>
                <span className="text-indigo-700">{fmt(selected.chiTiet.reduce((s, c) => s + c.thanhTien, 0))}₫</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
