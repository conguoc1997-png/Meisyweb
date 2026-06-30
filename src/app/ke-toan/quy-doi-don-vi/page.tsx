"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Pencil, X, Download, ArrowRight } from "lucide-react";
import * as XLSX from "xlsx";

type QuyDoi = {
  id: string;
  tuDonVi: string;
  veDonVi: string;
  heSo: number;
  ghiChu: string | null;
  createdAt: string;
};

const emptyForm = { tuDonVi: "", veDonVi: "", heSo: "1", ghiChu: "" };

export default function QuyDoiDonViPage() {
  const [items, setItems] = useState<QuyDoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const data = await fetch("/api/ke-toan/quy-doi-don-vi").then(r => r.json());
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = items.filter(it => {
    const s = search.toLowerCase();
    return !s || it.tuDonVi.toLowerCase().includes(s) || it.veDonVi.toLowerCase().includes(s) || (it.ghiChu || "").toLowerCase().includes(s);
  });

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModal(true);
  }

  function openEdit(it: QuyDoi) {
    setEditingId(it.id);
    setForm({ tuDonVi: it.tuDonVi, veDonVi: it.veDonVi, heSo: String(it.heSo), ghiChu: it.ghiChu || "" });
    setModal(true);
  }

  async function handleSave() {
    if (!form.tuDonVi.trim() || !form.veDonVi.trim()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/ke-toan/quy-doi-don-vi/${editingId}` : "/api/ke-toan/quy-doi-don-vi";
      const method = editingId ? "PATCH" : "POST";
      await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, heSo: Number(form.heSo) || 1 }),
      });
      setModal(false);
      fetchAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá dòng quy đổi này?")) return;
    await fetch(`/api/ke-toan/quy-doi-don-vi/${id}`, { method: "DELETE" });
    fetchAll();
  }

  function exportExcel() {
    const header = ["Đơn vị nguồn", "Đơn vị đích", "Hệ số", "Ghi chú (tên khác đối chiếu)"];
    const dataRows = filtered.map(it => [it.tuDonVi, it.veDonVi, it.heSo, it.ghiChu || ""]);
    const ws = XLSX.utils.aoa_to_sheet([["Bảng quy đổi đơn vị"], [], header, ...dataRows]);
    ws["!cols"] = [{ wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 30 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quy doi");
    XLSX.writeFile(wb, `bang-quy-doi-don-vi-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bảng Quy Đổi Đơn Vị</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quy đổi đơn vị mua ↔ đơn vị cơ bản — kèm ghi chú tên khác để kế toán đối chiếu khớp tên</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportExcel} disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Download size={15} /> Xuất Excel
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Thêm quy đổi
          </button>
        </div>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Tìm đơn vị, ghi chú..."
        className="w-64 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Quy đổi</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Hệ số</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Ghi chú (tên khác đối chiếu)</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="text-center py-12 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center py-12 text-slate-400">Chưa có quy đổi nào — bấm &quot;Thêm quy đổi&quot;</td></tr>
            )}
            {filtered.map(it => (
              <tr key={it.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <span className="font-medium text-slate-800">{it.tuDonVi}</span>
                  <ArrowRight size={12} className="inline mx-1.5 text-slate-300" />
                  <span className="text-slate-600">{it.veDonVi}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-700">{it.heSo}</td>
                <td className="px-4 py-2.5 text-slate-500 italic">{it.ghiChu || "—"}</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(it)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(it.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 shadow-xl w-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{editingId ? "Sửa quy đổi" : "Thêm quy đổi"}</h3>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Đơn vị nguồn *</label>
                  <input value={form.tuDonVi} onChange={e => setForm(f => ({ ...f, tuDonVi: e.target.value }))}
                    placeholder="VD: cuộn" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Đơn vị đích *</label>
                  <input value={form.veDonVi} onChange={e => setForm(f => ({ ...f, veDonVi: e.target.value }))}
                    placeholder="VD: m" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Hệ số (1 đơn vị nguồn = ? đơn vị đích)</label>
                <input type="number" min="0" step="0.01" value={form.heSo} onChange={e => setForm(f => ({ ...f, heSo: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú (tên khác để đối chiếu)</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  placeholder="VD: NCC ghi là 'thớt vải' = cuộn..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setModal(false)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
              <button onClick={handleSave} disabled={saving || !form.tuDonVi.trim() || !form.veDonVi.trim()}
                className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Đang lưu..." : editingId ? "Lưu" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
