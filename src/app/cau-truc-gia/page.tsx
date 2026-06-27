"use client";
import { useState, useMemo, useEffect } from "react";
import { X, Plus, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";

// ─── Cấu hình các khoản mục cố định (không thể xóa, không mất khi reset) ───
const FIXED_ITEMS: { key: string; label: string; defaultPct: number }[] = [
  { key: "gia_von",        label: "Giá vốn",                   defaultPct: 50 },
  { key: "loi_nhuan",      label: "Lợi nhuận mong muốn",       defaultPct: 20 },
  { key: "khau_hao",       label: "Khấu hao tài sản cố định",  defaultPct: 0  },
  { key: "cp_quan_ly",     label: "Chi phí quản lý",           defaultPct: 0  },
  { key: "cp_van_chuyen",  label: "Chi phí vận chuyển",        defaultPct: 0  },
  { key: "cp_ban_hang",    label: "Chi phí bán hàng",          defaultPct: 0  },
  { key: "cp_mkt",         label: "Chi phí MKT",               defaultPct: 0  },
  { key: "thue",           label: "Thuế",                      defaultPct: 0  }, // 👈 CỐ ĐỊNH, không bị xóa khi reset
];

type CustomItem = { id: string; label: string; pct: number };

const LS_CUSTOM = "cau-truc-gia-custom";
const LS_FIXED_PCTS = "cau-truc-gia-fixed-pcts";
const LS_GIA_NIEM_YET = "cau-truc-gia-niem-yet";

function makePcts(): Record<string, number> {
  return Object.fromEntries(FIXED_ITEMS.map(f => [f.key, f.defaultPct]));
}

function loadPcts(): Record<string, number> {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_FIXED_PCTS) || "{}");
    const defaults = makePcts();
    return { ...defaults, ...saved };
  } catch { return makePcts(); }
}

function loadCustom(): CustomItem[] {
  try { return JSON.parse(localStorage.getItem(LS_CUSTOM) || "[]"); } catch { return []; }
}

const fmtVnd = (n: number) => n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });

export default function CauTrucGiaPage() {
  const [giaNiemYet, setGiaNiemYet] = useState("");
  const [fixedPcts, setFixedPcts] = useState<Record<string, number>>(makePcts);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Tải từ localStorage khi mount
  useEffect(() => {
    setFixedPcts(loadPcts());
    setCustomItems(loadCustom());
    const saved = localStorage.getItem(LS_GIA_NIEM_YET);
    if (saved) setGiaNiemYet(saved);
  }, []);

  // Tự lưu fixedPcts
  useEffect(() => {
    localStorage.setItem(LS_FIXED_PCTS, JSON.stringify(fixedPcts));
  }, [fixedPcts]);

  // Tự lưu customItems
  useEffect(() => {
    localStorage.setItem(LS_CUSTOM, JSON.stringify(customItems));
  }, [customItems]);

  // Tự lưu giá niêm yết
  useEffect(() => {
    localStorage.setItem(LS_GIA_NIEM_YET, giaNiemYet);
  }, [giaNiemYet]);

  const gNY = parseFloat(giaNiemYet) || 0;

  // Tổng % đã phân bổ
  const tongPct = useMemo(() => {
    const fp = FIXED_ITEMS.reduce((s, f) => s + (fixedPcts[f.key] ?? 0), 0);
    const cp = customItems.reduce((s, c) => s + c.pct, 0);
    return fp + cp;
  }, [fixedPcts, customItems]);

  const conLai = Math.max(0, 100 - tongPct);

  // Tính số tiền
  const amt = (pct: number) => gNY > 0 ? Math.round(gNY * pct / 100) : 0;

  // Thêm khoản mục tùy chỉnh
  function handleAddCustom() {
    const label = newLabel.trim();
    if (!label) return;
    setCustomItems(prev => [...prev, { id: Date.now().toString(), label, pct: 0 }]);
    setNewLabel("");
  }

  // Xóa khoản mục tùy chỉnh
  function handleDeleteCustom(id: string) {
    setCustomItems(prev => prev.filter(c => c.id !== id));
  }

  // Sửa % tùy chỉnh
  function handleCustomPct(id: string, val: string) {
    const n = parseFloat(val) || 0;
    setCustomItems(prev => prev.map(c => c.id === id ? { ...c, pct: n } : c));
  }

  // Reset: chỉ reset %, KHÔNG xóa Thuế hay fixed items, KHÔNG xóa custom items
  function handleReset() {
    setFixedPcts(makePcts());
    setCustomItems(prev => prev.map(c => ({ ...c, pct: 0 })));
    setGiaNiemYet("");
  }

  // Toggle expand
  function toggleExpand(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cấu trúc giá bán</h1>
          <p className="text-slate-500 text-sm mt-0.5">Phân bổ % từ giá niêm yết cho từng khoản mục</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Giá niêm yết input */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wide">
          Giá niêm yết (₫) — cố định = 100%
        </label>
        <input
          type="number"
          placeholder="Nhập giá niêm yết để tính số tiền..."
          value={giaNiemYet}
          onChange={e => setGiaNiemYet(e.target.value)}
          className="w-full text-2xl font-bold text-rose-600 border-b-2 border-rose-200 focus:border-rose-400 outline-none py-2 text-right bg-transparent"
        />
        {gNY > 0 && (
          <p className="text-right text-sm text-slate-400 mt-1">{fmtVnd(gNY)} ₫</p>
        )}
      </div>

      {/* Bảng phân bổ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-slate-600 font-semibold">Khoản mục</th>
              <th className="text-right px-4 py-3 text-slate-600 font-semibold w-36">% / Giá niêm yết</th>
              <th className="text-right px-4 py-3 text-slate-600 font-semibold w-36">Số tiền (₫)</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {/* ── FIXED ITEMS ── */}
            {FIXED_ITEMS.map(f => {
              const pct = fixedPcts[f.key] ?? f.defaultPct;
              const isExpanded = expanded[f.key];
              const isGiaVon = f.key === "gia_von";
              return (
                <tr key={f.key} className="border-t hover:bg-slate-50/50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      {!isGiaVon && (
                        <button onClick={() => toggleExpand(f.key)} className="text-rose-400 hover:text-rose-600 shrink-0">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      )}
                      <span className={`${isGiaVon ? "font-bold text-slate-800" : "text-slate-700"} ${f.key === "thue" ? "text-orange-700 font-medium" : ""}`}>
                        {f.label}
                      </span>
                      {f.key === "thue" && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">cố định</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={pct}
                        onChange={e => setFixedPcts(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) || 0 }))}
                        className="w-16 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                      <span className="text-slate-400 text-xs">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {gNY > 0 ? (
                      <span className={isGiaVon ? "text-blue-700" : "text-slate-700"}>{fmtVnd(amt(pct))}₫</span>
                    ) : (
                      <span className="text-slate-300">0₫</span>
                    )}
                  </td>
                  <td></td>
                </tr>
              );
            })}

            {/* ── CUSTOM ITEMS ── */}
            {customItems.map(c => (
              <tr key={c.id} className="border-t hover:bg-slate-50/50 bg-blue-50/30">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2 pl-5">
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    <span className="text-slate-600">{c.label}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={c.pct}
                      onChange={e => handleCustomPct(c.id, e.target.value)}
                      className="w-16 text-right border border-blue-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                    />
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right text-slate-600">
                  {gNY > 0 ? `${fmtVnd(amt(c.pct))}₫` : <span className="text-slate-300">0₫</span>}
                </td>
                <td className="px-2 py-2.5 text-center">
                  <button onClick={() => handleDeleteCustom(c.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {/* ── Thêm mục ── */}
            <tr className="border-t">
              <td colSpan={4} className="px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Tên khoản mục mới..."
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAddCustom()}
                    className="flex-1 border border-dashed border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  />
                  <button
                    onClick={handleAddCustom}
                    disabled={!newLabel.trim()}
                    className="flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-rose-600 disabled:opacity-40"
                  >
                    <Plus size={14} /> Thêm mục
                  </button>
                </div>
              </td>
            </tr>
          </tbody>

          {/* Footer rows */}
          <tfoot className="border-t-2 border-slate-200">
            {/* Còn lại */}
            <tr className="bg-amber-50">
              <td className="px-4 py-3 font-semibold text-amber-700">
                Còn lại (chưa phân bổ)
              </td>
              <td className="px-4 py-3 text-right font-bold text-amber-600">{conLai.toFixed(1)}%</td>
              <td className="px-4 py-3 text-right font-bold text-amber-600">
                {gNY > 0 ? `${fmtVnd(amt(conLai))}₫` : "0₫"}
              </td>
              <td></td>
            </tr>

            {/* Giá niêm yết tổng */}
            <tr className="bg-rose-50 border-t border-rose-100">
              <td className="px-4 py-3 font-bold text-rose-700 text-base">Giá niêm yết</td>
              <td className="px-4 py-3 text-right font-bold text-rose-600">100%</td>
              <td className="px-4 py-3 text-right font-bold text-rose-600 text-base">
                {gNY > 0 ? `${fmtVnd(gNY)}₫` : "0₫"}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        {/* Helper text */}
        <div className="px-4 py-3 bg-slate-50 border-t text-xs text-slate-400">
          Giá niêm yết cố định = 100%. Mỗi khoản (gồm Giá vốn) là % của Giá niêm yết — "Còn lại" tự cân đối khi tổng % chưa đủ 100%.
          <br />
          <span className="text-orange-500 font-medium">Thuế</span> là khoản cố định — không bị xóa khi reset.
        </div>
      </div>

      {/* Tổng kiểm tra */}
      {tongPct > 100 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          ⚠ Tổng % đã vượt 100% ({tongPct.toFixed(1)}%). Cần giảm bớt để cân đối.
        </div>
      )}
    </div>
  );
}
