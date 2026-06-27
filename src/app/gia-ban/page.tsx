"use client";

import { useState, useMemo, useEffect, useCallback, Fragment } from "react";
import { ChevronDown, ChevronUp, RotateCcw, FileSpreadsheet, Calculator, TrendingUp, TrendingDown, List, RefreshCw, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

const CATEGORIES: { label: string; thuong: number; mall: number }[] = [
  { label: "Thời trang nữ", thuong: 16.5, mall: 17.0 },
  { label: "Thời trang nam", thuong: 16.5, mall: 17.0 },
  { label: "Thời trang trẻ em & trẻ sơ sinh", thuong: 16.5, mall: 17.0 },
  { label: "Giày dép nữ", thuong: 16.5, mall: 17.0 },
  { label: "Giày dép nam", thuong: 16.5, mall: 17.0 },
  { label: "Túi ví nữ", thuong: 16.5, mall: 17.0 },
  { label: "Túi ví nam", thuong: 16.5, mall: 17.0 },
  { label: "Phụ kiện thời trang", thuong: 16.5, mall: 17.0 },
  { label: "Làm đẹp / Chăm sóc cá nhân", thuong: 16.5, mall: 17.0 },
  { label: "Đồ chơi trẻ em", thuong: 15.5, mall: 17.0 },
  { label: "Nhà cửa & Đời sống", thuong: 10.0, mall: 12.0 },
  { label: "Thể thao & Du lịch", thuong: 10.0, mall: 12.0 },
  { label: "Thực phẩm & Đồ uống", thuong: 10.0, mall: 12.0 },
  { label: "Điện gia dụng", thuong: 5.5, mall: 7.0 },
  { label: "Điện thoại & Phụ kiện", thuong: 3.0, mall: 4.5 },
  { label: "Máy tính & Laptop", thuong: 3.0, mall: 4.5 },
  { label: "Thiết Bị Âm Thanh - Dàn âm thanh - Khác", thuong: 16.7, mall: 18.0 },
  { label: "Khác", thuong: 15.5, mall: 17.0 },
];

type FeeItem = {
  key: string; label: string; pct: number; amount: number;
  maxAmount: number; editable: boolean; isFixed: boolean; locked: boolean;
};

const FEE_DEFS: { key: string; label: string; defaultPct: number; amount: number; maxAmount: number; editable: boolean; isFixed: boolean; locked: boolean }[] = [
  { key: "thanh_toan",  label: "Phí thanh toán",                             defaultPct: 6,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "co_dinh",     label: "Phí cố định",                                defaultPct: 15.5, amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: true  },
  { key: "content",     label: "Content Xtra (MAX 50K)",                      defaultPct: 0,    amount: 0,     maxAmount: 50000, editable: true,  isFixed: false, locked: false },
  { key: "thue",        label: "Thuế",                                        defaultPct: 1.5,  amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "ma_giam_gia", label: "Mã giảm giá",                                defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "combo",       label: "Combo / Deal sốc",                            defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "voucher",     label: "Phí voucher xtra (MAX 50K)",                  defaultPct: 5.5,  amount: 0,     maxAmount: 50000, editable: true,  isFixed: false, locked: false },
  { key: "ho_tro_vc",   label: "Phí DVHT ưu đãi phí vận chuyển (MAX 50K)",   defaultPct: 0,    amount: 0,     maxAmount: 50000, editable: true,  isFixed: false, locked: false },
  { key: "hoan_huy",    label: "Phí hoàn / huỷ",                             defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "nhan_su",     label: "Phí nhân sự + mặt bằng",                     defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "dong_goi",    label: "Phí đóng gói",                               defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "quang_cao",   label: "Quảng cáo",                                  defaultPct: 7,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: false, locked: false },
  { key: "piship",      label: "Phí Piship",                                 defaultPct: 0,    amount: 2700,  maxAmount: 0,     editable: true,  isFixed: true,  locked: false },
  { key: "van_chuyen",  label: "Phí vận chuyển tạm tính / 1 đơn",            defaultPct: 0,    amount: 0,     maxAmount: 0,     editable: true,  isFixed: true,  locked: false },
  { key: "nen_tang",    label: "Phí nền tảng",                               defaultPct: 0,    amount: 3000,  maxAmount: 0,     editable: true,  isFixed: true,  locked: false },
];

function makeFees(coDinhPct: number): FeeItem[] {
  return FEE_DEFS.map(d => ({
    key: d.key, label: d.label, maxAmount: d.maxAmount,
    editable: d.editable, isFixed: d.isFixed, locked: d.locked,
    pct: d.key === "co_dinh" ? coDinhPct : d.defaultPct,
    amount: d.amount,
  }));
}

type Product = { sku: string; giaNhap: number; giaThanh: number };
type KhoProduct = { id: string; ten: string; sku: string; giaNhap: number };
type PriceRow = { id: string; ten: string; sku: string; giaNhap: number; flashSalePct: string; ngaySalePct: string; livePct: string };

function fmtVnd(n: number) { return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }); }

export default function GiaBanPage() {
  const [mainTab, setMainTab] = useState<"calculator" | "quantri">("calculator");
  const [shopType, setShopType] = useState<"thuong" | "mall">("thuong");
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [giaNhap, setGiaNhap] = useState("");
  const [giaBan, setGiaBan] = useState("");
  const [showFees, setShowFees] = useState(false);
  const [fees, setFees] = useState<FeeItem[]>(() => makeFees(CATEGORIES[0].thuong));

  const [markupPct, setMarkupPct] = useState("40");

  // Bảng giá kho
  const [priceRows, setPriceRows] = useState<PriceRow[]>([]);
  const [loadingKho, setLoadingKho] = useState(false);
  const [searchBang, setSearchBang] = useState("");

  const fetchKho = useCallback(async () => {
    setLoadingKho(true);
    try {
      const res = await fetch("/api/kho/san-pham");
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setPriceRows(prev => {
        const map = Object.fromEntries(prev.map(r => [r.id, r]));
        return (data as KhoProduct[]).map(p => map[p.id] ?? { id: p.id, ten: p.ten, sku: p.sku, giaNhap: p.giaNhap, flashSalePct: "", ngaySalePct: "", livePct: "" });
      });
    } catch { /* ignore */ } finally { setLoadingKho(false); }
  }, []);

  useEffect(() => { fetchKho(); }, [fetchKho]);

  // Tự động cập nhật khi quay lại tab
  useEffect(() => {
    const onFocus = () => fetchKho();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchKho]);

  const calcShopeePrice = (giaNhap: number) => {
    const m = parseFloat(markupPct) || 0;
    if (giaNhap <= 0 || m <= 0 || m >= 100) return 0;
    return Math.round(giaNhap / (m / 100));
  };

  const calcLoiNhuan = (giaNhap: number) => {
    const gB = calcShopeePrice(giaNhap);
    if (gB <= 0) return null;
    let tp = 0;
    for (const f of fees) {
      if (f.isFixed) { tp += f.amount; }
      else { let v = (f.pct / 100) * gB; if (f.maxAmount > 0) v = Math.min(v, f.maxAmount); tp += v; }
    }
    return { loiNhuan: gB - giaNhap - tp, tongPhi: tp, gB };
  };

  // Bulk global % inputs
  const [bulkFlash, setBulkFlash] = useState("");
  const [bulkNgay, setBulkNgay] = useState("");
  const [bulkLive, setBulkLive] = useState("");

  const updatePriceRow = (id: string, field: keyof Pick<PriceRow, "flashSalePct" | "ngaySalePct" | "livePct">, val: string) => {
    setPriceRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const moveRow = (id: string, dir: -1 | 1) => {
    setPriceRows(prev => {
      const idx = prev.findIndex(r => r.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr;
    });
  };

  const sortByPrice = () => {
    setPriceRows(prev => [
      ...prev.filter(r => r.giaNhap > 0),
      ...prev.filter(r => r.giaNhap <= 0),
    ]);
  };

  const applyBulk = () => {
    setPriceRows(prev => prev.map(r => ({
      ...r,
      ...(bulkFlash !== "" ? { flashSalePct: bulkFlash } : {}),
      ...(bulkNgay  !== "" ? { ngaySalePct:  bulkNgay  } : {}),
      ...(bulkLive  !== "" ? { livePct:       bulkLive  } : {}),
    })));
  };

  const filteredRows = useMemo(() =>
    priceRows.filter(r =>
      !searchBang ||
      r.ten.toLowerCase().includes(searchBang.toLowerCase()) ||
      r.sku.toLowerCase().includes(searchBang.toLowerCase())
    ), [priceRows, searchBang]);

  // Google Sheets
  const [sheetUrl, setSheetUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [selectedSku, setSelectedSku] = useState("");

  const cat = CATEGORIES[categoryIdx];

  function handleShopOrCat(newShop: "thuong" | "mall", newCatIdx: number) {
    const c = CATEGORIES[newCatIdx];
    const pct = newShop === "mall" ? c.mall : c.thuong;
    setFees(f => f.map(x => x.key === "co_dinh" ? { ...x, pct } : x));
  }

  function updateFee(key: string, value: string) {
    setFees(f => f.map(x => {
      if (x.key !== key) return x;
      return x.isFixed ? { ...x, amount: parseFloat(value) || 0 } : { ...x, pct: parseFloat(value) || 0 };
    }));
  }

  function resetFees() {
    const pct = shopType === "mall" ? cat.mall : cat.thuong;
    setFees(makeFees(pct));
  }

  const suggestedPrice = useMemo(() => {
    const n = parseFloat(giaNhap) || 0;
    const m = parseFloat(markupPct) || 0;
    if (n <= 0 || m <= 0 || m >= 100) return 0;
    return Math.round(n / (m / 100));
  }, [giaNhap, markupPct]);

  // Tính toán
  const gN = parseFloat(giaNhap) || 0;
  const gB = parseFloat(giaBan) || 0;
  const ratio = parseFloat(markupPct) || 0;
  // Giá bán hiệu lực: nhập tay > đề xuất > dùng 100k làm tham chiếu %
  const effectiveGB = gB > 0 ? gB : suggestedPrice > 0 ? suggestedPrice : (ratio > 0 && ratio < 100 ? Math.round(100000 / (ratio / 100)) : 0);
  const isEstimate = gB === 0 && gN === 0; // đang dùng giá tham chiếu
  const ready = effectiveGB > 0;
  const effectiveGN = gN > 0 ? gN : (ratio > 0 && ratio < 100 ? effectiveGB * (ratio / 100) : 0);

  const { tongPhi, pctPhi, loiNhuan, pctLN } = useMemo(() => {
    if (!ready) return { tongPhi: 0, pctPhi: 0, loiNhuan: 0, pctLN: 0 };
    let tp = 0;
    for (const f of fees) {
      if (f.isFixed) { tp += f.amount; }
      else { let v = (f.pct / 100) * effectiveGB; if (f.maxAmount > 0) v = Math.min(v, f.maxAmount); tp += v; }
    }
    const ln = effectiveGB - effectiveGN - tp;
    return { tongPhi: tp, pctPhi: (tp / effectiveGB) * 100, loiNhuan: ln, pctLN: (ln / effectiveGB) * 100 };
  }, [fees, effectiveGN, effectiveGB, ready]);

  // Import Google Sheets
  async function handleImport() {
    if (!sheetUrl.trim()) return;
    setLoadingSheet(true); setSheetError("");
    try {
      const res = await fetch("/api/gia-ban/import-sheet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setSheetError(data.error ?? "Lỗi"); return; }
      setProducts(data.products);
      setSelectedSku("");
    } catch { setSheetError("Không kết nối được"); }
    finally { setLoadingSheet(false); }
  }

  function handleSelectProduct(sku: string) {
    setSelectedSku(sku);
    const p = products.find(x => x.sku === sku);
    if (p) setGiaNhap(String(p.giaNhap));
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5" style={{ fontSize: "120%" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calculator size={22} className="text-rose-500" /> Cấu trúc chi phí
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tính lợi nhuận sau khi trừ các loại phí Shopee, và quản trị cấu trúc giá niêm yết</p>
        </div>
      </div>

      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setMainTab("calculator")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mainTab === "calculator" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Tính giá bán sản phẩm
        </button>
        <button onClick={() => setMainTab("quantri")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mainTab === "quantri" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Quản trị giá
        </button>
      </div>

      {mainTab === "calculator" && (
      <>
      {/* ── CALCULATOR ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Inputs */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex gap-4 flex-wrap items-end">
            {/* Shop + Ngành */}
            <div className="flex flex-col gap-2 w-56">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Loại shop</label>
                <select value={shopType}
                  onChange={e => { const v = e.target.value as "thuong"|"mall"; setShopType(v); handleShopOrCat(v, categoryIdx); }}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="thuong">Shop Thường</option>
                  <option value="mall">Shop Mall</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">
                  Ngành hàng <span className="text-yellow-600 font-bold">(Phí CĐ: {shopType === "mall" ? cat.mall : cat.thuong}%)</span>
                </label>
                <select value={categoryIdx}
                  onChange={e => { const v = Number(e.target.value); setCategoryIdx(v); handleShopOrCat(shopType, v); }}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300">
                  {CATEGORIES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Giá nhập */}
            <div className="w-44">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Giá nhập (đ)</label>
              <input type="number" placeholder="0" value={giaNhap}
                onChange={e => setGiaNhap(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>

            {/* Giá bán */}
            <div className="w-44">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Giá bán (đ)</label>
              <input type="number" placeholder="0" value={giaBan}
                onChange={e => setGiaBan(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
            </div>

            {/* Giá bán đề xuất */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Tỉ lệ cost (Giá nhập / Giá bán)</label>
              <div className="flex items-center gap-1.5">
                <input type="number" step="10" value={markupPct}
                  onChange={e => setMarkupPct(e.target.value)}
                  className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-2 text-right focus:outline-none focus:ring-2 focus:ring-rose-300" />
                <span className="text-xs text-slate-400">%</span>
                {suggestedPrice > 0 && (
                  <button type="button"
                    onClick={() => setGiaBan(String(suggestedPrice))}
                    className="text-xs px-2.5 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 rounded-lg transition font-mono whitespace-nowrap">
                    {fmtVnd(suggestedPrice)}đ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kết quả */}
        <div className="grid grid-cols-4 divide-x divide-slate-100">
          <div className="px-5 py-3 text-center">
            <div className="text-xs text-slate-500 mb-1 flex items-center justify-center gap-1">
              TỔNG PHÍ {isEstimate && <span className="text-[10px] bg-amber-100 text-amber-600 px-1 rounded">~ước tính</span>}
            </div>
            <div className="text-lg font-bold text-red-500">{ready ? fmtVnd(tongPhi) + "đ" : "—"}</div>
            <div className="text-xs text-slate-400">{ready ? pctPhi.toFixed(2) + "% giá bán" : ""}</div>
          </div>
          <div className="px-5 py-3 text-center">
            <div className="text-xs text-slate-500 mb-1">LỢI NHUẬN</div>
            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${!ready ? "text-slate-300" : loiNhuan >= 0 ? "text-green-600" : "text-red-600"}`}>
              {ready && (loiNhuan >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>)}
              {ready ? fmtVnd(loiNhuan) + "đ" : "—"}
            </div>
            <div className={`text-xs font-semibold ${!ready ? "" : pctLN < 0 ? "text-red-400" : pctLN < 10 ? "text-orange-400" : "text-green-500"}`}>
              {ready ? pctLN.toFixed(2) + "% LN" : ""}
            </div>
          </div>
          <div className="px-5 py-3 text-center">
            <div className="text-xs text-slate-500 mb-1">% PHÍ / GIÁ BÁN</div>
            <div className={`text-lg font-bold ${!ready ? "text-slate-300" : pctPhi > 50 ? "text-red-600" : pctPhi > 35 ? "text-orange-500" : "text-slate-700"}`}>
              {ready ? pctPhi.toFixed(2) + "%" : "—"}
            </div>
          </div>
          <button onClick={() => setShowFees(v => !v)}
            className="px-5 py-3 text-center hover:bg-slate-50 transition">
            <div className="text-xs text-slate-500 mb-1">CÁC LOẠI PHÍ</div>
            <div className="flex items-center justify-center gap-1 text-sm text-rose-500 font-medium">
              {showFees ? <><ChevronUp size={14}/> Ẩn</> : <><ChevronDown size={14}/> Xem & chỉnh</>}
            </div>
          </button>
        </div>

        {/* Bảng phí */}
        {showFees && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Các loại phí</span>
              <button onClick={resetFees} className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition">
                <RotateCcw size={11}/> Đặt lại mặc định
              </button>
            </div>
            <div className="grid grid-cols-[1fr_80px_40px_90px] text-xs font-semibold text-slate-400 pb-1 border-b border-slate-200 mb-1">
              <span>Loại phí</span><span className="text-right">Giá trị</span><span className="text-center">Đv</span><span className="text-right">Thành tiền</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6">
              {fees.map(f => {
                const amt = f.isFixed ? f.amount : (() => { let v = (f.pct / 100) * effectiveGB; return f.maxAmount > 0 ? Math.min(v, f.maxAmount) : v; })();
                return (
                  <div key={f.key} className="grid grid-cols-[1fr_80px_40px_90px] items-center py-1 border-b border-slate-100 text-xs">
                    <span className={f.key === "co_dinh" || f.key === "quang_cao" ? "font-bold text-slate-700" : "text-slate-600"}>{f.label}</span>
                    <input type="number" step="0.1" value={f.isFixed ? f.amount : f.pct}
                      onChange={e => updateFee(f.key, e.target.value)}
                      className="w-full text-right border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-300 bg-white text-xs" />
                    <span className="text-center text-slate-400">{f.isFixed ? "đ" : "%"}</span>
                    <span className={`text-right font-mono ${amt > 0 && ready ? "text-slate-700" : "text-slate-300"}`}>
                      {ready ? fmtVnd(amt) + "đ" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            {ready && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-700">
                <span>TỔNG PHÍ</span>
                <span className="text-red-500">{fmtVnd(tongPhi)}đ  ({pctPhi.toFixed(2)}%)</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── GOOGLE SHEETS ──────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={18} className="text-green-600" />
          <h2 className="font-semibold text-slate-700">Lấy giá từ Google Sheets</h2>
        </div>

        {/* URL input */}
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="Dán link Google Sheets vào đây..."
            value={sheetUrl} onChange={e => setSheetUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleImport()}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300" />
          <button onClick={handleImport} disabled={loadingSheet || !sheetUrl.trim()}
            className="text-sm px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap">
            {loadingSheet ? "Đang tải..." : "Tải dữ liệu"}
          </button>
        </div>

        {sheetError && <p className="text-xs text-red-500 mb-3">{sheetError}</p>}

        {/* Product dropdown */}
        {products.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1.5 block">
              Chọn sản phẩm ({products.length} mã) — giá nhập sẽ tự điền lên trên
            </label>
            <select value={selectedSku} onChange={e => handleSelectProduct(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-300">
              <option value="">-- Chọn mã SKU --</option>
              {products.map(p => (
                <option key={p.sku} value={p.sku}>
                  {p.sku}  ·  Giá xuất: {fmtVnd(p.giaNhap)}đ
                </option>
              ))}
            </select>
            {selectedSku && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                ✓ Đã điền giá nhập: {fmtVnd(parseFloat(giaNhap) || 0)}đ
              </p>
            )}
          </div>
        )}

        {products.length === 0 && !sheetError && (
          <p className="text-xs text-slate-400">Dán link Google Sheets rồi nhấn "Tải dữ liệu" để lấy danh sách sản phẩm.</p>
        )}
      </div>

      {/* ── BẢNG GIÁ SẢN PHẨM ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <List size={18} className="text-rose-500 shrink-0" />
            <h2 className="font-semibold text-slate-700">Bảng giá sản phẩm</h2>
            <span className="text-xs text-slate-400 ml-1">· Giá Shopee/TikTok = Giá nhập ÷ {markupPct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text" placeholder="Tìm tên / SKU..."
              value={searchBang} onChange={e => setSearchBang(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button onClick={sortByPrice}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition font-medium">
              <ArrowUpDown size={13} />
              Giá đủ lên trước
            </button>
            <button onClick={fetchKho} disabled={loadingKho}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50">
              <RefreshCw size={13} className={loadingKho ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>

        {/* ── BULK ROW ── */}
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-amber-700 shrink-0">Áp dụng cho tất cả SKU:</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-orange-500 font-medium w-20">Flash Sale</span>
            <input type="number" placeholder="%" min={0} max={99} value={bulkFlash}
              onChange={e => setBulkFlash(e.target.value)}
              className="w-16 text-center text-sm border border-orange-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-300 text-orange-600 font-bold placeholder:text-slate-300 bg-white" />
            <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-blue-500 font-medium w-20">Ngày Sale</span>
            <input type="number" placeholder="%" min={0} max={99} value={bulkNgay}
              onChange={e => setBulkNgay(e.target.value)}
              className="w-16 text-center text-sm border border-blue-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-blue-600 font-bold placeholder:text-slate-300 bg-white" />
            <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-purple-500 font-medium w-14">Live</span>
            <input type="number" placeholder="%" min={0} max={99} value={bulkLive}
              onChange={e => setBulkLive(e.target.value)}
              className="w-16 text-center text-sm border border-purple-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-300 text-purple-600 font-bold placeholder:text-slate-300 bg-white" />
            <span className="text-xs text-slate-400">%</span>
          </div>
          <button onClick={applyBulk}
            className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition">
            Cập nhật tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Tên sản phẩm</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Giá nhập</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1">SKU <span className="text-[10px] font-normal text-slate-300">↕ thứ tự</span></div>
                </th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-rose-500">Giá Shopee / TikTok</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-green-600">Lợi nhuận</th>
                <th className="text-center px-3 py-2.5 text-xs font-medium text-orange-500">Flash Sale</th>
                <th className="text-center px-3 py-2.5 text-xs font-medium text-blue-500">Ngày Sale</th>
                <th className="text-center px-3 py-2.5 text-xs font-medium text-purple-500">Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400 text-sm">
                  {loadingKho ? "Đang tải..." : "Không có sản phẩm"}
                </td></tr>
              )}
              {filteredRows.map((r, i) => {
                const realIdx = priceRows.findIndex(x => x.id === r.id);
                const shopee = calcShopeePrice(r.giaNhap);
                const flashPrice = shopee > 0 && parseFloat(r.flashSalePct) > 0 ? Math.round(shopee * (1 - parseFloat(r.flashSalePct) / 100)) : 0;
                const ngayPrice  = shopee > 0 && parseFloat(r.ngaySalePct)  > 0 ? Math.round(shopee * (1 - parseFloat(r.ngaySalePct)  / 100)) : 0;
                const livePrice  = shopee > 0 && parseFloat(r.livePct)      > 0 ? Math.round(shopee * (1 - parseFloat(r.livePct)      / 100)) : 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium max-w-[180px] truncate" title={r.ten}>{r.ten}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600 text-xs">{fmtVnd(r.giaNhap)}đ</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveRow(r.id, -1)} disabled={realIdx === 0}
                            className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-slate-600 transition">
                            <ArrowUp size={11} />
                          </button>
                          <button onClick={() => moveRow(r.id, 1)} disabled={realIdx === priceRows.length - 1}
                            className="p-0.5 rounded hover:bg-slate-200 disabled:opacity-20 disabled:cursor-not-allowed text-slate-400 hover:text-slate-600 transition">
                            <ArrowDown size={11} />
                          </button>
                        </div>
                        <span className="font-mono text-xs text-slate-400">{r.sku}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-bold text-sm ${shopee > 0 ? "text-rose-600" : "text-slate-300"}`}>
                        {shopee > 0 ? fmtVnd(shopee) + "đ" : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {(() => {
                        const calc = calcLoiNhuan(r.giaNhap);
                        if (!calc) return <span className="text-slate-300">—</span>;
                        const pct = ((calc.loiNhuan / calc.gB) * 100).toFixed(1);
                        return (
                          <div>
                            <span className={`font-bold text-sm ${calc.loiNhuan >= 0 ? "text-green-600" : "text-red-500"}`}>
                              {fmtVnd(calc.loiNhuan)}đ
                            </span>
                            <div className={`text-xs ${calc.loiNhuan >= 0 ? "text-green-400" : "text-red-400"}`}>{pct}%</div>
                          </div>
                        );
                      })()}
                    </td>
                    {/* Flash Sale */}
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <input type="number" placeholder="%" min={0} max={99}
                          value={r.flashSalePct}
                          onChange={e => updatePriceRow(r.id, "flashSalePct", e.target.value)}
                          className="w-12 text-center text-xs border border-orange-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-orange-300 text-orange-500 placeholder:text-slate-300 bg-orange-50" />
                        <span className="text-[10px] text-slate-400">%</span>
                      </div>
                      <div className={`text-sm font-bold ${flashPrice > 0 ? "text-orange-500" : "text-slate-200"}`}>
                        {flashPrice > 0 ? fmtVnd(flashPrice) + "đ" : "—"}
                      </div>
                    </td>
                    {/* Ngày Sale */}
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <input type="number" placeholder="%" min={0} max={99}
                          value={r.ngaySalePct}
                          onChange={e => updatePriceRow(r.id, "ngaySalePct", e.target.value)}
                          className="w-12 text-center text-xs border border-blue-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 text-blue-500 placeholder:text-slate-300 bg-blue-50" />
                        <span className="text-[10px] text-slate-400">%</span>
                      </div>
                      <div className={`text-sm font-bold ${ngayPrice > 0 ? "text-blue-500" : "text-slate-200"}`}>
                        {ngayPrice > 0 ? fmtVnd(ngayPrice) + "đ" : "—"}
                      </div>
                    </td>
                    {/* Live */}
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5 mb-1">
                        <input type="number" placeholder="%" min={0} max={99}
                          value={r.livePct}
                          onChange={e => updatePriceRow(r.id, "livePct", e.target.value)}
                          className="w-12 text-center text-xs border border-purple-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-300 text-purple-500 placeholder:text-slate-300 bg-purple-50" />
                        <span className="text-[10px] text-slate-400">%</span>
                      </div>
                      <div className={`text-sm font-bold ${livePrice > 0 ? "text-purple-500" : "text-slate-200"}`}>
                        {livePrice > 0 ? fmtVnd(livePrice) + "đ" : "—"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            {filteredRows.length} sản phẩm · Giá Shopee/TikTok = Giá nhập ÷ {markupPct}% · Flash Sale / Ngày Sale / Live = % giảm so với giá Shopee
          </div>
        )}
      </div>
      </>
      )}

      {mainTab === "quantri" && <QuanTriGiaTab />}
    </div>
  );
}

// ─── TAB: Quản trị giá — cấu trúc giá niêm yết theo cộng dồn chi phí ─────────
type QuanTriChild = { key: string; label: string; pct: string }; // pct = % trong phạm vi % của mục cha
type QuanTriField = { key: string; label: string; pct: string; children: QuanTriChild[] };

const QUANTRI_DEFS: { key: string; label: string; defaultPct: string }[] = [
  { key: "loiNhuan",  label: "Lợi nhuận mong muốn",        defaultPct: "20" },
  { key: "khauHao",   label: "Khấu hao tài sản cố định",    defaultPct: "0" },
  { key: "quanLy",    label: "Chi phí quản lý",             defaultPct: "0" },
  { key: "vanChuyen", label: "Chi phí vận chuyển",          defaultPct: "0" },
  { key: "banHang",   label: "Chi phí bán hàng",            defaultPct: "0" },
  { key: "mkt",       label: "Chi phí MKT",                 defaultPct: "0" },
];

function QuanTriGiaTab() {
  const [mode, setMode] = useState<"von" | "ban">("von");
  const [giaVon, setGiaVon] = useState("");
  const [giaNiemYetInput, setGiaNiemYetInput] = useState("");
  const [giaVonPct, setGiaVonPct] = useState("50");
  const [fields, setFields] = useState<QuanTriField[]>(
    () => QUANTRI_DEFS.map(d => ({ key: d.key, label: d.label, pct: d.defaultPct, children: [] }))
  );
  const [newLabel, setNewLabel] = useState("");
  const [showDoanhThuTest, setShowDoanhThuTest] = useState(false);
  const [doanhThuTest, setDoanhThuTest] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newChildLabel, setNewChildLabel] = useState<Record<string, string>>({});

  const toggleExpand = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const addChild = (parentKey: string) => {
    const label = (newChildLabel[parentKey] ?? "").trim();
    if (!label) return;
    const key = "child_" + Date.now();
    setFields(prev => prev.map(f => f.key === parentKey ? { ...f, children: [...f.children, { key, label, pct: "0" }] } : f));
    setNewChildLabel(prev => ({ ...prev, [parentKey]: "" }));
    setExpanded(prev => new Set(prev).add(parentKey));
  };

  const updateChildPct = (parentKey: string, childKey: string, val: string) =>
    setFields(prev => prev.map(f => f.key === parentKey
      ? { ...f, children: f.children.map(c => c.key === childKey ? { ...c, pct: val } : c) }
      : f));

  const removeChild = (parentKey: string, childKey: string) =>
    setFields(prev => prev.map(f => f.key === parentKey
      ? { ...f, children: f.children.filter(c => c.key !== childKey) }
      : f));

  const giaVonNum = Number(giaVon) || 0;
  const giaNiemYetNum = Number(giaNiemYetInput) || 0;
  const baseNum = mode === "von" ? giaVonNum : giaNiemYetNum;
  const doanhThuTestNum = Number(doanhThuTest) || 0;

  const rows = fields.map(f => {
    const amount = baseNum * (Number(f.pct) || 0) / 100;
    const amountTest = doanhThuTestNum * (Number(f.pct) || 0) / 100;
    const childrenRows = f.children.map(c => ({
      ...c,
      amount: amount * (Number(c.pct) || 0) / 100,
      amountTest: amountTest * (Number(c.pct) || 0) / 100,
    }));
    const tongPctCon = f.children.reduce((s, c) => s + (Number(c.pct) || 0), 0);
    return { ...f, amount, amountTest, childrenRows, tongPctCon, conLaiPctCon: 100 - tongPctCon };
  });
  const tongChiPhi = rows.reduce((s, r) => s + r.amount, 0);

  // Chế độ "von": Giá niêm yết = Giá vốn + tổng chi phí (cộng dồn)
  const giaNiemYetTinh = giaVonNum + tongChiPhi;

  // Chế độ "ban": Giá niêm yết cố định = 100%, Giá vốn cũng là 1 dòng %, phần dư tự cân đối
  const giaVonAmount = giaNiemYetNum * (Number(giaVonPct) || 0) / 100;
  const giaVonAmountTest = doanhThuTestNum * (Number(giaVonPct) || 0) / 100;
  const tongPct = (Number(giaVonPct) || 0) + rows.reduce((s, r) => s + (Number(r.pct) || 0), 0);
  const conLaiPct = 100 - tongPct;
  const conLaiAmount = giaNiemYetNum * conLaiPct / 100;
  const conLaiAmountTest = doanhThuTestNum * conLaiPct / 100;

  const updatePct = (key: string, val: string) =>
    setFields(prev => prev.map(f => f.key === key ? { ...f, pct: val } : f));

  const removeField = (key: string) =>
    setFields(prev => prev.filter(f => f.key !== key));

  const addField = () => {
    const label = newLabel.trim();
    if (!label) return;
    const key = "custom_" + Date.now();
    setFields(prev => [...prev, { key, label, pct: "0", children: [] }]);
    setNewLabel("");
  };

  const resetAll = () => {
    if (!confirm("Đặt lại toàn bộ về mặc định?")) return;
    setGiaVon("");
    setGiaNiemYetInput("");
    setGiaVonPct("50");
    setFields(QUANTRI_DEFS.map(d => ({ key: d.key, label: d.label, pct: d.defaultPct, children: [] })));
    setNewLabel("");
    setShowDoanhThuTest(false);
    setDoanhThuTest("");
    setExpanded(new Set());
    setNewChildLabel({});
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-end gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600 mb-1.5 block">
              {mode === "von" ? "Giá vốn (đ)" : "Giá niêm yết (đ) — cố định 100%"}
            </label>
            <input
              type="number" min={0}
              value={mode === "von" ? giaVon : giaNiemYetInput}
              onChange={e => mode === "von" ? setGiaVon(e.target.value) : setGiaNiemYetInput(e.target.value)}
              placeholder="0"
              className="w-64 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setMode("von")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${mode === "von" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}>
              Cố định Giá vốn
            </button>
            <button onClick={() => setMode("ban")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${mode === "ban" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"}`}>
              Cố định Giá niêm yết (100%)
            </button>
          </div>
        </div>
        <button onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition">
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {mode === "ban" && (
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60">
          {!showDoanhThuTest ? (
            <button onClick={() => setShowDoanhThuTest(true)}
              className="text-sm text-rose-500 hover:underline font-medium">
              + Test theo doanh thu thực tế khác
            </button>
          ) : (
            <div className="flex items-end gap-3">
              <div>
                <label className="text-sm font-medium text-slate-600 mb-1.5 block">Doanh thu test (đ)</label>
                <input
                  type="number" min={0} value={doanhThuTest}
                  onChange={e => setDoanhThuTest(e.target.value)}
                  placeholder="0"
                  className="w-64 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
              <button onClick={() => { setShowDoanhThuTest(false); setDoanhThuTest(""); }}
                className="text-sm text-slate-400 hover:text-red-500 px-2 py-2.5">Bỏ</button>
              <p className="text-xs text-slate-400 pb-3">Áp dụng cùng % cấu trúc bên dưới vào số doanh thu này, để xem từng khoản tốn bao nhiêu mà không đổi Giá niêm yết chính.</p>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 text-slate-500 font-medium">Khoản mục</th>
              <th className="text-right py-2 text-slate-500 font-medium w-32">{mode === "von" ? "% / Giá vốn" : "% / Giá niêm yết"}</th>
              <th className="text-right py-2 text-slate-500 font-medium w-40">Số tiền (đ)</th>
              {mode === "ban" && showDoanhThuTest && (
                <th className="text-right py-2 text-amber-600 font-medium w-40">Theo DT test (đ)</th>
              )}
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-2.5 font-medium text-slate-700">Giá vốn</td>
              <td className="py-2.5 text-right">
                {mode === "von" ? (
                  <span className="text-slate-400">—</span>
                ) : (
                  <>
                    <input
                      type="number" min={0} value={giaVonPct}
                      onChange={e => setGiaVonPct(e.target.value)}
                      className="w-20 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    /> %
                  </>
                )}
              </td>
              <td className="py-2.5 text-right font-semibold text-slate-800">
                {fmtVnd(mode === "von" ? giaVonNum : giaVonAmount)}đ
              </td>
              {mode === "ban" && showDoanhThuTest && (
                <td className="py-2.5 text-right font-semibold text-amber-600">{fmtVnd(giaVonAmountTest)}đ</td>
              )}
              <td></td>
            </tr>
            {rows.map(r => {
              const isOpen = expanded.has(r.key);
              const extraCols = mode === "ban" && showDoanhThuTest;
              return (
              <Fragment key={r.key}>
              <tr className="group">
                <td className="py-2.5 text-slate-600">
                  <button onClick={() => toggleExpand(r.key)} title="Thêm/xem mục con"
                    className="inline-flex items-center justify-center w-5 h-5 mr-1.5 rounded text-rose-500 hover:bg-rose-50 font-bold text-[13px] align-middle">
                    {isOpen ? "−" : "+"}
                  </button>
                  {r.label}
                  {r.children.length > 0 && <span className="text-[11px] text-slate-400 ml-1">({r.children.length} mục con)</span>}
                </td>
                <td className="py-2.5 text-right">
                  <input
                    type="number" min={0} value={r.pct}
                    onChange={e => updatePct(r.key, e.target.value)}
                    className="w-20 text-right border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  /> %
                </td>
                <td className="py-2.5 text-right font-medium text-slate-700">{fmtVnd(r.amount)}đ</td>
                {extraCols && (
                  <td className="py-2.5 text-right font-medium text-amber-600">{fmtVnd(r.amountTest)}đ</td>
                )}
                <td className="py-2.5 text-right">
                  <button onClick={() => removeField(r.key)} title="Xoá khoản mục"
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-1">✕</button>
                </td>
              </tr>
              {isOpen && (
                <>
                  {r.childrenRows.map(c => (
                    <tr key={c.key} className="bg-slate-50/60 group">
                      <td className="py-2 pl-8 text-slate-500 text-[13px]">
                        <span className="text-slate-300 mr-1.5">-</span>{c.label}
                      </td>
                      <td className="py-2 text-right">
                        <input
                          type="number" min={0} value={c.pct}
                          onChange={e => updateChildPct(r.key, c.key, e.target.value)}
                          className="w-16 text-right border border-slate-200 rounded-lg px-1.5 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        /> <span className="text-[11px] text-slate-400">% của mục</span>
                      </td>
                      <td className="py-2 text-right text-[13px] text-slate-600">{fmtVnd(c.amount)}đ</td>
                      {extraCols && <td className="py-2 text-right text-[13px] text-amber-500">{fmtVnd(c.amountTest)}đ</td>}
                      <td className="py-2 text-right">
                        <button onClick={() => removeChild(r.key, c.key)} title="Xoá mục con"
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition px-1 text-[13px]">✕</button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/60">
                    <td colSpan={extraCols ? 5 : 4} className="py-1.5 pl-8">
                      <div className="flex items-center gap-2">
                        <input
                          type="text" value={newChildLabel[r.key] ?? ""}
                          onChange={e => setNewChildLabel(prev => ({ ...prev, [r.key]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addChild(r.key); } }}
                          placeholder="Tên mục con..."
                          className="flex-1 max-w-[200px] border border-dashed border-slate-300 rounded-lg px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                        />
                        <button onClick={() => addChild(r.key)}
                          className="px-2.5 py-1 bg-rose-400 hover:bg-rose-500 text-white text-[13px] rounded-lg transition font-medium">
                          + Mục con
                        </button>
                        {r.children.length > 0 && (
                          <span className={`text-[12px] font-medium ${r.conLaiPctCon < 0 ? "text-red-500" : r.conLaiPctCon === 0 ? "text-emerald-500" : "text-amber-500"}`}>
                            Đã chia {r.tongPctCon}% / 100% mục — còn lại {r.conLaiPctCon}%
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                </>
              )}
              </Fragment>
              );
            })}
            <tr>
              <td colSpan={mode === "ban" && showDoanhThuTest ? 5 : 4} className="py-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="text" value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addField(); } }}
                    placeholder="Tên khoản mục mới..."
                    className="flex-1 max-w-xs border border-dashed border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <button onClick={addField}
                    className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-sm rounded-lg transition font-medium">
                    + Thêm mục
                  </button>
                </div>
              </td>
            </tr>
            {mode === "ban" && (
              <tr>
                <td className={`py-2.5 font-medium ${conLaiPct < 0 ? "text-red-600" : "text-amber-600"}`}>Còn lại (chưa phân bổ)</td>
                <td className={`py-2.5 text-right font-semibold ${conLaiPct < 0 ? "text-red-600" : "text-amber-600"}`}>{conLaiPct.toFixed(1)}%</td>
                <td className={`py-2.5 text-right font-semibold ${conLaiPct < 0 ? "text-red-600" : "text-amber-600"}`}>{fmtVnd(conLaiAmount)}đ</td>
                {showDoanhThuTest && (
                  <td className={`py-2.5 text-right font-semibold ${conLaiPct < 0 ? "text-red-600" : "text-amber-600"}`}>{fmtVnd(conLaiAmountTest)}đ</td>
                )}
                <td></td>
              </tr>
            )}
            <tr className="border-t-2 border-slate-200">
              <td className="py-3 font-bold text-slate-800">Giá niêm yết</td>
              <td></td>
              <td className="py-3 text-right font-bold text-rose-600 text-lg">
                {fmtVnd(mode === "von" ? giaNiemYetTinh : giaNiemYetNum)}đ
              </td>
              {mode === "ban" && showDoanhThuTest && (
                <td className="py-3 text-right font-bold text-amber-600 text-lg">{fmtVnd(doanhThuTestNum)}đ</td>
              )}
              <td></td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-slate-400 mt-3">
          {mode === "von"
            ? "Giá niêm yết = Giá vốn + tổng các khoản chi phí (mỗi khoản tính theo % của Giá vốn)."
            : "Giá niêm yết cố định = 100%. Mỗi khoản (gồm Giá vốn) là % của Giá niêm yết — \"Còn lại\" tự cân đối khi tổng % chưa đủ 100%."}
        </p>
      </div>
    </div>
  );
}
