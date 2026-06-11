"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Pencil, Trash2, X, BookOpen, TrendingDown, TrendingUp, Wallet, RefreshCw, UserPlus, ArrowDownToLine } from "lucide-react";

type NhaCungCap = { id: string; ma: string; ten: string };

const LOAI_GD = [
  { key: "mua_hang",       label: "Mua hàng",       sign: +1, color: "text-red-600",   bg: "bg-red-50 text-red-700 border-red-200" },
  { key: "tra_tien",       label: "Thanh toán",      sign: -1, color: "text-green-600", bg: "bg-green-50 text-green-700 border-green-200" },
  { key: "dieu_chinh_no",  label: "Điều chỉnh nợ",  sign: +1, color: "text-orange-600",bg: "bg-orange-50 text-orange-700 border-orange-200" },
  { key: "dieu_chinh_co",  label: "Điều chỉnh có",  sign: -1, color: "text-blue-600",  bg: "bg-blue-50 text-blue-700 border-blue-200" },
];

type CongNo = {
  id: string; nhaCC: string; ngay: string; soChungTu: string | null;
  dienGiai: string; loai: string; soTien: number; ghiChu: string | null;
  nguoiTao: string | null; createdAt: string;
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");

const emptyForm = {
  ngay: new Date().toISOString().slice(0, 10),
  soChungTu: "", dienGiai: "", loai: "mua_hang", soTien: "", ghiChu: "", nguoiTao: "",
};

export default function CongNoPage() {
  const [nhaCCList, setNhaCCList] = useState<NhaCungCap[]>([]);
  const [nhaCC, setNhaCC] = useState("");
  const [records, setRecords] = useState<CongNo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<CongNo | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CongNo | null>(null);
  const [showAddNCC, setShowAddNCC] = useState(false);
  const [nccForm, setNccForm] = useState({ ten: "", sdt: "", diaChi: "" });
  const [nccLoading, setNccLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNCC = async (keepSelected?: string) => {
    const data: NhaCungCap[] = await fetch("/api/ke-toan/nha-cung-cap").then(r => r.json());
    if (Array.isArray(data)) {
      setNhaCCList(data);
      if (keepSelected && data.find(n => n.id === keepSelected)) {
        setNhaCC(keepSelected);
      } else if (data.length > 0) {
        setNhaCC(prev => prev || data[0].id);
      }
    }
  };

  // Fetch danh sách nhà cung cấp động
  useEffect(() => { fetchNCC(); }, []);

  const handleRefreshNCC = async () => {
    setRefreshing(true);
    await fetchNCC(nhaCC);
    setRefreshing(false);
  };

  const handleAddNCC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nccForm.ten.trim()) return;
    setNccLoading(true);
    try {
      const maAuto = "NCC" + Date.now().toString().slice(-6);
      const res = await fetch("/api/ke-toan/nha-cung-cap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma: maAuto, ten: nccForm.ten.trim(), sdt: nccForm.sdt || null, diaChi: nccForm.diaChi || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const newNCC: NhaCungCap = await res.json();
      setShowAddNCC(false);
      setNccForm({ ten: "", sdt: "", diaChi: "" });
      await fetchNCC(newNCC.id);
    } catch (err) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setNccLoading(false); }
  };

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    const current = nhaCCList.find(n => n.id === nhaCC);
    if (!current) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/ke-toan/cong-no/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nhaCCId: current.id, nhaCCTen: current.ten }),
      });
      const result = await res.json();
      if (result.created > 0) {
        alert(`Đã đồng bộ ${result.created} phiếu nhập kho vào công nợ.`);
        fetchData();
      } else {
        alert(result.message || "Không có phiếu mới cần đồng bộ.");
      }
    } catch { alert("Lỗi đồng bộ"); }
    finally { setSyncing(false); }
  };

  const fetchData = async () => {
    if (!nhaCC) return;
    const data = await fetch(`/api/ke-toan/cong-no?nhaCC=${nhaCC}`).then(r => r.json());
    setRecords(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchData(); }, [nhaCC]);

  // Tính số dư lũy kế theo ngày
  const rows = useMemo(() => {
    let balance = 0;
    return records.map(r => {
      const loaiInfo = LOAI_GD.find(l => l.key === r.loai);
      const sign = loaiInfo?.sign ?? 1;
      const no  = sign === +1 ? r.soTien : 0;  // nợ phát sinh
      const co  = sign === -1 ? r.soTien : 0;  // có (thanh toán)
      balance += no - co;
      return { ...r, no, co, balance };
    });
  }, [records]);

  const tongNo  = rows.reduce((s, r) => s + r.no, 0);
  const tongCo  = rows.reduce((s, r) => s + r.co, 0);
  const conLai  = tongNo - tongCo;

  const openAdd = () => {
    setEditRecord(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (r: CongNo) => {
    setEditRecord(r);
    setForm({
      ngay: r.ngay.slice(0, 10), soChungTu: r.soChungTu ?? "",
      dienGiai: r.dienGiai, loai: r.loai,
      soTien: String(r.soTien), ghiChu: r.ghiChu ?? "", nguoiTao: r.nguoiTao ?? "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...form, nhaCC, soTien: Number(form.soTien) };
      const url  = editRecord ? `/api/ke-toan/cong-no/${editRecord.id}` : "/api/ke-toan/cong-no";
      const res  = await fetch(url, {
        method: editRecord ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setShowModal(false);
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/ke-toan/cong-no/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    fetchData();
  };

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-500" /> Công nợ nhà cung cấp
        </h1>
        <p className="text-slate-500 text-sm mt-1">Theo dõi nợ phải trả theo từng nhà cung cấp</p>
      </div>

      {/* Tabs nhà cung cấp */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {nhaCCList.map(nc => (
          <button key={nc.id} onClick={() => setNhaCC(nc.id)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold border transition ${
              nhaCC === nc.id
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}>
            {nc.ten}
          </button>
        ))}
        {/* Nút thêm NCC + làm mới */}
        <button onClick={() => { setNccForm({ ten: "", sdt: "", diaChi: "" }); setShowAddNCC(true); }}
          title="Thêm nhà cung cấp mới"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition">
          <UserPlus size={14} /> Thêm NCC
        </button>
        <button onClick={handleRefreshNCC} disabled={refreshing}
          title="Cập nhật danh sách từ nhập kho"
          className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-400" />
            <p className="text-xs text-slate-500">Tổng nợ phát sinh</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{fmt(tongNo)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-400" />
            <p className="text-xs text-slate-500">Đã thanh toán</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{fmt(tongCo)}</p>
        </div>
        <div className={`rounded-xl p-4 border ${conLai > 0 ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100"}`}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className={conLai > 0 ? "text-amber-400" : "text-slate-400"} />
            <p className="text-xs text-slate-500">Còn nợ</p>
          </div>
          <p className={`text-2xl font-bold ${conLai > 0 ? "text-amber-600" : "text-slate-600"}`}>{fmt(conLai)}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-700">
          Sổ cái — {nhaCCList.find(n => n.id === nhaCC)?.ten ?? ""}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={handleSync} disabled={syncing}
            title="Kéo phiếu nhập kho cũ vào công nợ theo tên NCC"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 text-sm rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition">
            <ArrowDownToLine size={14} className={syncing ? "animate-bounce" : ""} />
            {syncing ? "Đang đồng bộ..." : "Đồng bộ từ nhập kho"}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm">
            <Plus size={16} /> Thêm giao dịch
          </button>
        </div>
      </div>

      {/* Bảng sổ cái */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Số CT</th>
                <th className="px-4 py-3 text-left">Diễn giải</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-right text-red-500">Nợ phát sinh</th>
                <th className="px-4 py-3 text-right text-green-600">Thanh toán</th>
                <th className="px-4 py-3 text-right text-indigo-600">Số dư</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Chưa có giao dịch nào với {nhaCCList.find(n => n.id === nhaCC)?.ten ?? ""}</p>
                  </td>
                </tr>
              ) : rows.map(r => {
                const loaiInfo = LOAI_GD.find(l => l.key === r.loai);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3 text-slate-600">{fmtDate(r.ngay)}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{r.soChungTu || "—"}</td>
                    <td className="px-4 py-3 text-slate-800">
                      <p className="font-medium">{r.dienGiai}</p>
                      {r.ghiChu && <p className="text-xs text-slate-400">{r.ghiChu}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${loaiInfo?.bg ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                        {loaiInfo?.label ?? r.loai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {r.no > 0 ? fmt(r.no) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {r.co > 0 ? fmt(r.co) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${r.balance > 0 ? "text-amber-600" : r.balance < 0 ? "text-blue-600" : "text-slate-400"}`}>
                      {fmt(r.balance)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEdit(r)} className="p-1 text-slate-400 hover:text-indigo-600 rounded"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(r)} className="p-1 text-slate-400 hover:text-red-600 rounded"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-indigo-50 border-t-2 border-indigo-100 font-semibold text-sm">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-slate-600">Tổng cộng</td>
                  <td className="px-4 py-3 text-right text-red-600">{fmt(tongNo)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{fmt(tongCo)}</td>
                  <td className={`px-4 py-3 text-right ${conLai > 0 ? "text-amber-600" : "text-slate-600"}`}>{fmt(conLai)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{editRecord ? "Sửa giao dịch" : "Thêm giao dịch"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ngày *</label>
                  <input type="date" required value={form.ngay}
                    onChange={e => setForm(f => ({ ...f, ngay: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Số chứng từ</label>
                  <input value={form.soChungTu} placeholder="VD: HD0001"
                    onChange={e => setForm(f => ({ ...f, soChungTu: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Loại giao dịch *</label>
                <div className="grid grid-cols-2 gap-2">
                  {LOAI_GD.map(l => (
                    <button key={l.key} type="button"
                      onClick={() => setForm(f => ({ ...f, loai: l.key }))}
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition ${form.loai === l.key ? l.bg + " border-current" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Diễn giải *</label>
                <input required value={form.dienGiai} placeholder="VD: Mua vải OR02, hoá đơn số..."
                  onChange={e => setForm(f => ({ ...f, dienGiai: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Số tiền (VNĐ) *</label>
                <input required type="number" min="1" value={form.soTien}
                  onChange={e => setForm(f => ({ ...f, soTien: e.target.value }))} className={inp} placeholder="0" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Ghi chú</label>
                <input value={form.ghiChu}
                  onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))} className={inp} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {loading ? "Đang lưu..." : editRecord ? "Lưu" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm NCC */}
      {showAddNCC && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><UserPlus size={16} className="text-indigo-500" /> Thêm nhà cung cấp</h2>
              <button onClick={() => setShowAddNCC(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddNCC} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tên nhà cung cấp *</label>
                <input required value={nccForm.ten} placeholder="VD: Hắc Long"
                  onChange={e => setNccForm(f => ({ ...f, ten: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Số điện thoại</label>
                <input value={nccForm.sdt} placeholder="0901..."
                  onChange={e => setNccForm(f => ({ ...f, sdt: e.target.value }))} className={inp} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Địa chỉ</label>
                <input value={nccForm.diaChi}
                  onChange={e => setNccForm(f => ({ ...f, diaChi: e.target.value }))} className={inp} />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddNCC(false)}
                  className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={nccLoading}
                  className="flex-1 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                  {nccLoading ? "Đang thêm..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm xoá */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-800 mb-2">Xoá giao dịch?</h3>
            <p className="text-sm text-slate-500 mb-4">{deleteTarget.dienGiai} — {fmt(deleteTarget.soTien)}</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">Huỷ</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
