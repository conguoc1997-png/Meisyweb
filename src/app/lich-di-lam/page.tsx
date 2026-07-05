"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { CalendarDays, CheckCircle, Clock, Send, ChevronLeft, ChevronRight, X, Loader2, AlertCircle, Search, ChevronDown } from "lucide-react";

type NhanVien = { id: string; ten: string; maNV: string; phongBan: string | null };
type LichRow = {
  id: string; ngay: string; gioVao: string | null; gioRa: string | null;
  ghiChu: string | null; trangThai: string; adminNote: string | null;
};

const TT: Record<string, { label: string; color: string; bg: string }> = {
  cho_duyet: { label: "Chờ duyệt", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  da_duyet:  { label: "Đã duyệt",  color: "text-green-700", bg: "bg-green-50 border-green-200" },
  tu_choi:   { label: "Từ chối",   color: "text-red-700",   bg: "bg-red-50 border-red-200" },
};

const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function formatNgay(ngay: string) {
  const d = new Date(ngay + "T00:00:00");
  return `${DAYS_VI[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function LichDiLamPage() {
  const now = new Date();
  const todayStr = isoDate(now);

  // ── Auth step ──
  const [selectedNV, setSelectedNV] = useState<NhanVien | null>(null);
  const [maNVInput, setMaNVInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  // Lazy list
  const [showList, setShowList] = useState(false);
  const [nvList, setNvList] = useState<NhanVien[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const maNVRef = useRef<HTMLInputElement>(null);

  // ── Schedule state ──
  const [lichList, setLichList] = useState<LichRow[]>([]);
  const [loadingLich, setLoadingLich] = useState(false);
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [formGioVao, setFormGioVao] = useState("07:30");
  const [formGioRa, setFormGioRa] = useState("17:30");
  const [formGhiChu, setFormGhiChu] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; count: number } | null>(null);

  // ── Lookup by mã NV (fast path) ──
  const handleLookupMaNV = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const ma = maNVInput.trim().toUpperCase();
    if (!ma) return;
    setLookupLoading(true);
    setLookupError("");
    try {
      const res = await fetch(`/api/cham-cong/nhan-vien?maNV=${encodeURIComponent(ma)}`);
      const nv = await res.json();
      if (!nv || nv.error) {
        setLookupError(`Không tìm thấy mã nhân viên "${ma}". Thử lại hoặc tìm theo tên ↓`);
        return;
      }
      chonNV(nv as NhanVien);
    } catch {
      setLookupError("Lỗi kết nối, thử lại.");
    } finally {
      setLookupLoading(false);
    }
  };

  // ── Lazy load full list ──
  const handleShowList = async () => {
    setShowList(true);
    if (nvList.length > 0) return; // đã load rồi
    setListLoading(true);
    try {
      const res = await fetch("/api/cham-cong/nhan-vien");
      const d = await res.json();
      const list: NhanVien[] = Array.isArray(d) ? d : (d.list ?? []);
      // Ưu tiên VP + Livestream, còn lại xếp sau
      const priority = list.filter(nv => {
        const pb = (nv.phongBan ?? "").toLowerCase();
        return pb.includes("văn phòng") || pb.includes("van phong") || pb.includes("livestream") || pb === "vp" || pb === "cskh";
      });
      const rest = list.filter(nv => !priority.find(p => p.id === nv.id));
      setNvList([...priority, ...rest]);
    } catch { setNvList([]); }
    finally { setListLoading(false); }
  };

  const chonNV = (nv: NhanVien) => {
    setSelectedNV(nv);
    setShowList(false);
    setSelectedDates(new Set());
    setSubmitResult(null);
    loadLich(nv.id);
  };

  const loadLich = async (nvId: string) => {
    setLoadingLich(true);
    try {
      const res = await fetch(`/api/lich-di-lam?nhanVienId=${nvId}`);
      const d = await res.json();
      setLichList(Array.isArray(d) ? d : []);
    } catch { setLichList([]); }
    finally { setLoadingLich(false); }
  };

  // ── Calendar ──
  const calDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const days: (string | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(isoDate(new Date(calYear, calMonth, d)));
    return days;
  }, [calMonth, calYear]);

  const existingDates = useMemo(() => new Set(lichList.map(r => r.ngay.slice(0, 10))), [lichList]);

  const toggleDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    if (d.getDay() === 0 || dateStr <= todayStr) return;
    setSelectedDates(prev => {
      const next = new Set(prev);
      next.has(dateStr) ? next.delete(dateStr) : next.add(dateStr);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!selectedNV || selectedDates.size === 0) return;
    setSubmitting(true);
    let count = 0;
    for (const ngay of [...selectedDates].sort()) {
      try {
        const res = await fetch("/api/lich-di-lam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nhanVienId: selectedNV.id, ngay, gioVao: formGioVao || null, gioRa: formGioRa || null, ghiChu: formGhiChu || null }),
        });
        if (res.ok) count++;
      } catch { /* skip */ }
    }
    setSubmitting(false);
    setSubmitResult({ ok: count > 0, count });
    setSelectedDates(new Set());
    setFormGhiChu("");
    loadLich(selectedNV.id);
  };

  const handleHuy = async (id: string) => {
    if (!confirm("Hủy đăng ký lịch này?")) return;
    await fetch(`/api/lich-di-lam/${id}`, { method: "DELETE" });
    if (selectedNV) loadLich(selectedNV.id);
  };

  const filteredList = nvList.filter(nv =>
    nv.ten.toLowerCase().includes(listSearch.toLowerCase()) ||
    nv.maNV.toLowerCase().includes(listSearch.toLowerCase())
  );

  // Focus mã NV input on mount
  useEffect(() => { maNVRef.current?.focus(); }, []);

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 flex flex-col items-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Đăng ký lịch đi làm</h1>
            <p className="text-xs text-slate-500">Gửi lịch để admin phê duyệt</p>
          </div>
        </div>
      </div>

      {/* ── BƯỚC 1: Chọn NV ── */}
      {!selectedNV && (
        <div className="w-full max-w-md space-y-3">
          {/* Nhập mã NV — nhanh */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">Nhập mã nhân viên của bạn</p>
            <form onSubmit={handleLookupMaNV} className="flex gap-2">
              <input
                ref={maNVRef}
                value={maNVInput}
                onChange={e => { setMaNVInput(e.target.value.toUpperCase()); setLookupError(""); }}
                placeholder="VD: NV01, L01, CSKH01..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-200"
                autoCapitalize="characters"
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={lookupLoading || !maNVInput.trim()}
                className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5"
              >
                {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                {lookupLoading ? "" : "Tìm"}
              </button>
            </form>
            {lookupError && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> {lookupError}
              </p>
            )}
          </div>

          {/* Hoặc chọn từ danh sách */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button
              onClick={handleShowList}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 transition"
            >
              <span>Hoặc tìm theo tên</span>
              {listLoading
                ? <Loader2 size={15} className="animate-spin text-violet-400" />
                : <ChevronDown size={15} className={`transition-transform ${showList ? "rotate-180" : ""}`} />
              }
            </button>

            {showList && (
              <div className="border-t border-slate-100 p-4 space-y-2">
                <input
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Tìm theo tên..."
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {filteredList.map(nv => (
                    <button
                      key={nv.id}
                      onClick={() => chonNV(nv)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 transition text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                        {nv.ten.split(" ").pop()?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{nv.ten}</p>
                        <p className="text-xs text-slate-400">{nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}</p>
                      </div>
                    </button>
                  ))}
                  {filteredList.length === 0 && !listLoading && (
                    <p className="text-center text-sm text-slate-400 py-4">Không tìm thấy</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BƯỚC 2: Chọn lịch ── */}
      {selectedNV && (
        <div className="w-full max-w-md space-y-4">
          {/* Info NV */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">
                {selectedNV.ten.split(" ").pop()?.charAt(0) ?? "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedNV.ten}</p>
                <p className="text-xs text-slate-400">{selectedNV.maNV}{selectedNV.phongBan ? ` · ${selectedNV.phongBan}` : ""}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedNV(null); setMaNVInput(""); setLichList([]); }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X size={13} /> Đổi
            </button>
          </div>

          {/* Kết quả submit */}
          {submitResult && (
            <div className={`rounded-xl p-4 border flex items-start gap-3 ${submitResult.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              {submitResult.ok
                ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                : <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {submitResult.ok ? `Đã gửi ${submitResult.count} lịch thành công!` : "Có lỗi khi gửi"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Admin sẽ xem xét và phê duyệt sớm nhất có thể.</p>
              </div>
            </div>
          )}

          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <ChevronLeft size={16} className="text-slate-500" />
              </button>
              <p className="text-sm font-semibold text-slate-700">{MONTHS_VI[calMonth]} {calYear}</p>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition">
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS_VI.map(d => (
                <div key={d} className={`text-center text-[11px] font-medium py-1 ${d === "CN" ? "text-red-400" : "text-slate-400"}`}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((dateStr, i) => {
                if (!dateStr) return <div key={i} />;
                const d = new Date(dateStr + "T00:00:00");
                const isSun = d.getDay() === 0;
                const isPast = dateStr <= todayStr;
                const isSelected = selectedDates.has(dateStr);
                const existingTT = lichList.find(r => r.ngay.slice(0, 10) === dateStr)?.trangThai;
                return (
                  <button key={dateStr} onClick={() => toggleDate(dateStr)} disabled={isSun || isPast}
                    className={`aspect-square rounded-xl text-xs font-medium transition flex items-center justify-center relative
                      ${isSun || isPast ? "text-slate-300 cursor-default" : ""}
                      ${isSelected ? "bg-violet-500 text-white shadow" : ""}
                      ${existingTT && !isSelected
                        ? existingTT === "da_duyet" ? "bg-green-100 text-green-700"
                          : existingTT === "tu_choi" ? "bg-red-100 text-red-500"
                          : "bg-amber-100 text-amber-700"
                        : ""}
                      ${!isSelected && !existingTT && !isSun && !isPast ? "hover:bg-violet-50 text-slate-700" : ""}
                    `}
                  >
                    {d.getDate()}
                    {dateStr === todayStr && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-100">
              {[["bg-amber-100","Chờ duyệt"],["bg-green-100","Đã duyệt"],["bg-violet-500","Đang chọn"]].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-3 h-3 rounded ${bg}`} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Form giờ + ghi chú */}
          {selectedDates.size > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Đã chọn {selectedDates.size} ngày
              </p>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Giờ vào ca</label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="time" value={formGioVao} onChange={e => setFormGioVao(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-200" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Giờ ra ca</label>
                  <div className="relative">
                    <Clock size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="time" value={formGioRa} onChange={e => setFormGioRa(e.target.value)}
                      className="w-full pl-7 pr-2 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-200" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ghi chú (không bắt buộc)</label>
                <textarea value={formGhiChu} onChange={e => setFormGhiChu(e.target.value)}
                  placeholder="VD: Làm thêm buổi sáng, nghỉ sớm buổi chiều..." rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-200" />
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold py-3 rounded-xl transition">
                {submitting
                  ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                  : <><Send size={15} /> Gửi đăng ký ({selectedDates.size} ngày)</>}
              </button>
            </div>
          )}

          {/* Lịch sử */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Lịch đã đăng ký</p>
            {loadingLich ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-violet-400" /></div>
            ) : lichList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Chưa có lịch nào</p>
            ) : (
              <div className="space-y-2">
                {lichList.map(r => {
                  const tt = TT[r.trangThai] ?? TT.cho_duyet;
                  return (
                    <div key={r.id} className={`rounded-xl border p-3 ${tt.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">{formatNgay(r.ngay)}</p>
                          {(r.gioVao || r.gioRa) && (
                            <p className="text-xs text-slate-500 mt-0.5"><Clock size={11} className="inline mr-0.5" />{r.gioVao} – {r.gioRa}</p>
                          )}
                          {r.ghiChu && <p className="text-xs text-slate-400 mt-0.5 italic">"{r.ghiChu}"</p>}
                          {r.adminNote && <p className="text-xs text-slate-500 mt-1 font-medium">Admin: {r.adminNote}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tt.color}`}>{tt.label}</span>
                          {r.trangThai === "cho_duyet" && (
                            <button onClick={() => handleHuy(r.id)} className="text-[10px] text-red-400 hover:text-red-600 underline">Hủy</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
