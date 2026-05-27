"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X, Trash2, Eye, ArrowDownFromLine } from "lucide-react";

type VatTu = { id: string; ma: string; ten: string; donVi: string; nhom: string | null; loai: string };
type DinhMuc = { id: string; hangCat: string; soLuong: number; vatTu: VatTu };
type XuatRow = { vatTuId: string; vatTu?: VatTu; soLuong: number; donGia: number; ghiChu: string; tuDinhMuc?: boolean };
type LoCat = { id: string; hangCat: string; soSanPham: number | null; hangThucTe: number | null; ngay: string };
type PhieuXuat = {
  id: string; soPhieu: string; ngay: string; hangCat: string | null; soSanPham: number;
  lyDo: string; ghiChu: string | null; loCatId: string | null;
  chiTiet: (XuatRow & { id: string; thanhTien: number })[];
  createdAt: string;
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");

function genSoPhieu(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `XK${y}${m}${d}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;
}

export default function XuatKhoPage() {
  const [phieus, setPhieus]     = useState<PhieuXuat[]>([]);
  const [vatTus, setVatTus]     = useState<VatTu[]>([]);
  const [dinhMucs, setDinhMucs] = useState<DinhMuc[]>([]);
  const [loCats, setLoCats]     = useState<LoCat[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState<"create" | "view" | null>(null);
  const [selected, setSelected] = useState<PhieuXuat | null>(null);

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
  const [rows, setRows]   = useState<XuatRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [vtSearch, setVtSearch] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [p, v, d, l] = await Promise.all([
      fetch("/api/ke-toan/xuat-kho").then(r => r.json()),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()),
      fetch("/api/ke-toan/dinh-muc").then(r => r.json()),
      fetch("/api/san-xuat/lo-cat?limit=200").then(r => r.json()).catch(() => []),
    ]);
    setPhieus(Array.isArray(p) ? p : []);
    setVatTus(Array.isArray(v) ? v : []);
    setDinhMucs(Array.isArray(d) ? d : []);
    setLoCats(Array.isArray(l) ? l : (Array.isArray(l?.data) ? l.data : []));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => phieus.filter(p => {
    const s = search.toLowerCase();
    return !s || p.soPhieu.toLowerCase().includes(s) || (p.hangCat || "").toLowerCase().includes(s);
  }), [phieus, search]);

  // Khi chọn lô cắt → auto fill hangCat, soSanPham
  function onSelectLo(loCatId: string) {
    const lo = loCats.find(l => l.id === loCatId);
    if (!lo) { setForm(f => ({ ...f, loCatId: "" })); return; }
    const sp = lo.hangThucTe ?? lo.soSanPham ?? 0;
    setForm(f => ({ ...f, loCatId, hangCat: lo.hangCat, soSanPham: String(sp) }));
    autoFillDinhMuc(lo.hangCat, sp);
  }

  function autoFillDinhMuc(hangCat: string, soSanPham: number) {
    const dmRows = dinhMucs.filter(d => d.hangCat === hangCat);
    if (dmRows.length === 0) return;
    const newRows: XuatRow[] = dmRows.map(d => ({
      vatTuId: d.vatTu.id,
      vatTu: d.vatTu,
      soLuong: Math.round(d.soLuong * soSanPham / 100 * 100) / 100,
      donGia: 0,
      ghiChu: `Định mức: ${d.soLuong}/${100}sp`,
      tuDinhMuc: true,
    }));
    setRows(newRows);
    setVtSearch(newRows.map(() => ""));
  }

  // Khi nhập soSanPham → recalculate
  function onChangeSoSanPham(val: string) {
    setForm(f => ({ ...f, soSanPham: val }));
    const sp = parseFloat(val) || 0;
    if (form.hangCat && sp > 0) {
      autoFillDinhMuc(form.hangCat, sp);
    }
  }

  function addRow() {
    setRows(prev => [...prev, { vatTuId: "", soLuong: 0, donGia: 0, ghiChu: "" }]);
    setVtSearch(prev => [...prev, ""]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
    setVtSearch(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, patch: Partial<XuatRow>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  async function handleCreate() {
    const validRows = rows.filter(r => r.vatTuId && r.soLuong > 0);
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
    setRows([]);
    setVtSearch([]);
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá phiếu này? Sẽ hoàn ngược tồn kho.")) return;
    await fetch(`/api/ke-toan/xuat-kho/${id}`, { method: "DELETE" });
    fetchAll();
  }

  const tongTienForm = rows.reduce((s, r) => s + r.soLuong * r.donGia, 0);
  const tongTienStats = useMemo(() => filtered.reduce((s, p) => s + p.chiTiet.reduce((a, c) => a + c.thanhTien, 0), 0), [filtered]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Xuất Kho NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">Xuất nguyên phụ liệu theo lô cắt — tự tính từ định mức, có thể chỉnh tay</p>
        </div>
        <button onClick={() => { setModal("create"); resetForm(); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Tạo phiếu xuất
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Số phiếu xuất</p>
          <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Giá trị NPL đã xuất</p>
          <p className="text-2xl font-bold text-indigo-700">{fmt(tongTienStats)}₫</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Loại hàng</p>
          <p className="text-2xl font-bold text-teal-700">{new Set(filtered.map(p => p.hangCat).filter(Boolean)).size}</p>
        </div>
      </div>

      {/* Filters */}
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
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-mono text-indigo-700 font-medium">{p.soPhieu}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(p.ngay)}</td>
                <td className="px-4 py-3">
                  {p.hangCat && <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">{p.hangCat}</span>}
                </td>
                <td className="px-4 py-3 text-right text-slate-700">{p.soSanPham > 0 ? fmt(p.soSanPham) : "—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {fmt(p.chiTiet.reduce((s, c) => s + c.thanhTien, 0))}₫
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{p.ghiChu || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(p); setModal("view"); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Tạo phiếu xuất kho NPL</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Header */}
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
                  <label className="text-xs font-medium text-slate-500 block mb-1">Lý do</label>
                  <select value={form.lyDo} onChange={e => setForm(f => ({ ...f, lyDo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="san_xuat">Sản xuất</option>
                    <option value="dieu_chinh">Điều chỉnh</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                {/* Chọn lô cắt */}
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Lô cắt <span className="text-indigo-400">(tự điền định mức)</span>
                  </label>
                  <select value={form.loCatId} onChange={e => onSelectLo(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="">— Chọn lô cắt —</option>
                    {loCats.map(l => (
                      <option key={l.id} value={l.id}>
                        {fmtDate(l.ngay)} · {l.hangCat} · {l.hangThucTe ?? l.soSanPham ?? "?"} sp
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Loại hàng</label>
                  <input value={form.hangCat} onChange={e => setForm(f => ({ ...f, hangCat: e.target.value }))}
                    placeholder="VD: Áo sơ mi"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">
                    Số sản phẩm
                    {form.hangCat && dinhMucs.some(d => d.hangCat === form.hangCat) && (
                      <button onClick={() => autoFillDinhMuc(form.hangCat, parseFloat(form.soSanPham) || 0)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700 font-medium inline-flex items-center gap-0.5">
                        <ArrowDownFromLine size={10} /> Tính lại
                      </button>
                    )}
                  </label>
                  <input type="number" min={0} value={form.soSanPham}
                    onChange={e => onChangeSoSanPham(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Người tạo</label>
                  <input value={form.nguoiTao} onChange={e => setForm(f => ({ ...f, nguoiTao: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                  <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>

              {/* Chi tiết NPL */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-700">Chi tiết NPL xuất kho</h3>
                    {rows.some(r => r.tuDinhMuc) && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">Đã điền từ định mức</span>
                    )}
                  </div>
                  <button onClick={addRow} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Thêm dòng
                  </button>
                </div>

                {rows.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                    Chọn lô cắt để tự điền định mức, hoặc thêm dòng thủ công
                  </div>
                )}

                {rows.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-64">Vật tư</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 w-28">Số lượng</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-16">ĐV</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 w-28">Giá vốn</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 w-28">Thành tiền</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ghi chú</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const selVT = vatTus.find(v => v.id === row.vatTuId) || row.vatTu;
                        const filtVTs = vatTus.filter(v => {
                          const q = (vtSearch[i] || "").toLowerCase();
                          return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
                        });
                        return (
                          <tr key={i} className={`border-t border-slate-100 ${row.tuDinhMuc ? "bg-indigo-50/30" : ""}`}>
                            <td className="px-3 py-1.5">
                              <div className="relative">
                                <input
                                  value={vtSearch[i] || (selVT ? `${selVT.ma} – ${selVT.ten}` : "")}
                                  onChange={e => {
                                    const ns = [...vtSearch]; ns[i] = e.target.value; setVtSearch(ns);
                                    if (!e.target.value) updateRow(i, { vatTuId: "", vatTu: undefined });
                                  }}
                                  placeholder="Tìm vật tư..."
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                />
                                {vtSearch[i] && filtVTs.length > 0 && (
                                  <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                                    {filtVTs.map(v => (
                                      <button key={v.id}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2"
                                        onClick={() => {
                                          updateRow(i, { vatTuId: v.id, vatTu: v });
                                          const ns = [...vtSearch]; ns[i] = ""; setVtSearch(ns);
                                        }}>
                                        <span className="font-mono text-slate-400 shrink-0">{v.ma}</span>
                                        <span>{v.ten}</span>
                                        <span className="text-slate-400 ml-auto shrink-0">{v.donVi}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5">
                              <input type="number" min={0} step="0.01" value={row.soLuong || ""}
                                onChange={e => updateRow(i, { soLuong: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-3 py-1.5 text-xs text-slate-500">{selVT?.donVi || "—"}</td>
                            <td className="px-3 py-1.5">
                              <input type="number" min={0} value={row.donGia || ""}
                                onChange={e => updateRow(i, { donGia: parseFloat(e.target.value) || 0 })}
                                placeholder="Giá vốn"
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-3 py-1.5 text-right text-xs font-semibold text-slate-700">
                              {fmt(row.soLuong * row.donGia)}₫
                            </td>
                            <td className="px-3 py-1.5">
                              <input value={row.ghiChu} onChange={e => updateRow(i, { ghiChu: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-2 py-1.5">
                              <button onClick={() => removeRow(i)} className="p-1 text-slate-300 hover:text-red-500">
                                <X size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={4} className="px-3 py-2 text-xs font-semibold text-slate-600 text-right">Tổng:</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">{fmt(tongTienForm)}₫</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Đang lưu..." : "Xuất kho"}
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
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 py-2 text-xs font-medium text-slate-500">Vật tư</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Số lượng</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Giá vốn</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.chiTiet.map((r, i) => (
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-700">{r.vatTu?.ten || r.vatTuId}</p>
                        {r.vatTu && <p className="text-[10px] text-slate-400">{r.vatTu.ma} · {r.vatTu.donVi}</p>}
                      </td>
                      <td className="px-3 py-2 text-right">{fmt(r.soLuong)} <span className="text-slate-400 text-xs">{r.vatTu?.donVi}</span></td>
                      <td className="px-3 py-2 text-right text-xs">{r.donGia > 0 ? `${fmt(r.donGia)}₫` : "—"}</td>
                      <td className="px-3 py-2 text-right font-semibold">{r.thanhTien > 0 ? `${fmt(r.thanhTien)}₫` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-3 py-2 text-right font-bold text-slate-700">Tổng:</td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-700">
                      {fmt(selected.chiTiet.reduce((s, c) => s + c.thanhTien, 0))}₫
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
