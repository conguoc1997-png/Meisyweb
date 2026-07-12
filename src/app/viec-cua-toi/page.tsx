"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2, Circle, PlayCircle, ChevronDown,
  CalendarDays, Flag, Users, X, Check, Clock,
  AlertCircle, Smile,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────
type NhanVien = { id: string; ten: string; maNV: string; phongBan: string | null };
type Assignment = {
  id: string; taskId: string; nhanVienId: string;
  trangThai: string; note: string | null;
  ten: string; maNV: string; phongBan: string | null;
};
type Task = {
  id: string; title: string; description: string | null;
  deadline: string | null; priority: string; color: string;
  trangThai: string; createdAt: string;
  assignments: Assignment[];
};

// ── Constants ────────────────────────────────────────────────────────
const PRIORITY_MAP: Record<string, { label: string; icon: string; cls: string }> = {
  khan_cap:   { label: "Khẩn cấp",   icon: "🚨", cls: "bg-red-100 text-red-700" },
  cao:        { label: "Cao",         icon: "⚡", cls: "bg-amber-100 text-amber-700" },
  trung_binh: { label: "Trung bình",  icon: "🔵", cls: "bg-blue-100 text-blue-700" },
  thap:       { label: "Thấp",        icon: "⬇",  cls: "bg-gray-100 text-gray-600" },
};

const STATUS_STEPS = [
  { key: "chua_lam",   label: "Chưa làm",   icon: Circle,       cls: "text-gray-400",  bg: "bg-gray-100 text-gray-600",   ring: "ring-gray-200" },
  { key: "dang_lam",   label: "Đang làm",   icon: PlayCircle,   cls: "text-blue-500",  bg: "bg-blue-100 text-blue-700",   ring: "ring-blue-300" },
  { key: "hoan_thanh", label: "Hoàn thành", icon: CheckCircle2, cls: "text-green-500", bg: "bg-green-100 text-green-700", ring: "ring-green-300" },
];
const STATUS_MAP = Object.fromEntries(STATUS_STEPS.map(s => [s.key, s]));

const DEPT_COLOR: Record<string, string> = {
  Livestream: "#ec407a", CSKH: "#29b6f6", Kho: "#ffa726", May: "#26a69a",
};
function deptColor(pb: string | null) {
  if (!pb) return "#9e9e9e";
  for (const [k, v] of Object.entries(DEPT_COLOR)) if (pb.includes(k)) return v;
  return "#9e9e9e";
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function fmtDeadline(s: string | null) {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  const today = toYMD(new Date());
  const diff = Math.ceil((d.getTime() - new Date(today + "T00:00:00").getTime()) / 86400000);
  const dows = ["CN","T2","T3","T4","T5","T6","T7"];
  const label = `${dows[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}`;
  if (diff < 0)   return { label, badge: `Trễ ${Math.abs(diff)} ngày`, cls: "text-red-600 bg-red-50 border-red-200", urgent: true };
  if (diff === 0) return { label, badge: "Hôm nay!", cls: "text-orange-600 bg-orange-50 border-orange-200", urgent: true };
  if (diff === 1) return { label, badge: "Ngày mai", cls: "text-amber-600 bg-amber-50 border-amber-200", urgent: true };
  if (diff <= 3)  return { label, badge: `${diff} ngày`, cls: "text-amber-500 bg-amber-50 border-amber-200", urgent: false };
  return { label, badge: null, cls: "text-gray-500 bg-gray-50 border-gray-200", urgent: false };
}

// ── NV Picker ────────────────────────────────────────────────────────
function NVPicker({ nvList, onSelect }: { nvList: NhanVien[]; onSelect: (nv: NhanVien) => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#4285f4" }}>
          <Users size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Bạn là ai?</h2>
        <p className="text-sm text-gray-500 mb-6">Chọn tên để xem việc của bạn</p>
        <div className="space-y-2">
          {nvList.map(nv => (
            <button key={nv.id} onClick={() => onSelect(nv)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition text-left group">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                style={{ background: deptColor(nv.phongBan) }}>
                {nv.ten.split(" ").slice(-1)[0]?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">{nv.ten}</p>
                {nv.phongBan && <p className="text-[11px] text-gray-400">{nv.phongBan}</p>}
              </div>
              <Check size={14} className="text-blue-400 opacity-0 group-hover:opacity-100 transition" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Task Item ────────────────────────────────────────────────────────
function MyTaskItem({
  task, myAssignment, onUpdateStatus,
}: {
  task: Task;
  myAssignment: Assignment;
  onUpdateStatus: (taskId: string, trangThai: string, note: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(myAssignment.note ?? "");
  const [saving, setSaving] = useState(false);
  const dl = fmtDeadline(task.deadline);
  const prio = PRIORITY_MAP[task.priority];
  const myStatus = STATUS_MAP[myAssignment.trangThai] ?? STATUS_MAP.chua_lam;
  const MyIcon = myStatus.icon;

  async function setStatus(tt: string) {
    if (saving) return;
    setSaving(true);
    await onUpdateStatus(task.id, tt, note);
    setSaving(false);
  }

  async function saveNote() {
    if (note === (myAssignment.note ?? "")) return;
    setSaving(true);
    await onUpdateStatus(task.id, myAssignment.trangThai, note);
    setSaving(false);
  }

  const isDone = myAssignment.trangThai === "hoan_thanh";

  return (
    <div className={`bg-white rounded-2xl border transition-all overflow-hidden
      ${isDone ? "border-green-200 opacity-75" : dl?.urgent ? "border-amber-200" : "border-gray-200"}`}>
      {/* Color top bar */}
      <div className="h-1 w-full" style={{ background: task.color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Status button */}
          <button onClick={() => setStatus(
              myAssignment.trangThai === "chua_lam" ? "dang_lam" :
              myAssignment.trangThai === "dang_lam" ? "hoan_thanh" : "chua_lam"
            )}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition flex-shrink-0 mt-0.5
              ring-2 ${myStatus.ring} bg-white hover:scale-110`}>
            <MyIcon size={16} className={myStatus.cls} />
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold leading-snug ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-3 ml-10 flex-wrap">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${prio.cls}`}>
            {prio.icon} {prio.label}
          </span>
          {dl && (
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${dl.cls}`}>
              <CalendarDays size={9} />
              Hạn: {dl.label}
              {dl.badge && <span className="font-bold">· {dl.badge}</span>}
            </span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${myStatus.bg}`}>
            {myStatus.label}
          </span>
        </div>

        {/* Teammates */}
        {task.assignments.length > 1 && (
          <div className="ml-10 mt-2.5 flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400">Cùng làm:</span>
            {task.assignments.filter(a => a.nhanVienId !== myAssignment.nhanVienId).map((a, i) => {
              const s = STATUS_MAP[a.trangThai];
              return (
                <div key={i} title={`${a.ten}: ${s?.label}`}
                  className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background: deptColor(a.phongBan) }}>
                    {a.ten.split(" ").slice(-1)[0]?.[0]}
                  </div>
                  {a.trangThai === "hoan_thanh" && <span className="text-[9px] text-green-500">✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Note + expand */}
        <div className="ml-10 mt-3">
          <button onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-blue-500 hover:text-blue-700 flex items-center gap-1 transition">
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Thu gọn" : "Ghi chú tiến độ"}
          </button>

          {expanded && (
            <div className="mt-2">
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                onBlur={saveNote}
                placeholder="Ghi chú tiến độ của bạn..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-200 transition"
              />
              {saving && <p className="text-[10px] text-gray-400 mt-1">Đang lưu...</p>}
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        {!isDone && (
          <div className="ml-10 mt-3 flex gap-2">
            {myAssignment.trangThai === "chua_lam" && (
              <button onClick={() => setStatus("dang_lam")} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 text-[11px] font-semibold hover:bg-blue-100 transition disabled:opacity-50">
                <PlayCircle size={12} /> Bắt đầu làm
              </button>
            )}
            {myAssignment.trangThai === "dang_lam" && (
              <button onClick={() => setStatus("hoan_thanh")} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-600 text-[11px] font-semibold hover:bg-green-100 transition disabled:opacity-50">
                <Check size={12} /> Đánh dấu xong
              </button>
            )}
            {myAssignment.trangThai !== "chua_lam" && (
              <button onClick={() => setStatus("chua_lam")} disabled={saving}
                className="px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 text-[10px] hover:bg-gray-100 transition disabled:opacity-50">
                Reset
              </button>
            )}
          </div>
        )}

        {isDone && (
          <div className="ml-10 mt-2 flex items-center gap-2">
            <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
              <Check size={12} /> Đã hoàn thành
            </span>
            <button onClick={() => setStatus("dang_lam")} disabled={saving}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition">
              Hoàn tác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function ViecCuaToiPage() {
  const [nvList,  setNvList]  = useState<NhanVien[]>([]);
  const [me,      setMe]      = useState<NhanVien | null>(null);
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter,  setFilter]  = useState<"all" | "chua_lam" | "dang_lam" | "hoan_thanh">("all");

  // Load NV list
  useEffect(() => {
    fetch("/api/cham-cong/nhan-vien").then(r => r.json())
      .then(d => setNvList(Array.isArray(d) ? d : [])).catch(() => {});
    // Restore from localStorage
    try {
      const saved = localStorage.getItem("meisy_me_nv");
      if (saved) setMe(JSON.parse(saved));
    } catch {}
  }, []);

  const fetchMyTasks = useCallback(async (nvId: string) => {
    setLoading(true);
    try {
      const data = await fetch(`/api/giao-viec?nv=${nvId}&_t=${Date.now()}`).then(r => r.json());
      setTasks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (me) fetchMyTasks(me.id);
  }, [me, fetchMyTasks]);

  function selectMe(nv: NhanVien) {
    setMe(nv);
    try { localStorage.setItem("meisy_me_nv", JSON.stringify(nv)); } catch {}
  }

  function logout() {
    setMe(null);
    setTasks([]);
    try { localStorage.removeItem("meisy_me_nv"); } catch {}
  }

  async function updateStatus(taskId: string, trangThai: string, note: string) {
    if (!me) return;
    // Optimistic
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, assignments: t.assignments.map(a =>
          a.nhanVienId === me.id ? { ...a, trangThai, note: note || null } : a
        )}
      : t
    ));
    try {
      await fetch(`/api/giao-viec/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment: { nhanVienId: me.id, trangThai, note } }),
      });
    } catch {
      if (me) fetchMyTasks(me.id);
    }
  }

  // ── Derived ─────────────────────────────────────────────────────
  const myTasks = useMemo(() => {
    return tasks.map(t => ({
      task: t,
      myAss: t.assignments.find(a => a.nhanVienId === me?.id),
    })).filter(x => x.myAss);
  }, [tasks, me]);

  const filtered = useMemo(() => {
    if (filter === "all") return myTasks;
    return myTasks.filter(x => x.myAss!.trangThai === filter);
  }, [myTasks, filter]);

  const counts = useMemo(() => ({
    all:         myTasks.length,
    chua_lam:   myTasks.filter(x => x.myAss!.trangThai === "chua_lam").length,
    dang_lam:   myTasks.filter(x => x.myAss!.trangThai === "dang_lam").length,
    hoan_thanh: myTasks.filter(x => x.myAss!.trangThai === "hoan_thanh").length,
  }), [myTasks]);

  // ── Not logged in ─────────────────────────────────────────────
  if (!me) return <NVPicker nvList={nvList} onSelect={selectMe} />;

  const urgent = myTasks.filter(x =>
    x.myAss!.trangThai !== "hoan_thanh" && x.task.deadline &&
    (() => {
      const diff = Math.ceil((new Date(x.task.deadline! + "T00:00:00").getTime() - new Date(toYMD(new Date()) + "T00:00:00").getTime()) / 86400000);
      return diff <= 1;
    })()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
          style={{ background: deptColor(me.phongBan) }}>
          {me.ten.split(" ").slice(-1)[0]?.[0]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Xin chào, {me.ten.split(" ").slice(-1)[0]} 👋</p>
          <p className="text-[11px] text-gray-400">{me.phongBan ?? "Công ty"}</p>
        </div>

        {/* Stats quick */}
        <div className="flex items-center gap-3">
          {counts.dang_lam > 0 && (
            <div className="text-center">
              <p className="text-xs font-bold text-blue-600">{counts.dang_lam}</p>
              <p className="text-[9px] text-gray-400">Đang làm</p>
            </div>
          )}
          {counts.hoan_thanh > 0 && (
            <div className="text-center">
              <p className="text-xs font-bold text-green-600">{counts.hoan_thanh}</p>
              <p className="text-[9px] text-gray-400">Xong</p>
            </div>
          )}
        </div>

        <button onClick={logout}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
          <X size={13} /> Đổi người
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Urgent banner */}
        {urgent.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <span className="font-bold">{urgent.length} việc</span> sắp đến hạn hoặc đã trễ — hãy xử lý sớm!
            </p>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4 bg-gray-100 p-1 rounded-2xl">
          {[
            { key: "all",        label: "Tất cả",      count: counts.all },
            { key: "chua_lam",   label: "Chưa làm",    count: counts.chua_lam },
            { key: "dang_lam",   label: "Đang làm",    count: counts.dang_lam },
            { key: "hoan_thanh", label: "Xong",         count: counts.hoan_thanh },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key as typeof filter)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition
                ${filter === tab.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${filter === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Smile size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">
              {filter === "hoan_thanh" ? "Chưa hoàn thành việc nào" :
               filter === "dang_lam"  ? "Chưa có việc đang làm" :
               filter === "chua_lam"  ? "Không có việc chờ 🎉" :
               "Chưa có việc nào được giao"}
            </p>
            {filter === "all" && (
              <p className="text-sm text-gray-400 mt-1">Admin sẽ giao việc cho bạn sớm</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(({ task, myAss }) => (
              <MyTaskItem
                key={task.id}
                task={task}
                myAssignment={myAss!}
                onUpdateStatus={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
