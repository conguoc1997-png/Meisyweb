"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, Save, X, Users, Building2 } from "lucide-react";

type Ca = {
  id: string; ten: string; gioVao: string; gioRa: string;
  nghiTrua: number; ghiChu?: string;
};
type NhanVien = { id: string; ten: string; maNV: string; phongBan?: string | null; caLamViecId?: string | null };
type ApDung = "khong" | "bo_phan" | "nhan_vien";

type Form = Omit<Ca, "id"> & {
  id?: string;
  apDung: ApDung;
  boPhanList: string[];
  nhanVienIds: string[];
};

const PHONG_BAN = ["Kho", "May", "CSKH", "Livestream", "Văn phòng"];
const EMPTY: Form = {
  ten: "", gioVao: "07:30", gioRa: "17:30", nghiTrua: 90, ghiChu: "",
  apDung: "khong", boPhanList: [], nhanVienIds: [],
};

function soGioChuẩn(gioVao: string, gioRa: string, nghiTrua: number) {
  const [h1, m1] = gioVao.split(":").map(Number);
  const [h2, m2] = gioRa.split(":").map(Number);
  const total = (h2 * 60 + m2) - (h1 * 60 + m1) - nghiTrua;
  return (total / 60).toFixed(1);
}

export default function CaLamViecPage() {
  const [list, setList]       = useState<Ca[]>([]);
  const [nvList, setNvList]   = useState<NhanVien[]>([]);
  const [form, setForm]       = useState<Form | null>(null);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await fetch("/api/ca-lam-viec/load").then(r => r.json());
    setList(Array.isArray(data.caList) ? data.caList.map((c: Ca) => ({ ...c, nghiTrua: Number(c.nghiTrua) })) : []);
    setNvList(Array.isArray(data.nvList) ? data.nvList : []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form?.ten || !form.gioVao || !form.gioRa) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/ca-lam-viec", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, nghiTrua: Number(form.nghiTrua) }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) {
        alert("Lỗi khi lưu: " + (data?.error || res.status));
        setSaving(false);
        return;
      }
      setForm(null);
      await load();
    } catch (e) {
      alert("Lỗi kết nối: " + String(e));
    }
    setSaving(false);
  }

  async function del(id: string, ten: string) {
    if (!confirm(`Xoá ca "${ten}"?`)) return;
    await fetch(`/api/ca-lam-viec?id=${id}`, { method: "DELETE" });
    load();
  }

  function toggleBP(bp: string) {
    setForm(f => f && ({
      ...f,
      boPhanList: f.boPhanList.includes(bp)
        ? f.boPhanList.filter(b => b !== bp)
        : [...f.boPhanList, bp],
    }));
  }

  function toggleNV(id: string) {
    setForm(f => f && ({
      ...f,
      nhanVienIds: f.nhanVienIds.includes(id)
        ? f.nhanVienIds.filter(i => i !== id)
        : [...f.nhanVienIds, id],
    }));
  }

  // Đếm NV theo ca
  function countNV(caId: string) {
    return nvList.filter(nv => nv.caLamViecId === caId).length;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Lịch làm việc</h1>
          <p className="text-stone-400 text-sm mt-0.5">Cài ca theo bộ phận hoặc từng người</p>
        </div>
        <button
          onClick={() => setForm({ ...EMPTY })}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-all"
        >
          <Plus size={16} /> Thêm ca
        </button>
      </div>

      {/* Form thêm/sửa */}
      {form && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5 shadow-sm">
          <h2 className="font-semibold text-stone-700 mb-4">{form.id ? "Sửa ca" : "Thêm ca mới"}</h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Tên ca */}
            <div className="col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Tên ca *</label>
              <input
                value={form.ten}
                onChange={e => setForm(f => f && ({ ...f, ten: e.target.value }))}
                placeholder="VD: Ca hành chính, Ca kho..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Giờ vào / ra */}
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Giờ vào *</label>
              <input type="time" value={form.gioVao}
                onChange={e => setForm(f => f && ({ ...f, gioVao: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Giờ ra *</label>
              <input type="time" value={form.gioRa}
                onChange={e => setForm(f => f && ({ ...f, gioRa: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* Nghỉ trưa / Giờ chuẩn */}
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Nghỉ trưa (phút)</label>
              <input type="number" value={form.nghiTrua} min={0} max={180}
                onChange={e => setForm(f => f && ({ ...f, nghiTrua: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div className="flex items-end">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-sm w-full text-center">
                <span className="text-stone-400 text-xs block">Giờ làm chuẩn</span>
                <span className="font-bold text-emerald-600 text-lg">
                  {soGioChuẩn(form.gioVao, form.gioRa, form.nghiTrua)}h
                </span>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Ghi chú</label>
              <input value={form.ghiChu || ""}
                onChange={e => setForm(f => f && ({ ...f, ghiChu: e.target.value }))}
                placeholder="VD: Áp dụng cho bộ phận kho..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>

            {/* ── Áp dụng cho ── */}
            <div className="col-span-2 pt-1">
              <label className="text-xs text-stone-500 mb-2 block font-medium">Áp dụng cho</label>
              <div className="flex gap-2 mb-3">
                {([
                  { key: "khong",      label: "Không gán ngay", icon: null },
                  { key: "bo_phan",    label: "Bộ phận",        icon: <Building2 size={13}/> },
                  { key: "nhan_vien",  label: "Nhân viên cụ thể", icon: <Users size={13}/> },
                ] as { key: ApDung; label: string; icon: React.ReactNode }[]).map(opt => (
                  <button key={opt.key}
                    type="button"
                    onClick={() => setForm(f => f && ({ ...f, apDung: opt.key, boPhanList: [], nhanVienIds: [] }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                      ${form.apDung === opt.key
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-white text-stone-500 border-stone-200 hover:border-rose-300"
                      }`}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>

              {/* Chọn bộ phận */}
              {form.apDung === "bo_phan" && (
                <div className="flex flex-wrap gap-2">
                  {PHONG_BAN.map(bp => (
                    <button key={bp} type="button" onClick={() => toggleBP(bp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                        ${form.boPhanList.includes(bp)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-stone-500 border-stone-200 hover:border-emerald-300"
                        }`}
                    >
                      {bp}
                      {nvList.filter(nv => nv.phongBan?.toLowerCase() === bp.toLowerCase()).length > 0 && (
                        <span className="ml-1 opacity-60">
                          ({nvList.filter(nv => nv.phongBan?.toLowerCase() === bp.toLowerCase()).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Chọn nhân viên */}
              {form.apDung === "nhan_vien" && (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-stone-100 rounded-xl p-2">
                  {nvList.filter(nv => nv).map(nv => (
                    <button key={nv.id} type="button" onClick={() => toggleNV(nv.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all
                        ${form.nhanVienIds.includes(nv.id)
                          ? "bg-emerald-50 border border-emerald-200"
                          : "hover:bg-stone-50"
                        }`}
                    >
                      <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]
                        ${form.nhanVienIds.includes(nv.id) ? "bg-emerald-500 border-emerald-500 text-white" : "border-stone-300"}`}>
                        {form.nhanVienIds.includes(nv.id) ? "✓" : ""}
                      </span>
                      <span className="font-medium text-stone-700">{nv.ten}</span>
                      <span className="text-stone-400 text-xs">{nv.maNV}</span>
                      {nv.phongBan && <span className="text-stone-300 text-xs ml-auto">{nv.phongBan}</span>}
                    </button>
                  ))}
                </div>
              )}

              {form.apDung !== "khong" && (
                <p className="text-xs text-stone-400 mt-2">
                  {form.apDung === "bo_phan"
                    ? `Đã chọn ${form.boPhanList.length} bộ phận`
                    : `Đã chọn ${form.nhanVienIds.length} nhân viên`
                  }
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-50">
              <Save size={14} /> {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button onClick={() => setForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm hover:bg-stone-200">
              <X size={14} /> Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách ca */}
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
      ) : list.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p>Chưa có ca làm việc nào</p>
          <p className="text-sm mt-1">Bấm "Thêm ca" để tạo lịch làm việc</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(ca => {
            const soNV = countNV(ca.id);
            return (
              <div key={ca.id} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
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
                    {ca.gioVao} → {ca.gioRa} · nghỉ {ca.nghiTrua}p ·{" "}
                    <span className="text-emerald-600 font-medium">
                      {soGioChuẩn(ca.gioVao, ca.gioRa, ca.nghiTrua)}h/ngày
                    </span>
                  </p>
                  {ca.ghiChu && <p className="text-xs text-stone-300 mt-0.5">{ca.ghiChu}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setForm({ ...ca, apDung: "khong", boPhanList: [], nhanVienIds: [] })}
                    className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => del(ca.id, ca.ten)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
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
