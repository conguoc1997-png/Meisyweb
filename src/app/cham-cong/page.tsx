"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Users, Printer, CalendarDays, Trash2 } from "lucide-react";

type NhanVien = {
  id: string; maNV: string; ten: string;
  chucVu: string | null; phongBan: string | null;
  luongCB: number | null; phuCapChuyenCan: number | null; phuCapAn: number | null; heSoTC: number;
  active: boolean;
};

type ChamCong = {
  id: string; nhanVienId: string; ngay: string; trangThai: string;
  tangCa: number | null; ghiChu: string | null;
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

// Ngày lễ cố định hàng năm (MM-DD)
const FIXED_HOLIDAYS: { key: string; label: string }[] = [
  { key: "01-01", label: "Tết Dương lịch" },
  { key: "04-30", label: "Giải phóng miền Nam" },
  { key: "05-01", label: "Quốc tế Lao động" },
  { key: "09-02", label: "Quốc khánh" },
];

// Tạo danh sách ngày lễ mặc định cho 1 năm (YYYY-MM-DD)
const buildDefaultHolidays = (y: number): string[] =>
  FIXED_HOLIDAYS.map(h => `${y}-${h.key}`);

export default function ChamCongPage() {
  const now = new Date();
  const [thang, setThang] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);
  const [chamCongs, setChamCongs] = useState<ChamCong[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "nvId_ngay"

  // Ngày lễ — lưu vào localStorage theo năm
  const [holidays, setHolidaysRaw] = useState<string[]>(() => {
    try {
      const y = new Date().getFullYear();
      const saved = localStorage.getItem(`meisy_holidays_${y}`);
      return saved ? JSON.parse(saved) : buildDefaultHolidays(y);
    } catch { return buildDefaultHolidays(new Date().getFullYear()); }
  });
  const setHolidays = (list: string[]) => {
    setHolidaysRaw(list);
    try { localStorage.setItem(`meisy_holidays_${year}`, JSON.stringify(list)); } catch {}
  };
  const [activeTab, setActiveTab] = useState<"chamcong" | "luong">("chamcong");
  // Danh sách phòng ban — lưu localStorage
  const DEFAULT_PHONG_BAN = ["Kho", "May", "CSKH", "Livestream"];
  const [phongBanList, setPhongBanListRaw] = useState<string[]>(() => {
    try { const s = localStorage.getItem("meisy_phong_ban"); return s ? JSON.parse(s) : DEFAULT_PHONG_BAN; } catch { return DEFAULT_PHONG_BAN; }
  });
  const setPhongBanList = (list: string[]) => {
    setPhongBanListRaw(list);
    try { localStorage.setItem("meisy_phong_ban", JSON.stringify(list)); } catch {}
  };
  const [newPhongBan, setNewPhongBan] = useState("");

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  // Lưu nhãn ngày lễ
  const [holidayLabels, setHolidayLabelsRaw] = useState<Record<string, string>>(() => {
    try { const s = localStorage.getItem("meisy_holiday_labels"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const setHolidayLabels = (m: Record<string, string>) => {
    setHolidayLabelsRaw(m); try { localStorage.setItem("meisy_holiday_labels", JSON.stringify(m)); } catch {};
  };

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

  const isSunday = (day: number) => new Date(year, month - 1, day).getDay() === 0;
  const isSaturday = (day: number) => new Date(year, month - 1, day).getDay() === 6;
  const isHoliday = (day: number) => {
    const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return holidays.includes(key);
  };
  // Ngày nghỉ mặc định = CN hoặc ngày lễ (nhưng vẫn click được)
  const isDayOff = (day: number) => isSunday(day) || isHoliday(day);
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
      const dateKey = c.ngay.slice(0, 10);
      m[`${c.nhanVienId}_${dateKey}`] = c.trangThai;
    });
    return m;
  }, [chamCongs]);

  // Map tăng ca: "nvId_ngayISO" → số giờ TC
  const tcMap = useMemo(() => {
    const m: Record<string, number> = {};
    chamCongs.forEach(c => {
      if (c.tangCa != null && c.tangCa > 0) {
        const dateKey = c.ngay.slice(0, 10);
        m[`${c.nhanVienId}_${dateKey}`] = c.tangCa;
      }
    });
    return m;
  }, [chamCongs]);

  const getKey = (nvId: string, day: number) =>
    `${nvId}_${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const handleCellClick = async (nvId: string, day: number) => {
    // Xác nhận khi bấm vào ngày CN (chưa có dữ liệu)
    const key = getKey(nvId, day);
    const cur = ccMap[key] ?? "";
    if (isSunday(day) && !cur) {
      if (!confirm(`Ngày ${day}/${month} là Chủ Nhật.\nBạn có chắc muốn chấm công ngày này không?`)) return;
    }
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

  // Tăng ca: lưu số giờ
  const handleTCChange = async (nvId: string, day: number, val: string) => {
    const ngay = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const tangCa = val === "" ? null : parseFloat(val);
    // Optimistic
    setChamCongs(prev => {
      const existing = prev.find(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay);
      if (existing) return prev.map(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, tangCa } : c);
      if (!tangCa) return prev;
      return [...prev, { id: "tmp2", nhanVienId: nvId, ngay: ngay + "T00:00:00.000Z", trangThai: "", tangCa, ghiChu: null }];
    });
    await fetch("/api/cham-cong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId: nvId, ngay, tangCa }),
    }).catch(() => fetchData());
  };

  // Summary per employee
  const getSummary = (nvId: string) => {
    const counts: Record<string, number> = {};
    days.forEach(d => {
      if (isDayOff(d)) return;
      const tt = ccMap[getKey(nvId, d)] ?? "";
      if (tt) counts[tt] = (counts[tt] ?? 0) + (tt === "nua_ngay" ? 0.5 : 1);
    });
    return counts;
  };

  // Working days in month (excluding weekends)
  const soNgayLamViec = days.filter(d => !isDayOff(d)).length;

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
          <button onClick={() => setShowHolidayModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 text-sm text-purple-600 hover:bg-purple-50 transition">
            <CalendarDays size={14} /> Ngày lễ
          </button>
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

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-4">
        <button onClick={() => setActiveTab("chamcong")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "chamcong" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          📋 Chấm công
        </button>
        <button onClick={() => setActiveTab("luong")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "luong" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          💰 Bảng lương
        </button>
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

      {/* ─── TAB CHẤM CÔNG ─── */}
      {activeTab === "chamcong" && (loading ? (
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
                    <th key={d} className={`px-0 py-1 text-center w-[34px] font-semibold
                      ${isSunday(d) ? "bg-slate-100 text-slate-400" : isHoliday(d) ? "bg-purple-50 text-purple-500" : "text-slate-600"}`}>
                      <div>{d}</div>
                      <div className="text-[10px] font-normal">{getDayLabel(d)}</div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-emerald-700 bg-emerald-50 border-l border-slate-200 w-10">Công</th>
                  <th className="px-2 py-2 text-center font-semibold text-blue-700 bg-blue-50 w-8">NP</th>
                  <th className="px-2 py-2 text-center font-semibold text-red-700 bg-red-50 w-8">V</th>
                  <th className="px-2 py-2 text-center font-semibold text-amber-700 bg-amber-50 w-8">M</th>
                  <th className="px-2 py-2 text-center font-semibold text-cyan-700 bg-cyan-50 w-8">½</th>
                  <th className="px-2 py-2 text-center font-semibold text-purple-700 bg-purple-50 w-8">L</th>
                  <th className="px-2 py-2 text-center font-semibold text-orange-700 bg-orange-50 border-l border-orange-200 w-10">TC giờ</th>
                </tr>
              </thead>
              <tbody>
                {nhanViens.map((nv, idx) => {
                  const summary = getSummary(nv.id);
                  const cong = (summary["di_lam"] ?? 0) + (summary["di_muon"] ?? 0) + (summary["nua_ngay"] ?? 0);
                  const tongTC = days.reduce((s, d) => s + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  return (
                    <>
                    {/* ── Dòng 1: chấm công ── */}
                    <tr key={nv.id} className={`${rowBg} hover:bg-rose-50/20 transition`}>
                      {/* STT — rowSpan=2 */}
                      <td rowSpan={2} className={`sticky left-0 z-10 px-3 py-1.5 text-center text-slate-400 border-r border-slate-100 border-b-2 border-b-slate-200 ${rowBg}`}>
                        {idx + 1}
                      </td>
                      {/* Tên NV — rowSpan=2 */}
                      <td rowSpan={2} className={`sticky left-8 z-10 px-3 py-1.5 border-r border-slate-100 border-b-2 border-b-slate-200 ${rowBg}`}>
                        <p className="font-semibold text-slate-800 text-[13px]">{nv.ten}</p>
                        {nv.chucVu && <p className="text-[11px] text-slate-400">{nv.chucVu}</p>}
                      </td>
                      {/* Cells chấm công */}
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tt = ccMap[key] ?? "";
                        const info = TT_MAP[tt];
                        const isSaving = saving === key;
                        const sun = isSunday(d);
                        const holiday = isHoliday(d);
                        const defaultBg = sun ? "bg-slate-100/80" : holiday ? "bg-purple-50/60" : "";
                        return (
                          <td key={d}
                            className={`p-0 text-center cursor-pointer select-none border-x border-slate-100 transition hover:brightness-95 ${defaultBg} ${isSaving ? "opacity-50" : ""}`}
                            onClick={() => handleCellClick(nv.id, d)}
                            title={info?.title ?? (sun ? "Chủ nhật" : holiday ? (holidayLabels[`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`] ?? "Ngày lễ") : "Click để chấm công")}
                          >
                            {info ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold ${info.bg} ${info.text}`}>
                                {info.label}
                              </span>
                            ) : sun ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-slate-300">CN</span>
                            ) : holiday ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-purple-300">L</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-slate-200 hover:text-slate-400"></span>
                            )}
                          </td>
                        );
                      })}
                      {/* Summary row 1 — rowSpan=2 */}
                      <td rowSpan={2} className="px-2 py-1.5 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200 border-b-2 border-b-slate-200">{cong || "—"}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-blue-700 bg-blue-50/50 border-b-2 border-b-slate-200">{summary["nghi_phep"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-red-700 bg-red-50/50 font-semibold border-b-2 border-b-slate-200">{summary["vang"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-amber-700 bg-amber-50/50 border-b-2 border-b-slate-200">{summary["di_muon"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-cyan-700 bg-cyan-50/50 border-b-2 border-b-slate-200">{summary["nua_ngay"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-purple-700 bg-purple-50/50 border-b-2 border-b-slate-200">{summary["nghi_le"] || ""}</td>
                      <td rowSpan={2} className={`px-1 py-1.5 text-center font-bold border-l border-orange-200 border-b-2 border-b-slate-200 ${tongTC > 0 ? "text-orange-700 bg-orange-50/60" : "bg-orange-50/20 text-slate-300"}`}>
                        {tongTC > 0 ? tongTC : "—"}
                      </td>
                    </tr>
                    {/* ── Dòng 2: tăng ca ── */}
                    <tr key={`${nv.id}-tc`} className={`border-b-2 border-slate-200 ${rowBg}`}>
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tc = tcMap[key];
                        const sun = isSunday(d);
                        return (
                          <td key={d} className={`p-px border-x border-slate-100 ${sun ? "bg-slate-100/60" : "bg-orange-50/40"}`}>
                            {!sun ? (
                              <input
                                type="number"
                                min="0"
                                max="24"
                                step="0.5"
                                value={tc ?? ""}
                                onChange={e => {
                                  const val = e.target.value;
                                  const tcVal = val === "" ? null : Math.min(24, parseFloat(val));
                                  setChamCongs(prev => {
                                    const ngay = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                                    const existing = prev.find(c => c.nhanVienId === nv.id && c.ngay.slice(0,10) === ngay);
                                    if (existing) return prev.map(c => c.nhanVienId === nv.id && c.ngay.slice(0,10) === ngay ? { ...c, tangCa: tcVal } : c);
                                    if (!tcVal) return prev;
                                    return [...prev, { id: "tmp3", nhanVienId: nv.id, ngay: ngay + "T00:00:00.000Z", trangThai: "", tangCa: tcVal, ghiChu: null }];
                                  });
                                }}
                                onBlur={e => handleTCChange(nv.id, d, e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                placeholder=""
                                className="w-full h-7 text-center text-xs font-bold text-orange-700 bg-transparent border border-orange-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-orange-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                title="Số giờ tăng ca"
                              />
                            ) : (
                              <div className="h-6" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                    </>
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
                    const weekend = isDayOff(d);
                    return (
                      <td key={d} className={`text-center py-2 ${weekend ? "bg-slate-200/60 text-slate-400" : count > 0 ? "text-slate-700" : "text-slate-300"}`}>
                        {!weekend && count > 0 ? count : ""}
                      </td>
                    );
                  })}
                  <td colSpan={6} className="bg-slate-100 border-l border-slate-200"></td>
                  <td className="bg-orange-50/60 border-l border-orange-200 text-center text-orange-700">
                    {(() => {
                      const total = nhanViens.reduce((s, nv) => s + days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0), 0);
                      return total > 0 ? total : "";
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* ─── TAB BẢNG LƯƠNG ─── */}
      {activeTab === "luong" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Bảng Lương — Tháng {month}/{year}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {soNgayLamViec} ngày làm việc · Lương TC = (LCB ÷ {soNgayLamViec}ngày ÷ 8h) × 1.5 × giờ TC
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-3 py-2.5 text-left text-slate-500 w-8">STT</th>
                  <th className="px-3 py-2.5 text-left text-slate-500 min-w-[150px]">Nhân viên</th>
                  <th className="px-3 py-2.5 text-right text-slate-500">Lương CB</th>
                  <th className="px-3 py-2.5 text-center text-emerald-600">Công</th>
                  <th className="px-3 py-2.5 text-center text-blue-600">NP</th>
                  <th className="px-3 py-2.5 text-center text-red-500">Vắng</th>
                  <th className="px-3 py-2.5 text-center text-amber-600">Muộn</th>
                  <th className="px-3 py-2.5 text-center text-cyan-600">½</th>
                  <th className="px-3 py-2.5 text-center text-orange-600">TC giờ</th>
                  <th className="px-3 py-2.5 text-center text-orange-500">Hệ số TC</th>
                  <th className="px-3 py-2.5 text-right text-slate-500">Lương công</th>
                  <th className="px-3 py-2.5 text-right text-orange-600">Lương TC</th>
                  <th className="px-3 py-2.5 text-center text-teal-600 min-w-[130px]">Phụ cấp<div className="text-[10px] font-normal text-slate-400">CC + Ăn/ngày</div></th>
                  <th className="px-3 py-2.5 text-right font-bold text-indigo-700 bg-indigo-50 border-l border-indigo-100">Thực lĩnh</th>
                </tr>
              </thead>
              <tbody>
                {nhanViens.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-10 text-slate-400">Chưa có nhân viên</td></tr>
                )}
                {nhanViens.map((nv, idx) => {
                  const summary = getSummary(nv.id);
                  const tongTC = days.reduce((s, d) => s + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                  const lcb = nv.luongCB ?? 0;

                  // Ngày công tính lương: có mặt + muộn + ½×0.5 + phép + lễ (vắng = không tính)
                  const congCoMat  = summary["di_lam"]    ?? 0;
                  const congMuon   = summary["di_muon"]   ?? 0;
                  const congNuaNgay= summary["nua_ngay"]  ?? 0;
                  const congPhep   = summary["nghi_phep"] ?? 0;
                  const congLe     = summary["nghi_le"]   ?? 0;
                  const congVang   = summary["vang"]      ?? 0;
                  const congTinhLuong = congCoMat + congMuon + congNuaNgay * 0.5 + congPhep + congLe;

                  const heSoTC        = nv.heSoTC ?? 1.5;
                  const phuCapCC      = nv.phuCapChuyenCan ?? 0;
                  const phuCapAnNgay  = nv.phuCapAn ?? 0;
                  // Ngày đủ công cho PC ăn = chỉ di_lam + di_muon (đủ 1 ngày)
                  const ngayAnDuCong  = congCoMat + congMuon;
                  const tongPhuCap    = phuCapCC + phuCapAnNgay * ngayAnDuCong;
                  const luongNgay     = soNgayLamViec > 0 ? lcb / soNgayLamViec : 0;
                  const luongCong     = luongNgay * congTinhLuong;
                  const luongTC       = soNgayLamViec > 0 ? (lcb / (soNgayLamViec * 8)) * heSoTC * tongTC : 0;
                  const thucLinh      = luongCong + luongTC + tongPhuCap;

                  return (
                    <tr key={nv.id} className={`border-b border-slate-50 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                      <td className="px-3 py-2 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800">{nv.ten}</p>
                        {nv.chucVu && <p className="text-xs text-slate-400">{nv.chucVu}</p>}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {lcb > 0 ? fmt(lcb) + "₫" : <span className="text-slate-300 text-xs">Chưa có</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-emerald-700">{congTinhLuong || "—"}</td>
                      <td className="px-3 py-2 text-center text-blue-600">{congPhep || ""}</td>
                      <td className="px-3 py-2 text-center text-red-500 font-semibold">{congVang || ""}</td>
                      <td className="px-3 py-2 text-center text-amber-600">{congMuon || ""}</td>
                      <td className="px-3 py-2 text-center text-cyan-600">{congNuaNgay || ""}</td>
                      <td className="px-3 py-2 text-center text-orange-600 font-semibold">{tongTC > 0 ? tongTC : ""}</td>
                      {/* Hệ số TC — inline edit */}
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number" step="0.1" min="1" max="5"
                          defaultValue={heSoTC}
                          onBlur={async e => {
                            const val = parseFloat(e.target.value) || 1.5;
                            await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                              method: "PATCH", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ heSoTC: val }),
                            });
                            fetchData();
                          }}
                          onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          className="w-14 text-center text-xs font-semibold text-orange-600 border border-orange-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-orange-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {lcb > 0 && congTinhLuong > 0 ? fmt(Math.round(luongCong)) + "₫" : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-right text-orange-600">
                        {lcb > 0 && tongTC > 0 ? fmt(Math.round(luongTC)) + "₫" : ""}
                      </td>
                      {/* Phụ cấp — 2 ô: Chuyên cần + Ăn/ngày */}
                      <td className="px-2 py-1">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 w-7 shrink-0">CC</span>
                            <input
                              type="number" step="50000" min="0"
                              defaultValue={phuCapCC || ""}
                              placeholder="0"
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phuCapChuyenCan: val || null }),
                                });
                                fetchData();
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 w-7 shrink-0">Ăn</span>
                            <input
                              type="number" step="10000" min="0"
                              defaultValue={phuCapAnNgay || ""}
                              placeholder="0"
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phuCapAn: val || null }),
                                });
                                fetchData();
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            {phuCapAnNgay > 0 && <span className="text-[10px] text-slate-400">×{ngayAnDuCong}ng</span>}
                          </div>
                          {tongPhuCap > 0 && (
                            <div className="text-[11px] font-bold text-teal-700 text-right pr-1">
                              = {fmt(Math.round(tongPhuCap))}₫
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                        {lcb > 0 && thucLinh > 0 ? fmt(Math.round(thucLinh)) + "₫" : <span className="text-slate-300 font-normal">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {nhanViens.length > 0 && (
                <tfoot className="bg-slate-100 border-t-2 border-slate-200 font-semibold text-xs">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-slate-600">Tổng ({nhanViens.length} NV)</td>
                    <td className="px-3 py-2 text-center text-emerald-700">
                      {nhanViens.reduce((s, nv) => {
                        const sum = getSummary(nv.id);
                        return s + (sum["di_lam"]??0) + (sum["di_muon"]??0) + (sum["nua_ngay"]??0)*0.5 + (sum["nghi_phep"]??0) + (sum["nghi_le"]??0);
                      }, 0) || "—"}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-center text-orange-600">
                      {nhanViens.reduce((s, nv) => s + days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0), 0) || ""}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-right text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                      {fmt(Math.round(nhanViens.reduce((s, nv) => {
                        const sum = getSummary(nv.id);
                        const tongTC = days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                        const lcb = nv.luongCB ?? 0;
                        const cong = (sum["di_lam"]??0) + (sum["di_muon"]??0) + (sum["nua_ngay"]??0)*0.5 + (sum["nghi_phep"]??0) + (sum["nghi_le"]??0);
                        const luongCong = soNgayLamViec > 0 ? (lcb / soNgayLamViec) * cong : 0;
                        const luongTC = soNgayLamViec > 0 ? (lcb / (soNgayLamViec * 8)) * 1.5 * tongTC : 0;
                        return s + luongCong + luongTC;
                      }, 0)))}₫
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            💡 Lương TC = (LCB ÷ ngày ÷ 8h) × <b>Hệ số TC</b> × giờ TC &nbsp;|&nbsp; Thực lĩnh = Lương công + Lương TC + Phụ cấp &nbsp;|&nbsp; Vắng không tính lương
          </div>
        </div>
      )}

      {/* ═══ MODAL NGÀY LỄ ═══ */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quản lý Ngày lễ</h2>
                <p className="text-xs text-slate-400 mt-0.5">Ngày nghỉ lễ — CN luôn nghỉ, lễ hiển thị chữ L tím (vẫn bấm được để override)</p>
              </div>
              <button onClick={() => setShowHolidayModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Thêm ngày lễ */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Ngày (YYYY-MM-DD)</label>
                  <input type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Tên ngày lễ</label>
                  <input value={newHolidayLabel} onChange={e => setNewHolidayLabel(e.target.value)}
                    placeholder="VD: Giỗ Tổ Hùng Vương"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <button
                  onClick={() => {
                    if (!newHolidayDate) return;
                    if (!holidays.includes(newHolidayDate)) {
                      setHolidays([...holidays, newHolidayDate].sort());
                      if (newHolidayLabel) setHolidayLabels({ ...holidayLabels, [newHolidayDate]: newHolidayLabel });
                    }
                    setNewHolidayDate(""); setNewHolidayLabel("");
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition whitespace-nowrap">
                  + Thêm
                </button>
              </div>

              {/* Danh sách ngày lễ */}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 mb-2">Danh sách ngày lễ ({year})</p>
                {holidays.filter(h => h.startsWith(String(year))).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có ngày lễ nào</p>
                )}
                {holidays.filter(h => h.startsWith(String(year))).sort().map(date => {
                  const d = new Date(date + "T00:00:00");
                  const label = holidayLabels[date] ?? FIXED_HOLIDAYS.find(f => date.endsWith(f.key))?.label ?? "";
                  return (
                    <div key={date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                      <div>
                        <span className="font-semibold text-purple-700 text-sm">
                          {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">{DAY_OF_WEEK[d.getDay()]}</span>
                        {label && <span className="text-xs text-purple-600 ml-2 italic">{label}</span>}
                      </div>
                      <button onClick={() => {
                        setHolidays(holidays.filter(h => h !== date));
                        const { [date]: _, ...rest } = holidayLabels; void _; setHolidayLabels(rest);
                      }} className="text-slate-300 hover:text-red-500 transition p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Nút thêm nhanh ngày lễ cố định năm hiện tại */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Thêm nhanh ngày lễ cố định {year}:</p>
                <div className="flex flex-wrap gap-2">
                  {FIXED_HOLIDAYS.map(h => {
                    const full = `${year}-${h.key}`;
                    const added = holidays.includes(full);
                    return (
                      <button key={h.key} onClick={() => {
                        if (!added) { setHolidays([...holidays, full].sort()); setHolidayLabels({ ...holidayLabels, [full]: h.label }); }
                      }}
                        className={`text-xs px-3 py-1 rounded-full border transition ${added ? "bg-purple-100 text-purple-600 border-purple-200 cursor-default" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50"}`}>
                        {added ? "✓" : "+"} {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
                    <select value={nvForm.phongBan} onChange={e => setNvForm(f => ({ ...f, phongBan: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                      <option value="">— Chọn phòng ban —</option>
                      {phongBanList.map(pb => <option key={pb} value={pb}>{pb}</option>)}
                    </select>
                    {/* Thêm phòng ban mới */}
                    <div className="flex gap-1 mt-1.5">
                      <input value={newPhongBan} onChange={e => setNewPhongBan(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newPhongBan.trim()) {
                            if (!phongBanList.includes(newPhongBan.trim())) setPhongBanList([...phongBanList, newPhongBan.trim()]);
                            setNewPhongBan("");
                          }
                        }}
                        placeholder="Thêm phòng ban mới..."
                        className="flex-1 border border-dashed border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200" />
                      <button type="button"
                        onClick={() => {
                          if (!newPhongBan.trim()) return;
                          if (!phongBanList.includes(newPhongBan.trim())) setPhongBanList([...phongBanList, newPhongBan.trim()]);
                          setNewPhongBan("");
                        }}
                        className="px-2 py-1 bg-rose-500 text-white rounded-lg text-xs hover:bg-rose-600 transition">+</button>
                    </div>
                    {/* Danh sách quick-delete */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phongBanList.map(pb => (
                        <span key={pb} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
                          {pb}
                          <button onClick={() => setPhongBanList(phongBanList.filter(p => p !== pb))}
                            className="text-slate-400 hover:text-red-500 transition leading-none">×</button>
                        </span>
                      ))}
                    </div>
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
