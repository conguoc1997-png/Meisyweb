"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X, ChevronDown, Trash2, Eye, CheckCircle, Clock, AlertCircle } from "lucide-react";

type VatTu = {
  id: string; ma: string; ten: string; loai: string; nhom: string | null; donVi: string;
  tonKho?: { soLuong: number; giaTrungBinh: number };
};

type ChiTiet = {
  id?: string; vatTuId: string; vatTu?: VatTu;
  soLuong: number; donGia: number; thanhTien: number; ghiChu: string;
};

type PhieuNhap = {
  id: string; soPhieu: string; ngay: string; nhaCC: string; tenNhaCC: string | null;
  soHoaDon: string | null; ngayHoaDon: string | null; tongTien: number;
  trangThai: string; ghiChu: string | null; nguoiTao: string | null;
  chiTiet: ChiTiet[];
  createdAt: string;
};

const NHA_CC = [
  { value: "hac_long", label: "Hắc Long" },
  { value: "an_huy",   label: "An Huy" },
  { value: "viet_hoa", label: "Việt Hoa" },
  { value: "khac",     label: "Khác" },
];

const TRANG_THAI_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  chua_thanh_toan:    { label: "Chưa TT",    color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
  thanh_toan_1_phan:  { label: "TT 1 phần",  color: "bg-blue-100 text-blue-700",    icon: <AlertCircle size={12} /> },
  da_thanh_toan:      { label: "Đã TT",       color: "bg-green-100 text-green-700",  icon: <CheckCircle size={12} /> },
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");

function genSoPhieu(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const r = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `NK${y}${m}${d}-${r}`;
}

export default function NhapKhoPage() {
  const [phieus, setPhieus]   = useState<PhieuNhap[]>([]);
  const [vatTus, setVatTus]   = useState<VatTu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterNhaCC, setFilterNhaCC] = useState("");

  // Modal state
  const [modal, setModal] = useState<"create" | "view" | null>(null);
  const [selected, setSelected] = useState<PhieuNhap | null>(null);

  // Form state
  const [form, setForm] = useState({
    soPhieu: genSoPhieu(),
    ngay: new Date().toISOString().slice(0, 10),
    nhaCC: "hac_long",
    tenNhaCC: "",
    soHoaDon: "",
    ngayHoaDon: "",
    ghiChu: "",
    nguoiTao: "",
  });
  const [chiTiet, setChiTiet] = useState<ChiTiet[]>([
    { vatTuId: "", soLuong: 0, donGia: 0, thanhTien: 0, ghiChu: "" }
  ]);
  const [saving, setSaving] = useState(false);
  const [vatTuSearch, setVatTuSearch] = useState<string[]>([""]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [p, v] = await Promise.all([
      fetch("/api/ke-toan/nhap-kho").then(r => r.json()),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()),
    ]);
    setPhieus(Array.isArray(p) ? p : []);
    setVatTus(Array.isArray(v) ? v : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => phieus.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !s || p.soPhieu.toLowerCase().includes(s) ||
      (p.soHoaDon || "").toLowerCase().includes(s) ||
      NHA_CC.find(n => n.value === p.nhaCC)?.label.toLowerCase().includes(s);
    const matchNhaCC = !filterNhaCC || p.nhaCC === filterNhaCC;
    return matchSearch && matchNhaCC;
  }), [phieus, search, filterNhaCC]);

  const tongTienChiTiet = chiTiet.reduce((s, r) => s + r.soLuong * r.donGia, 0);

  function addRow() {
    setChiTiet(prev => [...prev, { vatTuId: "", soLuong: 0, donGia: 0, thanhTien: 0, ghiChu: "" }]);
    setVatTuSearch(prev => [...prev, ""]);
  }

  function removeRow(i: number) {
    setChiTiet(prev => prev.filter((_, idx) => idx !== i));
    setVatTuSearch(prev => prev.filter((_, idx) => idx !== i));
  }

  function updateRow(i: number, field: keyof ChiTiet, value: string | number) {
    setChiTiet(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      const updated = { ...r, [field]: value };
      updated.thanhTien = updated.soLuong * updated.donGia;
      return updated;
    }));
  }

  async function handleCreate() {
    if (!form.soPhieu || !form.ngay || !form.nhaCC) return;
    const validRows = chiTiet.filter(r => r.vatTuId && r.soLuong > 0 && r.donGia > 0);
    if (validRows.length === 0) return;
    setSaving(true);
    const res = await fetch("/api/ke-toan/nhap-kho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, chiTiet: validRows }),
    });
    setSaving(false);
    if (res.ok) {
      setModal(null);
      setForm({ soPhieu: genSoPhieu(), ngay: new Date().toISOString().slice(0, 10), nhaCC: "hac_long", tenNhaCC: "", soHoaDon: "", ngayHoaDon: "", ghiChu: "", nguoiTao: "" });
      setChiTiet([{ vatTuId: "", soLuong: 0, donGia: 0, thanhTien: 0, ghiChu: "" }]);
      setVatTuSearch([""]);
      fetchAll();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xoá phiếu này? Sẽ hoàn ngược tồn kho.")) return;
    await fetch(`/api/ke-toan/nhap-kho/${id}`, { method: "DELETE" });
    fetchAll();
  }

  async function handlePatchTrangThai(id: string, trangThai: string) {
    await fetch(`/api/ke-toan/nhap-kho/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai }),
    });
    fetchAll();
    if (selected) setSelected(prev => prev ? { ...prev, trangThai } : prev);
  }

  const totalStats = useMemo(() => ({
    soPhieu: filtered.length,
    tongTien: filtered.reduce((s, p) => s + p.tongTien, 0),
    chuaTT: filtered.filter(p => p.trangThai === "chua_thanh_toan").reduce((s, p) => s + p.tongTien, 0),
  }), [filtered]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phiếu Nhập Kho NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý nhập kho nguyên phụ liệu — tự động cập nhật tồn kho & công nợ</p>
        </div>
        <button
          onClick={() => { setModal("create"); setForm(f => ({ ...f, soPhieu: genSoPhieu() })); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Tạo phiếu nhập
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Số phiếu", value: totalStats.soPhieu, color: "text-slate-800", sub: "" },
          { label: "Tổng tiền hàng", value: fmt(totalStats.tongTien), color: "text-indigo-700", sub: "₫" },
          { label: "Chưa thanh toán", value: fmt(totalStats.chuaTT), color: "text-red-600", sub: "₫" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}{s.sub && <span className="text-sm font-normal ml-1">{s.sub}</span>}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm số phiếu, hoá đơn..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
        <select value={filterNhaCC} onChange={e => setFilterNhaCC(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả NCC</option>
          {NHA_CC.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-4 py-3 font-semibold text-slate-600">Số phiếu</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Ngày</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Nhà CC</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Số HĐ</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Tổng tiền</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chưa có phiếu nhập nào</td></tr>
            )}
            {filtered.map(p => {
              const tt = TRANG_THAI_MAP[p.trangThai] || TRANG_THAI_MAP.chua_thanh_toan;
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-indigo-700 font-medium">{p.soPhieu}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.ngay)}</td>
                  <td className="px-4 py-3 text-slate-700">{NHA_CC.find(n => n.value === p.nhaCC)?.label || p.nhaCC}</td>
                  <td className="px-4 py-3 text-slate-500">{p.soHoaDon || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(p.tongTien)}₫</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tt.color}`}>
                      {tt.icon} {tt.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {modal === "create" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Tạo phiếu nhập kho</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Header fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số phiếu *</label>
                  <input value={form.soPhieu} onChange={e => setForm(f => ({ ...f, soPhieu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày nhập *</label>
                  <input type="date" value={form.ngay} onChange={e => setForm(f => ({ ...f, ngay: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nhà cung cấp *</label>
                  <select value={form.nhaCC} onChange={e => setForm(f => ({ ...f, nhaCC: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {NHA_CC.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
                {form.nhaCC === "khac" && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Tên NCC</label>
                    <input value={form.tenNhaCC} onChange={e => setForm(f => ({ ...f, tenNhaCC: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số hoá đơn</label>
                  <input value={form.soHoaDon} onChange={e => setForm(f => ({ ...f, soHoaDon: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày HĐ</label>
                  <input type="date" value={form.ngayHoaDon} onChange={e => setForm(f => ({ ...f, ngayHoaDon: e.target.value }))}
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

              {/* Chi tiết */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Chi tiết hàng hoá</h3>
                  <button onClick={addRow} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Thêm dòng
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-3 py-2 text-xs font-medium text-slate-500 w-72">Vật tư</th>
                        <th className="px-3 py-2 text-xs font-medium text-slate-500 w-24">Số lượng</th>
                        <th className="px-3 py-2 text-xs font-medium text-slate-500 w-28">Đơn giá</th>
                        <th className="px-3 py-2 text-xs font-medium text-slate-500 w-28 text-right">Thành tiền</th>
                        <th className="px-3 py-2 text-xs font-medium text-slate-500">Ghi chú</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {chiTiet.map((row, i) => {
                        const selectedVT = vatTus.find(v => v.id === row.vatTuId);
                        const filteredVTs = vatTus.filter(v => {
                          const q = (vatTuSearch[i] || "").toLowerCase();
                          return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
                        });
                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-3 py-1.5">
                              <div className="relative">
                                <input
                                  value={vatTuSearch[i] || (selectedVT ? `${selectedVT.ma} - ${selectedVT.ten}` : "")}
                                  onChange={e => {
                                    const newSearch = [...vatTuSearch]; newSearch[i] = e.target.value;
                                    setVatTuSearch(newSearch);
                                    if (!e.target.value) updateRow(i, "vatTuId", "");
                                  }}
                                  placeholder="Tìm vật tư..."
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"
                                />
                                {vatTuSearch[i] && filteredVTs.length > 0 && (
                                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                    {filteredVTs.map(v => (
                                      <button key={v.id} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center gap-2"
                                        onClick={() => {
                                          updateRow(i, "vatTuId", v.id);
                                          const ns = [...vatTuSearch]; ns[i] = "";
                                          setVatTuSearch(ns);
                                        }}>
                                        <span className="font-mono text-slate-400">{v.ma}</span>
                                        <span className="text-slate-700">{v.ten}</span>
                                        <span className="text-slate-400 ml-auto">{v.donVi}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {selectedVT && !vatTuSearch[i] && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedVT.donVi} · {selectedVT.nhom || selectedVT.loai}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5">
                              <input type="number" min={0} value={row.soLuong || ""}
                                onChange={e => updateRow(i, "soLuong", parseFloat(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-3 py-1.5">
                              <input type="number" min={0} value={row.donGia || ""}
                                onChange={e => updateRow(i, "donGia", parseFloat(e.target.value) || 0)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-3 py-1.5 text-right font-medium text-slate-700 text-xs">
                              {fmt(row.soLuong * row.donGia)}₫
                            </td>
                            <td className="px-3 py-1.5">
                              <input value={row.ghiChu} onChange={e => updateRow(i, "ghiChu", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>
                            <td className="px-3 py-1.5">
                              {chiTiet.length > 1 && (
                                <button onClick={() => removeRow(i)} className="p-1 text-slate-400 hover:text-red-500">
                                  <X size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={3} className="px-3 py-2 text-xs font-semibold text-slate-600 text-right">Tổng cộng:</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">{fmt(tongTienChiTiet)}₫</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Huỷ
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu phiếu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-mono">{selected.soPhieu}</h2>
                <p className="text-xs text-slate-400">{NHA_CC.find(n => n.value === selected.nhaCC)?.label} · {fmtDate(selected.ngay)}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Dropdown trạng thái */}
                <div className="relative group">
                  <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${TRANG_THAI_MAP[selected.trangThai]?.color || ""}`}>
                    {TRANG_THAI_MAP[selected.trangThai]?.label}
                    <ChevronDown size={12} />
                  </button>
                  <div className="hidden group-hover:block absolute right-0 top-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 w-40 py-1">
                    {Object.entries(TRANG_THAI_MAP).map(([k, v]) => (
                      <button key={k} onClick={() => handlePatchTrangThai(selected.id, k)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-full ${v.color} flex items-center gap-1`}>{v.icon} {v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-slate-400 text-xs">Số HĐ</span><p className="font-medium">{selected.soHoaDon || "—"}</p></div>
                <div><span className="text-slate-400 text-xs">Ngày HĐ</span><p className="font-medium">{selected.ngayHoaDon ? fmtDate(selected.ngayHoaDon) : "—"}</p></div>
                <div><span className="text-slate-400 text-xs">Người tạo</span><p className="font-medium">{selected.nguoiTao || "—"}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 py-2 text-xs font-medium text-slate-500">Vật tư</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">SL</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Đơn giá</th>
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
                      <td className="px-3 py-2 text-right">{r.soLuong}</td>
                      <td className="px-3 py-2 text-right">{fmt(r.donGia)}₫</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(r.thanhTien)}₫</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={3} className="px-3 py-2 text-right font-bold text-slate-700">Tổng cộng:</td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-700 text-base">{fmt(selected.tongTien)}₫</td>
                  </tr>
                </tfoot>
              </table>
              {selected.ghiChu && <p className="text-sm text-slate-500 italic">{selected.ghiChu}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
