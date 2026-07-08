"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  CalendarDays, CheckCircle, Clock, Send, ChevronLeft, ChevronRight,
  X, Loader2, AlertCircle, Search, ChevronDown, RefreshCw, Edit3,
} from "lucide-react";

type NhanVien = {
  id: string; ten: string; maNV: string;
  phongBan: string | null; loaiLuong: string | null;
};
type LichRow = {
  id: string; ngay: string; gioVao: string | null; gioRa: string | null;
  ghiChu: string | null; trangThai: string; adminNote: string | null;
  ca: string | null; loai: string;
};

// ── Ca làm việc preset ──────────────────────────────────────────────────────
const CA_PRESETS = [
  { key: "ca1",  label: "Ca 1",  gioVao: "06:00", gioRa: "14:00", emoji: "🌅" },
  { key: "ca2",  label: "Ca 2",  gioVao: "14:00", gioRa: "22:00", emoji: "☀️"  },
  { key: "ca3",  label: "Ca 3",  gioVao: "22:00", gioRa: "06:00", emoji: "🌙" },
  { key: "khac", label: "Khác",  gioVao: null,     gioRa: null,    emoji: "✏️" },
] as const;
type CaKey = typeof CA_PRESETS[number]["key"];

function caLabel(ca: string | null) {
  const p = CA_PRESETS.find(c => c.key === ca);
  if (!p) return null;
  return p.gioVao ? `${p.emoji} ${p.label} (${p.gioVao}–${p.gioRa})` : `${p.emoji} ${p.label}`;
}

// Mặc định Ca 1; tất cả NV đều dùng chung 4 ca
function defaultCa(_nv: NhanVien): CaKey { return "ca1"; }
function allowedCas(_nv: NhanVien): CaKey[] { return ["ca1", "ca2", "ca3", "khac"]; }
// Tất cả đều chọn được mọi ngày kể cả CN
function allowSunday(_nv: NhanVien) { return true; }

// ── Helpers ─────────────────────────────────────────────────────────────────
const DAYS_VI = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS_VI = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

function formatNgay(ngay: string) {
  const d = new Date(ngay + "T00:00:00");
  return `${DAYS_VI[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}
function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LichDiLamPage() {
  const now = new Date();
  const todayStr = isoDate(now);

  // ── Auth ──
  const [selectedNV, setSelectedNV] = useState<NhanVien | null>(null);
  const [maNVInput, setMaNVInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [showList, setShowList] = useState(false);
  const [nvList, setNvList] = useState<NhanVien[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const maNVRef = useRef<HTMLInputElement>(null);

  // ── Schedule ──
  const [lichList, setLichList] = useState<LichRow[]>([]);
  const [loadingLich, setLoadingLich] = useState(false);
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  // Per-date selection: Map<dateStr, CaKey[]> — nhiều ca/ngày
  const [dateSelections, setDateSelections] = useState<Map<string, CaKey[]>>(new Map());

  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; count: number; errors?: string[] } | null>(null);

  // ── Change request modal ──
  type ChangeReq = { lich: LichRow; ca: CaKey; reason: string };
  const [changeReq, setChangeReq] = useState<ChangeReq | null>(null);
  const [changeSending, setChangeSending] = useState(false);

  // ── Lookup ──
  const handleLookupMaNV = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const ma = maNVInput.trim().toUpperCase();
    if (!ma) return;
    setLookupLoading(true); setLookupError("");
    try {
      const res = await fetch(`/api/cham-cong/nhan-vien?maNV=${encodeURIComponent(ma)}`);
      const nv = await res.json();
      if (!nv || nv.error) { setLookupError(`Không tìm thấy mã "${ma}". Thử lại hoặc tìm theo tên ↓`); return; }
      chonNV(nv as NhanVien);
    } catch { setLookupError("Lỗi kết nối, thử lại."); }
    finally { setLookupLoading(false); }
  };

  const handleShowList = async () => {
    setShowList(true);
    if (nvList.length > 0) return;
    setListLoading(true);
    try {
      const res = await fetch("/api/cham-cong/nhan-vien");
      const d = await res.json();
      const list: NhanVien[] = Array.isArray(d) ? d : (d.list ?? []);
      const priority = list.filter(nv => {
        const pb = (nv.phongBan ?? "").toLowerCase();
        return pb.includes("văn phòng") || pb.includes("van phong") || pb.includes("livestream") || pb === "vp" || pb === "cskh";
      });
      setNvList([...priority, ...list.filter(nv => !priority.find(p => p.id === nv.id))]);
    } catch { setNvList([]); }
    finally { setListLoading(false); }
  };

  const chonNV = (nv: NhanVien) => {
    setSelectedNV(nv); setShowList(false);
    setDateSelections(new Map()); setSubmitResult(null);
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

  // Map ngay → lich đăng ký (loai='dang_ky') và thay đổi đang chờ
  const lichByDate = useMemo(() => {
    const m = new Map<string, LichRow>();
    // Ưu tiên bản ghi dang_ky, sau đó thay_doi
    for (const r of lichList) {
      const date = r.ngay.slice(0, 10);
      if (r.loai === "dang_ky") m.set(date, r);
    }
    return m;
  }, [lichList]);

  const pendingChangeByDate = useMemo(() => {
    const m = new Map<string, LichRow>();
    for (const r of lichList) {
      if (r.loai === "thay_doi" && r.trangThai === "cho_duyet") {
        m.set(r.ngay.slice(0, 10), r);
      }
    }
    return m;
  }, [lichList]);

  const toggleDate = async (dateStr: string) => {
    if (!selectedNV) return;
    const d = new Date(dateStr + "T00:00:00");
    const isSun = d.getDay() === 0;
    const isPast = dateStr <= todayStr;
    const existing = lichByDate.get(dateStr);

    // Chủ nhật: chỉ CSKH được chọn
    if (isSun && !allowSunday(selectedNV)) return;
    if (isPast) return;

    // Ngày đã được duyệt → mở modal thay đổi
    if (existing?.trangThai === "da_duyet") {
      const def = defaultCa(selectedNV);
      setChangeReq({ lich: existing, ca: def, reason: "" });
      return;
    }

    // Ngày đang chờ duyệt → cho phép hủy
    if (existing?.trangThai === "cho_duyet") {
      // Tìm tất cả bản ghi cho_duyet của ngày này
      const pendingRecords = lichList.filter(r => r.ngay.slice(0, 10) === dateStr && r.trangThai === "cho_duyet" && r.loai === "dang_ky");
      const caInfo = pendingRecords.map(r => r.ca ? caLabel(r.ca) : "Khác").join(", ");
      if (!confirm(`Hủy đăng ký ngày ${formatNgay(dateStr)}${caInfo ? `\n${caInfo}` : ""}?`)) return;
      await Promise.all(pendingRecords.map(r => fetch(`/api/lich-di-lam/${r.id}`, { method: "DELETE" })));
      loadLich(selectedNV.id);
      return;
    }

    setDateSelections(prev => {
      const next = new Map(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr); // bỏ chọn ngày
      } else {
        next.set(dateStr, [defaultCa(selectedNV)]); // mặc định 1 ca
      }
      return next;
    });
  };

  // Toggle ca trong ngày: bật/tắt từng ca riêng lẻ
  const toggleCaForDate = (dateStr: string, ca: CaKey) => {
    setDateSelections(prev => {
      const next = new Map(prev);
      const cas = next.get(dateStr) ?? [];
      const idx = cas.indexOf(ca);
      const updated = idx >= 0 ? cas.filter(c => c !== ca) : [...cas, ca];
      if (updated.length === 0) {
        next.delete(dateStr); // bỏ ngày khi bỏ hết ca
      } else {
        next.set(dateStr, updated);
      }
      return next;
    });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!selectedNV || dateSelections.size === 0) return;
    setSubmitting(true);
    setSubmitResult(null);
    let count = 0;
    const errors: string[] = [];

    const requests: Promise<void>[] = [];
    for (const [ngay, cas] of [...dateSelections.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      for (const ca of cas) {
        const preset = CA_PRESETS.find(p => p.key === ca);
        requests.push(
          fetch("/api/lich-di-lam", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nhanVienId: selectedNV.id, ngay, ca,
              gioVao: preset?.gioVao ?? null,
              gioRa: preset?.gioRa ?? null,
              loai: "dang_ky",
            }),
          }).then(async r => {
            if (r.ok) {
              count++;
            } else {
              const data = await r.json().catch(() => ({}));
              errors.push(data.error || `Lỗi HTTP ${r.status}`);
            }
          }).catch(e => { errors.push("Mất kết nối: " + String(e)); })
        );
      }
    }
    await Promise.all(requests);
    setSubmitting(false);
    setSubmitResult({ ok: count > 0, count, errors });
    if (count > 0) {
      setDateSelections(new Map()); // chỉ xóa khi ít nhất 1 thành công
      loadLich(selectedNV.id);
    }
  };

  // ── Change request submit ──
  const handleSubmitChange = async () => {
    if (!changeReq || !selectedNV) return;
    setChangeSending(true);
    const preset = CA_PRESETS.find(p => p.key === changeReq.ca);
    const res = await fetch("/api/lich-di-lam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nhanVienId: selectedNV.id,
        ngay: changeReq.lich.ngay,
        ca: changeReq.ca,
        gioVao: preset?.gioVao || null,
        gioRa: preset?.gioRa || null,
        ghiChu: changeReq.reason || "Đề xuất thay đổi ca",
        loai: "thay_doi",
      }),
    });
    setChangeSending(false);
    if (res.ok) {
      setChangeReq(null);
      loadLich(selectedNV.id);
    }
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

  useEffect(() => { maNVRef.current?.focus(); }, []);

  // ─── RENDER ───────────────────────────────────────────────────────────────
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

      {/* BƯỚC 1: Chọn NV */}
      {!selectedNV && (
        <div className="w-full max-w-md space-y-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <p className="text-sm font-semibold text-slate-700 mb-3">Nhập mã nhân viên của bạn</p>
            <form onSubmit={handleLookupMaNV} className="flex gap-2">
              <input
                ref={maNVRef}
                value={maNVInput}
                onChange={e => { setMaNVInput(e.target.value.toUpperCase()); setLookupError(""); }}
                placeholder="VD: NV01, L01, CSKH01..."
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-violet-200"
                autoCapitalize="characters" autoComplete="off"
              />
              <button type="submit" disabled={lookupLoading || !maNVInput.trim()}
                className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5">
                {lookupLoading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              </button>
            </form>
            {lookupError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> {lookupError}</p>}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <button onClick={handleShowList}
              className="w-full flex items-center justify-between px-5 py-4 text-sm text-slate-600 hover:bg-slate-50 transition">
              <span>Hoặc tìm theo tên</span>
              {listLoading
                ? <Loader2 size={15} className="animate-spin text-violet-400" />
                : <ChevronDown size={15} className={`transition-transform ${showList ? "rotate-180" : ""}`} />}
            </button>
            {showList && (
              <div className="border-t border-slate-100 p-4 space-y-2">
                <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Tìm theo tên..." value={listSearch} onChange={e => setListSearch(e.target.value)} autoFocus />
                <div className="max-h-60 overflow-y-auto space-y-1.5">
                  {filteredList.map(nv => (
                    <button key={nv.id} onClick={() => chonNV(nv)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-violet-50 transition text-left">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm flex-shrink-0">
                        {nv.ten.split(" ").pop()?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{nv.ten}</p>
                        <p className="text-xs text-slate-400">{nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}</p>
                      </div>
                    </button>
                  ))}
                  {filteredList.length === 0 && !listLoading && <p className="text-center text-sm text-slate-400 py-4">Không tìm thấy</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BƯỚC 2: Lịch + Ca */}
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
                <p className="text-xs text-slate-400">
                  {selectedNV.maNV}{selectedNV.phongBan ? ` · ${selectedNV.phongBan}` : ""}
                </p>
              </div>
            </div>
            <button onClick={() => { setSelectedNV(null); setMaNVInput(""); setLichList([]); }}
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <X size={13} /> Đổi
            </button>
          </div>

          {/* Kết quả đăng ký */}
          {!loadingLich && (() => {
            const daDuyet  = lichList.filter(r => r.trangThai === "da_duyet" && r.loai === "dang_ky");
            const tuChoi   = lichList.filter(r => r.trangThai === "tu_choi");
            const thayDoi  = lichList.filter(r => r.loai === "thay_doi" && r.trangThai === "cho_duyet");
            if (daDuyet.length === 0 && tuChoi.length === 0 && thayDoi.length === 0) return null;
            return (
              <div className="rounded-2xl border overflow-hidden shadow-sm">
                <div className="bg-slate-700 px-4 py-3">
                  <p className="text-sm font-bold text-white">📋 Kết quả đăng ký của bạn</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {daDuyet.map(r => (
                    <div key={r.id} className="bg-green-50 px-4 py-3 flex items-start gap-3">
                      <span className="text-green-500 text-lg mt-0.5">✅</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-green-800">Được duyệt</p>
                        <p className="text-sm text-green-700">{formatNgay(r.ngay)}</p>
                        {r.ca && <p className="text-xs text-green-600 mt-0.5">{caLabel(r.ca)}</p>}
                        {!r.ca && (r.gioVao || r.gioRa) && (
                          <p className="text-xs text-green-600 mt-0.5"><Clock size={11} className="inline mr-0.5" />{r.gioVao} – {r.gioRa}</p>
                        )}
                        {r.adminNote && <p className="text-xs text-green-700 mt-1 bg-green-100 rounded-lg px-2 py-1">💬 Admin: {r.adminNote}</p>}
                        {/* Nếu có đề xuất thay đổi đang chờ */}
                        {pendingChangeByDate.has(r.ngay.slice(0, 10)) && (
                          <p className="text-xs text-amber-700 mt-1 bg-amber-50 rounded-lg px-2 py-1">⏳ Đề xuất thay đổi đang chờ duyệt</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {tuChoi.map(r => (
                    <div key={r.id} className="bg-red-50 px-4 py-3 flex items-start gap-3">
                      <span className="text-red-500 text-lg mt-0.5">❌</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-red-800">{r.loai === "thay_doi" ? "Đề xuất thay đổi bị từ chối" : "Bị từ chối"}</p>
                        <p className="text-sm text-red-700">{formatNgay(r.ngay)}</p>
                        {r.ca && <p className="text-xs text-red-500 mt-0.5">{caLabel(r.ca)}</p>}
                        {r.adminNote
                          ? <p className="text-xs text-red-700 mt-1 bg-red-100 rounded-lg px-2 py-1">💬 Admin: {r.adminNote}</p>
                          : <p className="text-xs text-red-400 mt-1 italic">Không có lý do từ admin</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Thông báo kết quả gửi */}
          {submitResult && (
            <div className={`rounded-xl p-4 border flex items-start gap-3 ${submitResult.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              {submitResult.ok
                ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                : <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">
                  {submitResult.ok
                    ? `Đã gửi ${submitResult.count} ca thành công!`
                    : "Gửi thất bại"}
                </p>
                {submitResult.ok && (
                  <p className="text-xs text-slate-500 mt-0.5">Admin sẽ xem xét và phê duyệt sớm nhất.</p>
                )}
                {/* Hiển thị lỗi chi tiết */}
                {submitResult.errors && submitResult.errors.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {submitResult.errors.slice(0, 3).map((e, i) => (
                      <p key={i} className="text-xs text-red-500">• {e}</p>
                    ))}
                    {submitResult.errors.length > 3 && (
                      <p className="text-xs text-red-400">...và {submitResult.errors.length - 3} lỗi khác</p>
                    )}
                  </div>
                )}
              </div>
              <button onClick={() => setSubmitResult(null)} className="text-slate-300 hover:text-slate-500 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronLeft size={16} className="text-slate-500" /></button>
              <p className="text-sm font-semibold text-slate-700">{MONTHS_VI[calMonth]} {calYear}</p>
              <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition"><ChevronRight size={16} className="text-slate-500" /></button>
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
                const isSelected = dateSelections.has(dateStr);
                const existing = lichByDate.get(dateStr);
                const hasPendingChange = pendingChangeByDate.has(dateStr);
                const existingTT = existing?.trangThai;
                const isBlocked = (isSun && !allowSunday(selectedNV)) || isPast;

                let bgClass = "";
                if (isSelected) bgClass = "bg-violet-500 text-white shadow";
                else if (existingTT === "da_duyet") bgClass = hasPendingChange
                  ? "bg-amber-100 text-amber-700" // có thay đổi đang chờ
                  : "bg-green-100 text-green-700 ring-1 ring-green-300";
                else if (existingTT === "cho_duyet") bgClass = "bg-amber-100 text-amber-700 hover:bg-red-100 hover:text-red-500";
                else if (existingTT === "tu_choi") bgClass = "bg-red-100 text-red-400";
                else if (isBlocked) bgClass = "text-slate-300 cursor-default";
                else bgClass = "hover:bg-violet-50 text-slate-700";

                return (
                  <button key={dateStr} onClick={() => toggleDate(dateStr)}
                    disabled={isBlocked}
                    className={`aspect-square rounded-xl text-xs font-medium transition flex flex-col items-center justify-center relative ${bgClass}`}
                  >
                    <span>{d.getDate()}</span>
                    {/* Dots: ca đã chọn (nhiều ca) */}
                    {isSelected && (() => {
                      const cas = dateSelections.get(dateStr) ?? [];
                      if (cas.length === 0) return null;
                      return (
                        <span className="text-[8px] leading-none opacity-80">
                          {cas.map(c => CA_PRESETS.find(p => p.key === c)?.emoji ?? "").join("")}
                        </span>
                      );
                    })()}
                    {/* Dot: lịch hiện có */}
                    {!isSelected && existing?.ca && (
                      <span className="text-[8px] leading-none opacity-70">{CA_PRESETS.find(c => c.key === existing.ca)?.emoji}</span>
                    )}
                    {dateStr === todayStr && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                    )}
                    {/* Lock icon for approved */}
                    {existingTT === "da_duyet" && !hasPendingChange && (
                      <span className="absolute top-0.5 right-0.5 text-[8px]">🔒</span>
                    )}
                    {/* Hint: click để hủy */}
                    {existingTT === "cho_duyet" && (
                      <span className="absolute top-0.5 right-0.5 text-[8px] opacity-60">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100">
              {[
                ["bg-amber-100","Chờ duyệt (click để hủy ✕)"],
                ["bg-green-100 ring-1 ring-green-300","Đã duyệt 🔒"],
                ["bg-violet-500","Đang chọn"],
              ].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={`w-3 h-3 rounded ${bg}`} /> {label}
                </div>
              ))}
            </div>
            {lichList.some(r => r.trangThai === "da_duyet" && r.loai === "dang_ky") && (
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Nhấn vào ngày 🔒 để đề xuất thay đổi hoặc hủy lịch
              </p>
            )}
          </div>

          {/* Danh sách ngày đang chọn + chọn ca */}
          {dateSelections.size > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-violet-700">Đã chọn {dateSelections.size} ngày — Chọn ca cho từng ngày</p>
                <button onClick={() => setDateSelections(new Map())} className="text-xs text-slate-400 hover:text-red-500">Xóa hết</button>
              </div>
              <div className="divide-y divide-slate-100">
                {[...dateSelections.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dateStr, cas]) => {
                  const allowed = allowedCas(selectedNV);
                  return (
                    <div key={dateStr} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-700">{formatNgay(dateStr)}</p>
                        <button onClick={() => setDateSelections(prev => { const n = new Map(prev); n.delete(dateStr); return n; })}
                          className="text-slate-300 hover:text-red-400"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CA_PRESETS.filter(p => allowed.includes(p.key)).map(preset => {
                          const isChecked = cas.includes(preset.key);
                          return (
                            <button key={preset.key} onClick={() => toggleCaForDate(dateStr, preset.key)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition
                                ${isChecked
                                  ? "bg-violet-500 text-white border-violet-500 shadow"
                                  : "border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-200"}`}>
                              <span>{preset.emoji}</span>
                              <span className="flex-1 text-left">
                                <span className="font-semibold">{preset.label}</span>
                                {preset.gioVao && <span className="ml-1 opacity-70">{preset.gioVao}–{preset.gioRa}</span>}
                              </span>
                              {isChecked && <span className="text-[10px]">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                      {cas.length > 1 && (
                        <p className="text-[11px] text-violet-600 mt-1.5">✓ {cas.length} ca được chọn cho ngày này</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="p-4 pt-0">
                {(() => {
                  const totalCa = [...dateSelections.values()].reduce((s, cas) => s + cas.length, 0);
                  return (
                    <button onClick={handleSubmit} disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 disabled:bg-violet-300 text-white font-semibold py-3 rounded-xl transition">
                      {submitting
                        ? <><Loader2 size={16} className="animate-spin" /> Đang gửi...</>
                        : <><Send size={15} /> Gửi đăng ký ({dateSelections.size} ngày · {totalCa} ca)</>}
                    </button>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Lịch đang chờ duyệt */}
          {!loadingLich && lichList.some(r => r.trangThai === "cho_duyet" && r.loai === "dang_ky") && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                <span>⏳</span>
                <p className="text-xs font-semibold text-amber-800">Đang chờ admin duyệt</p>
              </div>
              <div className="divide-y divide-slate-100">
                {lichList.filter(r => r.trangThai === "cho_duyet" && r.loai === "dang_ky").map(r => (
                  <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{formatNgay(r.ngay)}</p>
                      {r.ca && <p className="text-xs text-slate-500 mt-0.5">{caLabel(r.ca)}</p>}
                      {!r.ca && (r.gioVao || r.gioRa) && (
                        <p className="text-xs text-slate-400 mt-0.5"><Clock size={11} className="inline mr-0.5" />{r.gioVao} – {r.gioRa}</p>
                      )}
                      {r.ghiChu && <p className="text-xs text-slate-400 italic">"{r.ghiChu}"</p>}
                    </div>
                    <button onClick={() => handleHuy(r.id)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1 transition whitespace-nowrap">
                      Hủy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Đề xuất thay đổi đang chờ */}
          {!loadingLich && lichList.some(r => r.loai === "thay_doi" && r.trangThai === "cho_duyet") && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <RefreshCw size={14} className="text-blue-500" />
                <p className="text-xs font-semibold text-blue-800">Đề xuất thay đổi đang chờ duyệt</p>
              </div>
              <div className="divide-y divide-slate-100">
                {lichList.filter(r => r.loai === "thay_doi" && r.trangThai === "cho_duyet").map(r => (
                  <div key={r.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{formatNgay(r.ngay)}</p>
                      {r.ca && <p className="text-xs text-blue-600 mt-0.5">Xin đổi sang: {caLabel(r.ca)}</p>}
                      {r.ghiChu && <p className="text-xs text-slate-400 italic">Lý do: "{r.ghiChu}"</p>}
                    </div>
                    <button onClick={() => handleHuy(r.id)}
                      className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1 transition whitespace-nowrap">
                      Hủy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loadingLich && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-violet-400" /></div>}
        </div>
      )}

      {/* ── Modal: Đề xuất thay đổi ── */}
      {changeReq && selectedNV && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 size={18} className="text-blue-500" />
                <h2 className="font-bold text-slate-800">Đề xuất thay đổi lịch</h2>
              </div>
              <button onClick={() => setChangeReq(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Thông tin hiện tại */}
              <div className="bg-green-50 rounded-xl px-4 py-3 text-sm">
                <p className="text-xs text-green-600 font-medium mb-1">Lịch đã được duyệt</p>
                <p className="font-semibold text-green-800">{formatNgay(changeReq.lich.ngay)}</p>
                {changeReq.lich.ca && <p className="text-xs text-green-700 mt-0.5">{caLabel(changeReq.lich.ca)}</p>}
              </div>
              {/* Chọn ca mới */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Muốn đổi sang ca nào?</p>
                <div className="grid grid-cols-2 gap-2">
                  {CA_PRESETS.filter(p => allowedCas(selectedNV).includes(p.key)).map(preset => (
                    <button key={preset.key}
                      onClick={() => setChangeReq(prev => prev ? { ...prev, ca: preset.key } : null)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition
                        ${changeReq.ca === preset.key
                          ? "bg-blue-500 text-white border-blue-500 shadow"
                          : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-200"}`}>
                      <span className="text-base">{preset.emoji}</span>
                      <span>
                        <span className="font-semibold block">{preset.label}</span>
                        <span className="opacity-70">{preset.gioVao}–{preset.gioRa}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Lý do */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Lý do (không bắt buộc)</label>
                <textarea
                  value={changeReq.reason}
                  onChange={e => setChangeReq(prev => prev ? { ...prev, reason: e.target.value } : null)}
                  placeholder="VD: Ca trước bị trùng lịch, xin đổi ca khác..."
                  rows={2}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
            <div className="flex gap-2 p-5 pt-0">
              <button onClick={() => setChangeReq(null)}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm hover:bg-slate-50 transition">Đóng</button>
              <button onClick={handleSubmitChange} disabled={changeSending}
                className="flex-1 bg-blue-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition flex items-center justify-center gap-2">
                {changeSending
                  ? <><Loader2 size={15} className="animate-spin" /> Đang gửi...</>
                  : <><Send size={14} /> Gửi đề xuất</>}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center pb-4 px-5">
              Muốn hủy lịch đã duyệt → liên hệ admin
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
