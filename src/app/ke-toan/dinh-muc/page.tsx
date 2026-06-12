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
  // Giặt — tick riêng từng SP, CHUNG chỉ định VatTu nguồn
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
    { id?: string; vatTuId: string; soLuong: number; haoHui: number; donViMua?: string; vtSearch: string; changed: boolean }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [vtDropOpen, setVtDropOpen] = useState<number|null>(null);

  // Tick picker: chọn vật tư trực tiếp từ tồn kho cho tickOnly cols
  const [tickPicker, setTickPicker] = useState<{ hangCat: string; col: ColDef; search: string; showAll: boolean } | null>(null);

  // Chỉnh sửa tên cột
  const [colLabels, setColLabels] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem("dinh-muc-col-labels") || "{}"); } catch { return {}; }
  });
  const [editingColKey, setEditingColKey] = useState<string | null>(null);
  const [editingColVal, setEditingColVal] = useState("");

  // Cột tùy chỉnh (thêm mới)
  const [extraCols, setExtraCols] = useState<ColDef[]>(() => {
    try { return JSON.parse(localStorage.getItem("dinh-muc-extra-cols") || "[]"); } catch { return []; }
  });
  const [addColModal, setAddColModal] = useState(false);
  const [addColForm, setAddColForm] = useState({ label: "", loai: "hoan_thien", nhom: "", shared: false, tickOnly: false });

  const allColumns = useMemo(() => [...COLUMNS, ...extraCols], [extraCols]);

  function saveExtraCols(cols: ColDef[]) {
    setExtraCols(cols);
    localStorage.setItem("dinh-muc-extra-cols", JSON.stringify(cols));
  }
  function addNewCol() {
    const label = addColForm.label.trim();
    if (!label) return;
    const key = `custom_${Date.now()}`;
    const newCol: ColDef = {
      key, label,
      loai: addColForm.loai,
      nhom: addColForm.nhom.trim() || null,
      shared: addColForm.shared,
      tickOnly: addColForm.tickOnly,
      hdr: "bg-violet-100 text-violet-800",
      badge: "bg-violet-100 text-violet-700",
      separatorLeft: extraCols.length === 0, // đường kẻ trước cột đầu tiên
    };
    saveExtraCols([...extraCols, newCol]);
    setAddColModal(false);
    setAddColForm({ label: "", loai: "hoan_thien", nhom: "", shared: false, tickOnly: false });
  }
  function removeExtraCol(key: string) {
    saveExtraCols(extraCols.filter(c => c.key !== key));
  }
  function startEditCol(col: ColDef) {
    setEditingColKey(col.key);
    setEditingColVal(colLabels[col.key] ?? col.label);
  }
  function saveColLabel(key: string) {
    const val = editingColVal.trim();
    const next = { ...colLabels, [key]: val || COLUMNS.find(c => c.key === key)!.label };
    setColLabels(next);
    localStorage.setItem("dinh-muc-col-labels", JSON.stringify(next));
    setEditingColKey(null);
  }
  function getColLabel(col: ColDef) { return colLabels[col.key] ?? col.label; }

  /* ── Fetch ─────────────────────────────────────────────────────────────── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    // Load song song 3 API chính, hiển thị ngay khi xong
    const [sps, vts, dms] = await Promise.all([
      fetch("/api/kho/san-pham").then(r => r.json()).catch(() => []),
      fetch("/api/ke-toan/vat-tu").then(r => r.json()).catch(() => []),
      fetch("/api/ke-toan/dinh-muc").then(r => r.json()).catch(() => []),
    ]);
    setSanPhams(Array.isArray(sps) ? sps : []);
    setVatTus(Array.isArray(vts) ? vts : []);
    setDinhMucs(Array.isArray(dms) ? dms : []);
    setLoading(false); // hiển thị bảng ngay, không chờ tồn kho
    // Phase 2: load tồn kho trong nền
    fetch("/api/ke-toan/ton-kho")
      .then(r => r.json())
      .then(tonKhos => {
        if (Array.isArray(tonKhos)) {
          setTonKhoMap(new Map(tonKhos.map((t: {
            vatTuId: string; soLuong: number; soLuongQD?: number;
            donViQuyDoi?: string; quyDoi?: number; vatTu?: { donVi?: string }
          }) => [
            t.vatTuId,
            {
              vatTuId:     t.vatTuId,
              soLuongQD:   t.soLuongQD ?? t.soLuong,   // đã quy đổi (ví dụ m)
              donViQuyDoi: t.donViQuyDoi ?? t.vatTu?.donVi ?? "",
              quyDoi:      t.quyDoi ?? 1,
            } as TonKhoRow,
          ])));
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

  function getColVatTus(_col: ColDef, q: string): VatTu[] {
    const lq = q.toLowerCase();
    // Luôn hiện tất cả VatTu, filter theo search nếu có
    const matched = vatTus.filter(vt => {
      if (!q) return true;
      return vt.ten.toLowerCase().includes(lq) || vt.ma.toLowerCase().includes(lq);
    });
    // Ưu tiên: có tồn kho trước, sau đó theo tên
    matched.sort((a, b) => {
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

  /** Optimistic: cập nhật dinhMucs ngay, API chạy nền */
  function optimisticRemove(ids: string[]) {
    setDinhMucs(prev => prev.filter(dm => !ids.includes(dm.id)));
  }
  function optimisticAdd(tempDm: DinhMuc) {
    setDinhMucs(prev => [...prev, tempDm]);
  }
  function optimisticReplace(tempId: string, realDm: DinhMuc) {
    setDinhMucs(prev => prev.map(dm => dm.id === tempId ? realDm : dm));
  }

  async function toggleTick(hangCat: string, col: ColDef) {
    const key = `${hangCat}:${col.key}`;
    if (ticking === key) return;
    const targetCat = col.shared ? CHUNG_KEY : hangCat;
    const ownItems = getOwnItems(targetCat, col);
    if (ownItems.length > 0) {
      // Đã có → xoá (untick) — optimistic
      const ids = ownItems.map(dm => dm.id);
      optimisticRemove(ids);
      setTicking(key);
      try {
        await Promise.all(ids.map(id =>
          fetch(`/api/ke-toan/dinh-muc/${id}`, { method: "DELETE" })
        ));
      } catch { await refreshDinhMuc(); } // revert on error
      finally { setTicking(null); }
    } else {
      // Chưa có → nếu col không shared (Giặt), dùng VatTu từ CHUNG row
      if (!col.shared) {
        const chungItems = getChungItems(col);
        if (chungItems.length > 0) {
          const vatTuId = chungItems[0].vatTuId;
          const vt = vatTus.find(v => v.id === vatTuId);
          const tempId = `__temp__${Date.now()}`;
          const tempDm: DinhMuc = { id: tempId, hangCat, vatTuId, soLuong: 1, haoHui: 0, vatTu: vt };
          optimisticAdd(tempDm);
          setTicking(key);
          try {
            const res = await fetch("/api/ke-toan/dinh-muc", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ hangCat, vatTuId, soLuong: 1, haoHui: 0 }),
            });
            if (res.ok) {
              const real: DinhMuc = await res.json();
              optimisticReplace(tempId, { ...real, vatTu: vt });
            } else { await refreshDinhMuc(); }
          } catch { await refreshDinhMuc(); }
          finally { setTicking(null); }
          return;
        }
      }
      // Không có CHUNG ref → mở picker
      setTickPicker({ hangCat, col, search: "", showAll: false });
    }
  }

  async function confirmTickPick(vatTuId: string) {
    if (!tickPicker) return;
    const { hangCat, col } = tickPicker;
    const targetCat = col.shared ? CHUNG_KEY : hangCat;
    setTickPicker(null);
    const key = `${hangCat}:${col.key}`;
    // Optimistic add
    const vt = vatTus.find(v => v.id === vatTuId);
    const vtOptimistic: VatTu = vt ? { ...vt, loai: col.loai, nhom: col.nhom } : { id: vatTuId, ma: "", ten: vatTuId, loai: col.loai, nhom: col.nhom, donVi: "" };
    const tempId = `__temp__${Date.now()}`;
    const tempDm: DinhMuc = { id: tempId, hangCat: targetCat, vatTuId, soLuong: 1, haoHui: 0, vatTu: vtOptimistic };
    optimisticAdd(tempDm);
    // Cập nhật vatTus local để matchesCol khớp
    if (vt && (vt.loai !== col.loai || vt.nhom !== col.nhom)) {
      setVatTus(prev => prev.map(v => v.id === vatTuId ? { ...v, loai: col.loai, nhom: col.nhom } : v));
    }
    setTicking(key);
    try {
      // Đồng bộ loai + nhom của VatTu để matchesCol khớp với cột
      await fetch(`/api/ke-toan/vat-tu/${vatTuId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loai: col.loai, nhom: col.nhom }),
      });
      const res = await fetch("/api/ke-toan/dinh-muc", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hangCat: targetCat, vatTuId, soLuong: 1, haoHui: 0 }),
      });
      if (res.ok) {
        const real: DinhMuc = await res.json();
        optimisticReplace(tempId, { ...real, vatTu: vtOptimistic });
      } else { await refreshDinhMuc(); }
    } catch { await refreshDinhMuc(); }
    finally { setTicking(null); }
  }

  /* ── Cell open/close ────────────────────────────────────────────────────── */
  function openCell(hangCat: string, colKey: string) {
    const col = COLUMNS.find(c => c.key === colKey)!;
    // Shared col on product row → chỉ xem (không edit)
    if (col.shared && hangCat !== CHUNG_KEY) return;
    // !shared tickOnly + CHUNG row → mở picker để chọn VatTu nguồn
    if (!col.shared && col.tickOnly && hangCat === CHUNG_KEY) {
      setTickPicker({ hangCat: CHUNG_KEY, col, search: "", showAll: false });
      return;
    }
    // tickOnly: nếu đã có → mở modal nhập số; nếu chưa có → toggle (tạo mới sl=1)
    if (col.tickOnly) {
      const existing = getOwnItems(hangCat, col);
      if (existing.length > 0) {
        // Mở modal để chỉnh soLuong
        setEditCell({ hangCat, colKey });
        setEditItems(existing.map(dm => ({
          id: dm.id, vatTuId: dm.vatTuId, soLuong: dm.soLuong,
          haoHui: dm.haoHui ?? 0, donViMua: dm.donViMua ?? dm.vatTu?.donVi ?? "",
          vtSearch: "", changed: false,
        })));
        return;
      }
      toggleTick(hangCat, col);
      return;
    }
    const items = getOwnItems(hangCat, col);
    setEditCell({ hangCat, colKey });
    setEditItems(items.map(dm => {
      const tk = tonKhoMap.get(dm.vatTuId);
      // Ưu tiên donViMua đã lưu trong DB, fallback về donVi của vatTu
      const dvQD = dm.donViMua ?? dm.vatTu?.donVi ?? tk?.donViQuyDoi ?? "";
      return { id: dm.id, vatTuId: dm.vatTuId, soLuong: dm.soLuong, haoHui: dm.haoHui ?? 0, donViMua: dvQD, vtSearch: "", changed: false };
    }));
    setVtDropOpen(null);
  }
  function closeCell() { setEditCell(null); setEditItems([]); setVtDropOpen(null); }

  // Chỉ refresh định mức (không load lại san-pham, vat-tu, ton-kho)
  const refreshDinhMuc = useCallback(async () => {
    const dms = await fetch("/api/ke-toan/dinh-muc").then(r => r.json()).catch(() => []);
    if (Array.isArray(dms)) setDinhMucs(dms);
  }, []);

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
          body: JSON.stringify({ soLuong: item.soLuong, haoHui: item.haoHui, donViMua: item.donViMua }),
        });
        setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, changed: false } : it));
      } else {
        const res = await fetch("/api/ke-toan/dinh-muc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hangCat: editCell.hangCat, vatTuId: item.vatTuId, soLuong: item.soLuong, haoHui: item.haoHui, donViMua: item.donViMua }),
        });
        if (res.ok) {
          const newDm: DinhMuc = await res.json();
          setEditItems(prev => prev.map((it, i) => i === idx ? { ...it, id: newDm.id, changed: false } : it));
        }
      }
      await refreshDinhMuc();
    } finally { setSaving(false); }
  }

  async function deleteItem(idx: number) {
    const item = editItems[idx];
    if (item.id) {
      await fetch(`/api/ke-toan/dinh-muc/${item.id}`, { method: "DELETE" });
      await refreshDinhMuc();
    }
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  }

  function addEditRow() {
    setEditItems(prev => [...prev, { vatTuId: "", soLuong: 0, haoHui: 0, vtSearch: "", changed: false }]);
    setVtDropOpen(editItems.length);
  }

  async function selectVatTu(idx: number, vt: VatTu) {
    const tk = tonKhoMap.get(vt.id);
    // Dùng donVi của vatTu làm mặc định, không dùng donViQuyDoi từ tồn kho
    const dvQD = vt.donVi ?? tk?.donViQuyDoi ?? "";
    setEditItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, vatTuId: vt.id, vtSearch: vt.ten, donViMua: dvQD, changed: true } : it));
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
          ? <span className="text-sm font-semibold text-emerald-600">{items[0].soLuong}</span>
          : <span className="text-slate-200 text-base">—</span>;
      }
      // !shared + CHUNG row: hiển thị VatTu nguồn đã chọn (hoặc nút chọn)
      if (!col.shared && hangCat === CHUNG_KEY) {
        const chungItems = getChungItems(col);
        if (chungItems.length > 0) {
          const vt = vatTus.find(v => v.id === chungItems[0].vatTuId);
          return (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[80px]">{vt?.ten ?? "—"}</span>
              <span className="text-[9px] text-slate-300">nguồn</span>
            </div>
          );
        }
        return (
          <div className="w-8 h-8 rounded-xl mx-auto border-2 border-dashed border-slate-300 hover:border-blue-400 flex items-center justify-center text-slate-300 hover:text-blue-400 transition-all cursor-pointer">
            <span className="text-base">+</span>
          </div>
        );
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
              ? <span className="text-sm font-bold">{items[0]?.soLuong ?? 1}</span>
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
              {vt && (
                <span className="opacity-60 text-[9px] leading-none mb-0.5 max-w-[72px] truncate">{vt.ten}</span>
              )}
              <span className="font-bold text-sm leading-none">{fmt(dm.soLuong)}</span>
              {vt && (
                <span className="opacity-70 text-[10px]">{fmtDV(dm.donViMua ?? vt.donVi ?? "")}</span>
              )}
              {(dm.haoHui ?? 0) > 0 && (
                <span className="text-[9px] text-amber-600 font-medium mt-0.5">+{dm.haoHui}%</span>
              )}
            </div>
          );
        })}
        {items.length > 2 && <div className="text-[10px] text-slate-400">+{items.length - 2}</div>}
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
        <div className="space-y-2 animate-pulse">
          <div className="h-10 bg-slate-100 rounded-xl w-full" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
          <table className="text-sm border-collapse w-full" style={{ minWidth: `${200 + allColumns.length * 110}px` }}>
            <thead className="sticky top-0 z-20">
              <tr className="bg-slate-50 border-b-2 border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 w-48 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                  Sản phẩm
                </th>
                {allColumns.map(col => (
                  <th key={col.key} className={`px-2 py-3 text-center text-xs font-bold w-28 ${col.hdr} ${col.separatorLeft ? "border-l-2 border-slate-300" : ""}`}>
                    {editingColKey === col.key ? (
                      <input
                        autoFocus
                        value={editingColVal}
                        onChange={e => setEditingColVal(e.target.value)}
                        onBlur={() => saveColLabel(col.key)}
                        onKeyDown={e => { if (e.key === "Enter") saveColLabel(col.key); if (e.key === "Escape") setEditingColKey(null); }}
                        className="w-full text-center text-xs font-bold bg-white/80 border border-white rounded px-1 py-0.5 focus:outline-none"
                        style={{ minWidth: 60 }}
                      />
                    ) : (
                      <div
                        className="cursor-pointer hover:underline decoration-dotted"
                        title="Click để đổi tên cột"
                        onClick={() => startEditCol(col)}>
                        {getColLabel(col)}
                      </div>
                    )}
                    {col.shared && <div className="text-[10px] font-normal opacity-60 mt-0.5">↓ từ CHUNG</div>}
                    {!col.shared && !col.tickOnly && <div className="text-[10px] font-normal opacity-60 mt-0.5">riêng SP</div>}
                    {extraCols.some(c => c.key === col.key) && (
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <button onClick={e => {
                          e.stopPropagation();
                          saveExtraCols(extraCols.map(c => c.key === col.key ? { ...c, shared: !c.shared } : c));
                        }} className="text-[9px] text-indigo-300 hover:text-indigo-600">
                          {col.shared ? "→ phát sinh" : "→ chung"}
                        </button>
                        <span className="text-slate-200">·</span>
                        <button onClick={e => { e.stopPropagation(); removeExtraCol(col.key); }}
                          className="text-[9px] text-red-300 hover:text-red-500">✕ xóa</button>
                      </div>
                    )}
                  </th>
                ))}
                {/* Nút thêm cột mới */}
                <th className="px-2 py-3 text-center w-12 border-l-2 border-dashed border-slate-300">
                  <button onClick={() => setAddColModal(true)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 flex items-center justify-center mx-auto text-lg font-bold transition-colors"
                    title="Thêm cột mới">
                    +
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* ── CHUNG ROW (pinned) ─────────────────────────────────── */}
              <tr className="border-b-2 border-indigo-200 bg-indigo-50/60 sticky z-10" style={{ top: "49px" }}>
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
                {allColumns.map(col => (
                  <td key={col.key}
                    className={`px-2 py-3 text-center align-middle border-r border-indigo-100 bg-indigo-50
                      ${col.separatorLeft ? "border-l-2 border-slate-300" : ""}
                      cursor-pointer hover:bg-indigo-100/50 transition-colors`}
                    onClick={() => openCell(CHUNG_KEY, col.key)}>
                    <CellContent hangCat={CHUNG_KEY} col={col} />
                  </td>
                ))}
                <td className="bg-indigo-50" />
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
                    {allColumns.map(col => {
                      const canClick = !col.shared;
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
                    <td />
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Định mức / 1 sản phẩm</p>
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${editCol.badge}`}>{editCol.label}</span>
                  {editCell.hangCat === CHUNG_KEY ? (
                    <span className="text-indigo-700">Mặc định chung</span>
                  ) : (
                    <span className="break-all">{editCell.hangCat}
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
                        value={item.vtSearch !== undefined && item.vtSearch !== "" ? item.vtSearch : (vt ? vt.ten : "")}
                        onChange={e => {
                          setEditItems(prev => prev.map((it, i) =>
                            i === idx ? { ...it, vtSearch: e.target.value, changed: true } : it));
                          setVtDropOpen(idx);
                        }}
                        onFocus={e => { e.target.select(); setVtDropOpen(idx); }}
                        placeholder="Tìm vật tư bất kỳ..."
                        className="w-full border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-text"
                      />
                      {vtDropOpen === idx && (
                        <div className="absolute top-full left-0 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto mt-1">
                          {colVts.length === 0
                            ? <p className="text-xs text-slate-400 px-3 py-2">Không tìm thấy vật tư nhóm &ldquo;{editCol.label}&rdquo;</p>
                            : colVts.map(v => {
                                const tk = tonKhoMap.get(v.id);
                                const stock = tk?.soLuongQD ?? 0;
                                const donViHien = fmtDV(tk?.donViQuyDoi ?? v.donVi);
                                const hasStock = stock > 0;
                                return (
                                  <button key={v.id}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors
                                      ${hasStock ? "hover:bg-emerald-50" : "hover:bg-slate-50 opacity-60"}`}
                                    onMouseDown={e => e.preventDefault()}
                                    onClick={() => selectVatTu(idx, v)}>
                                    <span className={`flex-1 ${hasStock ? "text-slate-800" : "text-slate-400"}`}>{v.ten}</span>
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
                      {vt && !item.vtSearch && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-slate-400">{fmtDV(item.donViMua ?? vt.donVi)}</span>
                          <button
                            onClick={async () => {
                              const newDv = prompt(`Sửa đơn vị cho "${vt.ten}" (hiện: ${vt.donVi}):`, vt.donVi);
                              if (!newDv || newDv === vt.donVi) return;
                              await fetch(`/api/ke-toan/vat-tu/${vt.id}`, {
                                method: "PATCH", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ donVi: newDv.trim() }),
                              });
                              // Cập nhật local state, không cần re-fetch toàn bộ
                              setVatTus(prev => prev.map(v => v.id === vt.id ? { ...v, donVi: newDv.trim() } : v));
                            }}
                            className="text-[9px] text-indigo-400 hover:text-indigo-600 underline"
                          >sửa</button>
                        </div>
                      )}
                    </div>

                    {/* Quantity + Unit */}
                    <div className="w-24 shrink-0">
                      <p className="text-[10px] text-slate-400 mb-1 flex items-center gap-1">
                        SL / sp
                        {vt && <span className="px-1 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-medium">
                          {fmtDV(item.donViMua ?? vt.donVi)}
                        </span>}
                      </p>
                      <input type="number" min={0} step="0.01"
                        value={item.soLuong || ""}
                        onChange={e => setEditItems(prev => prev.map((it, i) =>
                          i === idx ? { ...it, soLuong: parseFloat(e.target.value) || 0, changed: true } : it))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-right focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                      {/* Chọn đơn vị: QD unit (mặc định) hoặc donViMua (gói, cuộn...) */}
                      {(() => {
                        const tk = tonKhoMap.get(vt?.id ?? "");
                        const dvQD = tk?.donViQuyDoi ?? vt?.donVi ?? "";
                        const dvMua = vt?.donViMua;
                        const hasTwoUnits = dvMua && dvMua !== dvQD;
                        const selected = item.donViMua ?? dvQD;
                        return hasTwoUnits ? (
                          <div className="flex gap-1 mt-1">
                            {[dvQD, dvMua!].map(dv => (
                              <button key={dv} type="button"
                                onClick={() => setEditItems(prev => prev.map((it, i) =>
                                  i === idx ? { ...it, donViMua: dv, changed: true } : it))}
                                className={`flex-1 text-[9px] px-1 py-0.5 rounded border transition-colors
                                  ${selected === dv
                                    ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                                    : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300"}`}>
                                {fmtDV(dv)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[9px] text-slate-400 mt-0.5 text-center">{fmtDV(item.donViMua ?? dvQD)}</p>
                        );
                      })()}
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
      {/* ── Tick Picker Modal ──────────────────────────────────────────────── */}
      {tickPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && setTickPicker(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Chọn vật tư — {tickPicker.col.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Chọn từ danh sách tồn kho</p>
              </div>
              <button onClick={() => setTickPicker(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="px-4 pt-3 pb-2 space-y-2">
              <input
                autoFocus
                value={tickPicker.search}
                onChange={e => setTickPicker(p => p ? { ...p, search: e.target.value } : p)}
                placeholder="Tìm tên vật tư..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={tickPicker.showAll}
                  onChange={e => setTickPicker(p => p ? { ...p, showAll: e.target.checked } : p)}
                  className="accent-indigo-600 w-3.5 h-3.5" />
                <span className="text-xs text-slate-400">Hiện cả hàng chưa nhập kho</span>
              </label>
            </div>
            <div className="max-h-64 overflow-y-auto px-2 pb-3">
              {(() => {
                const q = tickPicker.search.toLowerCase();
                const list = vatTus
                  .filter(v => {
                    const tk = tonKhoMap.get(v.id);
                    const hasStock = (tk?.soLuongQD ?? 0) > 0;
                    if (!tickPicker.showAll && !hasStock) return false;
                    return !q || v.ten.toLowerCase().includes(q) || v.ma.toLowerCase().includes(q);
                  })
                  .sort((a, b) => {
                    // Ưu tiên có tồn kho lên đầu
                    const aStock = (tonKhoMap.get(a.id)?.soLuongQD ?? 0) > 0;
                    const bStock = (tonKhoMap.get(b.id)?.soLuongQD ?? 0) > 0;
                    if (aStock !== bStock) return aStock ? -1 : 1;
                    return a.ten.localeCompare(b.ten);
                  });
                if (list.length === 0) return (
                  <p className="text-center text-xs text-slate-400 py-6">
                    {tickPicker.showAll ? "Không tìm thấy vật tư" : "Không có vật tư nào trong kho — bật \"Hiện cả hàng chưa nhập\" để xem tất cả"}
                  </p>
                );
                return list.map(v => {
                  const tk = tonKhoMap.get(v.id);
                  const stock = tk?.soLuongQD ?? 0;
                  return (
                    <button key={v.id}
                      onClick={() => confirmTickPick(v.id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-indigo-50 flex items-center gap-3 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{v.ten}</p>
                        <p className="text-xs text-slate-400">{v.loai}{v.nhom ? ` · ${v.nhom}` : ""}</p>
                      </div>
                      {tk ? (
                        <span className={`text-xs font-medium shrink-0 ${stock > 0 ? "text-emerald-600" : "text-slate-300"}`}>
                          {stock.toLocaleString("vi-VN")} {tk.donViQuyDoi ?? v.donVi}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300 shrink-0">chưa nhập</span>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
      {/* ── Modal thêm cột mới ─────────────────────────────────────────────── */}
      {addColModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
          onClick={e => e.target === e.currentTarget && setAddColModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Thêm cột mới</h3>
              <button onClick={() => setAddColModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Tên cột *</label>
                <input autoFocus value={addColForm.label}
                  onChange={e => setAddColForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="VD: Giặt Nhanh, In lụa..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Loại vật tư</label>
                  <select value={addColForm.loai}
                    onChange={e => setAddColForm(f => ({ ...f, loai: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <option value="hoan_thien">Hoàn thiện</option>
                    <option value="may">May</option>
                    <option value="gia_cong">Gia công</option>
                    <option value="vai">Vải</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Nhóm (nhom)</label>
                  <input value={addColForm.nhom}
                    onChange={e => setAddColForm(f => ({ ...f, nhom: e.target.value }))}
                    placeholder="VD: giat_nhanh"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-2">Loại cột *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Dùng chung", desc: "Tất cả SP dùng cùng 1 định mức", shared: true,  tickOnly: false },
                    { label: "Theo phát sinh", desc: "Mỗi SP nhập định mức riêng",       shared: false, tickOnly: false },
                    { label: "Tick chung",   desc: "Tick on/off dùng chung (vd: May)",  shared: true,  tickOnly: true  },
                    { label: "Tick phát sinh", desc: "Tick on/off từng SP riêng",        shared: false, tickOnly: true  },
                  ].map(opt => {
                    const active = addColForm.shared === opt.shared && addColForm.tickOnly === opt.tickOnly;
                    return (
                      <button key={opt.label} type="button"
                        onClick={() => setAddColForm(f => ({ ...f, shared: opt.shared, tickOnly: opt.tickOnly }))}
                        className={`text-left px-3 py-2 rounded-xl border-2 transition-all text-xs
                          ${active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <p className={`font-semibold ${active ? "text-indigo-700" : "text-slate-700"}`}>{opt.label}</p>
                        <p className="text-slate-400 mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setAddColModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Hủy</button>
              <button onClick={addNewCol} disabled={!addColForm.label.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40">
                Thêm cột
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
