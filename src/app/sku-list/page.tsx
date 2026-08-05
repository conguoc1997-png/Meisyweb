"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { Plus, Trash2, Settings, Check, X } from "lucide-react";

interface SanPham {
  id: string; sku: string; ten: string; mauSac: string | null; size: string | null;
  giaNhap: number; giaBan: number; updatedAt: string;
  dinhLuong: number | null; tenVai: string | null; giaVai: number | null;
  loaiGiaCong: string | null; giaGiaCong: number | null;
}
interface GiaCongLoai {
  id: string; nhomXuong: string; ma: string; chiPhi: Record<string, number>; thuTu: number;
}
interface Col { key: string; label: string; nhom: string }
interface VaiItem { ma: string; giaMet: number }
interface MauItem { ten: string; vietTat: string }

function fmt(n: number | null | undefined) {
  if (n == null || n === 0) return "";
  return n.toLocaleString("vi-VN");
}

function EditableCell({ value, onSave, type = "text", className = "" }: {
  value: string | number | null; onSave: (v: string) => void;
  type?: "text" | "number"; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) ref.current?.select(); }, [editing]);
  function commit() { setEditing(false); onSave(draft); }
  if (editing)
    return <input ref={ref} type={type} value={draft}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className={`w-full px-1 py-0.5 border border-blue-400 rounded outline-none text-sm bg-white ${className}`} />;
  return (
    <span onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}
      className={`block min-h-[1.5rem] cursor-text select-none ${className}`}>
      {value != null && value !== 0 && value !== ""
        ? (type === "number" ? Number(value).toLocaleString("vi-VN") : String(value))
        : <span className="text-slate-300">—</span>}
    </span>
  );
}

function DinhLuongInput({ sp, onSave }: { sp: SanPham; onSave: (sp: SanPham, v: string) => void }) {
  const [val, setVal] = useState(sp.dinhLuong != null ? String(sp.dinhLuong) : "");
  useEffect(() => { setVal(sp.dinhLuong != null ? String(sp.dinhLuong) : ""); }, [sp.dinhLuong]);
  return (
    <input
      type="number" step="0.01" value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onSave(sp, val)}
      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
      placeholder="—"
      className="w-16 text-right px-2 py-1 border border-transparent hover:border-slate-200 focus:border-blue-400 rounded outline-none text-sm bg-transparent focus:bg-white transition"
    />
  );
}

export default function SkuListPage() {
  const [tab, setTab] = useState<"sku" | "vai" | "giacong" | "mau">("sku");

  // SKU
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [skuLoading, setSkuLoading] = useState(true);
  const [skuSearch, setSkuSearch] = useState("");

  // Vải
  const [vais, setVais] = useState<VaiItem[]>([]);
  const [vaiLoading, setVaiLoading] = useState(true);
  const [addVaiForm, setAddVaiForm] = useState<{ ma: string; giaMet: string } | null>(null);

  // Màu
  const [maus, setMaus] = useState<MauItem[]>([]);
  const [mauLoading, setMauLoading] = useState(true);
  const [addMauForm, setAddMauForm] = useState<{ ten: string; vietTat: string } | null>(null);

  // Gia công
  const [loais, setLoais] = useState<GiaCongLoai[]>([]);
  const [cols, setCols] = useState<Col[]>([]);
  const [gcLoading, setGcLoading] = useState(true);
  const [showColEditor, setShowColEditor] = useState(false);
  const [addRowForm, setAddRowForm] = useState<{ nhomXuong: string; ma: string } | null>(null);
  const [addColForm, setAddColForm] = useState<{ label: string; nhom: string } | null>(null);

  // Load
  useEffect(() => {
    fetch("/api/kho/san-pham").then(r => r.json()).then(setSanPhams).finally(() => setSkuLoading(false));
    fetch("/api/gia-cong/vai").then(r => r.json()).then(setVais).finally(() => setVaiLoading(false));
    fetch("/api/gia-cong/mau").then(r => r.json()).then(setMaus).finally(() => setMauLoading(false));
  }, []);

  const loadGiaCong = useCallback(() => {
    setGcLoading(true);
    Promise.all([
      fetch("/api/gia-cong/loai").then(r => r.json()),
      fetch("/api/gia-cong/cot").then(r => r.json()),
    ]).then(([l, c]) => { setLoais(l); setCols(c); }).finally(() => setGcLoading(false));
  }, []);
  useEffect(() => { loadGiaCong(); }, [loadGiaCong]);

  // Vải map
  const vaiMap = Object.fromEntries(vais.map(v => [v.ma, v.giaMet]));

  // SKU update
  async function updateSku(id: string, patch: Partial<SanPham>) {
    setSanPhams(prev => prev.map(sp => sp.id === id ? { ...sp, ...patch } : sp));
    await fetch(`/api/kho/san-pham/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  // Khi chọn vải → auto tính giá vải
  async function handleSelectVai(sp: SanPham, maVai: string) {
    const giaMet = maVai ? (vaiMap[maVai] ?? null) : null;
    const giaVai = giaMet != null && sp.dinhLuong != null ? Math.round(sp.dinhLuong * giaMet) : null;
    await updateSku(sp.id, { tenVai: maVai || null, giaVai });
  }

  // Khi sửa định lượng → auto re-tính giá vải nếu đã có vải
  async function handleDinhLuong(sp: SanPham, val: string) {
    const dl = val === "" ? null : Number(val);
    const giaMet = sp.tenVai ? (vaiMap[sp.tenVai] ?? null) : null;
    const giaVai = dl != null && giaMet != null ? Math.round(dl * giaMet) : sp.giaVai;
    await updateSku(sp.id, { dinhLuong: dl, giaVai });
  }

  // Vải CRUD
  async function saveVais(newVais: VaiItem[]) {
    setVais(newVais);
    await fetch("/api/gia-cong/vai", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVais),
    });
  }
  async function addVai() {
    if (!addVaiForm?.ma) return;
    const newVais = [...vais, { ma: addVaiForm.ma, giaMet: Number(addVaiForm.giaMet) || 0 }];
    await saveVais(newVais);
    setAddVaiForm(null);
  }
  async function updateVai(idx: number, patch: Partial<VaiItem>) {
    const newVais = vais.map((v, i) => i === idx ? { ...v, ...patch } : v);
    await saveVais(newVais);
  }
  async function deleteVai(idx: number) {
    if (!confirm("Xoá loại vải này?")) return;
    await saveVais(vais.filter((_, i) => i !== idx));
  }

  // Màu CRUD
  async function saveMaus(newMaus: MauItem[]) {
    setMaus(newMaus);
    await fetch("/api/gia-cong/mau", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMaus) });
  }
  async function addMau() {
    if (!addMauForm?.ten || !addMauForm?.vietTat) return;
    await saveMaus([...maus, { ten: addMauForm.ten.toUpperCase(), vietTat: addMauForm.vietTat.toUpperCase() }]);
    setAddMauForm(null);
  }
  async function updateMau(idx: number, patch: Partial<MauItem>) {
    await saveMaus(maus.map((m, i) => i === idx ? { ...m, ...patch } : m));
  }
  async function deleteMau(idx: number) {
    if (!confirm("Xoá màu này?")) return;
    await saveMaus(maus.filter((_, i) => i !== idx));
  }

  // Gia công
  async function updateChiPhi(loai: GiaCongLoai, colKey: string, val: string) {
    const num = val === "" ? undefined : Number(val.replace(/\D/g, ""));
    const newChiPhi = { ...loai.chiPhi };
    if (num == null || isNaN(num)) delete newChiPhi[colKey]; else newChiPhi[colKey] = num;
    setLoais(prev => prev.map(l => l.id === loai.id ? { ...l, chiPhi: newChiPhi } : l));
    await fetch(`/api/gia-cong/loai/${loai.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chiPhi: newChiPhi }),
    });
  }
  async function updateLoaiField(loai: GiaCongLoai, field: "nhomXuong" | "ma", val: string) {
    setLoais(prev => prev.map(l => l.id === loai.id ? { ...l, [field]: val } : l));
    await fetch(`/api/gia-cong/loai/${loai.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: val }),
    });
  }
  async function deleteLoai(id: string) {
    if (!confirm("Xoá loại gia công này?")) return;
    setLoais(prev => prev.filter(l => l.id !== id));
    await fetch(`/api/gia-cong/loai/${id}`, { method: "DELETE" });
  }
  async function addLoai() {
    if (!addRowForm?.nhomXuong || !addRowForm.ma) return;
    const r = await fetch("/api/gia-cong/loai", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhomXuong: addRowForm.nhomXuong, ma: addRowForm.ma }),
    });
    const res = await r.json();
    if (!r.ok) { alert(res.error ?? "Lỗi khi thêm — thử lại"); return; }
    setLoais(prev => [...prev, res]);
    setAddRowForm(null);
  }
  async function saveCol(idx: number, patch: Partial<Col>) {
    const newCols = cols.map((c, i) => i === idx ? { ...c, ...patch } : c);
    setCols(newCols);
    await fetch("/api/gia-cong/cot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCols) });
  }
  async function deleteCol(idx: number) {
    if (!confirm("Xoá cột này?")) return;
    const newCols = cols.filter((_, i) => i !== idx);
    setCols(newCols);
    await fetch("/api/gia-cong/cot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCols) });
  }
  async function addCol() {
    if (!addColForm?.label) return;
    const key = addColForm.label.toLowerCase()
      .replace(/[àáảãạăắặẳẵâấầẩẫậ]/g,"a").replace(/[èéẻẽẹêếềểễệ]/g,"e")
      .replace(/[ìíỉĩị]/g,"i").replace(/[òóỏõọôốồổỗộơớờởỡợ]/g,"o")
      .replace(/[ùúủũụưứừửữự]/g,"u").replace(/[ỳýỷỹỵ]/g,"y")
      .replace(/đ/g,"d").replace(/[^a-z0-9]/g,"_");
    const newCols = [...cols, { key: `${key}_${Date.now()}`, label: addColForm.label, nhom: addColForm.nhom }];
    setCols(newCols);
    await fetch("/api/gia-cong/cot", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCols) });
    setAddColForm(null);
  }

  // Derived
  const filteredSP = sanPhams.filter(sp =>
    !sp.size &&
    (!skuSearch || sp.sku.toLowerCase().includes(skuSearch.toLowerCase()) || sp.ten.toLowerCase().includes(skuSearch.toLowerCase()))
  );
  const loaiMap = Object.fromEntries(loais.map(l => [l.ma, l]));
  const nhomGroups = Array.from(new Set(loais.map(l => l.nhomXuong)));
  const mainCols = cols.filter(c => c.nhom === "");
  const phuLieuCols = cols.filter(c => c.nhom === "PHU_LIEU");
  function tong(loai: GiaCongLoai) { return cols.reduce((s, c) => s + (loai.chiPhi[c.key] ?? 0), 0); }

  const TABS = [
    { key: "sku", label: "Danh sách SKU" },
    { key: "vai", label: "Bảng vải" },
    { key: "mau", label: "Bảng màu" },
    { key: "giacong", label: "Bảng giá gia công" },
  ] as const;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-800">Danh sách SKU & Giá gia công</h1>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${tab === t.key ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ TAB SKU ═══ */}
      {tab === "sku" && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <input value={skuSearch} onChange={e => setSkuSearch(e.target.value)}
              placeholder="Tìm mã SKU hoặc tên..." className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm w-64 outline-none focus:border-blue-400"/>
            <span className="text-sm text-slate-400">{filteredSP.length} SKU</span>
          </div>
          {skuLoading ? <p className="text-slate-400 text-sm">Đang tải...</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-slate-50 z-10">Mã SKU</th>
                    <th className="px-4 py-3 text-left">Tên sản phẩm</th>
                    <th className="px-4 py-3 text-right">ĐL (M)</th>
                    <th className="px-4 py-3 text-left">Tên vải</th>
                    <th className="px-4 py-3 text-right">Giá vải</th>
                    <th className="px-4 py-3 text-left">Giá công</th>
                    <th className="px-4 py-3 text-right">Giá gia công</th>
                    <th className="px-4 py-3 text-right bg-amber-50 text-amber-700">Giá nhập</th>
                    <th className="px-4 py-3 text-right bg-emerald-50 text-emerald-700">Giá bán</th>
                    <th className="px-4 py-3 text-center text-slate-400">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSP.map(sp => {
                    const gcLoai = sp.loaiGiaCong ? loaiMap[sp.loaiGiaCong] : null;
                    const giaGiaCong = sp.giaGiaCong ?? (gcLoai ? tong(gcLoai) : null);
                    const giaNhap = (sp.giaVai ?? 0) + (giaGiaCong ?? 0);
                    return (
                      <tr key={sp.id} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800 sticky left-0 bg-white hover:bg-slate-50 z-10">{sp.sku}</td>
                        <td className="px-4 py-2.5 text-slate-600 max-w-[220px] truncate">{sp.ten}</td>
                        <td className="px-2 py-1.5 text-right">
                          <DinhLuongInput sp={sp} onSave={handleDinhLuong} />
                        </td>
                        <td className="px-4 py-2.5">
                          <select value={sp.tenVai ?? ""}
                            onChange={e => handleSelectVai(sp, e.target.value)}
                            className="border border-slate-200 rounded px-2 py-0.5 text-sm bg-white outline-none focus:border-blue-400 w-full max-w-[120px]">
                            <option value="">—</option>
                            {vais.map(v => <option key={v.ma} value={v.ma}>{v.ma}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600">
                          {sp.giaVai != null ? sp.giaVai.toLocaleString("vi-VN") : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <select value={sp.loaiGiaCong ?? ""}
                            onChange={e => updateSku(sp.id, { loaiGiaCong: e.target.value || null })}
                            className="border border-slate-200 rounded px-2 py-0.5 text-sm bg-white outline-none focus:border-blue-400 w-full max-w-[120px]">
                            <option value="">—</option>
                            {loais.map(l => <option key={l.id} value={l.ma}>{l.ma}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-500 text-xs">
                          {giaGiaCong != null ? giaGiaCong.toLocaleString("vi-VN") : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-amber-700 bg-amber-50">
                          {giaNhap > 0 ? giaNhap.toLocaleString("vi-VN") : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-700 bg-emerald-50">
                          <EditableCell value={sp.giaBan || null} type="number" className="text-right text-emerald-700"
                            onSave={v => updateSku(sp.id, { giaBan: v === "" ? 0 : Number(v) })} />
                        </td>
                        <td className="px-4 py-2.5 text-center text-xs text-slate-400 whitespace-nowrap">
                          {sp.updatedAt ? new Date(sp.updatedAt).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"2-digit" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}

      {/* ═══ TAB VẢI ═══ */}
      {tab === "vai" && (
        <div className="max-w-lg">
          <p className="text-sm text-slate-500 mb-3">Nhập mã vải và giá/m — khi chọn vải trong SKU list, Giá vải tự tính = Định lượng × Giá/m</p>
          {vaiLoading ? <p className="text-slate-400 text-sm">Đang tải...</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Mã / Tên vải</th>
                  <th className="px-4 py-3 text-right">Giá / m (đ)</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vais.map((v, i) => (
                  <tr key={v.ma} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <EditableCell value={v.ma} onSave={val => updateVai(i, { ma: val })} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <EditableCell value={v.giaMet} type="number" className="text-right"
                        onSave={val => updateVai(i, { giaMet: Number(val) || 0 })} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => deleteVai(i)} className="text-slate-300 hover:text-rose-400 transition"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {addVaiForm ? (
                  <tr className="bg-blue-50/40">
                    <td className="px-3 py-2">
                      <input value={addVaiForm.ma} onChange={e => setAddVaiForm({ ...addVaiForm, ma: e.target.value })}
                        placeholder="Mã vải..." className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none"/>
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={addVaiForm.giaMet} onChange={e => setAddVaiForm({ ...addVaiForm, giaMet: e.target.value })}
                        placeholder="Giá/m..." className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none text-right"/>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={addVai} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"><Check size={13}/></button>
                        <button onClick={() => setAddVaiForm(null)} className="p-1 border border-slate-200 rounded hover:bg-slate-100"><X size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-2">
                      <button onClick={() => setAddVaiForm({ ma: "", giaMet: "" })}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition">
                        <Plus size={14}/> Thêm loại vải
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* ═══ TAB BẢNG MÀU ═══ */}
      {tab === "mau" && (
        <div className="max-w-md">
          <p className="text-sm text-slate-500 mb-3">Danh sách màu sắc và viết tắt — dùng trong form nhập kho và danh sách SKU</p>
          {mauLoading ? <p className="text-slate-400 text-sm">Đang tải...</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tên màu</th>
                  <th className="px-4 py-3 text-left">Viết tắt</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maus.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <EditableCell value={m.ten} onSave={val => updateMau(i, { ten: val.toUpperCase() })} />
                    </td>
                    <td className="px-4 py-2.5">
                      <EditableCell value={m.vietTat} onSave={val => updateMau(i, { vietTat: val.toUpperCase() })} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button onClick={() => deleteMau(i)} className="text-slate-300 hover:text-rose-400 transition"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                {addMauForm ? (
                  <tr className="bg-blue-50/40">
                    <td className="px-3 py-2">
                      <input value={addMauForm.ten} onChange={e => setAddMauForm({ ...addMauForm, ten: e.target.value })}
                        placeholder="Tên màu..." className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none"/>
                    </td>
                    <td className="px-3 py-2">
                      <input value={addMauForm.vietTat} onChange={e => setAddMauForm({ ...addMauForm, vietTat: e.target.value })}
                        placeholder="Viết tắt..." className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none"/>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button onClick={addMau} className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"><Check size={13}/></button>
                        <button onClick={() => setAddMauForm(null)} className="p-1 border border-slate-200 rounded hover:bg-slate-100"><X size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-2">
                      <button onClick={() => setAddMauForm({ ten: "", vietTat: "" })}
                        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition">
                        <Plus size={14}/> Thêm màu
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* ═══ TAB GIA CÔNG ═══ */}
      {tab === "giacong" && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setShowColEditor(!showColEditor)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition">
              <Settings size={14}/> Quản lý cột
            </button>
          </div>
          {showColEditor && (
            <div className="mb-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">CỘT HIỆN TẠI — double-click để sửa tên</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {cols.map((c, i) => (
                  <div key={c.key} className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className={`text-xs px-1 rounded ${c.nhom === "PHU_LIEU" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                      {c.nhom === "PHU_LIEU" ? "PL" : "CT"}
                    </span>
                    <EditableCell value={c.label} className="text-xs font-medium text-slate-700 min-w-[60px]"
                      onSave={v => saveCol(i, { label: v })} />
                    <button onClick={() => deleteCol(i)} className="text-slate-300 hover:text-rose-400 transition ml-1"><X size={12}/></button>
                  </div>
                ))}
              </div>
              {addColForm ? (
                <div className="flex items-center gap-2">
                  <input value={addColForm.label} onChange={e => setAddColForm({ ...addColForm, label: e.target.value })}
                    placeholder="Tên cột..." className="px-2 py-1 border border-slate-300 rounded text-sm outline-none focus:border-blue-400"/>
                  <select value={addColForm.nhom} onChange={e => setAddColForm({ ...addColForm, nhom: e.target.value })}
                    className="px-2 py-1 border border-slate-300 rounded text-sm outline-none">
                    <option value="">Chi tiết</option>
                    <option value="PHU_LIEU">Phụ liệu</option>
                  </select>
                  <button onClick={addCol} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"><Check size={13}/> Thêm</button>
                  <button onClick={() => setAddColForm(null)} className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-100">Huỷ</button>
                </div>
              ) : (
                <button onClick={() => setAddColForm({ label: "", nhom: "" })}
                  className="flex items-center gap-1 px-3 py-1 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-white transition">
                  <Plus size={13}/> Thêm cột
                </button>
              )}
            </div>
          )}
          {gcLoading ? <p className="text-slate-400 text-sm">Đang tải...</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="text-sm whitespace-nowrap border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-4 py-2 border border-slate-200 text-left sticky left-0 bg-slate-50 z-10" rowSpan={2}>Nhóm</th>
                    <th className="px-4 py-2 border border-slate-200 text-left sticky left-[100px] bg-slate-50 z-10" rowSpan={2}>Mã</th>
                    <th className="px-4 py-2 border border-slate-200 text-right bg-amber-50 text-amber-700 whitespace-nowrap min-w-[100px]" rowSpan={2}>TỔNG</th>
                    {mainCols.map(c => <th key={c.key} className="px-3 py-2 border border-slate-200 text-right bg-green-50 text-green-700">{c.label}</th>)}
                    {phuLieuCols.length > 0 && <th className="px-3 py-2 border border-slate-200 text-center bg-blue-50 text-blue-700" colSpan={phuLieuCols.length}>PHỤ LIỆU</th>}
                    <th className="px-3 py-2 border border-slate-200" rowSpan={2}></th>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                    {mainCols.map(c => <th key={c.key} className="border border-slate-200 bg-green-50"></th>)}
                    {phuLieuCols.map(c => <th key={c.key} className="px-3 py-2 border border-slate-200 text-right bg-blue-50 text-blue-600 uppercase">{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {nhomGroups.map(nhom => {
                    const rows = loais.filter(l => l.nhomXuong === nhom);
                    return rows.map((loai, ri) => (
                      <tr key={loai.id} className="hover:bg-slate-50">
                        {ri === 0 && (
                          <td className="px-4 py-2 border border-slate-200 font-bold text-slate-700 sticky left-0 bg-white z-10" rowSpan={rows.length}>
                            <EditableCell value={loai.nhomXuong} onSave={v => rows.forEach(r => updateLoaiField(r, "nhomXuong", v))} />
                          </td>
                        )}
                        <td className="px-4 py-2 border border-slate-200 font-semibold text-slate-800 sticky left-[100px] bg-white z-10">
                          <EditableCell value={loai.ma} onSave={v => updateLoaiField(loai, "ma", v)} />
                        </td>
                        <td className="px-4 py-2 border border-slate-200 text-right font-bold text-amber-700 bg-amber-50 min-w-[100px]">
                          {fmt(tong(loai)) || <span className="text-slate-300">0</span>}
                        </td>
                        {cols.map(c => (
                          <td key={c.key} className={`px-3 py-2 border border-slate-200 text-right ${c.nhom === "PHU_LIEU" ? "bg-blue-50/30" : "bg-green-50/30"}`}>
                            <EditableCell value={loai.chiPhi[c.key] ?? null} type="number" className="text-right"
                              onSave={v => updateChiPhi(loai, c.key, v)} />
                          </td>
                        ))}
                        <td className="px-3 py-2 border border-slate-200">
                          <button onClick={() => deleteLoai(loai.id)} className="text-slate-300 hover:text-rose-400 transition p-0.5"><Trash2 size={13}/></button>
                        </td>
                      </tr>
                    ));
                  })}
                  {addRowForm ? (
                    <tr className="bg-blue-50/30">
                      <td className="px-3 py-2 border border-slate-200">
                        <input value={addRowForm.nhomXuong} onChange={e => setAddRowForm({ ...addRowForm, nhomXuong: e.target.value })}
                          placeholder="Nhóm..." list="nhom-list" className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none"/>
                        <datalist id="nhom-list">{nhomGroups.map(n => <option key={n} value={n}/>)}</datalist>
                      </td>
                      <td className="px-3 py-2 border border-slate-200">
                        <input value={addRowForm.ma} onChange={e => setAddRowForm({ ...addRowForm, ma: e.target.value })}
                          placeholder="Mã..." className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none"/>
                      </td>
                      <td colSpan={cols.length + 2} className="px-3 py-2 border border-slate-200">
                        <div className="flex gap-2">
                          <button onClick={addLoai} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center gap-1"><Check size={13}/> Thêm</button>
                          <button onClick={() => setAddRowForm(null)} className="px-3 py-1 border border-slate-200 rounded text-sm hover:bg-slate-100">Huỷ</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={cols.length + 4} className="px-4 py-2 border border-slate-200">
                        <button onClick={() => setAddRowForm({ nhomXuong: "", ma: "" })}
                          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition">
                          <Plus size={14}/> Thêm loại gia công
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
