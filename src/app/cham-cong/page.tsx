"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Users, Printer } from "lucide-react";

type NhanVien = {
  id: string; maNV: string; ten: string;
  chucVu: string | null; phongBan: string | null;
  luongCB: number | null; active: boolean;
};

type ChamCong = {
  id: string; nhanVienId: string; ngay: string; trangThai: string; ghiChu: string | null;
};

// Trạng thái chấm công
const TRANG_THAI = [
  { key: "di_lam",     label: "✓",   title: "Đi làm",       bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  { key: "nghi_phep",  label: "NP",  title: "Nghỉ phép",     bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-300" },
  { key: "vang",       label: "V",   title: "Vắng",          bg: "bg-red-100",     text: "text-red-700",     border: "border-red-300" },
  { key: "di_muon",    label: "M",   title: "Đi muộn",       bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-300" },
  { key: "nua_ngay",   label: "½",   title: "Nửa ngày",      bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-300" },
  { key: "nghi_le",    label: "L",   title: "Nghỉ lễ",       bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-300" },
];
const TT_MAP = Object.fromEntries(TRANG_THAI.map(t => [t.key, t]));
const CYCLE = ["di_lam", "nghi_phep", "vang", "di_muon", "nua_ngay", "nghi_le", ""];

const fmt = (n: number) => n.toLocaleString("vi-VN");
const DAY_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ChamCongPage() {
  const now = new Date();
  const [thang, setThang] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);
  const [chamCongs, setChamCongs] = useState<ChamCong[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "nvId_ngay"

  // Modal quản lý NV
  const [showNVModal, setShowNVModal] = useState(false);
  const [allNVs, setAllNVs] = useState<NhanVien[]>([]);
  const [nvForm, setNvForm] = useState({ maNV: "", ten: "", chucVu: "", phongBan: "", luongCB: "" });
  const [editingNV, setEditingNV] = useState<NhanVien | null>(null);
  const [savingNV, setSavingNV] = useState(false);
  const [nvError, setNvError] = useState("");

  // Parse tháng
  const [year, month] = thang.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setThang(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setThang(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const isWeekend = (day: number) => {
    const dow = new Date(year, month - 1, day).getDay();
    return dow === 0 || dow === 6;
  };

  const getDayLabel = (day: number) => DAY_OF_WEEK[new Date(year, month - 1, day).getDay()];

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await fetch(`/api/cham-cong?thang=${thang}`).then(r => r.json());
    setNhanViens(Array.isArray(data.nhanViens) ? data.nhanViens : []);
    setChamCongs(Array.isArray(data.chamCongs) ? data.chamCongs : []);
    setLoading(false);
  }, [thang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Map nhanh: "nvId_ngayISO" → trangThai
  const ccMap = useMemo(() => {
    const m: Record<string, string> = {};
    chamCongs.forEach(c => {
      const dateKey = c.ngay.slice(0, 10); // YYYY-MM-DD
      m[`${c.nhanVienId}_${dateKey}`] = c.trangThai;
    });
    return m;
  }, [chamCongs]);

  const getKey = (nvId: string, day: number) =>
    `${nvId}_${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleCellClick = async (nvId: string, day: number) => {
    const key = getKey(nvId, day);
    const cur = ccMap[key] ?? "";
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    const ngay = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Optimistic update
    setChamCongs(prev => {
      const existing = prev.find(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay);
      if (!next) return prev.filter(c => !(c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay));
      if (existing) return prev.map(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, trangThai: next } : c);
      return [...prev, { id: "tmp", nhanVienId: nvId, ngay: ngay + "T00:00:00.000Z", trangThai: next, ghiChu: null }];
    });

    setSaving(key);
    await fetch("/api/cham-cong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId: nvId, ngay, trangThai: next || null }),
    }).catch(() => fetchData());
    setSaving(null);
  };

  // Summary per employee
  const getSummary = (nvId: string) => {
    const counts: Record<string, number> = {};
    days.forEach(d => {
      if (isWeekend(d)) return;
      const tt = ccMap[getKey(nvId, d)] ?? "";
      if (tt) counts[tt] = (counts[tt] ?? 0) + (tt === "nua_ngay" ? 0.5 : 1);
    });
    return counts;
  };

  // Working days in month (excluding weekends)
  const soNgayLamViec = days.filter(d => !isWeekend(d)).length;

  // Auto-generate maNV: NV001, NV002...
  const genMaNV = (list: NhanVien[]) => {
    const nums = list.map(n => parseInt(n.maNV.replace(/\D/g, ""))).filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `NV${String(next).padStart(3, "0")}`;
  };

  // Open NV modal
  const openNVModal = async () => {
    const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
    const list = Array.isArray(data) ? data : [];
    setAllNVs(list);
    // Tự điền maNV tiếp theo
    setNvForm(f => ({ ...f, maNV: genMaNV(list) }));
    setNvError("");
    setShowNVModal(true);
  };

  const saveNV = async () => {
    setNvError("");
    if (!nvForm.ten.trim()) { setNvError("Vui lòng nhập họ tên nhân viên"); return; }
    if (!nvForm.maNV.trim()) { setNvError("Vui lòng nhập mã nhân viên"); return; }
    setSavingNV(true);
    try {
      if (editingNV) {
        const res = await fetch(`/api/cham-cong/nhan-vien/${editingNV.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten: nvForm.ten, chucVu: nvForm.chucVu, phongBan: nvForm.phongBan, luongCB: nvForm.luongCB }),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi cập nhật"); return; }
      } else {
        const res = await fetch("/api/cham-cong/nhan-vien", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nvForm),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi thêm nhân viên"); return; }
      }
      const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
      const list = Array.isArray(data) ? data : [];
      setAllNVs(list);
      setNvForm({ maNV: genMaNV(list), ten: "", chucVu: "", phongBan: "", luongCB: "" });
      setEditingNV(null);
      fetchData();
    } finally {
      setSavingNV(false);
    }
  };

  const toggleActiveNV = async (nv: NhanVien) => {
    await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !nv.active }),
    });
    const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
    setAllNVs(Array.isArray(data) ? data : []);
    fetchData();
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Chấm Công</h1>
          <p className="text-sm text-slate-400 mt-0.5">{nhanViens.length} nhân viên · {soNgayLamViec} ngày làm việc tháng này</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNVModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
            <Users size={14} /> Nhân viên
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
            <Printer size={14} /> In bảng
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronLeft size={16} /></button>
          <span className="text-base font-bold text-slate-800 min-w-[140px] text-center">
            Tháng {month}/{year}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronRight size={16} /></button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          {TRANG_THAI.map(tt => (
            <span key={tt.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tt.bg} ${tt.text}`}>
              <span className="font-bold">{tt.label}</span> {tt.title}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">T7/CN xám</span>
        </div>
      </div>

      {/* Bảng chấm công */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Đang tải...</div>
      ) : nhanViens.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có nhân viên. <button onClick={openNVModal} className="text-rose-500 hover:underline">Thêm nhân viên</button></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse" style={{ minWidth: `${80 + 180 + daysInMonth * 34 + 180}px` }}>
              <thead>
                {/* Row 1: tháng + ngày */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 border-r border-slate-200 w-8">STT</th>
                  <th className="sticky left-8 z-10 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 border-r border-slate-200 min-w-[160px]">Nhân viên</th>
                  {days.map(d => (
                    <th key={d} className={`px-0 py-1 text-center w-[34px] font-semibold ${isWeekend(d) ? "bg-slate-100 text-slate-400" : "text-slate-600"}`}>
                      <div>{d}</div>
                      <div className={`text-[10px] font-normal ${isWeekend(d) ? "text-slate-400" : "text-slate-400"}`}>{getDayLabel(d)}</div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-emerald-700 bg-emerald-50 border-l border-slate-200 w-10">Công</th>
                  <th className="px-2 py-2 text-center font-semibold text-blue-700 bg-blue-50 w-8">NP</th>
                  <th className="px-2 py-2 text-center font-semibold text-red-700 bg-red-50 w-8">V</th>
                  <th className="px-2 py-2 text-center font-semibold text-amber-700 bg-amber-50 w-8">M</th>
                  <th className="px-2 py-2 text-center font-semibold text-cyan-700 bg-cyan-50 w-8">½</th>
                  <th className="px-2 py-2 text-center font-semibold text-purple-700 bg-purple-50 w-8">L</th>
                </tr>
              </thead>
              <tbody>
                {nhanViens.map((nv, idx) => {
                  const summary = getSummary(nv.id);
                  const cong = (summary["di_lam"] ?? 0) + (summary["di_muon"] ?? 0) + (summary["nua_ngay"] ?? 0);
                  return (
                    <tr key={nv.id} className={`border-b border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-rose-50/20 transition`}>
                      {/* STT */}
                      <td className={`sticky left-0 z-10 px-3 py-1.5 text-center text-slate-400 border-r border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                        {idx + 1}
                      </td>
                      {/* Tên NV */}
                      <td className={`sticky left-8 z-10 px-3 py-1.5 border-r border-slate-100 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                        <p className="font-semibold text-slate-800 text-[13px]">{nv.ten}</p>
                        {nv.chucVu && <p className="text-[11px] text-slate-400">{nv.chucVu}</p>}
                      </td>
                      {/* Cells */}
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tt = ccMap[key] ?? "";
                        const info = TT_MAP[tt];
                        const isSaving = saving === key;
                        const weekend = isWeekend(d);
                        return (
                          <td key={d}
                            className={`p-0 text-center cursor-pointer select-none border border-slate-100 transition
                              ${weekend ? "bg-slate-100/80" : ""}
                              ${isSaving ? "opacity-50" : ""}
                            `}
                            onClick={() => !weekend && handleCellClick(nv.id, d)}
                            title={info?.title ?? (weekend ? getDayLabel(d) : "Click để chấm")}
                          >
                            {info ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold ${info.bg} ${info.text}`}>
                                {info.label}
                              </span>
                            ) : (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[10px] ${weekend ? "text-slate-300" : "text-slate-200 hover:text-slate-400"}`}>
                                {weekend ? "—" : ""}
                              </span>
                            )}
                          </td>
                        );
                      })}
                      {/* Summary */}
                      <td className="px-2 py-1.5 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200">{cong || "—"}</td>
                      <td className="px-2 py-1.5 text-center text-blue-700 bg-blue-50/50">{summary["nghi_phep"] || ""}</td>
                      <td className="px-2 py-1.5 text-center text-red-700 bg-red-50/50 font-semibold">{summary["vang"] || ""}</td>
                      <td className="px-2 py-1.5 text-center text-amber-700 bg-amber-50/50">{summary["di_muon"] || ""}</td>
                      <td className="px-2 py-1.5 text-center text-cyan-700 bg-cyan-50/50">{summary["nua_ngay"] || ""}</td>
                      <td className="px-2 py-1.5 text-center text-purple-700 bg-purple-50/50">{summary["nghi_le"] || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer tổng */}
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-[12px]">
                <tr>
                  <td colSpan={2} className="sticky left-0 z-10 bg-slate-100 px-3 py-2 border-r border-slate-200 text-slate-600">
                    Tổng ({nhanViens.length} NV)
                  </td>
                  {days.map(d => {
                    const count = nhanViens.filter(nv => {
                      const tt = ccMap[getKey(nv.id, d)] ?? "";
                      return tt === "di_lam" || tt === "di_muon";
                    }).length;
                    const weekend = isWeekend(d);
                    return (
                      <td key={d} className={`text-center py-2 ${weekend ? "bg-slate-200/60 text-slate-400" : count > 0 ? "text-slate-700" : "text-slate-300"}`}>
                        {!weekend && count > 0 ? count : ""}
                      </td>
                    );
                  })}
                  <td colSpan={6} className="bg-slate-100 border-l border-slate-200"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ═══ MODAL NHÂN VIÊN ═══ */}
      {showNVModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Quản lý Nhân viên</h2>
              <button onClick={() => { setShowNVModal(false); setEditingNV(null); setNvError(""); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", luongCB: "" }); }}
                className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Form thêm/sửa */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">{editingNV ? `Sửa: ${editingNV.ten}` : "Thêm nhân viên"}</h3>
                {nvError && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{nvError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Mã NV *</label>
                    <input value={nvForm.maNV} onChange={e => setNvForm(f => ({ ...f, maNV: e.target.value }))}
                      disabled={!!editingNV}
                      placeholder="VD: NV001"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Họ tên *</label>
                    <input value={nvForm.ten} onChange={e => setNvForm(f => ({ ...f, ten: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Chức vụ</label>
                    <input value={nvForm.chucVu} onChange={e => setNvForm(f => ({ ...f, chucVu: e.target.value }))}
                      placeholder="Nhân viên kho..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Phòng ban</label>
                    <input value={nvForm.phongBan} onChange={e => setNvForm(f => ({ ...f, phongBan: e.target.value }))}
                      placeholder="Kho, Sản xuất..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Lương cơ bản</label>
                    <input type="number" value={nvForm.luongCB} onChange={e => setNvForm(f => ({ ...f, luongCB: e.target.value }))}
                      placeholder="VD: 5000000"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {editingNV && (
                    <button onClick={() => { setEditingNV(null); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", luongCB: "" }); }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition">Huỷ</button>
                  )}
                  <button onClick={saveNV} disabled={savingNV}
                    className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition disabled:opacity-60">
                    {savingNV ? "Đang lưu..." : editingNV ? "Cập nhật" : "+ Thêm"}
                  </button>
                </div>
              </div>

              {/* Danh sách NV */}
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {allNVs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Chưa có nhân viên</p>}
                {allNVs.map(nv => (
                  <div key={nv.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${nv.active ? "bg-white border border-slate-100" : "bg-slate-50 opacity-60"}`}>
                    <div>
                      <span className="font-mono text-xs text-slate-400 mr-2">{nv.maNV}</span>
                      <span className="font-medium text-slate-800 text-sm">{nv.ten}</span>
                      {nv.chucVu && <span className="text-xs text-slate-400 ml-2">{nv.chucVu}</span>}
                      {nv.luongCB && <span className="text-xs text-emerald-600 ml-2">{fmt(nv.luongCB)}₫</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingNV(nv); setNvForm({ maNV: nv.maNV, ten: nv.ten, chucVu: nv.chucVu ?? "", phongBan: nv.phongBan ?? "", luongCB: nv.luongCB ? String(nv.luongCB) : "" }); }}
                        className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50 transition">Sửa</button>
                      <button onClick={() => toggleActiveNV(nv)}
                        className={`text-xs px-2 py-1 rounded transition ${nv.active ? "text-slate-400 hover:bg-red-50 hover:text-red-500" : "text-green-600 hover:bg-green-50"}`}>
                        {nv.active ? "Ẩn" : "Kích hoạt"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
