"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Pencil, Trash2, Search, Layers, Scissors, Package } from "lucide-react";

type VatTu = { id: string; ma: string; ten: string; loai: string; donVi: string; nhom: string | null };
type DinhMuc = {
  id: string; hangCat: string; soLuong: number; donViMua: string; quyDoi: number;
  ghiChu: string | null; vatTu: VatTu;
};

const fmt = (n: number) => n.toLocaleString("vi-VN");

const DON_VI_MUA = ["m","cay","kg","chiec","goi","cuon","hop","bo","cai"];

export default function DinhMucPage() {
  const [items, setItems]     = useState<DinhMuc[]>([]);
  const [vatTus, setVatTus]   = useState<VatTu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterHang, setFilterHang] = useState("");

  const [modal, setModal]     = useState<"add" | "edit" | null>(null);
  const [editId, setEditId]   = useState<string | null>(null);
  const [form, setForm]       = useState({
    hangCat: "", vatTuId: "", soLuong: "", donViMua: "m", quyDoi: "1", ghiChu: ""
  });
  const [vtSearch, setVtSearch] = useState("");
  const [saving, setSaving]   = useState(false);

  // Thêm cả mã hàng mới inline
  const [newHangCat, setNewHangCat] = useState("");
  const [addingHang, setAddingHang] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [d, v] = await Promise.all([
        fetch("/api/ke-toan/dinh-muc").then(r => r.json()),
        fetch("/api/ke-toan/vat-tu").then(r => r.json()),
      ]);
      setItems(Array.isArray(d) ? d : []);
      setVatTus(Array.isArray(v) ? v : []);
    } catch (e) {
      console.error("fetchAll dinh-muc:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const allHangCat = useMemo(() => [...new Set(items.map(i => i.hangCat))].sort(), [items]);

  // Nhóm theo hangCat, split vải vs phụ liệu
  const grouped = useMemo(() => {
    const s = search.toLowerCase();
    const filtered = items.filter(it => {
      const matchS = !s || it.hangCat.toLowerCase().includes(s) || it.vatTu.ten.toLowerCase().includes(s);
      const matchH = !filterHang || it.hangCat === filterHang;
      return matchS && matchH;
    });
    const map = new Map<string, { vai: DinhMuc[]; phuLieu: DinhMuc[] }>();
    for (const it of filtered) {
      if (!map.has(it.hangCat)) map.set(it.hangCat, { vai: [], phuLieu: [] });
      const g = map.get(it.hangCat)!;
      it.vatTu.loai === "vai" ? g.vai.push(it) : g.phuLieu.push(it);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items, search, filterHang]);

  function openAdd(hangCat = "") {
    setForm({ hangCat, vatTuId: "", soLuong: "", donViMua: "m", quyDoi: "1", ghiChu: "" });
    setVtSearch(""); setEditId(null); setModal("add");
  }

  function openEdit(it: DinhMuc) {
    setForm({
      hangCat: it.hangCat, vatTuId: it.vatTu.id,
      soLuong: String(it.soLuong), donViMua: it.donViMua,
      quyDoi: String(it.quyDoi), ghiChu: it.ghiChu || "",
    });
    setVtSearch(""); setEditId(it.id); setModal("edit");
  }

  async function handleSave() {
    if (!form.hangCat || !form.vatTuId || !form.soLuong) return;
    setSaving(true);
    const payload = {
      hangCat: form.hangCat,
      vatTuId: form.vatTuId,
      soLuong: parseFloat(form.soLuong),
      donViMua: form.donViMua,
      quyDoi: parseFloat(form.quyDoi) || 1,
      ghiChu: form.ghiChu || null,
    };
    if (modal === "add") {
      await fetch("/api/ke-toan/dinh-muc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else if (editId) {
      await fetch(`/api/ke-toan/dinh-muc/${editId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  // Tạo mã hàng mới (chỉ mở modal thêm định mức đầu tiên cho hàng đó)
  function handleAddHang() {
    if (!newHangCat.trim()) return;
    openAdd(newHangCat.trim());
    setNewHangCat(""); setAddingHang(false);
  }

  const selVT = vatTus.find(v => v.id === form.vatTuId);
  const filteredVTs = vatTus.filter(v => {
    const q = vtSearch.toLowerCase();
    return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
  });

  // Hiển thị donViMua có quyDoi
  const showQuyDoi = ["cay","kg"].includes(form.donViMua);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Định Mức NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            BOM hoàn chỉnh: mỗi mã hàng gồm vải + phụ liệu · định mức / 100 sản phẩm
          </p>
        </div>
        <div className="flex gap-2">
          {addingHang ? (
            <div className="flex items-center gap-2">
              <input value={newHangCat} onChange={e=>setNewHangCat(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleAddHang()}
                placeholder="Tên mã hàng... (VD: Áo sơ mi)"
                autoFocus
                className="border border-indigo-300 rounded-xl px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              <button onClick={handleAddHang}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                Tạo
              </button>
              <button onClick={()=>{setAddingHang(false);setNewHangCat("");}}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50">
                <X size={14}/>
              </button>
            </div>
          ) : (
            <button onClick={()=>setAddingHang(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
              <Plus size={16}/> Thêm mã hàng
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Tìm mã hàng, vật tư..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
        </div>
        <select value={filterHang} onChange={e=>setFilterHang(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả mã hàng</option>
          {allHangCat.map(h=><option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      {loading && <p className="text-center py-12 text-slate-400">Đang tải...</p>}
      {!loading && grouped.length===0 && (
        <div className="text-center py-16 space-y-3">
          <Layers size={40} className="mx-auto text-slate-300"/>
          <p className="text-slate-400">Chưa có định mức. Bấm <strong>Thêm mã hàng</strong> để bắt đầu.</p>
        </div>
      )}

      {/* Grouped BOM cards */}
      {grouped.map(([hangCat, { vai, phuLieu }]) => (
        <div key={hangCat} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
                <Scissors size={15} className="text-white"/>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{hangCat}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {vai.length} vải · {phuLieu.length} phụ liệu · định mức /100 sản phẩm
                </p>
              </div>
            </div>
            <button onClick={()=>openAdd(hangCat)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              <Plus size={12}/> Thêm NPL
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {/* ── VẢI ── */}
            {(vai.length > 0) && (
              <div>
                <div className="flex items-center gap-2 px-5 py-2 bg-teal-50/60">
                  <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                  <span className="text-xs font-semibold text-teal-700">Vải</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">Vật tư</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400 text-right">Định mức</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">ĐV mua</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-teal-500">≈ đvị cơ bản</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">Ghi chú</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {vai.map(it => (
                      <tr key={it.id} className="border-t border-teal-50/80 hover:bg-teal-50/30">
                        <td className="px-5 py-2.5">
                          <p className="font-medium text-slate-700">{it.vatTu.ten}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{it.vatTu.ma}</p>
                        </td>
                        <td className="px-5 py-2.5 text-right font-bold text-teal-700">{fmt(it.soLuong)}</td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">{it.donViMua}</td>
                        <td className="px-5 py-2.5 text-xs text-teal-600">
                          {it.quyDoi !== 1 ? `= ${fmt(it.soLuong * it.quyDoi)} ${it.vatTu.donVi}` : `${it.vatTu.donVi}`}
                        </td>
                        <td className="px-5 py-2.5 text-slate-400 text-xs">{it.ghiChu || "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button onClick={()=>openEdit(it)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil size={12}/></button>
                            <button onClick={()=>handleDelete(it.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {vai.length === 0 && (
              <div className="px-5 py-3 bg-teal-50/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-200"></div>
                <span className="text-xs text-teal-400 italic">Chưa có định mức vải</span>
                <button onClick={()=>openAdd(hangCat)} className="text-xs text-teal-600 hover:underline ml-1">+ Thêm</button>
              </div>
            )}

            {/* ── PHỤ LIỆU ── */}
            {(phuLieu.length > 0) && (
              <div>
                <div className="flex items-center gap-2 px-5 py-2 bg-orange-50/60">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  <span className="text-xs font-semibold text-orange-700">Phụ liệu</span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">Vật tư</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">Nhóm</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400 text-right">Định mức</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">ĐV mua</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-orange-500">≈ đvị cơ bản</th>
                      <th className="px-5 py-1.5 text-xs font-medium text-slate-400">Ghi chú</th>
                      <th className="w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {phuLieu.map(it => (
                      <tr key={it.id} className="border-t border-orange-50/80 hover:bg-orange-50/30">
                        <td className="px-5 py-2.5">
                          <p className="font-medium text-slate-700">{it.vatTu.ten}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{it.vatTu.ma}</p>
                        </td>
                        <td className="px-5 py-2.5">
                          {it.vatTu.nhom && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">{it.vatTu.nhom}</span>
                          )}
                        </td>
                        <td className="px-5 py-2.5 text-right font-bold text-orange-700">{fmt(it.soLuong)}</td>
                        <td className="px-5 py-2.5 text-slate-600 text-xs">{it.donViMua}</td>
                        <td className="px-5 py-2.5 text-xs text-orange-600">
                          {it.quyDoi !== 1 ? `= ${fmt(it.soLuong * it.quyDoi)} ${it.vatTu.donVi}` : `${it.vatTu.donVi}`}
                        </td>
                        <td className="px-5 py-2.5 text-slate-400 text-xs">{it.ghiChu || "—"}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button onClick={()=>openEdit(it)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Pencil size={12}/></button>
                            <button onClick={()=>handleDelete(it.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={12}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {phuLieu.length === 0 && (
              <div className="px-5 py-3 bg-orange-50/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-200"></div>
                <span className="text-xs text-orange-400 italic">Chưa có định mức phụ liệu</span>
                <button onClick={()=>openAdd(hangCat)} className="text-xs text-orange-600 hover:underline ml-1">+ Thêm</button>
              </div>
            )}
          </div>

          {/* Footer tổng kết */}
          <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1"><Package size={11}/> Tổng {vai.length + phuLieu.length} loại NPL / 100 sản phẩm</span>
            <div className="flex gap-4">
              {vai.length > 0 && <span className="text-teal-600">{vai.length} vải</span>}
              {phuLieu.length > 0 && <span className="text-orange-600">{phuLieu.length} phụ liệu</span>}
            </div>
          </div>
        </div>
      ))}

      {/* ── MODAL THÊM / SỬA ── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {modal==="add" ? "Thêm NPL vào định mức" : "Sửa định mức"}
              </h2>
              <button onClick={()=>setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Mã hàng *</label>
                <input value={form.hangCat} onChange={e=>setForm(f=>({...f,hangCat:e.target.value}))}
                  placeholder="VD: Áo sơ mi"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                {allHangCat.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-1.5">
                    {allHangCat.map(h=>(
                      <button key={h} onClick={()=>setForm(f=>({...f,hangCat:h}))}
                        className={`px-2 py-0.5 rounded-lg text-xs border transition-colors ${form.hangCat===h?"bg-indigo-100 border-indigo-300 text-indigo-700":"border-slate-200 text-slate-500 hover:border-indigo-200"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Vật tư *</label>
                <div className="relative">
                  <input value={vtSearch||(selVT?`${selVT.ma} – ${selVT.ten}`:"")}
                    onChange={e=>{setVtSearch(e.target.value);if(!e.target.value)setForm(f=>({...f,vatTuId:""}));}}
                    placeholder="Tìm vật tư..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                  {vtSearch && filteredVTs.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-44 overflow-y-auto">
                      {filteredVTs.map(v=>(
                        <button key={v.id} onClick={()=>{setForm(f=>({...f,vatTuId:v.id,donViMua:v.donVi}));setVtSearch("");}}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2">
                          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] ${v.loai==="vai"?"bg-teal-100 text-teal-700":"bg-orange-100 text-orange-700"}`}>
                            {v.loai==="vai"?"Vải":"PL"}
                          </span>
                          <span className="font-mono text-slate-400">{v.ma}</span>
                          <span className="text-slate-700">{v.ten}</span>
                          <span className="text-slate-400 ml-auto">{v.donVi}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">ĐV mua</label>
                  <select value={form.donViMua} onChange={e=>setForm(f=>({...f,donViMua:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {DON_VI_MUA.map(d=><option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Định mức / 100 sp *
                    {selVT && <span className="ml-1 text-indigo-400">({form.donViMua})</span>}
                  </label>
                  <input type="number" min={0} step="0.01" value={form.soLuong}
                    onChange={e=>setForm(f=>({...f,soLuong:e.target.value}))}
                    placeholder="VD: 120, 700..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              </div>
              {showQuyDoi && (
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Hệ số quy đổi
                    <span className="ml-1 text-slate-400">(1 {form.donViMua} = ? {selVT?.donVi||"đvị cơ bản"})</span>
                  </label>
                  <input type="number" min={0} step="0.01" value={form.quyDoi}
                    onChange={e=>setForm(f=>({...f,quyDoi:e.target.value}))}
                    className="w-full border border-indigo-200 bg-indigo-50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              )}
              {form.soLuong && form.donViMua && (showQuyDoi ? form.quyDoi : true) && (
                <div className="bg-slate-50 rounded-xl px-4 py-2.5 text-xs text-slate-600">
                  <strong>Ví dụ:</strong> 100 sản phẩm cần{" "}
                  <strong className="text-indigo-700">{form.soLuong} {form.donViMua}</strong>
                  {showQuyDoi && form.quyDoi ? ` = ${parseFloat(form.soLuong)*parseFloat(form.quyDoi)} ${selVT?.donVi||"đvị cơ bản"}` : ""}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                <input value={form.ghiChu} onChange={e=>setForm(f=>({...f,ghiChu:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={()=>setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving?"Đang lưu...":"Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
