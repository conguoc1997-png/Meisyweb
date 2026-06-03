"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Search, X, ChevronDown, Trash2, Eye, CheckCircle, Clock, AlertCircle, UserPlus, Pencil } from "lucide-react";

type VatTu = {
  id: string; ma: string; ten: string; loai: string; nhom: string | null;
  donVi: string; donViMua: string; quyDoi: number;
  tonKho?: { soLuong: number; giaTrungBinh: number };
};

type NCC = { id: string; ma: string; ten: string; sdt?: string | null; diaChi?: string | null };

type ChiTiet = {
  id?: string; vatTuId: string; vatTu?: VatTu;
  soLuongMua: number; donViMua: string; quyDoi: number;
  soLuong: number;
  donGia: number; thanhTien: number; ghiChu: string;
};

type PhieuNhap = {
  id: string; soPhieu: string; ngay: string; nhaCC: string; tenNhaCC: string | null;
  soHoaDon: string | null; ngayHoaDon: string | null; tongTien: number;
  trangThai: string; ghiChu: string | null; nguoiTao: string | null;
  chiTiet: ChiTiet[];
  createdAt: string;
};

const DON_VI_MUA_BASE = [
  { value: "m",     label: "Mét (m)",  showQuyDoi: false },
  { value: "cay",   label: "Cây",       showQuyDoi: true,  placeholder: "m/cây" },
  { value: "kg",    label: "KG",        showQuyDoi: true,  placeholder: "m/kg" },
  { value: "chiec", label: "Chiếc",    showQuyDoi: false },
  { value: "goi",   label: "Gói",      showQuyDoi: false },
  { value: "cuon",  label: "Cuộn",     showQuyDoi: false },
  { value: "hop",   label: "Hộp",      showQuyDoi: false },
  { value: "bo",    label: "Bộ",       showQuyDoi: false },
  { value: "cai",   label: "Cái",      showQuyDoi: false },
];


const TRANG_THAI_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  chua_thanh_toan:    { label: "Chưa TT",    color: "bg-yellow-100 text-yellow-700", icon: <Clock size={12} /> },
  thanh_toan_1_phan:  { label: "TT 1 phần",  color: "bg-blue-100 text-blue-700",    icon: <AlertCircle size={12} /> },
  da_thanh_toan:      { label: "Đã TT",       color: "bg-green-100 text-green-700",  icon: <CheckCircle size={12} /> },
};

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");
function newRow(): ChiTiet {
  return { vatTuId: "", soLuongMua: 0, donViMua: "m", quyDoi: 1, soLuong: 0, donGia: 0, thanhTien: 0, ghiChu: "" };
}
function genSoPhieu() {
  const now = new Date();
  return `NK${now.getFullYear().toString().slice(-2)}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}-${String(Math.floor(Math.random()*999)+1).padStart(3,"0")}`;
}

export default function NhapKhoPage() {
  const [phieus, setPhieus]     = useState<PhieuNhap[]>([]);
  const [vatTus, setVatTus]     = useState<VatTu[]>([]);
  const [nccList, setNccList]   = useState<NCC[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterNCC, setFilterNCC] = useState("");

  const [modal, setModal]       = useState<"create" | "edit" | "view" | "addNCC" | "quyDoi" | "confirmDelete" | null>(null);
  const [selected, setSelected] = useState<PhieuNhap | null>(null);
  const [editId, setEditId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PhieuNhap | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form nhập kho
  const [form, setForm] = useState({
    soPhieu: genSoPhieu(), ngay: new Date().toISOString().slice(0,10),
    nhaCC: "", tenNhaCC: "", soHoaDon: "", ngayHoaDon: "", ghiChu: "", nguoiTao: "",
  });
  const [chiTiet, setChiTiet] = useState<ChiTiet[]>([newRow()]);
  const [saving, setSaving]   = useState(false);
  const [vtSearch, setVtSearch] = useState<string[]>([""]);

  // Form thêm NCC nhanh
  const [nccForm, setNccForm] = useState({ ma: "", ten: "", sdt: "", diaChi: "" });
  const [savingNCC, setSavingNCC] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, v, n] = await Promise.all([
        fetch("/api/ke-toan/nhap-kho").then(r => r.json()),
        fetch("/api/ke-toan/vat-tu").then(r => r.json()),
        fetch("/api/ke-toan/nha-cung-cap").then(r => r.json()),
      ]);
      setPhieus(Array.isArray(p) ? p : []);
      setVatTus(Array.isArray(v) ? v : []);
      setNccList(Array.isArray(n) ? n : []);
    } catch (e) {
      console.error("fetchAll nhap-kho:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Đơn vị mua = danh sách cố định (quy đổi lưu theo từng vật tư, không global)
  const donViMuaOptions = DON_VI_MUA_BASE;

  const filtered = useMemo(() => phieus.filter(p => {
    const s = search.toLowerCase();
    const ncc = nccList.find(n => n.ma === p.nhaCC || n.id === p.nhaCC);
    const matchS = !s || p.soPhieu.toLowerCase().includes(s) ||
      (p.soHoaDon||"").toLowerCase().includes(s) ||
      (ncc?.ten||"").toLowerCase().includes(s);
    return matchS && (!filterNCC || p.nhaCC === filterNCC);
  }), [phieus, search, filterNCC, nccList]);

  const getNccLabel = (nhaCC: string) =>
    nccList.find(n => n.id === nhaCC || n.ma === nhaCC)?.ten || nhaCC;

  // ── Row helpers ──
  function addRow() { setChiTiet(p=>[...p,newRow()]); setVtSearch(p=>[...p,""]); }
  function removeRow(i: number) {
    setChiTiet(p=>p.filter((_,idx)=>idx!==i));
    setVtSearch(p=>p.filter((_,idx)=>idx!==i));
  }
  function updateRow(i: number, patch: Partial<ChiTiet>) {
    setChiTiet(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      const updated = { ...r, ...patch };
      // Chỉ tự tính lại soLuong khi KHÔNG chỉnh tay soLuong
      if (patch.soLuong === undefined) {
        updated.soLuong = updated.soLuongMua * updated.quyDoi;
      }
      updated.thanhTien = updated.soLuongMua * updated.donGia;
      return updated;
    }));
  }

  // ── Submit phiếu nhập ──
  async function handleCreate() {
    if (!form.soPhieu || !form.ngay || !form.nhaCC) return;
    const validRows = chiTiet.filter(r => r.vatTuId && r.soLuongMua > 0 && r.donGia > 0);
    if (!validRows.length) return;
    setSaving(true);
    const res = await fetch("/api/ke-toan/nhap-kho", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, chiTiet: validRows }),
    });
    setSaving(false);
    if (res.ok) {
      setModal(null);
      setForm({ soPhieu: genSoPhieu(), ngay: new Date().toISOString().slice(0,10), nhaCC: nccList[0]?.id||"", tenNhaCC:"", soHoaDon:"", ngayHoaDon:"", ghiChu:"", nguoiTao:"" });
      setChiTiet([newRow()]); setVtSearch([""]);
      fetchAll();
    }
  }

  function openEdit(p: PhieuNhap) {
    setEditId(p.id);
    setForm({
      soPhieu:    p.soPhieu,
      ngay:       p.ngay.slice(0, 10),
      nhaCC:      p.nhaCC,
      tenNhaCC:   p.tenNhaCC || "",
      soHoaDon:   p.soHoaDon || "",
      ngayHoaDon: p.ngayHoaDon ? p.ngayHoaDon.slice(0, 10) : "",
      ghiChu:     p.ghiChu || "",
      nguoiTao:   p.nguoiTao || "",
    });
    const rows = p.chiTiet.map(r => ({
      id:         r.id,
      vatTuId:    r.vatTuId,
      vatTu:      r.vatTu,
      soLuongMua: r.soLuongMua,
      donViMua:   r.donViMua,
      quyDoi:     r.quyDoi,
      soLuong:    r.soLuong,
      donGia:     r.donGia,
      thanhTien:  r.thanhTien,
      ghiChu:     r.ghiChu || "",
    }));
    setChiTiet(rows.length ? rows : [newRow()]);
    setVtSearch(rows.map(() => ""));
    setModal("edit");
  }

  async function handleUpdate() {
    if (!editId || !form.soPhieu || !form.ngay || !form.nhaCC) return;
    const validRows = chiTiet.filter(r => r.vatTuId && r.soLuongMua > 0 && r.donGia > 0);
    if (!validRows.length) return;
    setSaving(true);
    const res = await fetch(`/api/ke-toan/nhap-kho/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, chiTiet: validRows }),
    });
    setSaving(false);
    if (res.ok) {
      setModal(null);
      setEditId(null);
      setChiTiet([newRow()]); setVtSearch([""]);
      fetchAll();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/ke-toan/nhap-kho/${deleteTarget.id}`, { method: "DELETE" });
    setDeleting(false);
    setDeleteTarget(null);
    setModal(null);
    fetchAll();
  }

  async function handlePatchTrangThai(id: string, trangThai: string) {
    await fetch(`/api/ke-toan/nhap-kho/${id}`, {
      method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ trangThai }),
    });
    fetchAll();
    setSelected(prev => prev ? {...prev, trangThai} : prev);
  }

  // ── Thêm NCC nhanh ──
  async function handleAddNCC() {
    if (!nccForm.ma || !nccForm.ten) return;
    setSavingNCC(true);
    const res = await fetch("/api/ke-toan/nha-cung-cap", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(nccForm),
    });
    setSavingNCC(false);
    if (res.ok) {
      const ncc = await res.json();
      setNccForm({ ma:"", ten:"", sdt:"", diaChi:"" });
      setModal(editId ? "edit" : "create");
      setForm(f => ({ ...f, nhaCC: ncc.id }));
      await fetchAll();
    }
  }

const tongTienForm = chiTiet.reduce((s,r)=>s+r.soLuongMua*r.donGia,0);
  const stats = useMemo(()=>({
    soPhieu: filtered.length,
    tongTien: filtered.reduce((s,p)=>s+p.tongTien,0),
    chuaTT: filtered.filter(p=>p.trangThai==="chua_thanh_toan").reduce((s,p)=>s+p.tongTien,0),
  }),[filtered]);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phiếu Nhập Kho NPL</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tự động cập nhật tồn kho & công nợ NCC</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>{ setModal("create"); setForm(f=>({...f,soPhieu:genSoPhieu(),nhaCC:nccList[0]?.id||""})); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
            <Plus size={16}/> Tạo phiếu nhập
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"Số phiếu",       value: String(stats.soPhieu),         color:"text-slate-800" },
          { label:"Tổng tiền hàng", value:`${fmt(stats.tongTien)}₫`,      color:"text-indigo-700" },
          { label:"Chưa thanh toán",value:`${fmt(stats.chuaTT)}₫`,        color:"text-red-600" },
        ].map(s=>(
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm số phiếu, hoá đơn..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-52 focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
        </div>
        <select value={filterNCC} onChange={e=>setFilterNCC(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả NCC</option>
          {nccList.map(n=><option key={n.id} value={n.id}>{n.ten}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              {["Số phiếu","Ngày","Nhà CC","Số HĐ","Tổng tiền","Trạng thái",""].map(h=>(
                <th key={h} className={`px-4 py-3 font-semibold text-slate-600 ${h==="Tổng tiền"?"text-right":""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-12 text-slate-400">Đang tải...</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan={7} className="text-center py-12 text-slate-400">Chưa có phiếu nhập nào</td></tr>}
            {filtered.map(p=>{
              const tt = TRANG_THAI_MAP[p.trangThai]||TRANG_THAI_MAP.chua_thanh_toan;
              return (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-indigo-700 font-medium">{p.soPhieu}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(p.ngay)}</td>
                  <td className="px-4 py-3 text-slate-700">{getNccLabel(p.nhaCC)}</td>
                  <td className="px-4 py-3 text-slate-500">{p.soHoaDon||"—"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmt(p.tongTien)}₫</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tt.color}`}>
                      {tt.icon} {tt.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={()=>{setSelected(p);setModal("view");}} title="Xem" className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"><Eye size={14}/></button>
                      <button onClick={()=>openEdit(p)} title="Sửa" className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50"><Pencil size={14}/></button>
                      <button onClick={()=>{setDeleteTarget(p);setModal("confirmDelete");}} title="Xoá" className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── CREATE MODAL ── */}
      {(modal==="create" || modal==="edit") && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-8 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modal==="edit" ? "✏️ Sửa phiếu nhập kho" : "Tạo phiếu nhập kho"}
              </h2>
              <button onClick={()=>{setModal(null);setEditId(null);}} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số phiếu *</label>
                  <input value={form.soPhieu} onChange={e=>setForm(f=>({...f,soPhieu:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày nhập *</label>
                  <input type="date" value={form.ngay} onChange={e=>setForm(f=>({...f,ngay:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nhà cung cấp *</label>
                  {nccList.length > 0 ? (
                    <div className="flex gap-2">
                      <select value={form.nhaCC} onChange={e=>setForm(f=>({...f,nhaCC:e.target.value}))}
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                        <option value="">— Chọn NCC —</option>
                        {nccList.map(n=><option key={n.id} value={n.id}>{n.ten}</option>)}
                      </select>
                      <button onClick={()=>setModal("addNCC")} title="Thêm NCC mới"
                        className="px-2.5 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <UserPlus size={15}/>
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={form.nhaCC} onChange={e=>setForm(f=>({...f,nhaCC:e.target.value}))}
                        placeholder="Nhập tên NCC..."
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                      <button onClick={()=>setModal("addNCC")} title="Thêm NCC vào danh sách"
                        className="flex items-center gap-1.5 px-3 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors whitespace-nowrap">
                        <UserPlus size={13}/> Thêm NCC
                      </button>
                    </div>
                  )}
                  {nccList.length === 0 && (
                    <p className="text-[10px] text-amber-500 mt-1">
                      Chưa có NCC nào — bấm &quot;Thêm NCC&quot; để tạo hoặc nhập tên tạm thời
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Số hoá đơn</label>
                  <input value={form.soHoaDon} onChange={e=>setForm(f=>({...f,soHoaDon:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ngày HĐ</label>
                  <input type="date" value={form.ngayHoaDon} onChange={e=>setForm(f=>({...f,ngayHoaDon:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Người tạo</label>
                  <input value={form.nguoiTao} onChange={e=>setForm(f=>({...f,nguoiTao:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                  <input value={form.ghiChu} onChange={e=>setForm(f=>({...f,ghiChu:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              </div>

              {/* Chi tiết hàng hoá */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-700">Chi tiết hàng hoá</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={addRow} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                      <Plus size={12}/> Thêm dòng
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-56">Vật tư</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-32">ĐV mua</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-20">Số lượng</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-24">Quy đổi</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-teal-600 w-20">≈ Tổng</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 w-28">Đơn giá</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 w-28">Thành tiền</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ghi chú</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {chiTiet.map((row, i) => {
                        const selVT = vatTus.find(v=>v.id===row.vatTuId);
                        const filtVTs = vatTus.filter(v=>{
                          const q=(vtSearch[i]||"").toLowerCase();
                          return !q||v.ten.toLowerCase().includes(q)||v.ma.toLowerCase().includes(q);
                        });
                        // Có quy đổi nếu quyDoi != 1 (donViMua ≠ donVi)
                        const hasConversion = row.quyDoi !== 1 || (selVT && selVT.donViMua !== selVT.donVi);

                        return (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="px-3 py-1.5 align-top">
                              <div className="relative">
                                <input value={vtSearch[i]||(selVT?`${selVT.ma} – ${selVT.ten}`:"")}
                                  onChange={e=>{const ns=[...vtSearch];ns[i]=e.target.value;setVtSearch(ns);if(!e.target.value)updateRow(i,{vatTuId:""});}}
                                  placeholder="Tìm vật tư..."
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
                                {vtSearch[i] && filtVTs.length>0 && (
                                  <div className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                    {filtVTs.map(v=>(
                                      <button key={v.id} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex gap-2"
                                        onClick={()=>{
                                          // Tự điền donViMua + quyDoi từ vật tư
                                          updateRow(i,{
                                            vatTuId:  v.id,
                                            donViMua: v.donViMua || v.donVi,
                                            quyDoi:   v.quyDoi   || 1,
                                          });
                                          const ns=[...vtSearch];ns[i]="";setVtSearch(ns);
                                        }}>
                                        <span className="font-mono text-slate-400">{v.ma}</span>
                                        <span>{v.ten}</span>
                                        <span className="text-slate-400 ml-auto">
                                          {v.donViMua !== v.donVi
                                            ? `${v.donViMua}→${v.donVi}`
                                            : v.donVi}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                {selVT && !vtSearch[i] && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">{selVT.donVi} · {selVT.nhom||selVT.loai}</p>
                                )}
                              </div>
                            </td>
                            {/* ĐV mua — auto từ vật tư, vẫn chỉnh được */}
                            <td className="px-3 py-1.5 align-top">
                              <select value={row.donViMua} onChange={e=>updateRow(i,{donViMua:e.target.value})}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300">
                                {donViMuaOptions.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
                              </select>
                              {selVT && selVT.donViMua !== selVT.donVi && (
                                <p className="text-[10px] text-indigo-500 mt-0.5">
                                  1 {selVT.donViMua} = {selVT.quyDoi} {selVT.donVi}
                                </p>
                              )}
                            </td>

                            {/* Số lượng mua */}
                            <td className="px-3 py-1.5 align-top">
                              <input type="number" min={0} value={row.soLuongMua||""}
                                onChange={e=>updateRow(i,{soLuongMua:parseFloat(e.target.value)||0})}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
                            </td>

                            {/* Hệ số quy đổi — editable nếu có conversion */}
                            <td className="px-3 py-1.5 align-top">
                              {hasConversion ? (
                                <input type="number" min={0} step="0.01" value={row.quyDoi||""}
                                  onChange={e=>updateRow(i,{quyDoi:parseFloat(e.target.value)||1})}
                                  className="w-full border border-indigo-200 bg-indigo-50 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
                              ) : (
                                <span className="text-xs text-slate-300 px-2">—</span>
                              )}
                            </td>

                            {/* Tổng quy đổi — editable */}
                            <td className="px-3 py-1.5 align-top">
                              {hasConversion ? (
                                <div>
                                  <input type="number" min={0} step="0.01"
                                    value={row.soLuong || ""}
                                    onChange={e => updateRow(i, { soLuong: parseFloat(e.target.value) || 0 })}
                                    className="w-full border border-teal-200 rounded-lg px-2 py-1.5 text-xs text-right font-semibold text-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50"/>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{selVT?.donVi||"đvị"}</p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </td>

                            {/* Đơn giá */}
                            <td className="px-3 py-1.5 align-top">
                              <div>
                                <input type="number" min={0} value={row.donGia||""}
                                  onChange={e=>updateRow(i,{donGia:parseFloat(e.target.value)||0})}
                                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
                                {hasConversion && row.soLuong>0 && row.donGia>0 && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    ≈{fmt(Math.round(row.soLuongMua*row.donGia/row.soLuong))}₫/{selVT?.donVi||"đvị"}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-1.5 text-right font-medium text-slate-700 text-xs align-top pt-3">
                              {fmt(row.soLuongMua*row.donGia)}₫
                            </td>
                            <td className="px-3 py-1.5 align-top">
                              <input value={row.ghiChu} onChange={e=>updateRow(i,{ghiChu:e.target.value})}
                                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-300"/>
                            </td>
                            <td className="px-2 py-1.5 align-top">
                              {chiTiet.length>1 && (
                                <button onClick={()=>removeRow(i)} className="p-1 text-slate-300 hover:text-red-500 mt-1"><X size={12}/></button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50">
                        <td colSpan={6} className="px-3 py-2 text-xs font-semibold text-slate-600 text-right">Tổng cộng:</td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-700">{fmt(tongTienForm)}₫</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={()=>{setModal(null);setEditId(null);}} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={modal==="edit" ? handleUpdate : handleCreate} disabled={saving}
                className={`px-5 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50
                  ${modal==="edit" ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                {saving ? "Đang lưu..." : modal==="edit" ? "Cập nhật" : "Lưu phiếu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL THÊM NCC NHANH ── */}
      {modal==="addNCC" && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">Thêm nhà cung cấp mới</h2>
              <button onClick={()=>setModal(editId ? "edit" : "create")} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Mã NCC *</label>
                  <input value={nccForm.ma} onChange={e=>setNccForm(f=>({...f,ma:e.target.value}))}
                    placeholder="VD: HL, AH..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">SĐT</label>
                  <input value={nccForm.sdt} onChange={e=>setNccForm(f=>({...f,sdt:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tên NCC *</label>
                <input value={nccForm.ten} onChange={e=>setNccForm(f=>({...f,ten:e.target.value}))}
                  placeholder="VD: Công ty TNHH Hắc Long"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Địa chỉ</label>
                <input value={nccForm.diaChi} onChange={e=>setNccForm(f=>({...f,diaChi:e.target.value}))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"/>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={()=>setModal(editId ? "edit" : "create")} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleAddNCC} disabled={savingNCC||!nccForm.ma||!nccForm.ten}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {savingNCC?"Đang lưu...":"Thêm NCC"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ── VIEW MODAL ── */}
      {modal==="view" && selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-mono">{selected.soPhieu}</h2>
                <p className="text-xs text-slate-400">{getNccLabel(selected.nhaCC)} · {fmtDate(selected.ngay)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${TRANG_THAI_MAP[selected.trangThai]?.color||""}`}>
                    {TRANG_THAI_MAP[selected.trangThai]?.label} <ChevronDown size={12}/>
                  </button>
                  <div className="hidden group-hover:block absolute right-0 top-full bg-white border border-slate-100 rounded-xl shadow-lg z-10 w-40 py-1">
                    {Object.entries(TRANG_THAI_MAP).map(([k,v])=>(
                      <button key={k} onClick={()=>handlePatchTrangThai(selected.id,k)}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-full ${v.color} flex items-center gap-1`}>{v.icon} {v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={()=>setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18}/></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><span className="text-slate-400 text-xs">Số HĐ</span><p className="font-medium">{selected.soHoaDon||"—"}</p></div>
                <div><span className="text-slate-400 text-xs">Ngày HĐ</span><p className="font-medium">{selected.ngayHoaDon?fmtDate(selected.ngayHoaDon):"—"}</p></div>
                <div><span className="text-slate-400 text-xs">Người tạo</span><p className="font-medium">{selected.nguoiTao||"—"}</p></div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-3 py-2 text-xs font-medium text-slate-500">Vật tư</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500">Mua</th>
                    <th className="px-3 py-2 text-xs font-medium text-teal-600">Quy đổi</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-xs font-medium text-slate-500 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.chiTiet.map((r,i)=>(
                    <tr key={i} className="border-t border-slate-50">
                      <td className="px-3 py-2">
                        <p className="font-medium text-slate-700">{r.vatTu?.ten||r.vatTuId}</p>
                        {r.vatTu && <p className="text-[10px] text-slate-400">{r.vatTu.ma}</p>}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {r.soLuongMua} {r.donViMua}
                      </td>
                      <td className="px-3 py-2 text-xs font-semibold text-teal-600">
                        {r.quyDoi!==1 ? `= ${fmt(r.soLuong)} ${r.vatTu?.donVi||""}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-xs">{fmt(r.donGia)}₫</td>
                      <td className="px-3 py-2 text-right font-semibold">{fmt(r.thanhTien)}₫</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td colSpan={4} className="px-3 py-2 text-right font-bold text-slate-700">Tổng cộng:</td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-700 text-base">{fmt(selected.tongTien)}₫</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL XÁC NHẬN XOÁ ── */}
      {modal==="confirmDelete" && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-red-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={18} className="text-red-500"/>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Xoá phiếu nhập kho?</p>
                  <p className="text-xs text-slate-500 mt-0.5">Hành động này không thể hoàn tác</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1 text-sm">
                <p><span className="text-slate-400 text-xs">Số phiếu:</span> <span className="font-mono font-semibold text-slate-800">{deleteTarget.soPhieu}</span></p>
                <p><span className="text-slate-400 text-xs">Nhà CC:</span> <span className="text-slate-700">{getNccLabel(deleteTarget.nhaCC)}</span></p>
                <p><span className="text-slate-400 text-xs">Tổng tiền:</span> <span className="font-semibold text-red-600">{fmt(deleteTarget.tongTien)}₫</span></p>
              </div>
              <p className="text-xs text-slate-500">
                ⚠️ Tồn kho và công nợ liên quan sẽ được <strong>đảo ngược</strong> tự động.
              </p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={()=>{setModal(null);setDeleteTarget(null);}}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Đang xoá..." : "Xoá phiếu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
