"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Save, X, Users, Building2, Check } from "lucide-react";

type Ca = {
  id: string; ten: string; gioVao: string; gioRa: string;
  nghiTrua: number; ghiChu?: string;
  gioVao2?: string | null; gioRa2?: string | null;
};
type NhanVien = { id: string; ten: string; maNV: string; phongBan?: string | null; caLamViecId?: string | null };
type ApDung = "khong" | "bo_phan" | "nhan_vien";

const PHONG_BAN = ["Kho", "May", "CSKH", "Livestream", "Văn phòng"];

function soGioChuẩn(gioVao: string, gioRa: string, nghiTrua: number, gioVao2?: string | null, gioRa2?: string | null) {
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const shift1 = toMin(gioRa) - toMin(gioVao);
  const shift2 = gioVao2 && gioRa2 ? toMin(gioRa2) - toMin(gioVao2) : 0;
  const total = shift1 + shift2 - nghiTrua;
  return (Math.max(0, total) / 60).toFixed(1);
}

export default function CaLamViecPage() {
  const [list, setList]       = useState<Ca[]>([]);
  const [nvList, setNvList]   = useState<NhanVien[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null); // null = không sửa, "new" = thêm mới
  const [draft, setDraft]     = useState<Ca & { apDung: ApDung; boPhanList: string[]; nhanVienIds: string[] }>({
    id: "", ten: "", gioVao: "07:30", gioRa: "17:30", nghiTrua: 90, ghiChu: "",
    gioVao2: null, gioRa2: null,
    apDung: "khong", boPhanList: [], nhanVienIds: [],
  });
  const [saving, setSaving]   = useState(false);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/ca-lam-viec/load").then(r => r.json());
    setList(Array.isArray(data.caList) ? data.caList.map((c: Ca) => ({ ...c, nghiTrua: Number(c.nghiTrua) })) : []);
    setNvList(Array.isArray(data.nvList) ? data.nvList : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startEdit(ca: Ca) {
    setEditingId(ca.id);
    setDraft({ ...ca, apDung: "khong", boPhanList: [], nhanVienIds: [] });
  }
  function startNew() {
    setEditingId("new");
    setDraft({ id: "", ten: "", gioVao: "07:30", gioRa: "17:30", nghiTrua: 90, ghiChu: "",
      gioVao2: null, gioRa2: null,
      apDung: "khong", boPhanList: [], nhanVienIds: [] });
  }
  function cancelEdit() { setEditingId(null); }

  async function save() {
    if (!draft.ten || !draft.gioVao || !draft.gioRa) return;
    setSaving(true);
    try {
      const isNew = editingId === "new";
      const res = await fetch("/api/ca-lam-viec", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, nghiTrua: Number(draft.nghiTrua) }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        alert("Lỗi khi lưu: " + (data?.error || res.status));
        setSaving(false);
        return;
      }
      setEditingId(null);
      await load();
    } catch (e) { alert("Lỗi kết nối: " + String(e)); }
    setSaving(false);
  }

  async function del(id: string, ten: string) {
    if (!confirm(`Xoá ca "${ten}"?`)) return;
    await fetch(`/api/ca-lam-viec?id=${id}`, { method: "DELETE" });
    load();
  }

  function countNV(caId: string) {
    return nvList.filter(nv => nv.caLamViecId === caId).length;
  }

  // Card ở chế độ sửa
  function EditCard({ ca }: { ca?: Ca }) {
    const soGio = soGioChuẩn(draft.gioVao, draft.gioRa, draft.nghiTrua, draft.gioVao2, draft.gioRa2);
    return (
      <div className="bg-white border-2 border-rose-200 rounded-2xl px-5 py-4 shadow-sm">
        {/* Dòng 1: tên + giờ */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={20} className="text-rose-400" />
          </div>
          <input
            autoFocus
            value={draft.ten}
            onChange={e => setDraft(d => ({ ...d, ten: e.target.value }))}
            placeholder="Tên ca..."
            className="flex-1 font-semibold text-stone-700 bg-transparent border-b-2 border-rose-200 focus:border-rose-400 outline-none py-0.5 text-sm"
          />
        </div>

        {/* Dòng 2: giờ vào / ra / nghỉ trưa */}
        <div className="flex items-center gap-3 ml-14 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">Vào</span>
            <input type="time" value={draft.gioVao}
              onChange={e => setDraft(d => ({ ...d, gioVao: e.target.value }))}
              className="text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <span className="text-stone-300">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">Ra</span>
            <input type="time" value={draft.gioRa}
              onChange={e => setDraft(d => ({ ...d, gioRa: e.target.value }))}
              className="text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400">Nghỉ trưa</span>
            <input type="number" value={draft.nghiTrua} min={0} max={180}
              onChange={e => setDraft(d => ({ ...d, nghiTrua: Number(e.target.value) }))}
              className="w-16 text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-rose-200 text-center"
            />
            <span className="text-xs text-stone-400">p</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{soGio}h/ngày</span>
        </div>

        {/* Ca 2 (tuỳ chọn) */}
        <div className="ml-14 mb-3">
          <button
            type="button"
            onClick={() => setDraft(d => d.gioVao2 != null
              ? { ...d, gioVao2: null, gioRa2: null }
              : { ...d, gioVao2: "18:00", gioRa2: "22:30" }
            )}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all font-medium
              ${draft.gioVao2 != null ? "bg-indigo-50 text-indigo-600 border-indigo-200" : "bg-white text-stone-400 border-stone-200 hover:border-indigo-200 hover:text-indigo-500"}`}
          >
            <span>{draft.gioVao2 != null ? "✓" : "+"}</span>
            Ca 2 (buổi tối)
          </button>
          {draft.gioVao2 != null && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-400">Vào</span>
                <input type="time" value={draft.gioVao2 || "18:00"}
                  onChange={e => setDraft(d => ({ ...d, gioVao2: e.target.value }))}
                  className="text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <span className="text-stone-300">→</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-stone-400">Ra</span>
                <input type="time" value={draft.gioRa2 || "22:30"}
                  onChange={e => setDraft(d => ({ ...d, gioRa2: e.target.value }))}
                  className="text-sm font-medium text-stone-700 border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Ghi chú */}
        <div className="ml-14 mb-3">
          <input value={draft.ghiChu || ""}
            onChange={e => setDraft(d => ({ ...d, ghiChu: e.target.value }))}
            placeholder="Ghi chú (tuỳ chọn)..."
            className="w-full text-xs text-stone-400 bg-transparent border-b border-stone-100 focus:border-stone-300 outline-none py-0.5"
          />
        </div>

        {/* Áp dụng cho — hiện cả khi thêm mới và khi sửa */}
        <div className="ml-14 mb-3">
          <p className="text-xs text-stone-400 mb-2 font-medium">Gán ca cho</p>
          <div className="flex gap-2 mb-2 flex-wrap">
            {([
              { key: "khong",     label: "Không thay đổi" },
              { key: "bo_phan",   label: "Bộ phận", icon: <Building2 size={12}/> },
              { key: "nhan_vien", label: "Nhân viên", icon: <Users size={12}/> },
            ] as { key: ApDung; label: string; icon?: React.ReactNode }[]).map(opt => (
              <button key={opt.key} type="button"
                onClick={() => setDraft(d => ({ ...d, apDung: opt.key as ApDung, boPhanList: [], nhanVienIds: [] }))}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                  ${draft.apDung === opt.key ? "bg-rose-500 text-white border-rose-500" : "bg-white text-stone-500 border-stone-200 hover:border-rose-300"}`}
              >
                {opt.icon}{opt.label}
              </button>
            ))}
          </div>
          {draft.apDung === "bo_phan" && (
            <div className="flex flex-wrap gap-1.5">
              {PHONG_BAN.map(bp => {
                const soNVInBP = nvList.filter(nv => nv.phongBan?.toLowerCase() === bp.toLowerCase()).length;
                return (
                  <button key={bp} type="button"
                    onClick={() => setDraft(d => ({ ...d, boPhanList: d.boPhanList.includes(bp) ? d.boPhanList.filter(b => b !== bp) : [...d.boPhanList, bp] }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all
                      ${draft.boPhanList.includes(bp) ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-stone-500 border-stone-200 hover:border-emerald-300"}`}
                  >
                    {bp}{soNVInBP > 0 && <span className="ml-1 opacity-60">({soNVInBP})</span>}
                  </button>
                );
              })}
            </div>
          )}
          {draft.apDung === "nhan_vien" && (
            <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-100 rounded-xl p-2">
              {nvList.map(nv => {
                const selected = draft.nhanVienIds.includes(nv.id);
                const currentCa = nv.caLamViecId === draft.id ? "• Ca này" : nv.caLamViecId ? "• Ca khác" : "";
                return (
                  <button key={nv.id} type="button"
                    onClick={() => setDraft(d => ({ ...d, nhanVienIds: d.nhanVienIds.includes(nv.id) ? d.nhanVienIds.filter(i => i !== nv.id) : [...d.nhanVienIds, nv.id] }))}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all
                      ${selected ? "bg-emerald-50 border border-emerald-200" : "hover:bg-stone-50"}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center
                      ${selected ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300"}`}>
                      {selected && <Check size={8}/>}
                    </span>
                    <span className="font-medium text-stone-700">{nv.ten}</span>
                    <span className="text-stone-400">{nv.maNV}</span>
                    {nv.phongBan && <span className="text-stone-300">{nv.phongBan}</span>}
                    {currentCa && <span className="ml-auto text-[10px] text-emerald-500">{currentCa}</span>}
                  </button>
                );
              })}
            </div>
          )}
          {draft.apDung !== "khong" && (
            <p className="text-[11px] text-stone-400 mt-1.5">
              {draft.apDung === "bo_phan"
                ? `${draft.boPhanList.length} bộ phận được chọn`
                : `${draft.nhanVienIds.length} nhân viên được chọn`}
            </p>
          )}
        </div>

        {/* Nút lưu / huỷ */}
        <div className="ml-14 flex gap-2">
          <button onClick={save} disabled={saving || !draft.ten}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-medium hover:bg-rose-600 disabled:opacity-40 transition-all">
            <Save size={12} /> {saving ? "Đang lưu..." : "Lưu"}
          </button>
          <button onClick={cancelEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-500 rounded-lg text-xs hover:bg-stone-200 transition-all">
            <X size={12} /> Huỷ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Lịch làm việc</h1>
          <p className="text-stone-400 text-sm mt-0.5">Cài ca theo bộ phận hoặc từng người</p>
        </div>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-40 transition-all"
        >
          <Plus size={16} /> Thêm ca
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 bg-stone-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-100 rounded w-1/3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Card thêm mới */}
          {editingId === "new" && <EditCard />}

          {list.length === 0 && editingId !== "new" && (
            <div className="text-center py-16 text-stone-400">
              <Clock size={40} className="mx-auto mb-3 opacity-40" />
              <p>Chưa có ca làm việc nào</p>
              <p className="text-sm mt-1">Bấm "Thêm ca" để tạo lịch làm việc</p>
            </div>
          )}

          {list.map(ca => {
            const soNV = countNV(ca.id);
            const isEditing = editingId === ca.id;

            if (isEditing) return <EditCard key={ca.id} ca={ca} />;

            return (
              <div key={ca.id} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 group hover:border-stone-200 transition-all">
                <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-stone-700">{ca.ten}</p>
                    {soNV > 0 && (
                      <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {soNV} NV
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-400 mt-0.5">
                    {ca.gioVao} → {ca.gioRa}
                    {ca.gioVao2 && ca.gioRa2 && (
                      <span className="text-indigo-400"> · {ca.gioVao2} → {ca.gioRa2}</span>
                    )}
                    {" "}· nghỉ {ca.nghiTrua}p ·{" "}
                    <span className="text-emerald-600 font-medium">
                      {soGioChuẩn(ca.gioVao, ca.gioRa, ca.nghiTrua, ca.gioVao2, ca.gioRa2)}h/ngày
                    </span>
                  </p>
                  {ca.ghiChu && <p className="text-xs text-stone-300 mt-0.5">{ca.ghiChu}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(ca)}
                    disabled={editingId !== null}
                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-lg disabled:opacity-30 transition-all"
                    title="Sửa"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => del(ca.id, ca.ten)}
                    disabled={editingId !== null}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-all"
                    title="Xoá"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
