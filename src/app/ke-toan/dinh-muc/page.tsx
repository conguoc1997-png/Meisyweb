"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Search, Trash2, Lock, Settings2 } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type SanPham = { id: string; ten: string; sku: string; mauSac?: string|null; size?: string|null };
type VatTu   = { id: string; ma: string; ten: string; loai: string; nhom: string|null; donVi: string;
                 donViMua?: string; quyDoi?: number;
                 tonKho?: { soLuong: number; giaTrungBinh: number }|null };
type TonKhoRow = { vatTuId: string; soLuongQD: number; donViQuyDoi: string; quyDoi: number };
type DinhMuc = { id: string; hangCat: string; vatTuId: string; soLuong: number;
                 haoHui?: number; donViMua?: string; ghiChu?: string|null; vatTu?: VatTu };

/* ─── Column definitions ─────────────────────────────────────────────────── */
type ColDef = {
  key: string; label: string; loai: string; nhom: string|null;
  hdr: string; badge: string; shared: boolean;
  tickOnly?: boolean;      // true → click trực tiếp toggle 0/1
  separatorLeft?: boolean; // true → đường kẻ phân cách bên trái
};

const COLUMNS: ColDef[] = [
  { key:"vai",      label:"Vải",       loai:"vai",        nhom:null,        shared:false,
    hdr:"bg-teal-100 text-teal-800",     badge:"bg-teal-100 text-teal-700" },
  // May
  { key:"khoa_keo", label:"Khoá",      loai:"may",        nhom:"khoa_keo",  shared:true,
    hdr:"bg-purple-100 text-purple-800", badge:"bg-purple-100 text-purple-700" },
  { key:"lot",      label:"Lót",       loai:"may",        nhom:"lot",       shared:true,
    hdr:"bg-orange-100 text-orange-800", badge:"bg-orange-100 text-orange-700" },
  { key:"chi",      label:"Chỉ",       loai:"may",        nhom:"chi",       shared:true,
    hdr:"bg-yellow-100 text-yellow-800", badge:"bg-yellow-100 text-yellow-700" },
  // Gia công
  { key:"cuc",      label:"Cúc",       loai:"gia_cong",   nhom:"cuc",       shared:true,
    hdr:"bg-pink-100 text-pink-800",     badge:"bg-pink-100 text-pink-700" },
  { key:"dinh_tan", label:"Đinh tán",  loai:"gia_cong",   nhom:"dinh_tan",  shared:true,
    hdr:"bg-rose-100 text-rose-800",     badge:"bg-rose-100 text-rose-700" },
  // Hoàn thiện — tickOnly: click trực tiếp
  { key:"may",      label:"May",       loai:"hoan_thien", nhom:"may",       shared:true, tickOnly:true,
    hdr:"bg-slate-200 text-slate-800",   badge:"bg-slate-200 text-slate-700" },
  // Giặt — riêng từng SP (2 cột ngoài cùng bên phải)
  { key:"giat_mau", label:"Giặt Màu",  loai:"hoan_thien", nhom:"giat_mau",  shared:false, tickOnly:true, separatorLeft:true,
    hdr:"bg-blue-100 text-blue-800",     badge:"bg-blue-100 text-blue-700" },
  { key:"giat_vs",  label:"Giặt VS",   loai:"hoan_thien", nhom:"giat_vi_sinh", shared:false, tickOnly:true,
    hdr:"bg-cyan-100 text-cyan-800",     badge:"bg-cyan-100 text-cyan-700" },
];

const CHUNG_KEY = "__CHUNG__"; // hangCat cho hàng mặc định chung
const fmt = (n: number) => n % 1 === 0 ? n.toLocaleString("vi-VN") : parseFloat(n.toFixed(2)).toLocaleString("vi-VN");

const DON_VI_LABEL: Record<string, string> = {
  m: "m", met: "m", cay: "cây", kg: "kg",
  cai: "cái", chiec: "chiếc", cuon: "cuộn",
  goi: "gói", hop: "hộp", bo: "bộ", thuong: "thương", set: "set",
};
const fmtDV = (dv: string) => DON_VI_LABEL[dv?.toLowerCase()] ?? dv;

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function DinhMucPage() {
  const [sanPhams,  setSanPhams]  = useState<SanPham[]>([]);
  const [vatTus,    setVatTus]    = useState<VatTu[]>([]);
  const [dinhMucs,  setDinhMucs]  = useState<DinhMuc[]>([]);
  const [tonKhoMap, setTonKhoMap] = useState<Map<string, TonKhoRow>>(new Map());
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  // Cell editing
  const [editCell,  setEditCell]  = useState<{ hangCat: string; colKey: string }|null>(null);
  const [editItems, setEditItems] = useState<
    { id?: string; vatTuId: string; soLuong: number; haoHui: number; vtSearch: string; changed: boolean }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [vtDropOpen, setVtDropOpen] = useState<number|null>(null);

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    // Phase 1: load dữ liệu chính → hiển thị bảng ngay
    const [sps, vts, dms] = await Promise.all([
      fetch("/api/kho/san-pham").then(r => r.json()),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()),
      fetch("/api/ke-toan/dinh-muc").then(r => r.json()),
    ]);
    setSanPhams(Array.isArray(sps) ? sps : []);
    setVatTus(Array.isArray(vts) ? vts : []);
    setDinhMucs(Array.isArray(dms) ? dms : []);
    setLoading(false);
    // Phase 2: load tồn kho trong nền (chỉ dùng cho dropdown đơn vị)
    fetch("/api/ke-toan/ton-kho")
      .then(r => r.json())
      .then(tonKhos => {
        if (Array.isArray(tonKhos)) {
          setTonKhoMap(new Map(tonKhos.map((t: TonKhoRow) => [t.vatTuId, t])));
        }
      })
      .catch(() => {}); // non-fatal
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const spMap = useMemo(() => new Map(sanPhams.map(s => [s.sku, s])), [sanPhams]);

  function matchesCol(dm: DinhMuc, col: ColDef): boolean {
    const vt = dm.vatTu || vatTus.find(v => v.id === dm.vatTuId);
    if (!vt) return false;
    if (vt.loai !== col.loai) return false;
    if (col.nhom !== null && vt.nhom !== col.nhom) return false;
    return true;
  }

  function getOwnItems(hangCat: string, col: ColDef): DinhMuc[] {
    return dinhMucs.filter(dm => dm.hangCat === hangCat && matchesCol(dm, col));
  }

  function getChungItems(col: ColDef): DinhMuc[] {
    return dinhMucs.filter(dm => dm.hangCat === CHUNG_KEY && matchesCol(dm, col));
  }

  /** Items cho cell: nếu col shared → chỉ CHUNG row; nếu col=vải → product-specific */
  function getCellDisplay(hangCat: string, col: ColDef): { items: DinhMuc[]; isChung: boolean } {
    if (hangCat === CHUNG_KEY) {
      return { items: getOwnItems(CHUNG_KEY, col), isChung: false };
    }
    if (col.shared) {
      // Product row + shared col: show CHUNG value (read-only)
      return { items: getChungItems(col), isChung: true };
    }
    // Vải col: product-specific
    return { items: getOwnItems(hangCat, col), isChung: false };
  }

  function getColVatTus(col: ColDef, q: string): VatTu[] {
    const matched = vatTus.filter(vt => {
      if (vt.loai !== col.loai) return false;
      // Hiển thị cả nhom đúng + nhom null (chưa phân nhóm) để user có thể link
      if (col.nhom !== null && vt.nhom !== col.nhom && vt.nhom !== null) return false;
      if (q) { const lq = q.toLowerCase(); return vt.ten.toLowerCase().includes(lq) || vt.ma.toLowerCase().includes(lq); }
      return true;
    });
    // Ưu tiên: nhom khớp → nhom null → hết kho; trong mỗi nhóm ưu tiên có stock (sau quy đổi)
    matched.sort((a, b) => {
      const aMatch = a.nhom === col.nhom ? 0 : 1;
      const bMatch = b.nhom === col.nhom ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      const aStock = tonKhoMap.get(a.id)?.soLuongQD ?? 0;
      const bStock = tonKhoMap.get(b.id)?.soLuongQD ?? 0;
      if (aStock > 0 && bStock <= 0) return -1;
      if (bStock > 0 && aStock <= 0) return 1;
      return a.ten.localeCompare(b.ten, "vi");
    });
    return matched.slice(0, 40);
  }

  /* ── Rows: ALL sanPhams + CHUNG at top ──────────────────────────────────── */
  const filteredSPs = useMemo(() => {
    if (!search) return sanPhams;
    const s = search.toLowerCase();
    return sanPhams.filter(sp => sp.ten.toLowerCase().includes(s) || sp.sku.toLowerCase().includes(s));
  }, [sanPhams, search]);

  /* ── Toggle tick (tickOnly cols) ───────────────────────────────────────── */
  const [ticking, setTicking] = useState<string|null>(null); // "hangCat:colKey"
  async function toggleTick(hangCat: string, col: ColDef) {
    const key = `${hangCat}:${col.key}`;
    if (ticking === key) return;
    setTicking(key);
    // Nếu shared → luôn dùng CHUNG_KEY; nếu !shared → dùng hangCat riêng
    const targetCat = col.shared ? CHUNG_KEY : hangCat;
    try {
      const ownItems = getOwnItems(targetCat, col);
      if (ownItems.length > 0) {
        // Đã có → xoá (untick)
        await Promise.all(ownItems.map(dm =>
          fetch(`/api/ke-toan/dinh-muc/${dm.id}`, { method: "DELETE" })
        ));
      } else {
        // Chưa có → tạo mới với soLuong=1 (tick)
        // Cần 1 vatTu thuộc nhom này — tìm theo loai+nhom, fallback theo nhom rồi theo tên
        const vt = vatTus.find(v => v.loai === col.loai && (col.nhom === null || v.nhom === col.nhom))
          ?? (col.nhom ? vatTus.find(v => v.nhom === col.nhom) : undefined)
          ?? vatTus.find(v => v.ten.toLowerCase().replace(/\s/g,"") === col.label.toLowerCase().replace(/\s/g,""));
        if (!vt) { alert(`Chưa có vật tư nhóm "${col.label}" trong tồn kho`); return; }
        // Tự động cập nhật loai/nhom của vật tư nếu chưa khớp với cột
        if (vt.loai !== col.loai || (col.nhom && vt.nhom !== col.nhom)) {
          await fetch(`/api/ke-toan/vat-tu/${vt.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ loai: col.loai, nhom: col.nhom ?? vt.nhom }),
          });
        }
        await fetch("/api/ke-toan/dinh-muc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hangCat: targetCat, vatTuId: vt.id, soLuong: 1, haoHui: 0 }),
        });
      }
      await fetchAll();
    } finally { setTicking(null); }
  }

  /* ── Cell open/close ────────────────────────────────────────────────────── */
  function openCell(hangCat: string, colKey: string) {
    const col = COLUMNS.find(c => c.key === colKey)!;
    // Shared col on product row → chỉ xem (không edit)
    if (col.shared && hangCat !== CHUNG_KEY) return;
    // !shared tickOnly + CHUNG row → không làm gì
    if (!col.shared && col.tickOnly && hangCat === CHUNG_KEY) return;
    // tickOnly → dùng toggleTick thay vì modal
    if (col.tickOnly) { toggleTick(hangCat, col); return; }
    const items = getOwnItems(hangCat, col);
    setEditCell({ hangCat, colKey });
    setEditItems(items.map(dm => ({ id: dm.id, vatTuId: dm.vatTuId, soLuong: dm.soLuong, haoHui: dm.haoHui ?? 0, vtSearch: "", changed: false })));
    setVtDropOpen(null);
  }
  function closeCell() { setEditCell(null); setEditItems([]); setVtDropOpen(null); }

  /* ── Save / delete edit item ────────────────────────────────────────────── */
  async function saveItem(idx: number) {
    if (!editCell) return;
    const item = editItems[idx];
    if (!item.vatTuId || item.soLuong <= 0) return;
    setSaving(true);
    try {
      if (item.id) {
        await fetch(`/api/ke-toan/dinh-muc/${item.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ soLuong: item.soLuong, haoHui: item.haoHui }),
        });
        setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, changed: false } : it));
      } else {
        const res = await fetch("/api/ke-toan/dinh-muc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hangCat: editCell.hangCat, vatTuId: item.vatTuId, soLuong: item.soLuong, haoHui: item.haoHui }),
        });
        if (res.ok) {
          const newDm: DinhMuc = await res.json();
          setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, id: newDm.id, changed: false } : it));
        }
      }
      await fetchAll();
    } finally { setSaving(false); }
  }

  async function deleteItem(idx: number) {
    const item = editItems[idx];
    if (item.id) {
      await fetch(`/api/ke-toan/dinh-muc/${item.id}`, { method: "DELETE" });
      await fetchAll();
    }
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  }

  function addEditRow() {
    setEditItems(prev => [...prev, { vatTuId: "", soLuong: 0, haoHui: 0, vtSearch: "", changed: false }]);
    setVtDropOpen(editItems.length);
  }

  async function selectVatTu(idx: number, vt: VatTu) {
    setEditItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, vatTuId: vt.id, vtSearch: vt.ten, changed: true } : it));
    setVtDropOpen(null);
    // Nếu vật tư chưa có nhom → tự động gán nhom theo cột đang edit
    if (!vt.nhom && editCell) {
      const col = COLUMNS.find(c => c.key === editCell.colKey);
      if (col?.nhom) {
        await fetch(`/api/ke-toan/vat-tu/${vt.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nhom: col.nhom }),
        });
        // Cập nhật local state
        setVatTus(prev => prev.map(v => v.id === vt.id ? { ...v, nhom: col.nhom } : v));
      }
    }
  }

  const editCol = editCell ? COLUMNS.find(c => c.key === editCell.colKey) : null;

  /* ── Cell render helper ─────────────────────────────────────────────────── */
  function CellContent({ hangCat, col }: { hangCat: string; col: ColDef }) {
    const { items, isChung } = getCellDisplay(hangCat, col);
    const canEdit = !col.shared || hangCat === CHUNG_KEY;
    const isLoading = ticking === `${hangCat}:${col.key}`;

    // ── tickOnly render ──────────────────────────────────────────────────
    if (col.tickOnly) {
      const checked = items.length > 0;
      // Shared + product row: hiển thị trạng thái kế thừa từ CHUNG (read-only)
      if (col.shared && hangCat !== CHUNG_KEY) {
        return checked
          ? <span className="text-lg">✓</span>
          : <span className="text-slate-200 text-base">—</span>;
      }
      // !shared + CHUNG row: không áp dụng
      if (!col.shared && hangCat === CHUNG_KEY) {
        return <span className="text-slate-200 text-base select-none">—</span>;
      }
      // CHUNG row (shared) hoặc product row (!shared): nút toggle
      return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-xl mx-auto transition-all
          ${isLoading ? "opacity-40" : ""}
          ${checked
            ? `${col.badge} shadow-sm`
            : "border-2 border-dashed border-slate-300 hover:border-slate-400"
          }`}>
          {isLoading
            ? <span className="text-xs animate-spin">⟳</span>
            : checked
              ? <span className="text-base font-bold">✓</span>
              : <span className="text-slate-400 text-base">+</span>
          }
        </div>
      );
    }

    // ── normal render ────────────────────────────────────────────────────
    if (items.length === 0) {
      if (isChung) return <span className="text-slate-200 text-base select-none">—</span>;
      return (
        <span className={`text-base select-none ${canEdit ? "text-slate-300 group-hover:text-slate-400" : "text-slate-200"}`}>
          {canEdit ? "+" : "—"}
        </span>
      );
    }

    return (
      <div className="space-y-1">
        {items.slice(0, 2).map((dm, i) => {
          const vt = dm.vatTu || vatTus.find(v => v.id === dm.vatTuId);
          return (
            <div key={i} className={`inline-flex flex-col items-center px-2 py-1 rounded-lg text-xs font-medium
              ${isChung ? "opacity-60 border border-dashed border-slate-300 bg-slate-50 text-slate-500" : col.badge}`}>
              <span className="font-bold text-sm leading-none">{fmt(dm.soLuong)}</span>
              <span className="opacity-70 text-[10px]">
                {vt ? fmtDV(tonKhoMap.get(vt.id)?.donViQuyDoi ?? vt.donVi) : ""}
              </span>
              {(dm.haoHui ?? 0) > 0 && (
                <span className="text-[9px] text-amber-600 font-medium mt-0.5">+{dm.haoHui}%</span>
              )}
            </div>
          );
        })}
        {items.length > 2 && <div className="text-[10px] text-slate-400">+{items.length - 2}</div>}
        {isChung && <div className="text-[10px] text-slate-400 mt-0.5">chung</div>}
      </div>
    );
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Định Mức NPL</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Số lượng vật tư / 1 sản phẩm ·
            <span className="ml-1 text-indigo-500 font-medium">Hàng CHUNG</span> = dùng chung cho tất cả ·
            <span className="ml-1 text-teal-600 font-medium">Vải</span> = điền riêng từng sản phẩm
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm..."
            className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <span className="text-xs text-slate-400">{filteredSPs.length} sản phẩm</span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">Đang tải...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
          <table className="text-sm border-collapse w-full" style={{ minWidth: `${200 + COLUMNS.length * 110}px` }}>
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 w-48 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Sản phẩm
                </th>
                {COLUMNS.map(col => (
                  <th key={col.key} className={`px-2 py-3 text-center text-xs font-bold w-28 ${col.hdr} ${col.separatorLeft ? "border-l-2 border-slate-300" : ""}`}>
                    <div>{col.label}</div>
                    {col.shared && <div className="text-[10px] font-normal opacity-60 mt-0.5">↓ từ CHUNG</div>}
                    {!col.shared && !col.tickOnly && <div className="text-[10px] font-normal opacity-60 mt-0.5">riêng SP</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* ── CHUNG ROW (pinned) ─────────────────────────────────── */}
              <tr className="border-b-2 border-indigo-200 bg-indigo-50/60">
                <td className="px-4 py-3 sticky left-0 bg-indigo-50 z-10 border-r border-indigo-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                      <Settings2 size={12} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-indigo-700 text-sm">Mặc định chung</p>
                      <p className="text-[10px] text-indigo-400">Áp dụng cho tất cả SP</p>
                    </div>
                  </div>
                </td>
                {COLUMNS.map(col => (
                  <td key={col.key}
                    className={`px-2 py-3 text-center align-middle border-r border-indigo-100
                      ${col.separatorLeft ? "border-l-2 border-slate-300" : ""}
                      ${col.shared ? "cursor-pointer hover:bg-indigo-100/50 transition-colors" : "bg-indigo-50/30"}`}
                    onClick={() => col.shared && openCell(CHUNG_KEY, col.key)}>
                    {col.shared ? (
                      <CellContent hangCat={CHUNG_KEY} col={col} />
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="text-xs text-indigo-300 flex items-center gap-1">
                          <Lock size={10} /> riêng SP
                        </span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* ── PRODUCT ROWS ───────────────────────────────────────── */}
              {filteredSPs.length === 0 ? (
                <tr><td colSpan={COLUMNS.length + 1} className="text-center py-12 text-slate-400 text-sm">
                  Kho sản phẩm trống. Thêm sản phẩm trong module Kho.
                </td></tr>
              ) : (
                filteredSPs.map(sp => (
                  <tr key={sp.sku} className="border-b border-slate-100 hover:bg-slate-50/40 group">
                    {/* Product label */}
                    <td className="px-4 py-2.5 sticky left-0 bg-white group-hover:bg-slate-50/40 z-10 border-r border-slate-100">
                      <p className="font-semibold text-slate-800 text-sm leading-tight">{sp.sku}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate w-40">{sp.ten}</p>
                      {(sp.mauSac || sp.size) && (
                        <p className="text-[10px] text-slate-300">{[sp.mauSac, sp.size].filter(Boolean).join(" · ")}</p>
                      )}
                    </td>

                    {/* Cells */}
                    {COLUMNS.map(col => {
                      const canEdit = !col.shared || (col.tickOnly && col.shared === false);
                      const canClick = !col.shared; // product rows: click khi !shared
                      return (
                        <td key={col.key}
                          className={`px-2 py-2 text-center align-middle border-r border-slate-50
                            ${col.separatorLeft ? "border-l-2 border-slate-200" : ""}
                            ${canClick ? "cursor-pointer hover:bg-teal-50/60 transition-colors" : ""}`}
                          onClick={() => canClick && openCell(sp.sku, col.key)}>
                          <CellContent hangCat={sp.sku} col={col} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Cell Edit Modal ─────────────────────────────────────────────── */}
      {editCell && editCol && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && closeCell()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Định mức / 1 sản phẩm</p>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${editCol.badge}`}>{editCol.label}</span>
                  {editCell.hangCat === CHUNG_KEY ? (
                    <span className="text-indigo-700">Mặc định chung</span>
                  ) : (
                    <span>{editCell.hangCat}
                      {spMap.get(editCell.hangCat) && <span className="text-sm font-normal text-slate-400 ml-1">— {spMap.get(editCell.hangCat)?.ten}</span>}
                    </span>
                  )}
                </h3>
              </div>
              <button onClick={closeCell} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {editItems.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có. Bấm <strong>+ Thêm vật tư</strong>.</p>
              )}
              {editItems.map((item, idx) => {
                const vt = vatTus.find(v => v.id === item.vatTuId);
                const colVts = getColVatTus(editCol, item.vtSearch);
                return (
                  <div key={idx} className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                    {/* VatTu picker */}
                    <div className="flex-1 relative">
                      <p className="text-[10px] text-slate-400 mb-1">Vật tư</p>
                      <input
                        value={item.vtSearch || (vt ? vt.ten : "")}
                        onChange={e => {
                          setEditItems(prev => prev.map((it, i) =>
                            i === idx ? { ...it, vtSearch: e.target.value, changed: true } : it));
                          setVtDropOpen(idx);
                        }}
                        onFocus={() => setVtDropOpen(idx)}
                        placeholder="Tìm vật tư..."
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                      {vtDropOpen === idx && (
                        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto mt-1">
                          {colVts.length === 0
                            ? <p className="text-xs text-slate-400 px-3 py-2">Không tìm thấy vật tư nhóm &ldquo;{editCol.label}&rdquo;</p>
                            : colVts.map(v => {
                                const tk = tonKhoMap.get(v.id);
                                const stock = tk?.soLuongQD ?? 0; // sau quy đổi từ lịch sử nhập
                                const donViHien = fmtDV(tk?.donViQuyDoi ?? v.donVi);
                                const hasStock = stock > 0;
                                return (
                                  <button key={v.id}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                                      ${hasStock ? "hover:bg-emerald-50" : "hover:bg-slate-50 opacity-60"}`}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => selectVatTu(idx, v)}>
                                    <span className={`truncate flex-1 ${hasStock ? "text-slate-800" : "text-slate-400"}`}>{v.ten}</span>
                                    {!v.nhom && (
                                      <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">→ tự link</span>
                                    )}
                                    {tk
                                      ? <span className={`shrink-0 font-medium text-right ${hasStock ? "text-emerald-600" : "text-slate-400"}`}>
                                          {fmt(stock)} {donViHien}
                                        </span>
                                      : <span className="shrink-0 text-slate-300 text-[10px]">chưa nhập</span>
                                    }
                                  </button>
                                );
                              })}
                        </div>
                      )}
                      {vt && !item.vtSearch && <p className="text-[10px] text-slate-400 mt-0.5">{fmtDV(vt.donVi)}</p>}
                    </div>

                    {/* Quantity */}
                    <div className="w-20 shrink-0">
                      <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                        SL / sp
                        {vt && <span className="px-1 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-medium">
                          {fmtDV(tonKhoMap.get(vt.id)?.donViQuyDoi ?? vt.donVi)}
                        </span>}
                      </p>
                      <input type="number" min={0} step="0.01"
                        value={item.soLuong || ""}
                        onChange={e => setEditItems(prev => prev.map((it, i) =>
                          i === idx ? { ...it, soLuong: parseFloat(e.target.value) || 0, changed: true } : it))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>

                    {/* Hao hụt % */}
                    <div className="w-16 shrink-0">
                      <p className="text-[10px] text-slate-400 mb-1">Hao %</p>
                      <input type="number" min={0} max={100} step="0.1"
                        value={item.haoHui || ""}
                        placeholder="0"
                        onChange={e => setEditItems(prev => prev.map((it, i) =>
                          i === idx ? { ...it, haoHui: parseFloat(e.target.value) || 0, changed: true } : it))}
                        className="w-full border border-amber-200 bg-amber-50 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>

                    {/* Save / Delete */}
                    <div className="flex flex-col gap-1 pt-5 shrink-0">
                      {item.changed && item.vatTuId && item.soLuong > 0 && (
                        <button onClick={() => saveItem(idx)} disabled={saving}
                          className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                          ✓
                        </button>
                      )}
                      <button onClick={() => deleteItem(idx)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
              <button onClick={addEditRow}
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                <Plus size={13} /> Thêm vật tư
              </button>
              <button onClick={closeCell}
                className="px-4 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
