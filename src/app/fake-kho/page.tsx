"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, X, Pencil, Trash2, RefreshCw, Package, AlertTriangle, CheckCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────
type FakeKhoRecord = {
  id: string;
  sku: string;
  tenSanPham: string | null;
  sanPhamId: string | null;
  size: string | null;
  ngayNhap: string;
  soLuongNhap: number;
  ngayRaHang: string | null;
  soLuongRa: number;
  ghiChu: string | null;
  createdAt: string;
};

type SanPhamOption = { id: string; sku: string; ten: string };

type FormState = {
  sku: string;
  tenSanPham: string;
  sanPhamId: string;
  size: string;
  ngayNhap: string;
  soLuongNhap: string;
  ngayRaHang: string;
  soLuongRa: string;
  ghiChu: string;
};

const EMPTY_FORM: FormState = {
  sku: "", tenSanPham: "", sanPhamId: "", size: "",
  ngayNhap: new Date().toISOString().slice(0, 10),
  soLuongNhap: "",
  ngayRaHang: "",
  soLuongRa: "0",
  ghiChu: "",
};

// ─── Helpers ──────────────────────────────────────────────
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export default function FakeKhoPage() {
  const [records, setRecords]   = useState<FakeKhoRecord[]>([]);
  const [skuOptions, setSkuOptions] = useState<SanPhamOption[]>([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState("");

  // Modal thêm/sửa
  const [modal, setModal]       = useState<"add" | "edit" | "release" | null>(null);
  const [editRecord, setEditRecord] = useState<FakeKhoRecord | null>(null);
  const [form, setForm]         = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);

  // Modal ghi nhận hàng ra
  const [releaseAmount, setReleaseAmount] = useState("");

  // ─── Fetch data ────────────────────────────────────────
  async function fetchAll() {
    setLoading(true);
    try {
      const [recs, sps] = await Promise.all([
        fetch("/api/fake-kho").then(r => r.json()),
        fetch("/api/kho/san-pham").then(r => r.json()),
      ]);
      if (Array.isArray(recs)) setRecords(recs);
      if (Array.isArray(sps))  setSkuOptions(sps);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  // ─── Khi chọn SKU từ dropdown → tự fill tên SP ────────
  function onPickSku(skuOrId: string) {
    const sp = skuOptions.find(s => s.sku === skuOrId || s.id === skuOrId);
    if (sp) {
      setForm(f => ({ ...f, sku: sp.sku, tenSanPham: sp.ten, sanPhamId: sp.id }));
    } else {
      setForm(f => ({ ...f, sku: skuOrId, tenSanPham: "", sanPhamId: "" }));
    }
  }

  // ─── Mở modal thêm ────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM);
    setEditRecord(null);
    setModal("add");
  }

  // ─── Mở modal sửa ─────────────────────────────────────
  function openEdit(r: FakeKhoRecord) {
    setEditRecord(r);
    setForm({
      sku:          r.sku,
      tenSanPham:   r.tenSanPham || "",
      sanPhamId:    r.sanPhamId  || "",
      size:         r.size       || "",
      ngayNhap:     r.ngayNhap.slice(0, 10),
      soLuongNhap:  String(r.soLuongNhap),
      ngayRaHang:   r.ngayRaHang ? r.ngayRaHang.slice(0, 10) : "",
      soLuongRa:    String(r.soLuongRa),
      ghiChu:       r.ghiChu || "",
    });
    setModal("edit");
  }

  // ─── Mở modal ghi nhận hàng ra ────────────────────────
  function openRelease(r: FakeKhoRecord) {
    setEditRecord(r);
    setReleaseAmount("");
    setModal("release");
  }

  // ─── Lưu thêm/sửa ─────────────────────────────────────
  async function handleSave() {
    if (!form.sku || !form.soLuongNhap || !form.ngayNhap) return;
    setSaving(true);
    try {
      const isEdit = modal === "edit" && editRecord;
      const url    = isEdit ? `/api/fake-kho/${editRecord.id}` : "/api/fake-kho";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { alert("Lỗi lưu dữ liệu"); return; }
      setModal(null);
      fetchAll();
    } finally {
      setSaving(false);
    }
  }

  // ─── Ghi nhận hàng ra ─────────────────────────────────
  async function handleRelease() {
    if (!editRecord || !releaseAmount) return;
    setSaving(true);
    try {
      const newSoLuongRa = editRecord.soLuongRa + (Number(releaseAmount) || 0);
      const res = await fetch(`/api/fake-kho/${editRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soLuongRa:  newSoLuongRa,
          ngayRaHang: new Date().toISOString().slice(0, 10),
        }),
      });
      if (!res.ok) { alert("Lỗi cập nhật"); return; }
      setModal(null);
      fetchAll();
    } finally {
      setSaving(false);
    }
  }

  // ─── Xóa ──────────────────────────────────────────────
  async function handleDelete(r: FakeKhoRecord) {
    if (!confirm(`Xóa record "${r.sku}"?`)) return;
    await fetch(`/api/fake-kho/${r.id}`, { method: "DELETE" });
    fetchAll();
  }

  // ─── Filter + summary ─────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(r =>
      r.sku.toLowerCase().includes(q) ||
      (r.tenSanPham || "").toLowerCase().includes(q)
    );
  }, [records, search]);

  const summary = useMemo(() => {
    const tongNhap = records.reduce((s, r) => s + r.soLuongNhap, 0);
    const tongRa   = records.reduce((s, r) => s + r.soLuongRa, 0);
    const tongNo   = tongNhap - tongRa;
    return { tongNhap, tongRa, tongNo };
  }, [records]);

  // ─── Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-amber-500" size={24} /> Fake Kho
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hàng nhập trước khi sản xuất xong — cho phép khách đặt trước
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAll} className="p-2 text-slate-400 hover:text-slate-700">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600"
          >
            <Plus size={15} /> Thêm nhập fake
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500 mb-1">Tổng nhập fake</p>
          <p className="text-2xl font-bold text-amber-600">{summary.tongNhap.toLocaleString("vi-VN")}</p>
          <p className="text-xs text-slate-400">sản phẩm</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500 mb-1">Đã ra hàng thực</p>
          <p className="text-2xl font-bold text-green-600">{summary.tongRa.toLocaleString("vi-VN")}</p>
          <p className="text-xs text-slate-400">sản phẩm</p>
        </div>
        <div className={`rounded-xl border p-4 ${summary.tongNo > 0 ? "bg-red-50 border-red-100" : "bg-white"}`}>
          <p className="text-xs text-slate-500 mb-1">Còn nợ khách</p>
          <p className={`text-2xl font-bold ${summary.tongNo > 0 ? "text-red-600" : "text-slate-700"}`}>
            {summary.tongNo.toLocaleString("vi-VN")}
          </p>
          <p className="text-xs text-slate-400">sản phẩm chưa có hàng</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo SKU hoặc tên sản phẩm..."
          className="w-full max-w-sm border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b">
            <tr>
              <th className="px-4 py-3 text-left">Mã SKU</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-center">Size</th>
              <th className="px-4 py-3 text-center">Ngày nhập</th>
              <th className="px-4 py-3 text-right">SL nhập</th>
              <th className="px-4 py-3 text-center">Ngày ra hàng</th>
              <th className="px-4 py-3 text-right">SL đã ra</th>
              <th className="px-4 py-3 text-right">SL nợ</th>
              <th className="px-4 py-3 text-left">Ghi chú</th>
              <th className="px-4 py-3 w-28"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400">Đang tải...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400">Chưa có dữ liệu</td></tr>
            )}
            {filtered.map(r => {
              const no = r.soLuongNhap - r.soLuongRa;
              const done = no <= 0;
              return (
                <tr key={r.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-semibold text-amber-700">{r.sku}</td>
                  <td className="px-4 py-3 text-slate-700">{r.tenSanPham || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-center">
                    {r.size ? (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">{r.size}</span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{fmtDate(r.ngayNhap)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{r.soLuongNhap.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {r.ngayRaHang ? fmtDate(r.ngayRaHang) : (
                      <span className="text-xs text-orange-400 bg-orange-50 px-2 py-0.5 rounded-full">Chưa ra</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 font-medium">{r.soLuongRa.toLocaleString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right">
                    {done ? (
                      <span className="flex items-center justify-end gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle2 size={13} /> Đủ hàng
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-1 text-red-600 font-bold">
                        <AlertTriangle size={13} /> {no.toLocaleString("vi-VN")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{r.ghiChu || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!done && (
                        <button
                          onClick={() => openRelease(r)}
                          className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-100 whitespace-nowrap"
                        >
                          Ra hàng
                        </button>
                      )}
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded hover:bg-blue-50">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(r)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ══ Modal Thêm / Sửa ══ */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h3 className="font-bold text-slate-800 text-lg">
                {modal === "add" ? "Thêm nhập fake kho" : "Sửa thông tin"}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* SKU Dropdown */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block font-medium">Mã SKU *</label>
                <select
                  value={form.sanPhamId || form.sku}
                  onChange={e => onPickSku(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                >
                  <option value="">-- Chọn SKU từ kho --</option>
                  {skuOptions.map(s => (
                    <option key={s.id} value={s.sku}>{s.sku} — {s.ten}</option>
                  ))}
                </select>
                <input
                  value={form.sku}
                  onChange={e => setForm(f => ({ ...f, sku: e.target.value, sanPhamId: "" }))}
                  placeholder="Hoặc nhập SKU thủ công..."
                  className="mt-1.5 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>

              {/* Tên SP + Size */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 mb-1 block">Tên sản phẩm</label>
                  <input
                    value={form.tenSanPham}
                    onChange={e => setForm(f => ({ ...f, tenSanPham: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Tự điền khi chọn SKU..."
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">Size</label>
                  <input
                    value={form.size}
                    onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="S, M, L, XL..."
                  />
                </div>
              </div>

              {/* Ngày nhập + SL nhập */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">📅 Ngày nhập *</label>
                  <input
                    type="date" value={form.ngayNhap}
                    onChange={e => setForm(f => ({ ...f, ngayNhap: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block font-medium">SL nhập *</label>
                  <input
                    type="number" min={0} value={form.soLuongNhap}
                    onChange={e => setForm(f => ({ ...f, soLuongNhap: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Ngày ra hàng + SL ra */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">🚀 Ngày ra hàng (dự kiến)</label>
                  <input
                    type="date" value={form.ngayRaHang}
                    onChange={e => setForm(f => ({ ...f, ngayRaHang: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">SL đã ra hàng</label>
                  <input
                    type="number" min={0} value={form.soLuongRa}
                    onChange={e => setForm(f => ({ ...f, soLuongRa: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Preview nợ */}
              {form.soLuongNhap && (
                <div className={`rounded-lg p-3 text-sm ${Number(form.soLuongNhap) - Number(form.soLuongRa) > 0 ? "bg-red-50" : "bg-green-50"}`}>
                  <span className="text-slate-600">Số lượng nợ: </span>
                  <span className={`font-bold ${Number(form.soLuongNhap) - Number(form.soLuongRa) > 0 ? "text-red-600" : "text-green-600"}`}>
                    {Math.max(0, Number(form.soLuongNhap) - Number(form.soLuongRa || 0))} SP
                  </span>
                </div>
              )}

              {/* Ghi chú */}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Ghi chú</label>
                <input
                  value={form.ghiChu}
                  onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Đặt trước đợt 1, giao tháng 7..."
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button
                onClick={handleSave}
                disabled={!form.sku || !form.soLuongNhap || !form.ngayNhap || saving}
                className="flex-1 bg-amber-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : modal === "add" ? "Thêm vào Fake Kho" : "Lưu chỉnh sửa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal Ghi nhận hàng ra ══ */}
      {modal === "release" && editRecord && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Ghi nhận hàng ra</h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 mb-4 text-sm space-y-1">
              <p className="font-semibold text-slate-800">{editRecord.sku}</p>
              {editRecord.tenSanPham && <p className="text-slate-500">{editRecord.tenSanPham}</p>}
              <div className="flex gap-4 pt-1">
                <span className="text-slate-600">Nhập fake: <b>{editRecord.soLuongNhap}</b></span>
                <span className="text-green-600">Đã ra: <b>{editRecord.soLuongRa}</b></span>
                <span className="text-red-600">Còn nợ: <b>{editRecord.soLuongNhap - editRecord.soLuongRa}</b></span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-1 block font-medium">Số lượng ra thêm lần này *</label>
              <input
                type="number" min={1}
                max={editRecord.soLuongNhap - editRecord.soLuongRa}
                value={releaseAmount}
                onChange={e => setReleaseAmount(e.target.value)}
                className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-sm bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-200"
                placeholder={`Tối đa ${editRecord.soLuongNhap - editRecord.soLuongRa}`}
              />
              {releaseAmount && (
                <p className="text-xs text-slate-500 mt-1">
                  Sau khi ra: còn nợ{" "}
                  <span className="font-semibold text-red-600">
                    {Math.max(0, editRecord.soLuongNhap - editRecord.soLuongRa - Number(releaseAmount))} SP
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600">Huỷ</button>
              <button
                onClick={handleRelease}
                disabled={!releaseAmount || Number(releaseAmount) <= 0 || saving}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Đang lưu..." : "Xác nhận ra hàng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
