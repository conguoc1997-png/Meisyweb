"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X, ChevronDown, Trash2, Eye, Pencil, CheckCircle, Clock, AlertCircle } from "lucide-react";

type VatTu = {
  id: string; ma: string; ten: string; loai: string; nhom: string | null; donVi: string;
  tonKho?: { soLuong: number; giaTrungBinh: number };
};

type NhaCungCapDB = {
  id: string; ma: string; ten: string; sdt?: string | null; diaChi?: string | null;
};

type QuyDoiRecord = {
  id: string; tuDonVi: string; veDonVi: string; heSo: number; ghiChu?: string | null;
};

type ChiTiet = {
  id?: string; vatTuId: string; vatTu?: VatTu;
  soLuongMua: number; donViMua: string; quyDoi: number;
  soLuong: number; donViQuyDoi: string; // đơn vị sau quy đổi (m, cái, chiếc...)
  donGia: number; thanhTien: number; vat: number; ghiChu: string;
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

// ĐV mua cho VẢI (có quy đổi sang mét)
const DON_VI_VAI = [
  { value: "m",   label: "Mét (m)", showQuyDoi: false, placeholder: "" },
  { value: "cay", label: "Cây",     showQuyDoi: true,  placeholder: "m/cây" },
  { value: "kg",  label: "KG",      showQuyDoi: true,  placeholder: "m/kg" },
];

// ĐV mua cho PHỤ LIỆU (không cần quy đổi)
const DON_VI_PHU_LIEU = [
  { value: "cai",    label: "Cái" },
  { value: "cuon",   label: "Cuộn" },
  { value: "kg",     label: "KG" },
  { value: "goi",    label: "Gói" },
  { value: "hop",    label: "Hộp" },
  { value: "bo",     label: "Bộ" },
  { value: "thuong", label: "Thương" },
  { value: "m",      label: "Mét (m)" },
];

// Map donVi của vật tư sang donViMua mặc định
const DON_VI_DEFAULT: Record<string, string> = {
  m: "m", cay: "cay", kg: "kg",
  cai: "cai", cuon: "cuon", thuong: "thuong", bo: "bo", met: "m",
};

const DEFAULT_QUY_DOI: Record<string, number> = { m: 1, cay: 50, kg: 1.5 };

// Map giá trị đơn vị raw → hiển thị có dấu
const DON_VI_LABEL: Record<string, string> = {
  m: "m", met: "m",
  cay: "cây", kg: "kg",
  cai: "cái", chiec: "chiếc",
  cuon: "cuộn",
  goi: "gói",
  hop: "hộp",
  bo: "bộ",
  thuong: "thương",
  set: "set",
};
const fmtDV = (dv: string) => DON_VI_LABEL[dv?.toLowerCase()] ?? dv;

const TRANG_THAI_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  chua_thanh_toan:    { label: "Chưa TT",    color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
  thanh_toan_1_phan:  { label: "TT 1 phần",  color: "bg-blue-100 text-blue-700",    icon: <AlertCircle size={12} /> },
  da_thanh_toan:      { label: "Đã TT",       color: "bg-green-100 text-green-700",  icon: <CheckCircle size={12} /> },
};

// NHA_CC cứng (4 nhà lớn hay dùng) — giữ lại để backward compat
const NHA_CC_STATIC = NHA_CC.filter(n => n.value !== "khac");

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");

function newRow(): ChiTiet {
  return { vatTuId: "", soLuongMua: 0, donViMua: "m", quyDoi: 1, soLuong: 0, donViQuyDoi: "", donGia: 0, thanhTien: 0, vat: 0, ghiChu: "" };
}

function genSoPhieu(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  // Dùng timestamp ms để tránh trùng
  const t = Date.now().toString().slice(-6);
  return `NK${y}${m}${d}-${t}`;
}

export default function NhapKhoPage() {
  const [phieus, setPhieus]   = useState<PhieuNhap[]>([]);
  const [vatTus, setVatTus]   = useState<VatTu[]>([]);
  const [nhaCCs, setNhaCCs]   = useState<NhaCungCapDB[]>([]);
  const [quyDois, setQuyDois] = useState<QuyDoiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterNhaCC, setFilterNhaCC] = useState("");

  const [modal, setModal]     = useState<"create" | "view" | null>(null);
  const [selected, setSelected] = useState<PhieuNhap | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mini-form thêm vật tư mới
  const [newVtModal, setNewVtModal] = useState<{ rowIdx: number } | null>(null);
  const [newVtForm, setNewVtForm] = useState({ ten: "", loai: "may", donVi: "cai", nhom: "" });
  const [customLoai, setCustomLoai] = useState(""); // nhập tự do khi chọn "+ thêm"
  const [customNhom, setCustomNhom] = useState(""); // nhập tự do khi chọn "+ thêm"
  const [savingVt, setSavingVt] = useState(false);

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
  const [chiTiet, setChiTiet] = useState<ChiTiet[]>([newRow()]);
  const [saving, setSaving]   = useState(false);
  const [vtSearch, setVtSearch] = useState<string[]>([""]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [p, v, ncc, qd] = await Promise.all([
      fetch("/api/ke-toan/nhap-kho").then(r => r.json()),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()),
      fetch("/api/ke-toan/nha-cung-cap").then(r => r.json()),
      fetch("/api/ke-toan/quy-doi-don-vi").then(r => r.json()),
    ]);
    setPhieus(Array.isArray(p) ? p : []);
    setVatTus(Array.isArray(v) ? v : []);
    setNhaCCs(Array.isArray(ncc) ? ncc : []);
    setQuyDois(Array.isArray(qd) ? qd : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Tự bổ sung loại từ DB vào dropdown
  const allLoaiOptions = useMemo(() => {
    const STATIC = [
      { value: "vai",        label: "Vải" },
      { value: "may",        label: "May" },
      { value: "gia_cong",   label: "Gia công" },
      { value: "hoan_thien", label: "Hoàn thiện" },
      { value: "phu_lieu",   label: "Phụ liệu (cũ)" },
    ];
    const known = new Set(STATIC.map(l => l.value));
    const extras = [...new Set(vatTus.map(v => v.loai).filter(l => l && !known.has(l)))]
      .map(l => ({ value: l, label: l }));
    return [...STATIC, ...extras];
  }, [vatTus]);

  const filtered = useMemo(() => phieus.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !s || p.soPhieu.toLowerCase().includes(s) ||
      (p.soHoaDon || "").toLowerCase().includes(s) ||
      NHA_CC.find(n => n.value === p.nhaCC)?.label.toLowerCase().includes(s);
    const matchNhaCC = !filterNhaCC || p.nhaCC === filterNhaCC;
    return matchSearch && matchNhaCC;
  }), [phieus, search, filterNhaCC]);

  const tongTienHang = chiTiet.reduce((s, r) => s + r.soLuongMua * r.donGia, 0);
  const tongVAT = chiTiet.reduce((s, r) => s + r.soLuongMua * r.donGia * (r.vat / 100), 0);
  const tongTienForm = tongTienHang + tongVAT;

  function addRow() {
    setChiTiet(prev => [...prev, newRow()]);
    setVtSearch(prev => [...prev, ""]);
  }

  function removeRow(i: number) {
    setChiTiet(prev => prev.filter((_, idx) => idx !== i));
    setVtSearch(prev => prev.filter((_, idx) => idx !== i));
  }

  function autoFillQuyDoi(donViMua: string, isVai: boolean): { quyDoi: number; donViQuyDoi: string } {
    if (isVai) {
      return { quyDoi: DEFAULT_QUY_DOI[donViMua] ?? 1, donViQuyDoi: "m" };
    }
    const dbRecord = quyDois.find(q => q.tuDonVi === donViMua);
    if (dbRecord) return { quyDoi: dbRecord.heSo, donViQuyDoi: dbRecord.veDonVi };
    return { quyDoi: 1, donViQuyDoi: "" };
  }

  function updateRow(i: number, patch: Partial<ChiTiet>, allVatTus?: VatTu[]) {
    const vts = allVatTus ?? vatTus;
    setChiTiet(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      const updated = { ...r, ...patch };

      // Khi chọn vật tư mới → tự set đơn vị mua phù hợp
      if (patch.vatTuId && patch.vatTuId !== r.vatTuId) {
        const vt = vts.find(v => v.id === patch.vatTuId);
        if (vt) {
          updated.vatTu = vt;
          const defaultDV = DON_VI_DEFAULT[vt.donVi] ?? (vt.loai === "vai" ? "m" : "cai");
          updated.donViMua = defaultDV;
          const qdInfo = autoFillQuyDoi(defaultDV, vt.loai === "vai");
          updated.quyDoi = qdInfo.quyDoi;
          updated.donViQuyDoi = qdInfo.donViQuyDoi;
        }
      }
      // Nếu đổi donViMua thủ công → auto-fill quyDoi từ DB
      if (patch.donViMua && patch.donViMua !== r.donViMua && !patch.vatTuId) {
        const isVai = updated.vatTu?.loai === "vai";
        const qdInfo = autoFillQuyDoi(patch.donViMua, isVai);
        updated.quyDoi = qdInfo.quyDoi;
        updated.donViQuyDoi = qdInfo.donViQuyDoi;
      }
      // Tự tính lại soLuong (trừ khi chỉnh tay)
      if (patch.soLuong === undefined) {
        updated.soLuong = updated.soLuongMua * updated.quyDoi;
      }
      updated.thanhTien = updated.soLuongMua * updated.donGia;
      return updated;
    }));
  }

  function openEdit(p: PhieuNhap) {
    setEditingId(p.id);
    setForm({
      soPhieu: p.soPhieu,
      ngay: p.ngay.slice(0, 10),
      nhaCC: p.nhaCC,
      tenNhaCC: p.tenNhaCC || "",
      soHoaDon: p.soHoaDon || "",
      ngayHoaDon: p.ngayHoaDon ? p.ngayHoaDon.slice(0, 10) : "",
      ghiChu: p.ghiChu || "",
      nguoiTao: p.nguoiTao || "",
    });
    setChiTiet(p.chiTiet.map(r => {
      // Lấy donViQuyDoi: ưu tiên giá trị đã lưu trong DB, fallback từ QuyDoiDonVi hoặc donVi vật tư
      const dvqd = (r as ChiTiet).donViQuyDoi
        || autoFillQuyDoi(r.donViMua ?? "m", r.vatTu?.loai === "vai").donViQuyDoi
        || r.vatTu?.donVi
        || "";
      return {
        id: r.id,
        vatTuId: r.vatTuId,
        vatTu: r.vatTu,
        soLuongMua: r.soLuongMua ?? 0,
        donViMua: r.donViMua ?? "m",
        quyDoi: r.quyDoi ?? 1,
        soLuong: r.soLuong ?? 0,
        donViQuyDoi: dvqd,
        donGia: r.donGia ?? 0,
        thanhTien: r.thanhTien ?? 0,
        vat: r.vat ?? 0,
        ghiChu: r.ghiChu ?? "",   // null → "" để tránh uncontrolled input
      };
    }));
    setVtSearch(p.chiTiet.map(() => ""));
    setModal("create");
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setForm({ soPhieu: genSoPhieu(), ngay: new Date().toISOString().slice(0, 10), nhaCC: "hac_long", tenNhaCC: "", soHoaDon: "", ngayHoaDon: "", ghiChu: "", nguoiTao: "" });
    setChiTiet([newRow()]);
    setVtSearch([""]);
  }

  async function handleSaveNewVt() {
    if (!newVtForm.ten.trim() || !newVtModal) return;
    setSavingVt(true);
    const ma = "VT" + Date.now().toString().slice(-6);
    const loaiFinal = newVtForm.loai === "__custom__" ? customLoai.trim() : newVtForm.loai;
    const nhomFinal = newVtForm.nhom === "__custom__" ? customNhom.trim() : (newVtForm.nhom || null);
    const res = await fetch("/api/ke-toan/vat-tu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ma, ten: newVtForm.ten.trim(), loai: loaiFinal, donVi: newVtForm.donVi, nhom: nhomFinal }),
    });
    setSavingVt(false);
    if (res.ok) {
      const newVt: VatTu = await res.json();
      setVatTus(prev => [...prev, newVt]);
      updateRow(newVtModal.rowIdx, { vatTuId: newVt.id });
      setNewVtModal(null);
      setNewVtForm({ ten: "", loai: "may", donVi: "cai", nhom: "" });
      setCustomLoai(""); setCustomNhom("");
    }
  }

  async function handleCreate() {
    if (!form.soPhieu || !form.ngay || !form.nhaCC) {
      alert("Vui lòng điền đầy đủ: Số phiếu, Ngày nhập, Nhà cung cấp");
      return;
    }
    const validRows = chiTiet.filter(r => r.vatTuId && r.soLuongMua > 0 && r.donGia > 0);
    if (validRows.length === 0) {
      alert("Chưa có dòng hàng hợp lệ.\n\n• Phải chọn vật tư từ danh sách (click vào tên)\n• Số lượng > 0\n• Đơn giá > 0");
      return;
    }
    setSaving(true);

    // Nếu chọn "khác" + nhập tên mới → tự tạo NhaCungCap
    let finalNhaCC = form.nhaCC;
    let finalTenNhaCC = form.tenNhaCC;
    if (form.nhaCC === "khac" && form.tenNhaCC.trim()) {
      const tenClean = form.tenNhaCC.trim();
      // Kiểm tra đã tồn tại chưa (theo tên)
      const existing = nhaCCs.find(n => n.ten.toLowerCase() === tenClean.toLowerCase());
      if (existing) {
        finalNhaCC = existing.id;
        finalTenNhaCC = existing.ten;
      } else {
        const maAuto = "NCC" + Date.now().toString().slice(-6);
        const nccRes = await fetch("/api/ke-toan/nha-cung-cap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ma: maAuto, ten: tenClean }),
        });
        if (nccRes.ok) {
          const newNCC: NhaCungCapDB = await nccRes.json();
          finalNhaCC = newNCC.id;
          finalTenNhaCC = newNCC.ten;
          setNhaCCs(prev => [...prev, newNCC]);
        }
      }
    }

    const url = editingId ? `/api/ke-toan/nhap-kho/${editingId}` : "/api/ke-toan/nhap-kho";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nhaCC: finalNhaCC, tenNhaCC: finalTenNhaCC, chiTiet: validRows }),
    });
    setSaving(false);
    if (res.ok) {
      closeModal();
      fetchAll();
    } else {
      const errData = await res.json().catch(() => ({}));
      alert("❌ Lỗi khi lưu phiếu:\n" + (errData.error || `HTTP ${res.status}`));
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
        <button onClick={() => { setEditingId(null); setForm(f => ({ ...f, soPhieu: genSoPhieu() })); setModal("create"); }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Tạo phiếu nhập
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Số phiếu", value: String(totalStats.soPhieu), color: "text-slate-800" },
          { label: "Tổng tiền hàng", value: `${fmt(totalStats.tongTien)}₫`, color: "text-indigo-700" },
          { label: "Chưa thanh toán", value: `${fmt(totalStats.chuaTT)}₫`, color: "text-red-600" },
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
            placeholder="Tìm số phiếu, hoá đơn..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={filterNhaCC} onChange={e => setFilterNhaCC(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả NCC</option>
          {NHA_CC_STATIC.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
          {nhaCCs.map(n => <option key={n.id} value={n.id}>{n.ten}</option>)}
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
              <th className="px-4 py-3 font-semibold text-slate-600">Nguyên phụ liệu</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Tổng tiền</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="text-center py-12 text-slate-400">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-slate-400">Chưa có phiếu nhập nào</td></tr>
            )}
            {filtered.map(p => {
              const tt = TRANG_THAI_MAP[p.trangThai] || TRANG_THAI_MAP.chua_thanh_toan;
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-indigo-700 font-medium">{p.soPhieu}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.ngay)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {nhaCCs.find(n => n.id === p.nhaCC)?.ten
                      || (p.nhaCC === "khac" && p.tenNhaCC ? p.tenNhaCC : null)
                      || NHA_CC_STATIC.find(n => n.value === p.nhaCC)?.label
                      || p.tenNhaCC
                      || p.nhaCC}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.soHoaDon || "—"}</td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex flex-wrap gap-1">
                      {p.chiTiet.slice(0, 3).map((c, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full truncate max-w-[100px]">
                          {c.vatTu?.ten ?? "—"}
                        </span>
                      ))}
                      {p.chiTiet.length > 3 && (
                        <span className="text-xs text-slate-400">+{p.chiTiet.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(p.tongTien)}₫</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tt.color}`}>
                      {tt.icon} {tt.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelected(p); setModal("view"); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Xem">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Sửa">
                        <Pencil size={14} />
                      </button>
                      <div className="w-px h-4 bg-slate-200 mx-1" />
                      <button onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Xoá">
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

      {/* ── CREATE MODAL ── */}
      {modal === "create" && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? "Sửa phiếu nhập kho" : "Tạo phiếu nhập kho"}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số phiếu *</label>
                  <input value={form.soPhieu} onChange={e => setForm(f => ({ ...f, soPhieu: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày nhập *</label>
                  <input type="date" value={form.ngay} onChange={e => setForm(f => ({ ...f, ngay: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nhà cung cấp *</label>
                  <select value={form.nhaCC} onChange={e => setForm(f => ({ ...f, nhaCC: e.target.value, tenNhaCC: "" }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {NHA_CC_STATIC.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                    {nhaCCs.filter(n => !NHA_CC_STATIC.some(s => s.value === n.id)).map(n => (
                      <option key={n.id} value={n.id}>{n.ten}</option>
                    ))}
                    <option value="khac">+ Thêm mới...</option>
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

              {/* Chi tiết hàng hoá */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Chi tiết hàng hoá</h3>
                  <button onClick={addRow} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    <Plus size={12} /> Thêm dòng
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-56">Vật tư</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-24">ĐV mua</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-20">Số lượng</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 w-24">Quy đổi</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-teal-700 w-24">ĐV sau QĐ</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-teal-600 w-28">≈ Tổng QĐ</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-28">Đơn giá</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 w-28">Thành tiền</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-orange-500 w-20">VAT %</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ghi chú</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {chiTiet.map((row, i) => {
                        const selectedVT = vatTus.find(v => v.id === row.vatTuId) ?? row.vatTu;
                        const isVai = selectedVT?.loai === "vai";
                        const filteredVTs = vatTus.filter(v => {
                          const q = (vtSearch[i] || "").trim().toLowerCase();
                          return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
                        });
                        const dvInfo = isVai ? DON_VI_VAI.find(d => d.value === row.donViMua) : null;
                        const dbQD = !isVai ? quyDois.find(q => q.tuDonVi === row.donViMua) : null;
                        // Vải: luôn hiện (kể cả mét — quyDoi=1); phụ liệu: hiện khi không phải "cai"
                        const showQD = isVai
                          ? true
                          : (row.donViMua !== "cai");
                        const tongDonVi = isVai ? "m" : (row.donViQuyDoi || dbQD?.veDonVi || row.donViMua || "đv");
                        const quyDoiLabel = isVai
                          ? (dvInfo?.placeholder || `${tongDonVi}/${row.donViMua}`)
                          : (dbQD
                              ? `${dbQD.veDonVi}/${row.donViMua}`
                              : row.donViQuyDoi
                                ? `${row.donViQuyDoi}/${row.donViMua}`
                                : row.donViMua === "m" ? "1:1" : `?/${row.donViMua}`);
                        const tongLabel = tongDonVi;

                        return (
                          <tr key={i} className="border-t border-slate-100">
                            {/* Vật tư */}
                            <td className="px-3 py-1.5 align-top">
                              <div className="relative">
                                <input
                                  value={vtSearch[i] && vtSearch[i].trim()
                                    ? vtSearch[i]
                                    : (selectedVT ? selectedVT.ten : "")}
                                  onChange={e => {
                                    const ns = [...vtSearch]; ns[i] = e.target.value; setVtSearch(ns);
                                    if (!e.target.value) updateRow(i, { vatTuId: "" });
                                  }}
                                  onFocus={() => {
                                    if (!vtSearch[i]) {
                                      const ns = [...vtSearch]; ns[i] = " "; setVtSearch(ns);
                                    }
                                  }}
                                  onBlur={() => {
                                    setTimeout(() => {
                                      const ns = [...vtSearch];
                                      if (ns[i] === " ") { ns[i] = ""; setVtSearch(ns); }
                                    }, 200);
                                  }}
                                  placeholder="Chọn hoặc tìm vật tư..."
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300 cursor-pointer"
                                />
                                {vtSearch[i] && (
                                  <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-52 overflow-y-auto">
                                    {filteredVTs.map(v => (
                                      <button key={v.id}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2"
                                        onMouseDown={e => e.preventDefault()}
                                        onClick={() => {
                                          updateRow(i, { vatTuId: v.id });
                                          const ns = [...vtSearch]; ns[i] = ""; setVtSearch(ns);
                                        }}>
                                        <span className="text-slate-700">{v.ten}</span>
                                        <span className="text-slate-400 ml-auto shrink-0">{v.donVi}</span>
                                      </button>
                                    ))}
                                    <button
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => {
                                        const ns = [...vtSearch]; ns[i] = ""; setVtSearch(ns);
                                        setNewVtModal({ rowIdx: i });
                                        setNewVtForm({ ten: vtSearch[i]?.trim() || "", loai: "may", donVi: "cai", nhom: "" });
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs text-indigo-600 hover:bg-indigo-50 font-medium border-t border-slate-100 flex items-center gap-1">
                                      <Plus size={11} /> Thêm vật tư mới...
                                    </button>
                                  </div>
                                )}
                                {selectedVT && !vtSearch[i] && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedVT.donVi} · {selectedVT.nhom || selectedVT.loai}</p>
                                )}
                              </div>
                            </td>

                            {/* Đơn vị mua */}
                            <td className="px-3 py-1.5 align-top">
                              <select value={row.donViMua}
                                onChange={e => updateRow(i, { donViMua: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300">
                                {(isVai ? DON_VI_VAI : DON_VI_PHU_LIEU).map(d => (
                                  <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                              </select>
                            </td>

                            {/* Số lượng */}
                            <td className="px-3 py-1.5 align-top">
                              <input type="number" min={0} value={row.soLuongMua || ""}
                                onChange={e => updateRow(i, { soLuongMua: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>

                            {/* Quy đổi (hệ số) */}
                            <td className="px-3 py-1.5 align-top">
                              {showQD ? (
                                <input type="number" min={0} step="0.01"
                                  value={row.quyDoi || ""}
                                  onChange={e => updateRow(i, { quyDoi: parseFloat(e.target.value) || 1 })}
                                  className="w-full border border-indigo-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-indigo-50" />
                              ) : (
                                <span className="text-xs text-slate-300 px-2">—</span>
                              )}
                            </td>

                            {/* ĐV sau quy đổi — luôn hiển thị, luôn editable */}
                            <td className="px-3 py-1.5 align-top">
                              <div className="flex items-center gap-0.5">
                                <input
                                  value={row.donViQuyDoi || tongDonVi}
                                  onChange={e => updateRow(i, { donViQuyDoi: e.target.value })}
                                  placeholder="đvị"
                                  className="w-full border border-teal-200 rounded-lg px-2 py-1.5 text-xs text-center font-medium text-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50"
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 text-center">/{fmtDV(row.donViMua)}</p>
                            </td>

                            {/* Tổng quy đổi */}
                            <td className="px-3 py-1.5 align-top">
                              {showQD ? (
                                <div>
                                  <input
                                    type="number" min={0} step="0.01"
                                    value={row.soLuong || ""}
                                    onChange={e => updateRow(i, { soLuong: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-teal-200 rounded-lg px-2 py-1.5 text-xs text-right font-semibold text-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50"
                                  />
                                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">
                                    {row.donViQuyDoi || tongLabel}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>

                            {/* Đơn giá — luôn tính theo ĐV mua */}
                            <td className="px-3 py-1.5 align-top">
                              <div>
                                <input type="number" min={0} value={row.donGia || ""}
                                  onChange={e => updateRow(i, { donGia: parseFloat(e.target.value) || 0 })}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                                {/* Nhãn đơn vị giá: đ/cây, đ/kg, đ/m... */}
                                <p className="text-[10px] text-slate-400 mt-0.5 text-right">
                                  đ/{fmtDV(row.donViMua) || "đv"}
                                </p>
                              </div>
                            </td>

                            {/* Thành tiền */}
                            <td className="px-3 py-1.5 align-top pt-3">
                              <p className="text-right font-semibold text-slate-700 text-xs">
                                {fmt(row.soLuongMua * row.donGia)}₫
                              </p>
                              {row.vat > 0 && (
                                <p className="text-right text-[10px] text-orange-500 mt-0.5">
                                  +{fmt(Math.round(row.soLuongMua * row.donGia * row.vat / 100))}₫ VAT
                                </p>
                              )}
                            </td>

                            {/* VAT % */}
                            <td className="px-3 py-1.5 align-top">
                              <input
                                type="number" min={0} max={100} step={1}
                                value={row.vat || ""}
                                placeholder="0"
                                onChange={e => updateRow(i, { vat: parseFloat(e.target.value) || 0 })}
                                className="w-full border border-orange-200 rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-orange-300 bg-orange-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </td>

                            {/* Ghi chú */}
                            <td className="px-3 py-1.5 align-top">
                              <input value={row.ghiChu} onChange={e => updateRow(i, { ghiChu: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300" />
                            </td>

                            <td className="px-2 py-1.5 align-top">
                              {chiTiet.length > 1 && (
                                <button onClick={() => removeRow(i)} className="p-1 text-slate-300 hover:text-red-500 mt-1">
                                  <X size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      {tongVAT > 0 && (
                        <>
                          <tr className="border-t border-slate-200 bg-slate-50">
                            <td colSpan={6} className="px-3 py-1.5 text-xs text-slate-500 text-right">Tiền hàng:</td>
                            <td className="px-3 py-1.5 text-right text-xs text-slate-600">{fmt(tongTienHang)}₫</td>
                            <td colSpan={3}></td>
                          </tr>
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="px-3 py-1.5 text-xs text-orange-500 text-right">Thuế VAT:</td>
                            <td className="px-3 py-1.5 text-right text-xs text-orange-600">+{fmt(Math.round(tongVAT))}₫</td>
                            <td colSpan={3}></td>
                          </tr>
                        </>
                      )}
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-slate-600 text-right">Tổng cộng{tongVAT > 0 ? " (đã VAT)" : ""}:</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">{fmt(Math.round(tongTienForm))}₫</td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={closeModal} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
              <button onClick={handleCreate} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu phiếu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW MODAL ── */}
      {modal === "view" && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{selected.soPhieu}</h2>
                <p className="text-xs text-slate-400">
                  {nhaCCs.find(n => n.id === selected.nhaCC)?.ten
                    || (selected.nhaCC === "khac" && selected.tenNhaCC ? selected.tenNhaCC : null)
                    || NHA_CC_STATIC.find(n => n.value === selected.nhaCC)?.label
                    || selected.tenNhaCC
                    || selected.nhaCC}
                  {" · "}{fmtDate(selected.ngay)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${TRANG_THAI_MAP[selected.trangThai]?.color || ""}`}>
                    {TRANG_THAI_MAP[selected.trangThai]?.label} <ChevronDown size={12} />
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
                    <th className="px-3 py-2 text-xs font-medium text-slate-500">Số lượng mua</th>
                    <th className="px-3 py-2 text-xs font-medium text-teal-600">Tổng (quy đổi)</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.chiTiet.map((r, i) => {
                    const isVaiRow = r.vatTu?.loai === "vai";
                    return (
                      <tr key={i} className="border-t border-slate-50">
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-700">{r.vatTu?.ten || r.vatTuId}</p>
                          {r.vatTu && <p className="text-[10px] text-slate-400">{r.vatTu.nhom || r.vatTu.loai}</p>}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {r.soLuongMua} {fmtDV(r.donViMua)}
                          {isVaiRow && r.donViMua !== "m" && r.quyDoi !== 1 && (
                            <span className="text-slate-400"> × {r.quyDoi} m/{fmtDV(r.donViMua)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold">
                          {isVaiRow ? (
                            <span className="text-teal-600">{fmt(r.soLuong)} m</span>
                          ) : (r as ChiTiet).donViQuyDoi && (r as ChiTiet).donViQuyDoi !== r.donViMua && (r.quyDoi ?? 1) !== 1 ? (
                            <span className="text-teal-600">
                              {fmt(r.soLuongMua * (r.quyDoi ?? 1))} {fmtDV((r as ChiTiet).donViQuyDoi)}
                              <span className="text-slate-400 font-normal ml-1">({r.soLuongMua} {fmtDV(r.donViMua)})</span>
                            </span>
                          ) : (
                            <span className="text-slate-500">{fmt(r.soLuongMua)} {fmtDV(r.donViMua)}</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-xs">{fmt(r.donGia)}₫</td>
                        <td className="px-3 py-2 text-right font-semibold">{fmt(r.thanhTien)}₫</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={4} className="px-3 py-2 text-right font-bold text-slate-700">Tổng cộng:</td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-700 text-base">{fmt(selected.tongTien)}₫</td>
                  </tr>
                </tfoot>
              </table>
              {selected.ghiChu && <p className="text-sm text-slate-500 italic">{selected.ghiChu}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── MINI MODAL THÊM VẬT TƯ MỚI ── */}
      {newVtModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Thêm vật tư mới</h3>
              <button onClick={() => setNewVtModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tên vật tư *</label>
                <input
                  autoFocus
                  value={newVtForm.ten}
                  onChange={e => setNewVtForm(f => ({ ...f, ten: e.target.value }))}
                  placeholder="Vd: Khoá kéo 20cm, Cúc bấm..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Loại</label>
                  {newVtForm.loai === "__custom__" ? (
                    <div className="flex gap-1">
                      <input autoFocus value={customLoai} onChange={e => setCustomLoai(e.target.value)}
                        placeholder="Nhập tên loại mới..."
                        className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      <button onClick={() => setNewVtForm(f => ({ ...f, loai: "may" }))}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-lg">✕</button>
                    </div>
                  ) : (
                    <select value={newVtForm.loai} onChange={e => {
                      const loai = e.target.value;
                      const defaultDonVi = loai === "vai" ? "cay" : "cai";
                      setNewVtForm(f => ({ ...f, loai, nhom: "", donVi: defaultDonVi }));
                    }}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      {allLoaiOptions.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                      <option value="__custom__">➕ Thêm loại mới...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Đơn vị</label>
                  <select value={newVtForm.donVi} onChange={e => setNewVtForm(f => ({ ...f, donVi: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {newVtForm.loai === "vai" ? (
                      <>
                        <option value="cay">Cây</option>
                        <option value="m">Mét (m)</option>
                        <option value="kg">KG</option>
                      </>
                    ) : (
                      <>
                        <option value="cai">Cái</option>
                        <option value="chiec">Chiếc</option>
                        <option value="goi">Gói</option>
                        <option value="cuon">Cuộn</option>
                        <option value="hop">Hộp</option>
                        <option value="bo">Bộ</option>
                        <option value="kg">KG</option>
                        <option value="m">Mét (m)</option>
                        <option value="thuong">Thương</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              {newVtForm.loai !== "vai" && (() => {
                const NHOM_OPTS: Record<string, { value: string; label: string }[]> = {
                  may:        [{ value:"lot", label:"Lót" }, { value:"chi", label:"Chỉ" }, { value:"khoa_keo", label:"Khoá kéo" }, { value:"mac", label:"Mác" }, { value:"khac", label:"Khác" }],
                  gia_cong:   [{ value:"cuc", label:"Cúc" }, { value:"dinh_tan", label:"Đinh tán" }, { value:"mac_da", label:"Mác da" }, { value:"khac", label:"Khác" }],
                  hoan_thien: [{ value:"giat_mau", label:"Giặt màu" }, { value:"giat_vi_sinh", label:"Giặt vi sinh" }, { value:"may", label:"May" }, { value:"mac_lung", label:"Mác lưng" }, { value:"khac", label:"Khác" }],
                  phu_lieu:   [{ value:"khoa_keo", label:"Khoá kéo" }, { value:"cuc", label:"Cúc" }, { value:"dinh_tan", label:"Đinh tán" }, { value:"lot", label:"Lót" }, { value:"chi", label:"Chỉ" }, { value:"khac", label:"Khác" }],
                };
                const opts = NHOM_OPTS[newVtForm.loai] ?? [];
                return (
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Nhóm</label>
                    {newVtForm.nhom === "__custom__" ? (
                      <div className="flex gap-1">
                        <input autoFocus value={customNhom} onChange={e => setCustomNhom(e.target.value)}
                          placeholder="Nhập tên nhóm mới..."
                          className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                        <button onClick={() => setNewVtForm(f => ({ ...f, nhom: "" }))}
                          className="px-2 py-1 text-slate-400 hover:text-slate-600 text-lg">✕</button>
                      </div>
                    ) : (
                      <select value={newVtForm.nhom} onChange={e => setNewVtForm(f => ({ ...f, nhom: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        <option value="">— Chọn nhóm —</option>
                        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        <option value="__custom__">➕ Thêm nhóm mới...</option>
                      </select>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setNewVtModal(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleSaveNewVt} disabled={savingVt || !newVtForm.ten.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {savingVt ? "Đang lưu..." : "Thêm & chọn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
