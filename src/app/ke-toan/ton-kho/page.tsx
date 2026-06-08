"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, X, Pencil, PackageCheck, RefreshCw } from "lucide-react";

type TonKho = {
  id: string;
  vatTuId: string;
  soLuong: number;
  giaTrungBinh: number;
  giaTriTon: number;
  updatedAt: string;
  donViMua: string;     // đơn vị mua (cuộn, gói, ...)
  quyDoi: number;       // hệ số quy đổi
  donViQuyDoi: string;  // đơn vị sau quy đổi (m, cái, chiếc...)
  soLuongQD: number;    // soLuong × quyDoi
  vatTu: {
    id: string; ma: string; ten: string; loai: string;
    nhom: string | null; donVi: string; ghiChu: string | null;
  };
};

type VatTuForm = {
  ma: string; ten: string; loai: string; nhom: string; donVi: string; ghiChu: string;
};

const LOAI_OPTIONS = [
  { value: "vai",        label: "Vải" },
  { value: "may",        label: "May" },
  { value: "gia_cong",   label: "Gia công" },
  { value: "hoan_thien", label: "Hoàn thiện" },
  // legacy
  { value: "phu_lieu",   label: "Phụ liệu" },
];

const NHOM_OPTIONS: Record<string, string[]> = {
  vai:        ["vai"],
  may:        ["lot", "chi", "khoa_keo", "mac", "khac"],
  gia_cong:   ["cuc", "dinh_tan", "mac_da", "khac"],
  hoan_thien: ["mac_lung", "khac"],
  phu_lieu:   ["chi", "cuc", "khoa_keo", "lot", "dinh_tan", "giat_mau", "giat_vi_sinh", "may", "khac"],
};

const NHOM_LABEL: Record<string, string> = {
  vai:          "Vải",
  lot:          "Lót",
  chi:          "Chỉ",
  khoa_keo:     "Khoá kéo",
  mac:          "Mác",
  cuc:          "Cúc",
  dinh_tan:     "Đinh tán / Núm",
  mac_da:       "Mác da",
  mac_lung:     "Mác lưng",
  giat_mau:     "Giặt màu",
  giat_vi_sinh: "Giặt vi sinh",
  may:          "May",
  khac:         "Khác",
  // legacy
  vai_cotton: "Vải cotton", vai_thun: "Vải thun", vai_lua: "Vải lụa",
  vai_kaki: "Kaki", vai_jean: "Jean / Bò",
  mex: "Mex", nhan: "Nhãn", dong_goi: "Đóng gói",
};

const DON_VI_OPTIONS = [
  { value: "m",      label: "Mét (m)" },
  { value: "yard",   label: "Yard" },
  { value: "kg",     label: "KG" },
  { value: "cay",    label: "Cây" },
  { value: "cai",    label: "Cái" },
  { value: "chiec",  label: "Chiếc" },
  { value: "cuon",   label: "Cuộn" },
  { value: "goi",    label: "Gói" },
  { value: "hop",    label: "Hộp" },
  { value: "bo",     label: "Bộ" },
  { value: "thuong", label: "Thương" },
];

const fmt = (n: number) => n.toLocaleString("vi-VN");

const LOAI_COLOR: Record<string, string> = {
  vai:        "bg-teal-100 text-teal-700",
  may:        "bg-blue-100 text-blue-700",
  gia_cong:   "bg-purple-100 text-purple-700",
  hoan_thien: "bg-pink-100 text-pink-700",
  phu_lieu:   "bg-orange-100 text-orange-700",
};
const loaiColor = (loai: string) => LOAI_COLOR[loai] ?? "bg-slate-100 text-slate-600";

export default function TonKhoPage() {
  const [items, setItems]         = useState<TonKho[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterNhom, setFilterNhom] = useState("");

  const [modal, setModal]         = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<TonKho | null>(null);
  const [form, setForm]           = useState<VatTuForm>({ ma: "", ten: "", loai: "vai", nhom: "", donVi: "m", ghiChu: "" });
  const [customLoai, setCustomLoai] = useState("");
  const [customNhom, setCustomNhom] = useState("");
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [recalcing, setRecalcing] = useState(false);
  const [groupByName, setGroupByName] = useState(false);

  // Multi-select + merge
  const [selected, setSelected]   = useState<Set<string>>(new Set()); // vatTuIds
  const [merging, setMerging]     = useState(false);
  const [mergeModal, setMergeModal] = useState(false);
  const [masterId, setMasterId]   = useState<string>("");

  // Delete confirmation (2 lớp)
  const [deleteTarget, setDeleteTarget] = useState<TonKho | null>(null);
  const [deleteStep, setDeleteStep]     = useState(0); // 0=closed, 1=first, 2=second
  const [deleting, setDeleting]         = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/ke-toan/ton-kho");
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = useMemo(() => items.filter(t => {
    const s = search.toLowerCase();
    const matchS = !s || t.vatTu.ten.toLowerCase().includes(s) || t.vatTu.ma.toLowerCase().includes(s);
    const matchL = !filterLoai || t.vatTu.loai === filterLoai;
    const matchN = !filterNhom || t.vatTu.nhom === filterNhom;
    return matchS && matchL && matchN;
  }), [items, search, filterLoai, filterNhom]);

  const stats = useMemo(() => ({
    total: filtered.length,
    giaTriTon: filtered.reduce((s, t) => s + t.giaTriTon, 0),
    soVai: filtered.filter(t => t.vatTu.loai === "vai").length,
    soPhuLieu: filtered.filter(t => t.vatTu.loai === "phu_lieu").length,
  }), [filtered]);

  const allNhom = useMemo(() => {
    const s = new Set(items.map(t => t.vatTu.nhom).filter(Boolean) as string[]);
    return [...s].sort();
  }, [items]);

  // Gộp các mã vật tư cùng tên thành 1 dòng
  type GroupedRow = {
    ten: string;
    loai: string;
    nhom: string | null;
    donVi: string;
    soLuong: number;
    giaTriTon: number;
    giaTrungBinh: number;
    items: TonKho[];   // các mã VT bên trong group
  };

  const groupedRows = useMemo((): GroupedRow[] => {
    const map = new Map<string, GroupedRow>();
    for (const t of filtered) {
      const key = t.vatTu.ten.trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          ten: t.vatTu.ten,
          loai: t.vatTu.loai,
          nhom: t.vatTu.nhom,
          donVi: t.vatTu.donVi,
          soLuong: 0,
          giaTriTon: 0,
          giaTrungBinh: 0,
          items: [],
        });
      }
      const g = map.get(key)!;
      g.soLuong   += t.soLuong;
      g.giaTriTon += t.giaTriTon;
      g.items.push(t);
    }
    // tính giá TB bình quân gia quyền
    for (const g of map.values()) {
      g.giaTrungBinh = g.soLuong > 0 ? g.giaTriTon / g.soLuong : 0;
    }
    return [...map.values()].sort((a, b) => a.ten.localeCompare(b.ten));
  }, [filtered]);

  const groupedStats = useMemo(() => ({
    total: groupedRows.length,
    giaTriTon: groupedRows.reduce((s, g) => s + g.giaTriTon, 0),
    soVai: groupedRows.filter(g => g.loai === "vai").length,
    soPhuLieu: groupedRows.filter(g => g.loai === "phu_lieu").length,
  }), [groupedRows]);

  function openCreate() {
    setForm({ ma: "", ten: "", loai: "may", nhom: "", donVi: "cai", ghiChu: "" });
    setCustomLoai(""); setCustomNhom(""); setSaveError("");
    setEditTarget(null);
    setModal("create");
  }

  function openEdit(t: TonKho) {
    setForm({ ma: t.vatTu.ma, ten: t.vatTu.ten, loai: t.vatTu.loai, nhom: t.vatTu.nhom || "", donVi: t.vatTu.donVi, ghiChu: t.vatTu.ghiChu || "" });
    setCustomLoai(""); setCustomNhom(""); setSaveError("");
    setEditTarget(t);
    setModal("edit");
  }

  async function handleSave() {
    setSaveError("");
    if (!form.ten.trim()) { setSaveError("Vui lòng nhập tên vật tư."); return; }
    if (!form.ma.trim()) { setSaveError("Vui lòng nhập mã vật tư."); return; }
    setSaving(true);
    try {
      const loaiFinal = form.loai === "__custom__" ? customLoai.trim() || "khac" : form.loai;
      const nhomFinal = form.nhom === "__custom__" ? customNhom.trim() || null : (form.nhom || null);
      const payload = { ...form, loai: loaiFinal, nhom: nhomFinal, ghiChu: form.ghiChu || null };
      let res: Response;
      if (modal === "create") {
        res = await fetch("/api/ke-toan/vat-tu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (modal === "edit" && editTarget) {
        res = await fetch(`/api/ke-toan/vat-tu/${editTarget.vatTuId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else return;
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setSaveError(d.error?.includes("Unique") || d.error?.includes("unique")
          ? `Mã "${form.ma}" đã tồn tại, vui lòng dùng mã khác.`
          : (d.error || "Lỗi không xác định."));
        return;
      }
      setModal(null);
      fetchAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleRecalc() {
    if (!confirm("Tính lại toàn bộ tồn kho từ lịch sử nhập/xuất?\n\nThao tác này sẽ cập nhật số lượng và giá trị tồn kho dựa trên dữ liệu thực tế.")) return;
    setRecalcing(true);
    try {
      const res = await fetch("/api/ke-toan/ton-kho/recalc", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Đã tính lại ${data.updated} mặt hàng thành công!`);
        fetchAll();
      } else {
        alert("❌ Lỗi: " + (data.error || "Không xác định"));
      }
    } finally {
      setRecalcing(false);
    }
  }

  // Merge handler
  async function handleMerge() {
    const dupIds = [...selected].filter(id => id !== masterId);
    if (!masterId || dupIds.length === 0) return;
    setMerging(true);
    try {
      const res = await fetch("/api/ke-toan/vat-tu/merge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId, duplicateIds: dupIds }),
      });
      if (res.ok) {
        setSelected(new Set());
        setMergeModal(false);
        setMasterId("");
        fetchAll();
      } else {
        const d = await res.json();
        alert("❌ Lỗi: " + (d.error || "Không xác định"));
      }
    } finally { setMerging(false); }
  }

  // Delete handler (2 lớp)
  function askDelete(t: TonKho) { setDeleteTarget(t); setDeleteStep(1); }
  function cancelDelete() { setDeleteTarget(null); setDeleteStep(0); }
  async function confirmDelete() {
    if (!deleteTarget) return;
    if (deleteStep === 1) { setDeleteStep(2); return; }
    setDeleting(true);
    try {
      await fetch(`/api/ke-toan/vat-tu/${deleteTarget.vatTuId}`, { method: "DELETE" });
      cancelDelete();
      fetchAll();
    } finally { setDeleting(false); }
  }

  const nhomOptions = NHOM_OPTIONS[form.loai] || [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tồn Kho Nguyên Phụ Liệu</h1>
          <p className="text-sm text-slate-500 mt-0.5">Báo cáo tồn kho theo giá vốn bình quân gia quyền</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size >= 2 && (
            <button onClick={() => { setMergeModal(true); setMasterId([...selected][0]); }}
              className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
              Gộp {selected.size} mục
            </button>
          )}
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50">
              Bỏ chọn
            </button>
          )}
          <button onClick={handleRecalc} disabled={recalcing}
            title="Tính lại tồn kho từ lịch sử nhập/xuất"
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50">
            <RefreshCw size={15} className={recalcing ? "animate-spin" : ""} />
            {recalcing ? "Đang tính..." : "Tính lại tồn kho"}
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Thêm vật tư
          </button>
        </div>
      </div>

      {/* Stats */}
      {(() => {
        const s = groupByName ? groupedStats : stats;
        return (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Tổng mặt hàng", value: s.total, color: "text-slate-800" },
              { label: "Giá trị tồn kho", value: `${fmt(Math.round(s.giaTriTon))}₫`, color: "text-indigo-700" },
              { label: "Mặt hàng vải", value: s.soVai, color: "text-teal-700" },
              { label: "Phụ liệu", value: s.soPhuLieu, color: "text-orange-700" },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500 mb-1">{card.label}</p>
                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm mã, tên vật tư..."
            className="pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={filterLoai} onChange={e => { setFilterLoai(e.target.value); setFilterNhom(""); }}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
          <option value="">Tất cả loại</option>
          {LOAI_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        {allNhom.length > 0 && (
          <select value={filterNhom} onChange={e => setFilterNhom(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
            <option value="">Tất cả nhóm</option>
            {allNhom.map(n => <option key={n} value={n}>{NHOM_LABEL[n] ?? n}</option>)}
          </select>
        )}
        {/* Toggle gộp theo tên */}
        <button onClick={() => setGroupByName(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-colors ${groupByName ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
          <span className="text-base leading-none">{groupByName ? "⊞" : "⊟"}</span>
          Gộp theo tên
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-left">
              <th className="px-3 py-3 w-8"></th>
              <th className="px-4 py-3 font-semibold text-slate-600">Tên vật tư</th>
              <th className="px-4 py-3 font-semibold text-slate-600">Loại / Nhóm</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Tồn kho</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Đơn vị</th>
              <th className="px-4 py-3 font-semibold text-teal-600 text-right">Quy đổi</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Giá TB</th>
              <th className="px-4 py-3 font-semibold text-slate-600 text-right">Giá trị tồn</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={groupByName ? 9 : 10} className="text-center py-12 text-slate-400">Đang tải...</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={groupByName ? 9 : 10} className="text-center py-12 text-slate-400 space-y-2">
                <PackageCheck size={32} className="mx-auto text-slate-300" />
                <p>Chưa có dữ liệu tồn kho</p>
              </td></tr>
            )}

            {/* ── Chế độ gộp theo tên ── */}
            {!loading && groupByName && groupedRows.map(g => (
              <tr key={g.ten} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3">
                  <input type="checkbox"
                    checked={g.items.every(i => selected.has(i.vatTuId))}
                    onChange={e => {
                      const s = new Set(selected);
                      g.items.forEach(i => e.target.checked ? s.add(i.vatTuId) : s.delete(i.vatTuId));
                      setSelected(s);
                    }}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{g.ten}</p>
                  {g.items.length > 1 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {g.items.map(i => i.vatTu.ma).join(" · ")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${loaiColor(g.loai)}`}>
                    {LOAI_OPTIONS.find(l => l.value === g.loai)?.label}
                  </span>
                  {g.nhom && <span className="ml-1.5 text-xs text-slate-400">{NHOM_LABEL[g.nhom] ?? g.nhom}</span>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {fmt(Math.round(g.soLuong * 100) / 100)}
                  {g.items.length > 1 && (
                    <span className="ml-1.5 text-[10px] text-indigo-400">({g.items.length} mã)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{g.donVi}</td>
                {/* Quy đổi (grouped: sum soLuongQD) */}
                <td className="px-4 py-3 text-right">
                  {(() => {
                    const totalQD = g.items.reduce((s, t) => s + (t.soLuongQD ?? t.soLuong), 0);
                    const dvQD = g.items.find(t => t.donViQuyDoi && t.donViQuyDoi !== t.donViMua)?.donViQuyDoi ?? null;
                    const hasConv = dvQD != null && g.items.some(t => (t.quyDoi ?? 1) !== 1);
                    return hasConv ? (
                      <div className="space-y-0.5">
                        <div>
                          <span className="font-semibold text-teal-700">{fmt(Math.round(totalQD * 100) / 100)}</span>
                          <span className="text-xs text-teal-500 ml-1">{dvQD}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ({fmt(Math.round(g.soLuong * 100) / 100)} {g.donVi})
                        </div>
                      </div>
                    ) : <span className="text-xs text-slate-300">—</span>;
                  })()}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{fmt(Math.round(g.giaTrungBinh))}₫</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(Math.round(g.giaTriTon))}₫</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  {g.items.length === 1 && (
                    <button onClick={() => openEdit(g.items[0])} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                      <Pencil size={13} />
                    </button>
                  )}
                  {g.items.length === 1 && (
                    <button onClick={() => askDelete(g.items[0])} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {/* ── Chế độ chi tiết từng mã ── */}
            {!loading && !groupByName && filtered.map(t => (
              <tr key={t.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${selected.has(t.vatTuId) ? "bg-indigo-50/40" : ""}`}>
                <td className="px-3 py-3">
                  <input type="checkbox"
                    checked={selected.has(t.vatTuId)}
                    onChange={e => {
                      const s = new Set(selected);
                      e.target.checked ? s.add(t.vatTuId) : s.delete(t.vatTuId);
                      setSelected(s);
                    }}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.vatTu.ten}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${loaiColor(t.vatTu.loai)}`}>
                    {LOAI_OPTIONS.find(l => l.value === t.vatTu.loai)?.label}
                  </span>
                  {t.vatTu.nhom && <span className="ml-1.5 text-xs text-slate-400">{NHOM_LABEL[t.vatTu.nhom] ?? t.vatTu.nhom}</span>}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(t.soLuong)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{t.donViMua ?? t.vatTu.donVi}</td>
                {/* Quy đổi — hiện cả sau và trước quy đổi */}
                <td className="px-4 py-3 text-right">
                  {(t.quyDoi ?? 1) !== 1 && t.donViQuyDoi && t.donViQuyDoi !== t.donViMua ? (
                    <div className="space-y-0.5">
                      <div>
                        <span className="font-semibold text-teal-700">{fmt(Math.round(t.soLuongQD * 100) / 100)}</span>
                        <span className="text-xs text-teal-500 ml-1">{t.donViQuyDoi}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ({fmt(Math.round(t.soLuong * 100) / 100)} {t.donViMua ?? t.vatTu.donVi})
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-600">{fmt(Math.round(t.giaTrungBinh))}₫</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700">{fmt(Math.round(t.giaTriTon))}₫</td>
                <td className="px-4 py-3 flex items-center gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => askDelete(t)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td colSpan={groupByName ? 6 : 7} className="px-4 py-3 font-semibold text-slate-700 text-right">Tổng giá trị tồn kho:</td>
                <td className="px-4 py-3 text-right font-bold text-indigo-700 text-base">
                  {fmt(Math.round(groupByName ? groupedStats.giaTriTon : stats.giaTriTon))}₫
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MODAL Thêm / Sửa vật tư */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">{modal === "create" ? "Thêm vật tư" : "Sửa vật tư"}</h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Mã vật tư *</label>
                  <input value={form.ma} onChange={e => setForm(f => ({ ...f, ma: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Đơn vị</label>
                  <select value={form.donVi} onChange={e => setForm(f => ({ ...f, donVi: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    {DON_VI_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Tên vật tư *</label>
                <input value={form.ten} onChange={e => setForm(f => ({ ...f, ten: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Loại</label>
                  {form.loai === "__custom__" ? (
                    <div className="flex gap-1">
                      <input autoFocus placeholder="Nhập tên loại mới..."
                        value={customLoai}
                        onChange={e => setCustomLoai(e.target.value)}
                        className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      <button onClick={() => setForm(f => ({ ...f, loai: "may", nhom: "" }))}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-lg">✕</button>
                    </div>
                  ) : (
                    <select value={form.loai} onChange={e => setForm(f => ({ ...f, loai: e.target.value, nhom: "" }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      {LOAI_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                      <option value="__custom__">➕ Thêm loại mới...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nhóm</label>
                  {form.nhom === "__custom__" ? (
                    <div className="flex gap-1">
                      <input autoFocus placeholder="Nhập tên nhóm mới..."
                        value={customNhom}
                        onChange={e => setCustomNhom(e.target.value)}
                        className="flex-1 border border-indigo-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                      <button onClick={() => setForm(f => ({ ...f, nhom: "" }))}
                        className="px-2 py-1 text-slate-400 hover:text-slate-600 text-lg">✕</button>
                    </div>
                  ) : (
                    <select value={form.nhom} onChange={e => setForm(f => ({ ...f, nhom: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      <option value="">— Chọn nhóm —</option>
                      {nhomOptions.map(n => <option key={n} value={n}>{NHOM_LABEL[n] ?? n}</option>)}
                      <option value="__custom__">➕ Thêm nhóm mới...</option>
                    </select>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 block mb-1">Ghi chú</label>
                <input value={form.ghiChu} onChange={e => setForm(f => ({ ...f, ghiChu: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            {saveError && (
              <div className="mx-6 mb-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                {saveError}
              </div>
            )}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => { setModal(null); setSaveError(""); }} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Huỷ</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Merge Modal ────────────────────────────────────────────────── */}
      {mergeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && setMergeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Gộp vật tư trùng tên</h3>
              <p className="text-xs text-slate-400 mt-0.5">Chọn mục giữ lại (master) — các mục còn lại sẽ bị gộp vào</p>
            </div>
            <div className="p-5 space-y-2 max-h-64 overflow-y-auto">
              {[...selected].map(vatTuId => {
                const t = items.find(i => i.vatTuId === vatTuId);
                if (!t) return null;
                return (
                  <label key={vatTuId} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                    ${masterId === vatTuId ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"}`}>
                    <input type="radio" name="master" checked={masterId === vatTuId}
                      onChange={() => setMasterId(vatTuId)} className="accent-indigo-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm">{t.vatTu.ten}</p>
                      <p className="text-xs text-slate-400">Tồn: {fmt(t.soLuong)} {t.donViMua}</p>
                    </div>
                    {masterId === vatTuId && <span className="text-xs text-indigo-600 font-medium shrink-0">Giữ lại</span>}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setMergeModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={handleMerge} disabled={merging || !masterId}
                className="px-5 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                {merging ? "Đang gộp..." : `Gộp ${selected.size} mục`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation (2 lớp) ─────────────────────────────────── */}
      {deleteStep > 0 && deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-5">
              {deleteStep === 1 ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <X size={22} className="text-red-500" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-center">Xoá vật tư?</h3>
                  <p className="text-sm text-slate-500 text-center mt-1">
                    <span className="font-semibold text-slate-700">{deleteTarget.vatTu.ten}</span>
                  </p>
                  <p className="text-xs text-slate-400 text-center mt-2">Thao tác này sẽ xoá vĩnh viễn vật tư và tồn kho.</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4">
                    <X size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-red-600 text-center">Xác nhận lần 2</h3>
                  <p className="text-sm text-slate-500 text-center mt-1">Bạn chắc chắn muốn xoá <span className="font-semibold text-slate-700">{deleteTarget.vatTu.ten}</span>?</p>
                  <p className="text-xs text-red-400 text-center mt-2 font-medium">Không thể khôi phục sau khi xoá!</p>
                </>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={cancelDelete} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Huỷ</button>
              <button onClick={confirmDelete} disabled={deleting}
                className={`flex-1 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50
                  ${deleteStep === 2 ? "bg-red-600 hover:bg-red-700" : "bg-red-400 hover:bg-red-500"}`}>
                {deleting ? "Đang xoá..." : deleteStep === 1 ? "Tiếp tục" : "Xoá vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
