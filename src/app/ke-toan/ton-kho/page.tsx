"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, X, Pencil, PackageCheck } from "lucide-react";

type TonKho = {
  id: string;
  vatTuId: string;
  soLuong: number;
  giaTrungBinh: number;
  giaTriTon: number;
  updatedAt: string;
  vatTu: {
    id: string; ma: string; ten: string; loai: string;
    nhom: string | null; donVi: string; ghiChu: string | null;
  };
};

type VatTuForm = {
  ma: string; ten: string; loai: string; nhom: string; donVi: string; ghiChu: string;
};

const LOAI_OPTIONS = [
  { value: "vai",      label: "Vải" },
  { value: "phu_lieu", label: "Phụ liệu" },
];

const NHOM_OPTIONS: Record<string, string[]> = {
  vai:      ["vai_cotton", "vai_thun", "vai_lua", "khac"],
  phu_lieu: ["chi", "cuc", "khoa_keo", "lot", "dinh_tan", "mex", "nhan", "dong_goi", "khac"],
};

const NHOM_LABEL: Record<string, string> = {
  vai_cotton: "Vải cotton",
  vai_thun:   "Vải thun",
  vai_lua:    "Vải lụa",
  chi:        "Chỉ",
  cuc:        "Cúc",
  khoa_keo:   "Khóa / Kéo",
  lot:        "Lót",
  dinh_tan:   "Đinh tán",
  mex:        "Mex",
  nhan:       "Nhãn",
  dong_goi:   "Đóng gói",
  khac:       "Khác",
};

const DON_VI_OPTIONS = ["m", "yard", "kg", "cai", "cuon", "thuong", "bo", "met"];

const fmt = (n: number) => n.toLocaleString("vi-VN");

export default function TonKhoPage() {
  const [items, setItems]         = useState<TonKho[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterNhom, setFilterNhom] = useState("");

  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<TonKho | null>(null);
  const [form, setForm]           = useState<VatTuForm>({ ma: "", ten: "", loai: "vai", nhom: "", donVi: "m", ghiChu: "" });
  const [saving, setSaving]       = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/ke-toan/ton-kho");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => items.filter(t => {
    const s = search.toLowerCase();
    const matchS = !s || t.vatTu.ten.toLowerCase().includes(s) || t.vatTu.ma.toLowerCase().includes(s);
    const matchL = !filterLoai || t.vatTu.loai === filterLoai;
    const matchN = !filterNhom || t.vatTu.nhom === filterNhom;
    return matchS && matchL && matchN;
  }), [items, search, filterLoai, filterNhom]);

  const stats = useMemo(() => ({
    total: filtered.length,
    giaTriTon: filtered.reduce((s, t) => s + t.giaTriTon, 0),
    soVai: filtered.filter(t => t.vatTu.loai === "vai").length,
    soPhuLieu: filtered.filter(t => t.vatTu.loai === "phu_lieu").length,
  }), [filtered]);

  const allNhom = useMemo(() => {
    const s = new Set(items.map(t => t.vatTu.nhom).filter(Boolean) as string[]);
    return [...s].sort();
  }, [items]);

  function openCreate() {
    setForm({ ma: "", ten: "", loai: "vai", nhom: "", donVi: "m", ghiChu: "" });
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(t: TonKho) {
    setForm({ ma: t.vatTu.ma, ten: t.vatTu.ten, loai: t.vatTu.loai, nhom: t.vatTu.nhom || "", donVi: t.vatTu.donVi, ghiChu: t.vatTu.ghiChu || "" });
    setEditTarget(t);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.ma || !form.ten) return;
    setSaving(true);
    if (modal === "create") {
      await fetch("/api/ke-toan/vat-tu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nhom: form.nhom || null, ghiChu: form.ghiChu || null }),
      });
    } else if (modal === "edit" && editTarget) {
      await fetch(`/api/ke-toan/vat-tu/${editTarget.vatTuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nhom: form.nhom || null, ghiChu: form.ghiChu || null }),
      });
    }
    setSaving(false);
    setModal(null);
    fetchAll();
  }

  const nhomOptions = NHOM_OPTIONS[form.loai] || [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tồn Kho Nguyên Phụ Liệu</h1>
          <p className="text-sm text-slate-500 mt-0.5">Báo cáo tồn kho theo giá vốn bình quân gia quyền</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Thêm vật tư
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tổng mặt hàng", value: stats.total, color: "text-slate-800" },
          { label: "Giá trị tồn kho", value: `${fmt(stats.giaTriTon)}₫`, color: "text-indigo-700" },
          { label: "Mặt hàng vải", value: stats.soVai, color: "text-teal-700" },
          { label: "Phụ liệu", value: stats.soPhuLieu, color: "text-orange-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã, tên vật tư..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={filterLoai} onChange={e => { setFilterLoai(e.target.value); setFilterNhom(""); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả loại</option>
          {LOAI_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        {allNhom.length > 0 && (
          <select value={filterNhom} onChange={e => setFilterNhom(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">Tất cả nhóm</option>
            {allNhom.map(n => <option key={n} value={n}>{NHOM_LABEL[n] ?? n}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Mã</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Tên vật tư</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Loại / Nhóm</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Tồn kho</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Đơn vị</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Giá TB</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Giá trị tồn</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-12 text-slate-400">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400 space-y-2">
                <PackageCheck size={32} className="mx-auto text-slate-300" />
                <p>Chưa có dữ liệu tồn kho</p>
              </td></tr>
            )}
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.vatTu.ma}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.vatTu.ten}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.vatTu.loai === "vai" ? "bg-teal-100 text-teal-700" : "bg-orange-100 text-orange-700"}`}>
                    {LOAI_OPTIONS.find(l => l.value === t.vatTu.loai)?.label}
                  </span>
                  {t.vatTu.nhom && <span className="ml-1.5 text-xs text-slate-400">{NHOM_LABEL[t.vatTu.nhom] ?? t.vatTu.nhom}</span>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(t.soLuong)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{t.vatTu.donVi}</td>
                <td className="px-4 py-3 text-right text-slate-600">{fmt(Math.round(t.giaTrungBinh))}₫</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(Math.round(t.giaTriTon))}₫</td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={6} className="px-4 py-3 font-semibold text-slate-700 text-right">Tổng giá trị tồn kho:</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700 text-base">{fmt(Math.round(stats.giaTriTon))}₫</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MODAL Thêm / Sửa vật tư */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">{modal === "create" ? "Thêm vật tư" : "Sửa vật tư"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Mã vật tư *</label>
                  <input value={form.ma} onChange={e => setForm(f => ({ ...f, ma: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Đơn vị</label>
                  <select value={form.donVi} onChange={e => setForm(f => ({ ...f, donVi: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {DON_VI_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tên vật tư *</label>
                <input value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Loại</label>
                  <select value={form.loai} onChange={e => setForm(f => ({ ...f, loai: e.target.value, nhom: "" }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {LOAI_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nhóm</label>
                  <select value={form.nhom} onChange={e => setForm(f => ({ ...f, nhom: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">— Chọn nhóm —</option>
                    {nhomOptions.map(n => <option key={n} value={n}>{NHOM_LABEL[n] ?? n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
