"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Plus, X, Trash2, Check, ChevronDown, ChevronUp,
  CalendarDays, Users, Flag, Clock, Pencil, GripVertical,
  AlertCircle, CheckCircle2, Circle, PlayCircle,
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
const COLUMNS = [
  { key: "chua_lam",    label: "Chưa làm",    icon: Circle,       bg: "bg-gray-50",    border: "border-gray-200",  dot: "bg-gray-400",    count_color: "bg-gray-200 text-gray-600" },
  { key: "dang_lam",    label: "Đang làm",    icon: PlayCircle,   bg: "bg-blue-50",    border: "border-blue-200",  dot: "bg-blue-500",    count_color: "bg-blue-100 text-blue-700" },
  { key: "hoan_thanh",  label: "Hoàn thành",  icon: CheckCircle2, bg: "bg-green-50",   border: "border-green-200", dot: "bg-green-500",   count_color: "bg-green-100 text-green-700" },
] as const;

const PRIORITY = [
  { key: "khan_cap",    label: "Khẩn cấp", color: "#db4437", bg: "bg-red-100 text-red-700",    icon: "🚨" },
  { key: "cao",         label: "Cao",      color: "#f4b400", bg: "bg-amber-100 text-amber-700", icon: "⚡" },
  { key: "trung_binh",  label: "Trung bình",color:"#4285f4", bg: "bg-blue-100 text-blue-700",  icon: "🔵" },
  { key: "thap",        label: "Thấp",     color: "#9e9e9e", bg: "bg-gray-100 text-gray-600",   icon: "⬇" },
];
const PRIORITY_MAP = Object.fromEntries(PRIORITY.map(p => [p.key, p]));

const COLORS = [
  "#4285f4","#0f9d58","#db4437","#f4b400",
  "#ab47bc","#00acc1","#ff7043","#795548",
];

const DEPT_COLOR: Record<string, string> = {
  Livestream: "#ec407a", CSKH: "#29b6f6",
  Kho: "#ffa726", May: "#26a69a",
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
  const label = `${d.getDate()}/${d.getMonth()+1}`;
  if (diff < 0)  return { label, badge: "Trễ " + Math.abs(diff) + "d", cls: "text-red-600 bg-red-50 border-red-200" };
  if (diff === 0) return { label, badge: "Hôm nay", cls: "text-orange-600 bg-orange-50 border-orange-200" };
  if (diff <= 3)  return { label, badge: diff + "d", cls: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label, badge: null, cls: "text-gray-500 bg-gray-50 border-gray-200" };
}

let _tmpId = 0;
const tmpId = () => `tmp_${++_tmpId}`;

// ── Task Modal ───────────────────────────────────────────────────────
function TaskModal({
  task, nvList, onSave, onDelete, onClose,
}: {
  task?: Task;
  nvList: NhanVien[];
  onSave: (data: {
    title: string; description: string; deadline: string;
    priority: string; color: string; nhanVienIds: string[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}) {
  const [title,    setTitle]    = useState(task?.title ?? "");
  const [desc,     setDesc]     = useState(task?.description ?? "");
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "trung_binh");
  const [color,    setColor]    = useState(task?.color ?? "#4285f4");
  const [nvIds,    setNvIds]    = useState<string[]>(task?.assignments.map(a => a.nhanVienId) ?? []);
  const [saving,   setSaving]   = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => titleRef.current?.focus(), 50); }, []);

  const toggleNv = (id: string) =>
    setNvIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  async function submit() {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({ title: title.trim(), description: desc, deadline, priority, color, nhanVienIds: nvIds });
    setSaving(false);
    onClose();
  }

  const prioInfo = PRIORITY_MAP[priority];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Color bar */}
        <div className="h-1.5 flex-shrink-0 rounded-t-2xl" style={{ background: color }} />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{task ? "Sửa công việc" : "Tạo công việc mới"}</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X size={15} />
            </button>
          </div>

          {/* Title */}
          <input ref={titleRef} value={title} onChange={e => setTitle(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") submit(); }}
            placeholder="Tên công việc..."
            className="w-full border-b-2 border-gray-200 focus:border-blue-500 py-2 text-gray-800 font-medium outline-none text-[16px] mb-4 transition" />

          {/* Description */}
          <textarea value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Mô tả công việc..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 resize-none outline-none focus:ring-2 focus:ring-blue-200 mb-4" />

          {/* Deadline + Priority */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <CalendarDays size={11} /> Deadline
              </label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                <Flag size={11} /> Độ ưu tiên
              </label>
              <select value={priority} onChange={e => setPriority(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200">
                {PRIORITY.map(p => <option key={p.key} value={p.key}>{p.icon} {p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Color */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-gray-500">Màu:</span>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: c }}>
                {color === c && <Check size={11} className="text-white" strokeWidth={3} />}
              </button>
            ))}
          </div>

          {/* Assign NV */}
          <div className="mb-2">
            <label className="text-xs text-gray-500 mb-2 block flex items-center gap-1">
              <Users size={11} /> Giao cho
            </label>
            <div className="flex flex-wrap gap-2">
              {nvList.map(nv => {
                const selected = nvIds.includes(nv.id);
                return (
                  <button key={nv.id} onClick={() => toggleNv(nv.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all
                      ${selected ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                      style={{ background: deptColor(nv.phongBan) }}>
                      {nv.ten.split(" ").slice(-1)[0]?.[0]}
                    </span>
                    {nv.ten.split(" ").slice(-1)[0]}
                    {selected && <Check size={10} className="text-blue-500" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {onDelete && (
            <button onClick={async () => { if (confirm("Xoá công việc này?")) { await onDelete(); onClose(); } }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-red-400 hover:bg-red-50 rounded-lg transition">
              <Trash2 size={14} /> Xóa
            </button>
          )}
          <div className="flex-1" />
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Hủy</button>
          <button onClick={submit} disabled={!title.trim() || saving}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition disabled:opacity-40 shadow-sm"
            style={{ background: color }}>
            {saving ? "Đang lưu..." : task ? "Lưu" : "Tạo việc"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────────
function TaskCard({
  task, onEdit, onMove,
}: {
  task: Task;
  onEdit: () => void;
  onMove: (trangThai: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dl = fmtDeadline(task.deadline);
  const prio = PRIORITY_MAP[task.priority];
  const doneCount = task.assignments.filter(a => a.trangThai === "hoan_thanh").length;
  const totalCount = task.assignments.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
      {/* Color left border */}
      <div className="flex">
        <div className="w-1 rounded-l-xl flex-shrink-0" style={{ background: task.color }} />
        <div className="flex-1 p-3">
          {/* Header */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug">{task.title}</p>
              {task.description && !expanded && (
                <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
              )}
            </div>
            <button onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 transition flex-shrink-0">
              <Pencil size={12} />
            </button>
          </div>

          {/* Expanded description */}
          {expanded && task.description && (
            <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {/* Priority */}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${prio.bg}`}>
              {prio.icon} {prio.label}
            </span>

            {/* Deadline */}
            {dl && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${dl.cls}`}>
                <CalendarDays size={9} /> {dl.label}
                {dl.badge && <span className="font-bold">· {dl.badge}</span>}
              </span>
            )}
          </div>

          {/* Progress bar (if has assignments) */}
          {totalCount > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  {/* NV avatars */}
                  {task.assignments.slice(0, 5).map((a, i) => (
                    <div key={i} title={`${a.ten}: ${a.trangThai === "hoan_thanh" ? "✓" : a.trangThai === "dang_lam" ? "⏳" : "○"}`}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-white text-[8px] font-bold -ml-1 first:ml-0
                        ${a.trangThai === "hoan_thanh" ? "border-green-400" : a.trangThai === "dang_lam" ? "border-blue-400" : "border-white"}`}
                      style={{ background: deptColor(a.phongBan) }}>
                      {a.ten.split(" ").slice(-1)[0]?.[0]}
                    </div>
                  ))}
                  {task.assignments.length > 5 && (
                    <span className="text-[9px] text-gray-400 ml-1">+{task.assignments.length-5}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500">{doneCount}/{totalCount}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${progress}%`, background: task.color }} />
              </div>
            </div>
          )}

          {/* Assignments expand */}
          {totalCount > 0 && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 mt-2 transition">
              {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {expanded ? "Thu gọn" : "Chi tiết NV"}
            </button>
          )}

          {expanded && (
            <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2">
              {task.assignments.map((a, i) => {
                const icon = a.trangThai === "hoan_thanh" ? "✓" : a.trangThai === "dang_lam" ? "⏳" : "○";
                const cls  = a.trangThai === "hoan_thanh"
                  ? "text-green-600" : a.trangThai === "dang_lam"
                  ? "text-blue-600" : "text-gray-400";
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0 mt-0.5"
                      style={{ background: deptColor(a.phongBan) }}>
                      {a.ten.split(" ").slice(-1)[0]?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-medium text-gray-700">{a.ten}</span>
                        <span className={`text-[10px] font-bold ${cls}`}>{icon}</span>
                      </div>
                      {a.note && <p className="text-[10px] text-gray-400 mt-0.5 italic">"{a.note}"</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Move buttons */}
          <div className="flex gap-1 mt-2.5 pt-2 border-t border-gray-100">
            {COLUMNS.filter(c => c.key !== task.trangThai).map(c => (
              <button key={c.key} onClick={() => onMove(c.key)}
                className={`flex-1 text-[10px] py-1 rounded-lg border transition font-medium
                  ${c.key === "hoan_thanh"
                    ? "border-green-200 text-green-600 hover:bg-green-50"
                    : c.key === "dang_lam"
                    ? "border-blue-200 text-blue-600 hover:bg-blue-50"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                {c.key === "hoan_thanh" ? "✓ Xong" : c.key === "dang_lam" ? "▶ Làm" : "○ Chờ"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function GiaoViecPage() {
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [nvList,  setNvList]  = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<{ task?: Task } | null>(null);
  const [filterNv,setFilterNv]= useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/giao-viec?_t=" + Date.now()).then(r => r.json());
      setTasks(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/cham-cong/nhan-vien").then(r => r.json()).then(d => setNvList(Array.isArray(d) ? d : [])).catch(() => {});
    fetchTasks();
  }, [fetchTasks]);

  const filtered = useMemo(() => {
    if (!filterNv) return tasks;
    return tasks.filter(t => t.assignments.some(a => a.nhanVienId === filterNv));
  }, [tasks, filterNv]);

  const columns = useMemo(() => {
    const map: Record<string, Task[]> = { chua_lam: [], dang_lam: [], hoan_thanh: [] };
    for (const t of filtered) {
      const col = map[t.trangThai] ?? map.chua_lam;
      col.push(t);
    }
    return map;
  }, [filtered]);

  // ── Optimistic create ──────────────────────────────────────────
  async function handleCreate(data: {
    title: string; description: string; deadline: string;
    priority: string; color: string; nhanVienIds: string[];
  }) {
    const optId = tmpId();
    const assignments: Assignment[] = data.nhanVienIds.map(nvId => {
      const nv = nvList.find(n => n.id === nvId);
      return { id: optId + nvId, taskId: optId, nhanVienId: nvId,
        trangThai: "chua_lam", note: null,
        ten: nv?.ten ?? "", maNV: nv?.maNV ?? "", phongBan: nv?.phongBan ?? null };
    });
    const optTask: Task = {
      id: optId, title: data.title, description: data.description || null,
      deadline: data.deadline || null, priority: data.priority, color: data.color,
      trangThai: "chua_lam", createdAt: new Date().toISOString(), assignments,
    };
    setTasks(prev => [optTask, ...prev]);
    try {
      const res = await fetch("/api/giao-viec", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      const json = await res.json();
      // Replace optimistic with real id
      setTasks(prev => prev.map(t => t.id === optId ? { ...t, id: json.id ?? optId } : t));
    } catch {
      setTasks(prev => prev.filter(t => t.id !== optId));
    }
  }

  // ── Optimistic update ──────────────────────────────────────────
  async function handleUpdate(taskId: string, data: {
    title: string; description: string; deadline: string;
    priority: string; color: string; nhanVienIds: string[];
  }) {
    const assignments: Assignment[] = data.nhanVienIds.map(nvId => {
      const nv = nvList.find(n => n.id === nvId);
      // Preserve existing status if reassigned
      const existing = tasks.find(t => t.id === taskId)?.assignments.find(a => a.nhanVienId === nvId);
      return {
        id: existing?.id ?? tmpId(), taskId,
        nhanVienId: nvId, trangThai: existing?.trangThai ?? "chua_lam",
        note: existing?.note ?? null,
        ten: nv?.ten ?? "", maNV: nv?.maNV ?? "", phongBan: nv?.phongBan ?? null,
      };
    });
    setTasks(prev => prev.map(t => t.id === taskId
      ? { ...t, ...data, deadline: data.deadline || null,
          description: data.description || null, assignments }
      : t
    ));
    try {
      await fetch(`/api/giao-viec/${taskId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
    } catch {
      fetchTasks();
    }
  }

  // ── Optimistic delete ──────────────────────────────────────────
  async function handleDelete(taskId: string) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      await fetch(`/api/giao-viec/${taskId}`, { method: "DELETE" });
    } catch {
      fetchTasks();
    }
  }

  // ── Move column ────────────────────────────────────────────────
  async function handleMove(taskId: string, trangThai: string) {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, trangThai } : t));
    try {
      await fetch(`/api/giao-viec/${taskId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trangThai }),
      });
    } catch {
      fetchTasks();
    }
  }

  // Stats
  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter(t => t.trangThai === "hoan_thanh").length;
  const overdue    = tasks.filter(t =>
    t.deadline && t.trangThai !== "hoan_thanh" &&
    new Date(t.deadline + "T23:59:59") < new Date()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#4285f4" }}>
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">Giao việc</h1>
            <p className="text-[11px] text-gray-400">Quản lý công việc nhân viên</p>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-400">Tổng</p>
            <p className="text-lg font-bold text-gray-700">{totalTasks}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Hoàn thành</p>
            <p className="text-lg font-bold text-green-600">{doneTasks}</p>
          </div>
          {overdue > 0 && (
            <div className="text-center">
              <p className="text-xs text-gray-400">Trễ hạn</p>
              <p className="text-lg font-bold text-red-500">{overdue}</p>
            </div>
          )}
        </div>

        {/* Filter by NV */}
        <select value={filterNv} onChange={e => setFilterNv(e.target.value)}
          className="text-sm border border-gray-200 rounded-full px-3 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
          <option value="">Tất cả nhân viên</option>
          {nvList.map(nv => <option key={nv.id} value={nv.id}>{nv.ten}</option>)}
        </select>

        <button onClick={() => setModal({})}
          className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-2xl text-white text-sm font-medium transition shadow-sm"
          style={{ background: "#4285f4" }}>
          <Plus size={16} /> Tạo việc
        </button>
      </header>

      {/* ── Kanban board ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 p-5 overflow-x-auto min-h-0">
          {COLUMNS.map(col => {
            const ColIcon = col.icon;
            const colTasks = columns[col.key] ?? [];
            return (
              <div key={col.key} className="flex flex-col w-80 flex-shrink-0 min-h-0">
                {/* Column header */}
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${col.bg} border ${col.border}`}>
                  <ColIcon size={14} className={col.key === "hoan_thanh" ? "text-green-500" : col.key === "dang_lam" ? "text-blue-500" : "text-gray-400"} />
                  <span className="text-sm font-semibold text-gray-700 flex-1">{col.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.count_color}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pb-4 pr-1 min-h-[200px]">
                  {colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setModal({ task })}
                      onMove={(tt) => handleMove(task.id, tt)}
                    />
                  ))}

                  {colTasks.length === 0 && (
                    <div className={`rounded-xl border-2 border-dashed ${col.border} p-6 text-center`}>
                      <p className="text-[11px] text-gray-400">
                        {col.key === "chua_lam" ? "Chưa có việc nào" :
                         col.key === "dang_lam"  ? "Chưa có việc đang làm" :
                         "Chưa có việc hoàn thành"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick add button */}
                {col.key === "chua_lam" && (
                  <button onClick={() => setModal({})}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition mt-1">
                    <Plus size={14} /> Thêm việc
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <TaskModal
          task={modal.task}
          nvList={nvList}
          onSave={modal.task
            ? (data) => handleUpdate(modal.task!.id, data)
            : handleCreate}
          onDelete={modal.task ? () => handleDelete(modal.task!.id) : undefined}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
