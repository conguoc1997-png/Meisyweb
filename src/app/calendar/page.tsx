"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Bell, X, Plus, Trash2,
  CalendarDays, CheckCircle2, Clock, Users, Check, XCircle,
  Pencil, MoreHorizontal,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────
type NhanVien = { id: string; ten: string; maNV: string; phongBan: string | null };
type LichRow  = {
  id: string; nhanVienId: string; ngay: string; ca: string | null;
  trangThai: string; loai: string; adminNote: string | null;
  nhanVien: { ten: string; maNV: string; phongBan: string | null };
};
type ChamCongRow = {
  id: string; nhanVienId: string; ngay: string;
  trangThai: string | null; gioVao: string | null; gioRa: string | null; tangCa: number | null;
};
type CalEvent = {
  id: string; title: string; date: string;
  startTime: string | null; endTime: string | null;
  color: string; description: string | null; type: string;
};

// ── Constants ───────────────────────────────────────────────────────
const DOW = ["T2","T3","T4","T5","T6","T7","CN"];
const DOW_FULL = ["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","Chủ nhật"];

const COLORS = [
  { hex: "#4285f4", name: "Xanh dương" },
  { hex: "#0f9d58", name: "Xanh lá" },
  { hex: "#db4437", name: "Đỏ" },
  { hex: "#f4b400", name: "Vàng" },
  { hex: "#ab47bc", name: "Tím" },
  { hex: "#00acc1", name: "Xanh ngọc" },
  { hex: "#ff7043", name: "Cam" },
  { hex: "#795548", name: "Nâu" },
];

const CC_STATUS: Record<string, { label: string; color: string }> = {
  di_lam:     { label: "Đi làm",     color: "#0f9d58" },
  di_muon:    { label: "Đi muộn",    color: "#f4b400" },
  nghi_phep:  { label: "Nghỉ phép",  color: "#4285f4" },
  nghi_benh:  { label: "Nghỉ bệnh",  color: "#ab47bc" },
  vang_mat:   { label: "Vắng mặt",   color: "#db4437" },
  da_dang_ky: { label: "Đã đăng ký", color: "#9e9e9e" },
};

const CA_LABEL: Record<string, string> = {
  ca1:"Ca 1 🌅", ca2:"Ca 2 ☀️", ca3:"Ca 3 🌙", khac:"Khác ✏️",
};

const DEPT_COLOR: Record<string, string> = {
  Livestream: "#ec407a", CSKH: "#29b6f6",
  Kho: "#ffa726", May: "#26a69a",
};
function deptColor(pb: string | null) {
  if (!pb) return "#bdbdbd";
  for (const [k, v] of Object.entries(DEPT_COLOR)) if (pb.includes(k)) return v;
  return "#9e9e9e";
}

// ── Helpers ─────────────────────────────────────────────────────────
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function monthStr(y: number, m: number) {
  return `${y}-${String(m).padStart(2,"0")}`;
}
function fmtDateFull(s: string) {
  const d = new Date(s + "T00:00:00");
  const dows = ["CN","T2","T3","T4","T5","T6","T7"];
  return `${dows[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth()+1}, ${d.getFullYear()}`;
}
let _tmpId = 0;
function tmpId() { return `tmp_${++_tmpId}`; }

// ── Task Modal ───────────────────────────────────────────────────────
function TaskModal({
  date, event, onSave, onDelete, onClose,
}: {
  date: string;
  event?: CalEvent;
  onSave: (data: Omit<CalEvent,"id"|"type">) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [title,  setTitle]  = useState(event?.title ?? "");
  const [start,  setStart]  = useState(event?.startTime ?? "");
  const [end,    setEnd]    = useState(event?.endTime ?? "");
  const [desc,   setDesc]   = useState(event?.description ?? "");
  const [color,  setColor]  = useState(event?.color ?? "#4285f4");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 50); }, []);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), date, startTime: start||null, endTime: end||null, color, description: desc||null });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Top color bar */}
        <div className="h-1.5 rounded-t-2xl" style={{ background: color }} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">{fmtDateFull(date)}</span>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
              <X size={15} />
            </button>
          </div>

          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            placeholder="Thêm tiêu đề..."
            className="w-full border-b-2 border-gray-200 focus:border-blue-500 px-0 py-2 text-gray-800 font-medium outline-none text-[17px] mb-5 transition"
          />

          {/* Time */}
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              <span className="text-gray-400 text-sm">–</span>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
          </div>

          {/* Description */}
          <div className="flex gap-2 mb-5">
            <div className="w-4 flex-shrink-0" />
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Thêm mô tả..."
              rows={2}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-2 mb-6 pl-5">
            {COLORS.map(c => (
              <button key={c.hex} onClick={() => setColor(c.hex)} title={c.name}
                className="w-6 h-6 rounded-full transition-all flex items-center justify-center"
                style={{ background: c.hex }}>
                {color === c.hex && <Check size={12} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
            {onDelete && (
              <button onClick={async () => { await onDelete(); onClose(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400 hover:bg-red-50 rounded-lg transition">
                <Trash2 size={14} /> Xóa
              </button>
            )}
            <div className="flex-1" />
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">
              Hủy
            </button>
            <button onClick={submit} disabled={!title.trim() || saving}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-40 shadow-sm"
              style={{ background: color }}>
              {saving ? "Đang lưu..." : event ? "Lưu thay đổi" : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()+1);

  const [nvList,      setNvList]      = useState<NhanVien[]>([]);
  const [lichList,    setLichList]    = useState<LichRow[]>([]);
  const [ccList,      setCcList]      = useState<ChamCongRow[]>([]);
  const [events,      setEvents]      = useState<CalEvent[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [filterPB,    setFilterPB]    = useState("");

  // Notifications
  const [showNotif,   setShowNotif]   = useState(false);
  const [pendingLich, setPendingLich] = useState<LichRow[]>([]);
  const [notifNote,   setNotifNote]   = useState<Record<string, string>>({});
  const [duyeting,    setDuyeting]    = useState<string | null>(null);

  // Calendar state
  const [selected,    setSelected]    = useState<string | null>(toYMD(today));
  const [taskModal,   setTaskModal]   = useState<{ date: string; event?: CalEvent } | null>(null);

  const todayStr = toYMD(today);

  // ── Fetch NV ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cham-cong/nhan-vien")
      .then(r => r.json()).then(d => setNvList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // ── Fetch month ─────────────────────────────────────────────────
  const fetchMonth = useCallback(async () => {
    setLoading(true);
    const thang = monthStr(year, month);
    const bust  = `&_t=${Date.now()}`;
    try {
      const [lich, cc, ev, pending] = await Promise.all([
        fetch(`/api/lich-di-lam?thang=${thang}&trangThai=da_duyet${bust}`).then(r=>r.json()).catch(()=>[]),
        fetch(`/api/cham-cong?thang=${thang}${bust}`).then(r=>r.json()).catch(()=>({ chamCongs:[] })),
        fetch(`/api/calendar?thang=${thang}${bust}`).then(r=>r.json()).catch(()=>[]),
        fetch(`/api/lich-di-lam?thang=${thang}&trangThai=cho_duyet${bust}`).then(r=>r.json()).catch(()=>[]),
      ]);
      setLichList(Array.isArray(lich) ? lich : []);
      setCcList(Array.isArray(cc) ? cc : (cc?.chamCongs ?? []));
      setEvents(Array.isArray(ev) ? ev : []);
      setPendingLich(Array.isArray(pending) ? pending : []);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);

  // ── Calendar grid ────────────────────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow    = (() => {
    const d = new Date(year, month-1, 1).getDay();
    return d === 0 ? 6 : d-1; // 0=Mon
  })();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const weeks = totalCells / 7;

  // ── Derived maps ─────────────────────────────────────────────────
  const nvMap = useMemo(() => Object.fromEntries(nvList.map(nv => [nv.id, nv])), [nvList]);

  const phongBanList = useMemo(() => {
    const s = new Set<string>();
    nvList.forEach(nv => { if (nv.phongBan) s.add(nv.phongBan); });
    return Array.from(s).sort();
  }, [nvList]);

  function filterNv(nvId: string) {
    if (!filterPB) return true;
    return nvMap[nvId]?.phongBan === filterPB;
  }

  const ccByDate = useMemo(() => {
    const m = new Map<string, ChamCongRow[]>();
    ccList.forEach(cc => {
      const d = cc.ngay.slice(0,10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(cc);
    });
    return m;
  }, [ccList]);

  const lichByDate = useMemo(() => {
    const m = new Map<string, LichRow[]>();
    lichList.forEach(l => {
      const d = l.ngay.slice(0,10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(l);
    });
    return m;
  }, [lichList]);

  const eventsByDate = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    events.forEach(ev => {
      if (!m.has(ev.date)) m.set(ev.date, []);
      m.get(ev.date)!.push(ev);
    });
    return m;
  }, [events]);

  // ── Navigation ───────────────────────────────────────────────────
  const prevMonth = () => { if (month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday   = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth()+1);
    setSelected(todayStr);
  };

  // ── Duyệt lịch ──────────────────────────────────────────────────
  async function handleDuyet(id: string, trangThai: "da_duyet" | "tu_choi") {
    setDuyeting(id);
    await fetch(`/api/lich-di-lam/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai, adminNote: notifNote[id] || "" }),
    }).catch(() => {});
    setPendingLich(prev => prev.filter(r => r.id !== id));
    setDuyeting(null);
    fetchMonth();
  }

  // ── Task CRUD (optimistic) ───────────────────────────────────────
  async function createEvent(data: Omit<CalEvent,"id"|"type">) {
    // Optimistic: thêm ngay vào state
    const optimId = tmpId();
    const optimEv: CalEvent = { ...data, id: optimId, type: "task" };
    setEvents(prev => [...prev, optimEv]);

    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "task" }),
      });
      const saved = await res.json();
      // Replace optimistic entry with real one
      setEvents(prev => prev.map(e => e.id === optimId ? { ...saved, ...data, id: saved.id ?? optimId } : e));
    } catch {
      // Rollback
      setEvents(prev => prev.filter(e => e.id !== optimId));
    }
  }

  async function updateEvent(id: string, data: Omit<CalEvent,"id"|"type">) {
    // Optimistic update
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    try {
      await fetch(`/api/calendar/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      fetchMonth(); // rollback via refetch
    }
  }

  async function deleteEvent(id: string) {
    // Optimistic remove
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    } catch {
      fetchMonth();
    }
  }

  // ── Selected day detail ──────────────────────────────────────────
  const selectedCC   = selected ? (ccByDate.get(selected)    ?? []) : [];
  const selectedLich = selected ? (lichByDate.get(selected)  ?? []) : [];
  const selectedEvts = selected ? (eventsByDate.get(selected)?? []) : [];

  const selectedDetail = useMemo(() => {
    if (!selected) return [];
    const ccNvIds = new Set(selectedCC.map(c => c.nhanVienId));
    const lichOnly = selectedLich.filter(l => !ccNvIds.has(l.nhanVienId));
    const rows: Array<{
      nvId: string; ten: string; maNV: string; phongBan: string | null;
      status: string; gioVao: string|null; gioRa: string|null; ca: string|null; tangCa: number|null;
    }> = [];
    selectedCC.forEach(cc => {
      const nv = nvMap[cc.nhanVienId]; if (!nv) return;
      if (filterPB && nv.phongBan !== filterPB) return;
      rows.push({ nvId:cc.nhanVienId, ten:nv.ten, maNV:nv.maNV, phongBan:nv.phongBan,
        status:cc.trangThai||"di_lam", gioVao:cc.gioVao, gioRa:cc.gioRa, ca:null, tangCa:cc.tangCa });
    });
    lichOnly.forEach(l => {
      const nv = nvMap[l.nhanVienId] ?? l.nhanVien; if (!nv) return;
      if (filterPB && nv.phongBan !== filterPB) return;
      rows.push({ nvId:l.nhanVienId, ten:nv.ten, maNV:nv.maNV, phongBan:nv.phongBan,
        status:"da_dang_ky", gioVao:null, gioRa:null, ca:l.ca, tangCa:null });
    });
    return rows.sort((a,b) => a.ten.localeCompare(b.ten));
  }, [selected, selectedCC, selectedLich, nvMap, filterPB]);

  // Selected date info
  const selDate = selected ? new Date(selected + "T00:00:00") : null;
  const selDowIdx = selDate ? selDate.getDay() : -1; // 0=Sun
  const selDow = selDate ? ["CN","T2","T3","T4","T5","T6","T7"][selDowIdx] : "";

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">

      {/* ── Google-style Top Bar ── */}
      <header className="flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0 gap-3">
        {/* Logo + title */}
        <div className="flex items-center gap-3 mr-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#4285f4" }}>
            <CalendarDays size={17} className="text-white" />
          </div>
          <span className="text-xl font-normal text-gray-700 hidden sm:block">Lịch Công Ty</span>
        </div>

        {/* Today button */}
        <button onClick={goToday}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition">
          Hôm nay
        </button>

        {/* Nav arrows */}
        <div className="flex items-center gap-1">
          <button onClick={prevMonth}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button onClick={nextMonth}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Month/Year title */}
        <h2 className="text-xl font-normal text-gray-700 min-w-[160px]">
          Tháng {month} năm {year}
        </h2>

        {loading && (
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-1" />
        )}

        <div className="flex-1" />

        {/* Filter phòng ban */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400" />
          <select value={filterPB} onChange={e => setFilterPB(e.target.value)}
            className="text-sm border border-gray-300 rounded-full px-3 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="">Tất cả phòng ban</option>
            {phongBanList.map(pb => <option key={pb} value={pb}>{pb}</option>)}
          </select>
        </div>

        {/* Notification */}
        <button onClick={() => setShowNotif(!showNotif)}
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition
            ${showNotif ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-600"}`}>
          <Bell size={18} />
          {pendingLich.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
              {pendingLich.length > 9 ? "9+" : pendingLich.length}
            </span>
          )}
        </button>

        {/* Create button */}
        <button onClick={() => setTaskModal({ date: selected ?? todayStr })}
          className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition shadow-sm">
          <Plus size={16} /> Tạo
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Calendar grid ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* DOW header row */}
          <div className="grid grid-cols-7 border-b border-gray-200 flex-shrink-0">
            {DOW.map((d, i) => (
              <div key={d} className={`text-center py-2 text-[11px] font-semibold uppercase tracking-wider
                ${i === 6 ? "text-red-400" : "text-gray-500"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-7 h-full" style={{ minHeight: `${weeks * 110}px` }}>
              {Array.from({ length: totalCells }, (_, i) => {
                const dayNum = i - firstDow + 1;
                const isOtherMonth = dayNum < 1 || dayNum > daysInMonth;
                if (isOtherMonth) {
                  return (
                    <div key={i} className="border-r border-b border-gray-100 bg-gray-50/50 min-h-[110px]" />
                  );
                }

                const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
                const ccDay   = (ccByDate.get(dateStr) ?? []).filter(c => filterNv(c.nhanVienId));
                const lichDay = (lichByDate.get(dateStr) ?? []).filter(l => filterNv(l.nhanVienId));
                const evDay   = eventsByDate.get(dateStr) ?? [];
                const isToday    = dateStr === todayStr;
                const isSelected = dateStr === selected;
                const isSun = (i % 7) === 6;

                const nvIds = [...new Set([...ccDay.map(c=>c.nhanVienId),...lichDay.map(l=>l.nhanVienId)])];
                const diLamCount  = ccDay.filter(c => c.trangThai==="di_lam"||c.trangThai==="di_muon").length;
                const dangKyCount = lichDay.filter(l => !ccDay.find(c => c.nhanVienId===l.nhanVienId)).length;

                return (
                  <div key={i}
                    onClick={() => setSelected(isSelected ? null : dateStr)}
                    className={`border-r border-b border-gray-200 min-h-[110px] cursor-pointer group relative transition-colors
                      ${isSelected ? "bg-blue-50" : isSun ? "bg-red-50/20 hover:bg-red-50/40" : "hover:bg-gray-50/80"}`}
                  >
                    {/* Date number */}
                    <div className="flex items-center justify-between px-2 pt-2 pb-0.5">
                      <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium transition
                        ${isToday
                          ? "bg-blue-600 text-white font-bold"
                          : isSun
                            ? "text-red-500 hover:bg-red-100"
                            : "text-gray-700 hover:bg-gray-200"}`}>
                        {dayNum}
                      </span>

                      {/* Quick add */}
                      <button
                        onClick={e => { e.stopPropagation(); setTaskModal({ date: dateStr }); }}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition">
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Events */}
                    <div className="px-1 space-y-0.5 pb-1">
                      {evDay.slice(0, 3).map(ev => (
                        <button key={ev.id}
                          onClick={e => { e.stopPropagation(); setTaskModal({ date: ev.date, event: ev }); }}
                          className="w-full text-left flex items-center gap-1 px-1.5 py-[3px] rounded text-[11px] font-medium text-white truncate hover:opacity-90 transition"
                          style={{ background: ev.color }}>
                          {ev.startTime && (
                            <span className="opacity-80 text-[10px] flex-shrink-0">{ev.startTime.slice(0,5)}</span>
                          )}
                          <span className="truncate">{ev.title}</span>
                        </button>
                      ))}
                      {evDay.length > 3 && (
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(dateStr); }}
                          className="w-full text-left px-1.5 py-[2px] text-[10px] text-gray-500 hover:bg-gray-100 rounded">
                          +{evDay.length - 3} sự kiện
                        </button>
                      )}
                    </div>

                    {/* Attendance summary */}
                    {(nvIds.length > 0) && (
                      <div className="px-2 pb-1.5">
                        {/* Avatar dots */}
                        <div className="flex items-center gap-[3px]">
                          {nvIds.slice(0, 7).map((id, idx) => (
                            <span key={idx}
                              className="w-[7px] h-[7px] rounded-full inline-block flex-shrink-0"
                              style={{ background: deptColor(nvMap[id]?.phongBan ?? null) }}
                            />
                          ))}
                          {nvIds.length > 7 && (
                            <span className="text-[8px] text-gray-400 ml-0.5">+{nvIds.length-7}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {diLamCount > 0 && (
                            <span className="text-[9px] text-emerald-600 font-medium">✓{diLamCount}</span>
                          )}
                          {dangKyCount > 0 && (
                            <span className="text-[9px] text-gray-400">●{dangKyCount}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className={`w-72 border-l border-gray-200 flex flex-col bg-white flex-shrink-0 transition-all ${!selected && !showNotif ? "hidden" : ""}`}>

          {/* Notification panel */}
          {showNotif && (
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Thông báo</span>
                  {pendingLich.length > 0 && (
                    <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{pendingLich.length}</span>
                  )}
                </div>
                <button onClick={() => setShowNotif(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                {pendingLich.length === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 size={22} className="mx-auto mb-1 text-gray-200" />
                    <p className="text-xs text-gray-400">Không có thông báo</p>
                  </div>
                ) : pendingLich.map(r => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                        style={{ background: deptColor(r.nhanVien.phongBan) }}>
                        {r.nhanVien.ten.split(" ").slice(-1)[0]?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700">{r.nhanVien.ten}</p>
                        <p className="text-[11px] text-gray-500">
                          {new Date(r.ngay + "T00:00:00").toLocaleDateString("vi-VN")}
                          {r.ca ? ` · ${CA_LABEL[r.ca] ?? r.ca}` : ""}
                        </p>
                        <input
                          value={notifNote[r.id] ?? ""}
                          onChange={e => setNotifNote(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Ghi chú..."
                          className="w-full mt-1 text-[11px] border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-2 ml-9">
                      <button onClick={() => handleDuyet(r.id, "da_duyet")} disabled={duyeting===r.id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[11px] font-semibold text-white transition disabled:opacity-50"
                        style={{ background: "#0f9d58" }}>
                        <Check size={11} /> Duyệt
                      </button>
                      <button onClick={() => handleDuyet(r.id, "tu_choi")} disabled={duyeting===r.id}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-red-50 text-red-500 text-[11px] font-semibold transition disabled:opacity-50">
                        <XCircle size={11} /> Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day detail */}
          {selected && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Day header */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{selDow}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-light leading-none
                        ${selected === todayStr ? "text-blue-600" : "text-gray-800"}`}>
                        {parseInt(selected.slice(8))}
                      </span>
                      <span className="text-sm text-gray-500">
                        tháng {parseInt(selected.slice(5,7))}
                      </span>
                    </div>
                    {selected === todayStr && (
                      <p className="text-[10px] text-blue-500 mt-0.5">Hôm nay</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTaskModal({ date: selected })}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">

                {/* Events */}
                {selectedEvts.length > 0 && (
                  <div className="px-3 pt-3">
                    {selectedEvts.map(ev => (
                      <button key={ev.id} onClick={() => setTaskModal({ date: ev.date, event: ev })}
                        className="w-full text-left flex items-start gap-2.5 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition group/ev mb-1">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ background: ev.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                          {(ev.startTime || ev.endTime) && (
                            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock size={10} />
                              {ev.startTime?.slice(0,5)}{ev.endTime ? ` – ${ev.endTime.slice(0,5)}` : ""}
                            </p>
                          )}
                          {ev.description && <p className="text-[10px] text-gray-400 truncate mt-0.5">{ev.description}</p>}
                        </div>
                        <Pencil size={11} className="text-gray-300 group-hover/ev:text-gray-400 flex-shrink-0 mt-1" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Divider */}
                {selectedEvts.length > 0 && selectedDetail.length > 0 && (
                  <div className="mx-3 border-t border-gray-100 my-2" />
                )}

                {/* Attendance */}
                {selectedDetail.length > 0 && (
                  <div className="px-3 pb-3">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                      Nhân viên ({selectedDetail.length})
                    </p>
                    {selectedDetail.map((r, i) => {
                      const s = CC_STATUS[r.status] ?? CC_STATUS.di_lam;
                      return (
                        <div key={i} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition">
                          {/* Avatar */}
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                            style={{ background: deptColor(r.phongBan) }}>
                            {r.ten.split(" ").slice(-1)[0]?.[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{r.ten}</p>
                            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                              {r.gioVao && (
                                <span className="text-[10px] text-gray-400">
                                  {r.gioVao}{r.gioRa ? `–${r.gioRa}` : ""}
                                </span>
                              )}
                              {r.ca && <span className="text-[10px] text-gray-400">{CA_LABEL[r.ca]??r.ca}</span>}
                              {(r.tangCa ?? 0) > 0 && (
                                <span className="text-[10px] text-amber-600 font-medium">+{r.tangCa}h</span>
                              )}
                            </div>
                          </div>
                          {/* Status pill */}
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                            style={{ background: s.color }}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedEvts.length === 0 && selectedDetail.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                    <CalendarDays size={30} className="mb-2" />
                    <p className="text-xs text-gray-400">Không có sự kiện</p>
                    <button onClick={() => setTaskModal({ date: selected })}
                      className="mt-3 text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition">
                      <Plus size={12} /> Tạo sự kiện
                    </button>
                  </div>
                )}

                <div className="h-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Task Modal ── */}
      {taskModal && (
        <TaskModal
          date={taskModal.date}
          event={taskModal.event}
          onSave={taskModal.event
            ? (data) => updateEvent(taskModal.event!.id, data)
            : createEvent}
          onDelete={taskModal.event ? () => deleteEvent(taskModal.event!.id) : undefined}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  );
}
