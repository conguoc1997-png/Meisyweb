"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Clock, Save, X } from "lucide-react";

type Ca = {
  id: string; ten: string; gioVao: string; gioRa: string;
  nghiTrua: number; ghiChu?: string;
};
type Form = Omit<Ca, "id"> & { id?: string };

const EMPTY: Form = { ten: "", gioVao: "07:30", gioRa: "17:30", nghiTrua: 90, ghiChu: "" };

// Tính số giờ làm chuẩn
function soGioChuẩn(gioVao: string, gioRa: string, nghiTrua: number) {
  const [h1, m1] = gioVao.split(":").map(Number);
  const [h2, m2] = gioRa.split(":").map(Number);
  const total = (h2 * 60 + m2) - (h1 * 60 + m1) - nghiTrua;
  return (total / 60).toFixed(1);
}

export default function CaLamViecPage() {
  const [list, setList]     = useState<Ca[]>([]);
  const [form, setForm]     = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/ca-lam-viec");
    setList(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function save() {
    if (!form?.ten || !form.gioVao || !form.gioRa) return;
    setSaving(true);
    await fetch("/api/ca-lam-viec", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setForm(null);
    load();
  }

  async function del(id: string, ten: string) {
    if (!confirm(`Xoá ca "${ten}"?`)) return;
    await fetch(`/api/ca-lam-viec?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Lịch làm việc</h1>
          <p className="text-stone-400 text-sm mt-0.5">Cài ca làm việc theo bộ phận hoặc từng người</p>
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
            <div className="col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Tên ca *</label>
              <input
                value={form.ten}
                onChange={e => setForm(f => f && ({ ...f, ten: e.target.value }))}
                placeholder="VD: Ca hành chính, Ca kho..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Giờ vào *</label>
              <input
                type="time"
                value={form.gioVao}
                onChange={e => setForm(f => f && ({ ...f, gioVao: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Giờ ra *</label>
              <input
                type="time"
                value={form.gioRa}
                onChange={e => setForm(f => f && ({ ...f, gioRa: e.target.value }))}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Nghỉ trưa (phút)</label>
              <input
                type="number"
                value={form.nghiTrua}
                onChange={e => setForm(f => f && ({ ...f, nghiTrua: Number(e.target.value) }))}
                min={0} max={180}
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
            <div className="col-span-2">
              <label className="text-xs text-stone-500 mb-1 block">Ghi chú</label>
              <input
                value={form.ghiChu || ""}
                onChange={e => setForm(f => f && ({ ...f, ghiChu: e.target.value }))}
                placeholder="VD: Áp dụng cho bộ phận kho..."
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
            >
              <Save size={14} /> {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={() => setForm(null)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm hover:bg-stone-200"
            >
              <X size={14} /> Huỷ
            </button>
          </div>
        </div>
      )}

      {/* Danh sách ca */}
      {list.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Clock size={40} className="mx-auto mb-3 opacity-40" />
          <p>Chưa có ca làm việc nào</p>
          <p className="text-sm mt-1">Bấm "Thêm ca" để tạo lịch làm việc</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map(ca => (
            <div key={ca.id} className="bg-white border border-stone-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-700">{ca.ten}</p>
                <p className="text-sm text-stone-400 mt-0.5">
                  {ca.gioVao} → {ca.gioRa} · nghỉ {ca.nghiTrua}p ·{" "}
                  <span className="text-emerald-600 font-medium">
                    {soGioChuẩn(ca.gioVao, ca.gioRa, ca.nghiTrua)}h/ngày
                  </span>
                </p>
                {ca.ghiChu && <p className="text-xs text-stone-300 mt-0.5">{ca.ghiChu}</p>}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setForm({ ...ca })}
                  className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-all"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => del(ca.id, ca.ten)}
                  className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
