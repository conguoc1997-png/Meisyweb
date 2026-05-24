"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp, RotateCcw, FileSpreadsheet, Calculator, TrendingUp, TrendingDown, List, RefreshCw } from "lucide-react";

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
type PriceRow = { id: string; ten: string; sku: string; giaNhap: number; flashSale: string; ngaySale: string; live: string };

function fmtVnd(n: number) { return n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }); }

export default function GiaBanPage() {
  const [shopType, setShopType] = useState<"thuong" | "mall">("thuong");
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [giaNhap, setGiaNhap] = useState("");
  const [giaBan, setGiaBan] = useState("");
  const [showFees, setShowFees] = useState(false);
  const [fees, setFees] = useState<FeeItem[]>(() => makeFees(CATEGORIES[0].thuong));

  const [markupPct, setMarkupPct] = useState("200");

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
        return (data as KhoProduct[]).map(p => map[p.id] ?? { id: p.id, ten: p.ten, sku: p.sku, giaNhap: p.giaNhap, flashSale: "", ngaySale: "", live: "" });
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
    if (giaNhap <= 0 || m <= 0) return 0;
    return Math.round(giaNhap * (m / 100));
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

  const updatePriceRow = (id: string, field: keyof Pick<PriceRow, "flashSale" | "ngaySale" | "live">, val: string) => {
    setPriceRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
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
    if (n <= 0 || m <= 0) return 0;
    return Math.round(n * (m / 100));
  }, [giaNhap, markupPct]);

  // Tính toán
  const gN = parseFloat(giaNhap) || 0;
  const gB = parseFloat(giaBan) || 0;
  const ready = gB > 0;

  const { tongPhi, pctPhi, loiNhuan, pctLN } = useMemo(() => {
    if (!ready) return { tongPhi: 0, pctPhi: 0, loiNhuan: 0, pctLN: 0 };
    let tp = 0;
    for (const f of fees) {
      if (f.isFixed) { tp += f.amount; }
      else { let v = (f.pct / 100) * gB; if (f.maxAmount > 0) v = Math.min(v, f.maxAmount); tp += v; }
    }
    const ln = gB - gN - tp;
    return { tongPhi: tp, pctPhi: (tp / gB) * 100, loiNhuan: ln, pctLN: (ln / gB) * 100 };
  }, [fees, gN, gB, ready]);

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
            <Calculator size={22} className="text-rose-500" /> Tính giá bán sản phẩm
          </h1>
          <p className="text-slate-500 text-sm mt-1">Tính lợi nhuận sau khi trừ các loại phí Shopee</p>
        </div>
      </div>

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
              <label className="text-xs font-medium text-slate-500 mb-1 block">Đề xuất (Giá nhập ×)</label>
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
        <div className={`grid grid-cols-4 divide-x divide-slate-100 ${ready ? "" : "opacity-40"}`}>
          <div className="px-5 py-3 text-center">
            <div className="text-xs text-slate-500 mb-1">TỔNG PHÍ</div>
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
                const amt = f.isFixed ? f.amount : (() => { let v = (f.pct / 100) * gB; return f.maxAmount > 0 ? Math.min(v, f.maxAmount) : v; })();
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
            <span className="text-xs text-slate-400 ml-1">· Giá Shopee/TikTok tự tính theo công thức ×{markupPct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text" placeholder="Tìm tên / SKU..."
              value={searchBang} onChange={e => setSearchBang(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 w-44 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <button onClick={fetchKho} disabled={loadingKho}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50">
              <RefreshCw size={13} className={loadingKho ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500 w-8">#</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">Tên sản phẩm</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-500">SKU</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-500">Giá nhập</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-rose-500">Giá Shopee / TikTok</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-green-600">Lợi nhuận</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-orange-500">Giá Flash Sale</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-blue-500">Giá ngày Sale</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-purple-500">Giá Live</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">
                  {loadingKho ? "Đang tải..." : "Không có sản phẩm"}
                </td></tr>
              )}
              {filteredRows.map((r, i) => {
                const shopee = calcShopeePrice(r.giaNhap);
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-slate-400">{i + 1}</td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium max-w-[200px] truncate" title={r.ten}>{r.ten}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.sku}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600 text-xs">{fmtVnd(r.giaNhap)}đ</td>
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
                    <td className="px-3 py-2">
                      <input type="number" placeholder="—"
                        value={r.flashSale}
                        onChange={e => updatePriceRow(r.id, "flashSale", e.target.value)}
                        className="w-28 text-right text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-200 text-orange-600 font-medium placeholder:text-slate-300" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" placeholder="—"
                        value={r.ngaySale}
                        onChange={e => updatePriceRow(r.id, "ngaySale", e.target.value)}
                        className="w-28 text-right text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 text-blue-600 font-medium placeholder:text-slate-300" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" placeholder="—"
                        value={r.live}
                        onChange={e => updatePriceRow(r.id, "live", e.target.value)}
                        className="w-28 text-right text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 text-purple-600 font-medium placeholder:text-slate-300" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredRows.length > 0 && (
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            {filteredRows.length} sản phẩm · Giá Shopee/TikTok = Giá nhập × {markupPct}% · Giá Flash Sale / Ngày sale / Live nhập tay
          </div>
        )}
      </div>
    </div>
  );
}
