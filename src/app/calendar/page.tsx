"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Bell, X, Plus, Trash2,
  CalendarDays, CheckCircle2, Clock, Users, Check, XCircle,
  Pencil,
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

const COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e",
  "#06b6d4","#6366f1","#ec4899","#8b5cf6",
];

const CC_STATUS: Record<string, { label: string; dot: string; pill: string }> = {
  di_lam:     { label: "Đi làm",     dot: "bg-emerald-400", pill: "bg-emerald-100 text-emerald-700" },
  di_muon:    { label: "Đi muộn",    dot: "bg-amber-400",   pill: "bg-amber-100 text-amber-700" },
  nghi_phep:  { label: "Nghỉ phép",  dot: "bg-blue-400",    pill: "bg-blue-100 text-blue-700" },
  nghi_benh:  { label: "Nghỉ bệnh",  dot: "bg-purple-400",  pill: "bg-purple-100 text-purple-700" },
  vang_mat:   { label: "Vắng mặt",   dot: "bg-red-400",     pill: "bg-red-100 text-red-600" },
  da_dang_ky: { label: "Đã đăng ký", dot: "bg-violet-400",  pill: "bg-violet-100 text-violet-700" },
};

const CA_LABEL: Record<string, string> = {
  ca1:"Ca 1 🌅", ca2:"Ca 2 ☀️", ca3:"Ca 3 🌙", khac:"Khác ✏️",
};

const DEPT_COLOR: Record<string, string> = {
  Livestream: "bg-pink-400", CSKH: "bg-sky-400",
  Kho: "bg-amber-400", May: "bg-teal-400",
};
function deptDot(pb: string | null) {
  if (!pb) return "bg-stone-300";
  for (const [k, v] of Object.entries(DEPT_COLOR)) if (pb.includes(k)) return v;
  return "bg-stone-300";
}
function deptBg(pb: string | null) {
  const map: Record<string,string> = {
    Livestream:"bg-pink-100 text-pink-700", CSKH:"bg-sky-100 text-sky-700",
    Kho:"bg-amber-100 text-amber-700", May:"bg-teal-100 text-teal-700",
  };
  if (!pb) return "bg-stone-100 text-stone-500";
  for (const [k,v] of Object.entries(map)) if (pb.includes(k)) return v;
  return "bg-stone-100 text-stone-500";
}

// ── Helpers ─────────────────────────────────────────────────────────
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function monthStr(y: number, m: number) {
  return `${y}-${String(m).padStart(2,"0")}`;
}
function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00");
  return `${["CN","T2","T3","T4","T5","T6","T7"][d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

// ── Create/Edit Task Modal ───────────────────────────────────────────
function TaskModal({
  date, event, onSave, onDelete, onClose,
}: {
  date: string;
  event?: CalEvent;
  onSave: (data: Omit<CalEvent,"id"|"type">) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [title,   setTitle]   = useState(event?.title ?? "");
  const [start,   setStart]   = useState(event?.startTime ?? "");
  const [end,     setEnd]     = useState(event?.endTime ?? "");
  const [desc,    setDesc]    = useState(event?.description ?? "");
  const [color,   setColor]   = useState(event?.color ?? "#6366f1");
  const [saving,  setSaving]  = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), date, startTime: start||null, endTime: end||null, color, description: desc||null });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Color stripe */}
        <div className="h-2" style={{ background: color }} />

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-800">{event ? "Sửa sự kiện" : "Tạo sự kiện mới"}</h3>
            <button onClick={onClose} className="text-stone-300 hover:text-stone-500"><X size={18} /></button>
          </div>

          {/* Date */}
          <p className="text-xs text-stone-400 mb-3">{fmtDate(date)}</p>

          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            placeholder="Tên sự kiện / công việc..."
            className="w-full border-b-2 border-stone-200 focus:border-indigo-400 px-0 py-2 text-stone-800 font-medium outline-none text-[15px] mb-4 transition"
          />

          {/* Time */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-stone-400 mb-1 block">Bắt đầu</label>
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-stone-400 mb-1 block">Kết thúc</label>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>

          {/* Description */}
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Mô tả (không bắt buộc)..."
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-600 resize-none outline-none focus:ring-2 focus:ring-indigo-200 mb-4"
          />

          {/* Color picker */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-stone-400">Màu:</span>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-all ${color === c ? "ring-2 ring-offset-1 ring-stone-400 scale-110" : ""}`}
                style={{ background: c }} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {onDelete && (
              <button onClick={async () => { await onDelete(); onClose(); }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-xl transition">
                <Trash2 size={14} /> Xóa
              </button>
            )}
            <div className="flex-1" />
            <button onClick={onClose}
              className="px-4 py-2 text-sm text-stone-500 hover:bg-stone-50 rounded-xl transition">
              Hủy
            </button>
            <button onClick={submit} disabled={!title.trim() || saving}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl transition disabled:opacity-40"
              style={{ background: color }}>
              {saving ? "Đang lưu..." : event ? "Lưu" : "Tạo"}
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

  const [nvList,     setNvList]     = useState<NhanVien[]>([]);
  const [lichList,   setLichList]   = useState<LichRow[]>([]);
  const [ccList,     setCcList]     = useState<ChamCongRow[]>([]);
  const [events,     setEvents]     = useState<CalEvent[]>([]);
  const [loading,    setLoading]    = useState(false);

  // Notifications (lịch chờ duyệt)
  const [showNotif,  setShowNotif]  = useState(false);
  const [pendingLich, setPendingLich] = useState<LichRow[]>([]);
  const [notifNote,  setNotifNote]  = useState<Record<string, string>>({});
  const [duyeting,   setDuyeting]   = useState<string | null>(null);

  // Calendar state
  const [selected,   setSelected]   = useState<string | null>(toYMD(today));
  const [filterPB,   setFilterPB]   = useState("");

  // Task modal
  const [taskModal,  setTaskModal]  = useState<{ date: string; event?: CalEvent } | null>(null);

  const todayStr = toYMD(today);

  // ── Fetch all NV (once) ──────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cham-cong/nhan-vien")
      .then(r => r.json()).then(d => setNvList(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // ── Fetch month data ─────────────────────────────────────────────
  const fetchMonth = async () => {
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
      const ccArr = Array.isArray(cc) ? cc : (cc?.chamCongs ?? []);
      setCcList(ccArr);
      setEvents(Array.isArray(ev) ? ev : []);
      setPendingLich(Array.isArray(pending) ? pending : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMonth(); }, [year, month]);

  // ── Calendar grid calc ───────────────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow    = (() => {
    const d = new Date(year, month-1, 1).getDay();
    return d === 0 ? 6 : d-1;
  })();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  // ── Derived maps ─────────────────────────────────────────────────
  const nvMap = useMemo(() => Object.fromEntries(nvList.map(nv => [nv.id, nv])), [nvList]);

  const phongBanList = useMemo(() => {
    const s = new Set<string>();
    nvList.forEach(nv => { if (nv.phongBan) s.add(nv.phongBan); });
    return Array.from(s).sort();
  }, [nvList]);

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

  function filterNv(nvId: string) {
    if (!filterPB) return true;
    return nvMap[nvId]?.phongBan === filterPB;
  }

  // ── Navigation ────────────────────────────────────────────────────
  const prevMonth = () => { if (month===1){setYear(y=>y-1);setMonth(12);}else setMonth(m=>m-1); };
  const nextMonth = () => { if (month===12){setYear(y=>y+1);setMonth(1);}else setMonth(m=>m+1); };
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()+1); setSelected(todayStr); };

  // ── Duyet lich ───────────────────────────────────────────────────
  async function handleDuyet(id: string, trangThai: "da_duyet" | "tu_choi") {
    setDuyeting(id);
    const note = notifNote[id] || "";
    await fetch(`/api/lich-di-lam/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai, adminNote: note }),
    }).catch(() => {});
    setPendingLich(prev => prev.filter(r => r.id !== id));
    setDuyeting(null);
    fetchMonth();
  }

  // ── Task CRUD ─────────────────────────────────────────────────────
  async function createEvent(data: Omit<CalEvent,"id"|"type">) {
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, type: "task" }),
    });
    fetchMonth();
  }
  async function updateEvent(id: string, data: Omit<CalEvent,"id"|"type">) {
    await fetch(`/api/calendar/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchMonth();
  }
  async function deleteEvent(id: string) {
    await fetch(`/api/calendar/${id}`, { method: "DELETE" });
    fetchMonth();
  }

  // ── Selected day detail ───────────────────────────────────────────
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

  // ── Day cell ──────────────────────────────────────────────────────
  function DayCell({ dayNum }: { dayNum: number }) {
    const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(dayNum).padStart(2,"0")}`;
    const ccDay   = (ccByDate.get(dateStr)    ?? []).filter(c => filterNv(c.nhanVienId));
    const lichDay = (lichByDate.get(dateStr)  ?? []).filter(l => filterNv(l.nhanVienId));
    const evDay   = eventsByDate.get(dateStr) ?? [];
    const isToday    = dateStr === todayStr;
    const isSelected = dateStr === selected;

    const diLam  = ccDay.filter(c => c.trangThai==="di_lam"||c.trangThai==="di_muon").length;
    const dangKy = lichDay.filter(l => !ccDay.find(c => c.nhanVienId===l.nhanVienId)).length;

    const nvIds = [...new Set([...ccDay.map(c=>c.nhanVienId),...lichDay.map(l=>l.nhanVienId)])];

    return (
      <div
        onClick={() => setSelected(isSelected ? null : dateStr)}
        className={`relative min-h-[90px] rounded-xl cursor-pointer transition-all border group
          ${isSelected ? "bg-indigo-50 border-indigo-300 shadow-sm"
            : isToday  ? "border-rose-300 bg-rose-50/40"
            : "border-stone-100 hover:border-stone-300 hover:bg-stone-50/60"}`}
      >
        {/* Date number */}
        <div className="flex items-center justify-between px-2 pt-1.5">
          <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold
            ${isToday ? "bg-rose-500 text-white" : isSelected ? "bg-indigo-500 text-white" : "text-stone-600"}`}>
            {dayNum}
          </span>
          {/* Quick add button */}
          <button
            onClick={e => { e.stopPropagation(); setTaskModal({ date: dateStr }); }}
            className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center transition-all hover:bg-indigo-200">
            <Plus size={11} />
          </button>
        </div>

        {/* Tasks/events */}
        <div className="px-1.5 pb-1 space-y-0.5 mt-0.5">
          {evDay.slice(0,3).map(ev => (
            <button key={ev.id}
              onClick={e => { e.stopPropagation(); setTaskModal({ date: ev.date, event: ev }); }}
              className="w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white truncate transition hover:opacity-80"
              style={{ background: ev.color }}>
              {ev.startTime && <span className="opacity-80 text-[9px]">{ev.startTime.slice(0,5)}</span>}
              <span className="truncate">{ev.title}</span>
            </button>
          ))}
          {evDay.length > 3 && (
            <p className="text-[9px] text-stone-400 px-1.5">+{evDay.length-3} sự kiện</p>
          )}
        </div>

        {/* Attendance dots */}
        {(diLam > 0 || dangKy > 0) && (
          <div className="px-1.5 pb-1.5">
            <div className="flex flex-wrap gap-0.5 mt-0.5">
              {nvIds.slice(0,6).map((id,i) => (
                <span key={i} className={`w-1.5 h-1.5 rounded-full ${deptDot(nvMap[id]?.phongBan??null)}`} />
              ))}
              {nvIds.length > 6 && <span className="text-[8px] text-stone-300">+{nvIds.length-6}</span>}
            </div>
            {(diLam > 0 || dangKy > 0) && (
              <div className="flex gap-1.5 mt-0.5">
                {diLam  > 0 && <span className="text-[9px] text-emerald-600">✓{diLam}</span>}
                {dangKy > 0 && <span className="text-[9px] text-violet-500">●{dangKy}</span>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf8] flex flex-col">
      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <CalendarDays size={18} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-800 leading-none">Lịch Công Ty</h1>
            <p className="text-[11px] text-stone-400 mt-0.5">Quản lý lịch, sự kiện & chấm công</p>
          </div>
        </div>

        {/* Filter phòng ban */}
        <div className="flex items-center gap-2">
          <Users size={13} className="text-stone-400" />
          <select value={filterPB} onChange={e => setFilterPB(e.target.value)}
            className="text-sm border border-stone-200 rounded-xl px-3 py-1.5 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="">Tất cả phòng ban</option>
            {phongBanList.map(pb => <option key={pb} value={pb}>{pb}</option>)}
          </select>
        </div>

        {/* Notification bell */}
        <button onClick={() => setShowNotif(!showNotif)}
          className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition
            ${showNotif ? "bg-amber-50 border-amber-200 text-amber-600" : "border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
          <Bell size={16} />
          {pendingLich.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendingLich.length > 9 ? "9+" : pendingLich.length}
            </span>
          )}
          <span className="text-sm font-medium hidden sm:block">Thông báo</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Calendar ── */}
        <div className="flex-1 flex flex-col overflow-hidden p-5">
          {/* Month nav */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={prevMonth} className="w-8 h-8 border border-stone-200 rounded-lg flex items-center justify-center hover:bg-stone-50 transition">
              <ChevronLeft size={15} className="text-stone-500" />
            </button>
            <h2 className="text-xl font-bold text-stone-800 min-w-[150px] text-center">
              Tháng {month}/{year}
            </h2>
            <button onClick={nextMonth} className="w-8 h-8 border border-stone-200 rounded-lg flex items-center justify-center hover:bg-stone-50 transition">
              <ChevronRight size={15} className="text-stone-500" />
            </button>
            <button onClick={goToday} className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition font-medium">
              Hôm nay
            </button>
            {loading && <span className="text-xs text-stone-400 animate-pulse ml-1">Đang tải...</span>}

            <div className="flex-1" />

            {/* New event button */}
            <button onClick={() => setTaskModal({ date: selected ?? todayStr })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition">
              <Plus size={15} /> Tạo sự kiện
            </button>
          </div>

          {/* DOW headers */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {DOW.map(d => (
              <div key={d} className={`text-center text-[11px] font-semibold py-1 ${d==="CN"?"text-rose-400":"text-stone-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - firstDow + 1;
              if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} />;
              return <DayCell key={i} dayNum={dayNum} />;
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-stone-100">
            {[
              { c:"bg-emerald-400", l:"Đi làm" }, { c:"bg-violet-400", l:"Đã đăng ký" },
              { c:"bg-amber-400",   l:"Đi muộn" },
            ].map(({c,l}) => (
              <div key={l} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c}`}/><span className="text-[11px] text-stone-500">{l}</span>
              </div>
            ))}
            <span className="text-[11px] text-stone-400 ml-2">Chấm màu = phòng ban:</span>
            {Object.entries(DEPT_COLOR).map(([dept, c]) => (
              <div key={dept} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c}`}/><span className="text-[11px] text-stone-500">{dept}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        {(selected || showNotif) && (
          <div className="w-80 border-l border-stone-100 bg-white flex flex-col overflow-hidden flex-shrink-0">
            {/* Notifications */}
            {showNotif && (
              <div className="border-b border-stone-100">
                <div className="flex items-center justify-between px-4 py-3 bg-amber-50/60">
                  <div className="flex items-center gap-2">
                    <Bell size={15} className="text-amber-500" />
                    <span className="text-sm font-bold text-amber-700">Thông báo lịch</span>
                    {pendingLich.length > 0 && (
                      <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{pendingLich.length}</span>
                    )}
                  </div>
                  <button onClick={() => setShowNotif(false)} className="text-stone-300 hover:text-stone-500"><X size={15} /></button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-stone-50">
                  {pendingLich.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400">
                      <CheckCircle2 size={24} className="mx-auto mb-1 text-stone-200" />
                      Không có thông báo mới
                    </div>
                  ) : pendingLich.map(r => (
                    <div key={r.id} className="px-4 py-3 hover:bg-stone-50 transition">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5 ${deptDot(r.nhanVien.phongBan)}`}>
                          {r.nhanVien.ten.split(" ").slice(-1)[0]?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-stone-700">{r.nhanVien.ten}</p>
                          <p className="text-[11px] text-stone-500">
                            {r.loai === "thay_doi" ? "🔄 Đề xuất thay đổi" : "📅 Đăng ký lịch"}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {new Date(r.ngay + "T00:00:00").toLocaleDateString("vi-VN")}
                            {r.ca ? ` · ${CA_LABEL[r.ca] ?? r.ca}` : ""}
                          </p>
                          {/* Note input */}
                          <input
                            value={notifNote[r.id] ?? ""}
                            onChange={e => setNotifNote(p => ({ ...p, [r.id]: e.target.value }))}
                            placeholder="Ghi chú (tuỳ chọn)..."
                            className="w-full mt-1.5 text-[11px] border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                          />
                        </div>
                      </div>
                      <div className="flex gap-1.5 mt-2 ml-9">
                        <button onClick={() => handleDuyet(r.id, "da_duyet")}
                          disabled={duyeting === r.id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold transition disabled:opacity-50">
                          <Check size={11} /> Duyệt
                        </button>
                        <button onClick={() => handleDuyet(r.id, "tu_choi")}
                          disabled={duyeting === r.id}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 text-[11px] font-semibold transition disabled:opacity-50">
                          <XCircle size={11} /> Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected day detail */}
            {selected && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wide font-medium">
                      {["CN","T2","T3","T4","T5","T6","T7"][new Date(selected+"T00:00:00").getDay()]}
                    </p>
                    <p className="text-lg font-bold text-stone-800">
                      {parseInt(selected.slice(8))} tháng {parseInt(selected.slice(5,7))}
                    </p>
                    {selected === todayStr && <p className="text-[10px] text-rose-400">📍 Hôm nay</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTaskModal({ date: selected })}
                      className="w-8 h-8 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-500 transition">
                      <Plus size={15} />
                    </button>
                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-300 hover:text-stone-500 transition">
                      <X size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {/* Tasks/Events */}
                  {selectedEvts.length > 0 && (
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Sự kiện / Công việc</p>
                      <div className="space-y-1.5">
                        {selectedEvts.map(ev => (
                          <button key={ev.id} onClick={() => setTaskModal({ date: ev.date, event: ev })}
                            className="w-full text-left flex items-center gap-2.5 p-2.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50 transition">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-700 truncate">{ev.title}</p>
                              {(ev.startTime||ev.endTime) && (
                                <p className="text-[10px] text-stone-400">
                                  {ev.startTime?.slice(0,5)}{ev.endTime ? ` – ${ev.endTime.slice(0,5)}` : ""}
                                </p>
                              )}
                              {ev.description && <p className="text-[10px] text-stone-400 truncate">{ev.description}</p>}
                            </div>
                            <Pencil size={11} className="text-stone-300 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  {selectedEvts.length > 0 && selectedDetail.length > 0 && (
                    <div className="mx-4 border-t border-stone-100 my-1" />
                  )}

                  {/* Attendance */}
                  {selectedDetail.length > 0 && (
                    <div className="px-4 pt-3">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-2">Nhân viên ({selectedDetail.length})</p>
                      <div className="space-y-1.5">
                        {selectedDetail.map((r, i) => {
                          const s = CC_STATUS[r.status] ?? CC_STATUS.di_lam;
                          return (
                            <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-stone-50 transition">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${deptDot(r.phongBan)}`}>
                                {r.ten.split(" ").slice(-1)[0]?.[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-stone-700 truncate">{r.ten}</p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {r.phongBan && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${deptBg(r.phongBan)}`}>{r.phongBan}</span>
                                  )}
                                  {r.gioVao && <span className="text-[9px] text-stone-400">{r.gioVao}{r.gioRa?`–${r.gioRa}`:""}</span>}
                                  {r.ca && <span className="text-[9px] text-stone-400">{CA_LABEL[r.ca]??r.ca}</span>}
                                  {(r.tangCa ?? 0) > 0 && <span className="text-[9px] text-amber-600 font-medium">+{r.tangCa}h</span>}
                                </div>
                              </div>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${s.pill}`}>
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedEvts.length === 0 && selectedDetail.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-stone-300">
                      <CalendarDays size={28} className="mb-2" />
                      <p className="text-xs">Ngày trống</p>
                      <button onClick={() => setTaskModal({ date: selected })}
                        className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600 transition">
                        <Plus size={12} /> Tạo sự kiện
                      </button>
                    </div>
                  )}

                  <div className="h-4" />
                </div>
              </div>
            )}
          </div>
        )}
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
