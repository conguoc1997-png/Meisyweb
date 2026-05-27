"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Pencil, Trash2, Search, BookOpen } from "lucide-react";

type VatTu = { id: string; ma: string; ten: string; loai: string; donVi: string; nhom: string | null };
type DinhMuc = { id: string; hangCat: string; soLuong: number; ghiChu: string | null; vatTu: VatTu };

const fmt = (n: number) => n.toLocaleString("vi-VN");

export default function DinhMucPage() {
  const [items, setItems]     = useState<DinhMuc[]>([]);
  const [vatTus, setVatTus]   = useState<VatTu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterHang, setFilterHang] = useState("");

  const [modal, setModal]     = useState<"create" | "edit" | null>(null);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState({ hangCat: "", vatTuId: "", soLuong: "", ghiChu: "" });
  const [vtSearch, setVtSearch] = useState("");
  const [saving, setSaving]   = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [d, v] = await Promise.all([
      fetch("/api/ke-toan/dinh-muc").then(r => r.json()),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()),
    ]);
    setItems(Array.isArray(d) ? d : []);
    setVatTus(Array.isArray(v) ? v : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Nhóm theo hangCat
  const grouped = useMemo(() => {
    const s = search.toLowerCase();
    const filtered = items.filter(it => {
      const matchS = !s || it.hangCat.toLowerCase().includes(s) || it.vatTu.ten.toLowerCase().includes(s);
      const matchH = !filterHang || it.hangCat === filterHang;
      return matchS && matchH;
    });
    const map = new Map<string, DinhMuc[]>();
    for (const it of filtered) {
      if (!map.has(it.hangCat)) map.set(it.hangCat, []);
      map.get(it.hangCat)!.push(it);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items, search, filterHang]);

  const allHangCat = useMemo(() => [...new Set(items.map(i => i.hangCat))].sort(), [items]);

  function openCreate(hangCat = "") {
    setForm({ hangCat, vatTuId: "", soLuong: "", ghiChu: "" });
    setVtSearch(""); setEditId(null); setModal("create");
  }

  function openEdit(it: DinhMuc) {
    setForm({ hangCat: it.hangCat, vatTuId: it.vatTu.id, soLuong: String(it.soLuong), ghiChu: it.ghiChu || "" });
    setVtSearch(""); setEditId(it.id); setModal("edit");
  }

  async function handleSave() {
    if (!form.hangCat || !form.vatTuId || !form.soLuong) return;
    setSaving(true);
    if (modal === "create") {
      await fetch("/api/ke-toan/dinh-muc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, soLuong: parseFloat(form.soLuong) }),
      });
    } else if (editId) {
      await fetch(`/api/ke-toan/dinh-muc/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, soLuong: parseFloat(form.soLuong) }),
      });
    }
    setSaving(false);
    setModal(null);
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá định mức này?")) return;
    await fetch(`/api/ke-toan/dinh-muc/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const filteredVTs = vatTus.filter(v => {
    const q = vtSearch.toLowerCase();
    return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Định Mức NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">Cài định mức nguyên phụ liệu theo từng loại hàng cắt — dùng để tự tính khi xuất kho</p>
        </div>
        <button onClick={() => openCreate()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Thêm định mức
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm loại hàng, vật tư..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={filterHang} onChange={e => setFilterHang(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả loại hàng</option>
          {allHangCat.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {/* Grouped list */}
      {loading && <p className="text-center py-12 text-slate-400">Đang tải...</p>}
      {!loading && grouped.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <BookOpen size={40} className="mx-auto text-slate-300" />
          <p className="text-slate-400">Chưa có định mức nào. Thêm định mức để hệ thống tự tính khi xuất kho.</p>
        </div>
      )}
      {grouped.map(([hangCat, rows]) => (
        <div key={hangCat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800">{hangCat}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{rows.length} loại NPL · định mức / 100 sản phẩm</p>
            </div>
            <button onClick={() => openCreate(hangCat)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              <Plus size={12} /> Thêm NPL
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-50">
                <th className="px-5 py-2 text-xs font-medium text-slate-500">Vật tư</th>
                <th className="px-5 py-2 text-xs font-medium text-slate-500">Loại / Nhóm</th>
                <th className="px-5 py-2 text-xs font-medium text-slate-500 text-right">Định mức / 100sp</th>
                <th className="px-5 py-2 text-xs font-medium text-slate-500">ĐV</th>
                <th className="px-5 py-2 text-xs font-medium text-slate-500">Ghi chú</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(it => (
                <tr key={it.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-5 py-2.5">
                    <p className="font-medium text-slate-700">{it.vatTu.ten}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{it.vatTu.ma}</p>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${it.vatTu.loai === "vai" ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"}`}>
                      {it.vatTu.loai === "vai" ? "Vải" : "Phụ liệu"}
                    </span>
                    {it.vatTu.nhom && <span className="ml-1.5 text-xs text-slate-400">{it.vatTu.nhom}</span>}
                  </td>
                  <td className="px-5 py-2.5 text-right font-bold text-indigo-700">{fmt(it.soLuong)}</td>
                  <td className="px-5 py-2.5 text-slate-500 text-xs">{it.vatTu.donVi}</td>
                  <td className="px-5 py-2.5 text-slate-400 text-xs">{it.ghiChu || "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(it)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(it.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">{modal === "create" ? "Thêm định mức NPL" : "Sửa định mức"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Loại hàng cắt *</label>
                <input value={form.hangCat} onChange={e => setForm(f => ({ ...f, hangCat: e.target.value }))}
                  placeholder="VD: Áo sơ mi, Quần âu, Đầm..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                {allHangCat.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {allHangCat.map(h => (
                      <button key={h} onClick={() => setForm(f => ({ ...f, hangCat: h }))}
                        className={`px-2 py-0.5 rounded-lg text-xs border transition-colors ${form.hangCat === h ? "bg-indigo-100 border-indigo-300 text-indigo-700" : "border-slate-200 text-slate-500 hover:border-indigo-200"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Vật tư *</label>
                <div className="relative">
                  <input value={vtSearch || (vatTus.find(v => v.id === form.vatTuId) ? `${vatTus.find(v => v.id === form.vatTuId)!.ma} – ${vatTus.find(v => v.id === form.vatTuId)!.ten}` : "")}
                    onChange={e => { setVtSearch(e.target.value); if (!e.target.value) setForm(f => ({ ...f, vatTuId: "" })); }}
                    placeholder="Tìm vật tư..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  {vtSearch && filteredVTs.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-44 overflow-y-auto">
                      {filteredVTs.map(v => (
                        <button key={v.id} onClick={() => { setForm(f => ({ ...f, vatTuId: v.id })); setVtSearch(""); }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2">
                          <span className="font-mono text-slate-400 shrink-0">{v.ma}</span>
                          <span className="text-slate-700">{v.ten}</span>
                          <span className="text-slate-400 ml-auto">{v.donVi}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">
                  Định mức / 100 sản phẩm *
                  {form.vatTuId && <span className="ml-1 text-indigo-500">({vatTus.find(v => v.id === form.vatTuId)?.donVi})</span>}
                </label>
                <input type="number" min={0} step="0.01" value={form.soLuong}
                  onChange={e => setForm(f => ({ ...f, soLuong: e.target.value }))}
                  placeholder="VD: 120 (mét vải), 700 (cúc)..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
