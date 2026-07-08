"use client";
import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft, ChevronRight, Users, X,
  CalendarDays, CheckCircle2, Clock, TrendingUp,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
type NhanVien = {
  id: string; ten: string; maNV: string; phongBan: string | null;
};
type LichRow = {
  id: string; nhanVienId: string; ngay: string;
  ca: string | null; trangThai: string;
  nhanVien: { ten: string; maNV: string; phongBan: string | null };
};
type ChamCongRow = {
  id: string; nhanVienId: string; ngay: string;
  trangThai: string | null;
  gioVao: string | null; gioRa: string | null; tangCa: number | null;
};

// ── Hằng số ────────────────────────────────────────────────────────
const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const CC_STATUS: Record<string, { label: string; dot: string; pill: string }> = {
  di_lam:     { label: "Đi làm",      dot: "bg-emerald-400", pill: "bg-emerald-100 text-emerald-700" },
  di_muon:    { label: "Đi muộn",     dot: "bg-amber-400",   pill: "bg-amber-100 text-amber-700" },
  nghi_phep:  { label: "Nghỉ phép",   dot: "bg-blue-400",    pill: "bg-blue-100 text-blue-700" },
  nghi_benh:  { label: "Nghỉ bệnh",   dot: "bg-purple-400",  pill: "bg-purple-100 text-purple-700" },
  vang_mat:   { label: "Vắng mặt",    dot: "bg-red-400",     pill: "bg-red-100 text-red-600" },
  da_dang_ky: { label: "Đã đăng ký",  dot: "bg-violet-400",  pill: "bg-violet-100 text-violet-700" },
};

const CA_LABEL: Record<string, string> = {
  ca1: "Ca 1 🌅", ca2: "Ca 2 ☀️", ca3: "Ca 3 🌙", khac: "Khác ✏️",
};

const DEPT_COLOR: Record<string, string> = {
  Livestream: "bg-pink-400", CSKH: "bg-sky-400",
  Kho: "bg-amber-400", May: "bg-teal-400",
};
function deptColor(pb: string | null) {
  if (!pb) return "bg-stone-300";
  for (const [k, v] of Object.entries(DEPT_COLOR)) if (pb.includes(k)) return v;
  return "bg-stone-300";
}

// ── Helpers ────────────────────────────────────────────────────────
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthStr(y: number, m: number) {
  return `${y}-${String(m).padStart(2, "0")}`;
}

// ── Main ───────────────────────────────────────────────────────────
export default function CalendarPage() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [nvList,   setNvList]   = useState<NhanVien[]>([]);
  const [lichList, setLichList] = useState<LichRow[]>([]);
  const [ccList,   setCcList]   = useState<ChamCongRow[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // YYYY-MM-DD
  const [filterPB, setFilterPB] = useState<string>(""); // phòng ban filter

  // ── Data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cham-cong/nhan-vien")
      .then(r => r.json())
      .then(d => setNvList(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const thang = monthStr(year, month);
    const bust = `&_t=${Date.now()}`;
    Promise.all([
      fetch(`/api/lich-di-lam?thang=${thang}&trangThai=da_duyet${bust}`).then(r => r.json()).catch(() => []),
      fetch(`/api/cham-cong?thang=${thang}${bust}`).then(r => r.json()).catch(() => ({ chamCongs: [] })),
    ]).then(([lich, cc]) => {
      setLichList(Array.isArray(lich) ? lich : []);
      const ccArr = Array.isArray(cc) ? cc : (cc?.chamCongs ?? []);
      setCcList(ccArr);
    }).finally(() => setLoading(false));
  }, [year, month]);

  // ── Calendar grid ─────────────────────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (() => {
    const d = new Date(year, month - 1, 1).getDay(); // 0=Sun
    return d === 0 ? 6 : d - 1; // convert to 0=Mon
  })();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

  // ── Phòng ban list ────────────────────────────────────────────────
  const phongBanList = useMemo(() => {
    const s = new Set<string>();
    nvList.forEach(nv => { if (nv.phongBan) s.add(nv.phongBan); });
    return ["", ...Array.from(s).sort()];
  }, [nvList]);

  // ── Build day data ────────────────────────────────────────────────
  const nvMap = useMemo(() => Object.fromEntries(nvList.map(nv => [nv.id, nv])), [nvList]);

  // cc by date + nhanVienId
  const ccByDate = useMemo(() => {
    const m = new Map<string, ChamCongRow[]>();
    for (const cc of ccList) {
      const d = cc.ngay.slice(0, 10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(cc);
    }
    return m;
  }, [ccList]);

  // lich by date
  const lichByDate = useMemo(() => {
    const m = new Map<string, LichRow[]>();
    for (const l of lichList) {
      const d = l.ngay.slice(0, 10);
      if (!m.has(d)) m.set(d, []);
      m.get(d)!.push(l);
    }
    return m;
  }, [lichList]);

  // Filter helpers
  const filterNv = (nvId: string) => {
    if (!filterPB) return true;
    const nv = nvMap[nvId];
    return nv?.phongBan === filterPB;
  };

  // ── Summary stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalDiLam = 0, totalMuon = 0, totalNghi = 0, totalDangKy = 0;
    ccList.forEach(cc => {
      if (!filterNv(cc.nhanVienId)) return;
      if (cc.trangThai === "di_lam") totalDiLam++;
      else if (cc.trangThai === "di_muon") { totalDiLam++; totalMuon++; }
      else if (cc.trangThai === "da_dang_ky") totalDangKy++;
      else if (cc.trangThai === "nghi_phep" || cc.trangThai === "nghi_benh" || cc.trangThai === "vang_mat") totalNghi++;
    });
    return { totalDiLam, totalMuon, totalNghi, totalDangKy };
  }, [ccList, filterPB, nvMap]);

  // ── Navigation ────────────────────────────────────────────────────
  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };
  const goToday = () => {
    setYear(today.getFullYear()); setMonth(today.getMonth() + 1);
    setSelected(toYMD(today));
  };

  const todayStr = toYMD(today);

  // ── Selected day detail ────────────────────────────────────────────
  const selectedCC   = selected ? (ccByDate.get(selected) ?? []) : [];
  const selectedLich = selected ? (lichByDate.get(selected) ?? []) : [];

  // Merge: cc thực tế + lich đăng ký chưa có cc
  const selectedDetail = useMemo(() => {
    if (!selected) return [];
    const ccNvIds = new Set(selectedCC.map(c => c.nhanVienId));
    const lichOnly = selectedLich.filter(l => !ccNvIds.has(l.nhanVienId));
    const rows: Array<{
      nvId: string; ten: string; maNV: string; phongBan: string | null;
      status: string; gioVao: string | null; gioRa: string | null;
      ca: string | null; tangCa: number | null;
    }> = [];
    // cc thực tế
    selectedCC.forEach(cc => {
      const nv = nvMap[cc.nhanVienId];
      if (!nv) return;
      if (filterPB && nv.phongBan !== filterPB) return;
      rows.push({
        nvId: cc.nhanVienId, ten: nv.ten, maNV: nv.maNV, phongBan: nv.phongBan,
        status: cc.trangThai || "di_lam", gioVao: cc.gioVao, gioRa: cc.gioRa,
        ca: null, tangCa: cc.tangCa,
      });
    });
    // lịch đăng ký (chưa chấm công)
    lichOnly.forEach(l => {
      const nv = nvMap[l.nhanVienId] ?? l.nhanVien;
      if (!nv) return;
      if (filterPB && nv.phongBan !== filterPB) return;
      rows.push({
        nvId: l.nhanVienId, ten: nv.ten, maNV: nv.maNV, phongBan: nv.phongBan,
        status: "da_dang_ky", gioVao: null, gioRa: null,
        ca: l.ca, tangCa: null,
      });
    });
    return rows.sort((a, b) => a.ten.localeCompare(b.ten));
  }, [selected, selectedCC, selectedLich, nvMap, filterPB]);

  // ── Cell render helper ────────────────────────────────────────────
  function DayCell({ dayNum }: { dayNum: number }) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const ccDay   = (ccByDate.get(dateStr) ?? []).filter(c => filterNv(c.nhanVienId));
    const lichDay = (lichByDate.get(dateStr) ?? []).filter(l => filterNv(l.nhanVienId));
    const isToday    = dateStr === todayStr;
    const isSelected = dateStr === selected;
    const isPast     = dateStr < todayStr;

    const diLam  = ccDay.filter(c => c.trangThai === "di_lam" || c.trangThai === "di_muon").length;
    const dangKy = lichDay.filter(l => !ccDay.find(c => c.nhanVienId === l.nhanVienId)).length;
    const total  = diLam + dangKy;

    // Top 3 dept dots
    const nvIds = [...new Set([...ccDay.map(c => c.nhanVienId), ...lichDay.map(l => l.nhanVienId)])];
    const dots  = nvIds.slice(0, 5).map(id => nvMap[id]?.phongBan ?? null);

    return (
      <button
        onClick={() => setSelected(isSelected ? null : dateStr)}
        className={`relative min-h-[72px] w-full text-left p-1.5 rounded-xl transition-all border
          ${isSelected   ? "bg-rose-50 border-rose-300 shadow-sm"
          : isToday     ? "border-rose-200 bg-rose-50/40"
          : "border-transparent hover:bg-stone-50 hover:border-stone-200"}`}
      >
        {/* Date number */}
        <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold
          ${isToday ? "bg-rose-500 text-white" : isPast ? "text-stone-400" : "text-stone-700"}`}>
          {dayNum}
        </span>

        {/* Dept dots */}
        {dots.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mt-1 px-0.5">
            {dots.map((pb, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${deptColor(pb)}`} />
            ))}
            {nvIds.length > 5 && <span className="text-[8px] text-stone-400 leading-none mt-0.5">+{nvIds.length - 5}</span>}
          </div>
        )}

        {/* Summary pills */}
        {total > 0 && (
          <div className="mt-1 space-y-0.5">
            {diLam > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-[9px] text-emerald-700 font-medium">{diLam} đi làm</span>
              </div>
            )}
            {dangKy > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                <span className="text-[9px] text-violet-700 font-medium">{dangKy} đăng ký</span>
              </div>
            )}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf8]">
      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
            <CalendarDays size={20} className="text-rose-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-800">Lịch Công Ty</h1>
            <p className="text-xs text-stone-400">Lịch đăng ký & chấm công toàn công ty</p>
          </div>
        </div>

        {/* Filter phòng ban */}
        <div className="flex items-center gap-2">
          <Users size={14} className="text-stone-400" />
          <select
            value={filterPB}
            onChange={e => setFilterPB(e.target.value)}
            className="text-sm border border-stone-200 rounded-xl px-3 py-1.5 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Tất cả phòng ban</option>
            {phongBanList.filter(p => p).map(pb => (
              <option key={pb} value={pb}>{pb}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* ── Calendar main ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Month nav + stats */}
          <div className="px-6 pt-5 pb-3">
            {/* Nav row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition">
                  <ChevronLeft size={16} className="text-stone-500" />
                </button>
                <h2 className="text-xl font-bold text-stone-800 min-w-[160px] text-center">
                  Tháng {month}/{year}
                </h2>
                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition">
                  <ChevronRight size={16} className="text-stone-500" />
                </button>
                <button onClick={goToday}
                  className="text-xs px-3 py-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition font-medium">
                  Hôm nay
                </button>
              </div>

              {loading && (
                <span className="text-xs text-stone-400 animate-pulse">Đang tải...</span>
              )}
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", label: "Ngày công", val: stats.totalDiLam },
                { icon: Clock,        color: "text-amber-500",   bg: "bg-amber-50",   label: "Đi muộn",  val: stats.totalMuon },
                { icon: Users,        color: "text-violet-500",  bg: "bg-violet-50",  label: "Đã đăng ký",val: stats.totalDangKy },
                { icon: TrendingUp,   color: "text-blue-500",    bg: "bg-blue-50",    label: "Nghỉ",      val: stats.totalNghi },
              ].map(({ icon: Icon, color, bg, label, val }) => (
                <div key={label} className={`${bg} rounded-xl px-4 py-3 flex items-center gap-3`}>
                  <Icon size={18} className={color} />
                  <div>
                    <p className="text-xs text-stone-500">{label}</p>
                    <p className="text-lg font-bold text-stone-700">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 px-6 pb-6 overflow-auto">
            {/* DOW headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {DOW.map(d => (
                <div key={d} className={`text-center text-xs font-semibold py-1
                  ${d === "CN" ? "text-rose-400" : "text-stone-400"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: totalCells }, (_, i) => {
                const dayNum = i - firstDow + 1;
                if (dayNum < 1 || dayNum > daysInMonth) {
                  return <div key={i} />;
                }
                return <DayCell key={i} dayNum={dayNum} />;
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-stone-100">
              <span className="text-xs text-stone-400 font-medium">Ghi chú:</span>
              {[
                { dot: "bg-emerald-400", label: "Đi làm" },
                { dot: "bg-amber-400",   label: "Đi muộn" },
                { dot: "bg-violet-400",  label: "Đã đăng ký" },
                { dot: "bg-blue-400",    label: "Nghỉ phép" },
                { dot: "bg-red-400",     label: "Vắng mặt" },
              ].map(({ dot, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <span className="text-xs text-stone-500">{label}</span>
                </div>
              ))}
              <span className="ml-2 text-xs text-stone-400">Màu chấm = phòng ban:</span>
              {Object.entries(DEPT_COLOR).map(([dept, color]) => (
                <div key={dept} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs text-stone-500">{dept}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: Day detail ── */}
        <div className={`transition-all duration-200 overflow-hidden flex-shrink-0
          ${selected ? "w-80" : "w-0"}`}>
          {selected && (
            <div className="w-80 h-full border-l border-stone-100 bg-white flex flex-col overflow-hidden">
              {/* Panel header */}
              <div className="px-4 py-4 border-b border-stone-100 flex items-start justify-between">
                <div>
                  <p className="text-xs text-stone-400 font-medium uppercase tracking-wide">
                    {["CN","T2","T3","T4","T5","T6","T7"][new Date(selected + "T00:00:00").getDay()]}
                  </p>
                  <p className="text-2xl font-bold text-stone-800">
                    {parseInt(selected.slice(8))} tháng {parseInt(selected.slice(5, 7))}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{selected === todayStr ? "📍 Hôm nay" : selected}</p>
                </div>
                <button onClick={() => setSelected(null)}
                  className="text-stone-300 hover:text-stone-500 mt-1">
                  <X size={18} />
                </button>
              </div>

              {/* Summary chips */}
              <div className="px-4 py-3 flex gap-2 flex-wrap border-b border-stone-50">
                {(["di_lam","di_muon","da_dang_ky","nghi_phep","nghi_benh","vang_mat"] as const).map(st => {
                  const count = st === "da_dang_ky"
                    ? selectedDetail.filter(r => r.status === "da_dang_ky").length
                    : selectedDetail.filter(r => r.status === st).length;
                  if (count === 0) return null;
                  const s = CC_STATUS[st];
                  return (
                    <span key={st} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${s.pill}`}>
                      {count} {s.label}
                    </span>
                  );
                })}
                {selectedDetail.length === 0 && (
                  <span className="text-xs text-stone-400">Chưa có dữ liệu</span>
                )}
              </div>

              {/* Employee list */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-50">
                {selectedDetail.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-stone-300">
                    <CalendarDays size={32} className="mb-2" />
                    <p className="text-sm">Không có dữ liệu</p>
                  </div>
                ) : selectedDetail.map((r, i) => {
                  const s = CC_STATUS[r.status] ?? CC_STATUS.di_lam;
                  return (
                    <div key={i} className="px-4 py-3 hover:bg-stone-50 transition">
                      <div className="flex items-center gap-2.5">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${deptColor(r.phongBan)}`}>
                          {r.ten.split(" ").slice(-1)[0]?.[0] ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-700 truncate">{r.ten}</p>
                          <p className="text-[11px] text-stone-400">{r.maNV} · {r.phongBan ?? "—"}</p>
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${s.pill}`}>
                          {s.label}
                        </span>
                      </div>

                      {/* Time info */}
                      {(r.gioVao || r.gioRa || r.ca || r.tangCa) && (
                        <div className="mt-1.5 ml-[42px] flex flex-wrap gap-2">
                          {r.gioVao && (
                            <span className="text-[10px] text-stone-400">
                              🕐 {r.gioVao}{r.gioRa ? ` – ${r.gioRa}` : ""}
                            </span>
                          )}
                          {r.ca && (
                            <span className="text-[10px] text-stone-400">
                              {CA_LABEL[r.ca] ?? r.ca}
                            </span>
                          )}
                          {r.tangCa != null && r.tangCa > 0 && (
                            <span className="text-[10px] text-amber-600 font-medium">
                              +{r.tangCa}h tăng ca
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
                <p className="text-[11px] text-stone-400 text-center">
                  {selectedDetail.length} nhân viên · {filterPB || "Tất cả phòng ban"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
