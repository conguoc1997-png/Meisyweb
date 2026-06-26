"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Plus, Star, TrendingUp, Eye, ShoppingBag, DollarSign, Users, Package, Upload, CheckCircle, XCircle, Search, Sparkles, ChevronDown, ChevronUp, Link2, Loader2, FileSpreadsheet, Pencil, Trash2, Download, Bell, Circle, CalendarDays, Send, PackageCheck } from "lucide-react";
import * as XLSX from "xlsx";
import { formatCurrency, formatDate, PLATFORM_LABEL, TRANG_THAI_BOOKING } from "@/lib/utils";

type SanPham = { id: string; ten: string; sku: string; giaNhap: number; giaBan: number; tonKho: number; createdAt: string; tiktokProductId?: string | null; mauSac?: string | null };
type KOC = { id: string; ten: string; platform: string; follower: number; giaCast: number; linkProfile: string | null; sdt: string | null; email: string | null; diaChi: string | null; ghiChu: string | null; trangThaiHopTac: string; createdAt: string };
type Booking = {
  id: string; kocId: string; sanPhamId: string | null;
  soLuongGui: number; chiPhiCast: number; chiPhiSP: number; chiPhi: number;
  ngayBat: string; ngayKet: string | null;
  trangThai: string; doanhThu: number; donHang: number; luotXem: number; ghiChu: string | null;
  ngayRaHang: string | null; ngayLenVideo: string | null; daSent: boolean; daRecv: boolean;
  koc: KOC; sanPham: SanPham | null;
};

const TT_COLOR: Record<string, string> = {
  dang_chay: "bg-green-100 text-green-700",
  ket_thuc: "bg-slate-100 text-slate-600",
  huy: "bg-red-100 text-red-700",
};

export default function KocPage() {
  const [kocs, setKocs] = useState<KOC[]>([]);
  const [sanPhams, setSanPhams] = useState<SanPham[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"bookings" | "kocs" | "thanhTich" | "schedule">("bookings");
  const [expandedSP, setExpandedSP] = useState<string | null>(null);
  const [spSubTab, setSpSubTab] = useState<Record<string, "chiphi" | "koc" | "hieugua">>({});
  const [modalPickSP, setModalPickSP] = useState(false);
  const [pickSPSearch, setPickSPSearch] = useState("");
  const [searchKOC, setSearchKOC] = useState("");
  const [filterThang, setFilterThang] = useState("");
  const [filterSP, setFilterSP] = useState("");
  const [modalKOC, setModalKOC] = useState(false);
  const [modalBooking, setModalBooking] = useState(false);
  const [modalUpdate, setModalUpdate] = useState<Booking | null>(null);
  const [modalEditKOC, setModalEditKOC] = useState<KOC | null>(null);
  const [modalEditBooking, setModalEditBooking] = useState<Booking | null>(null);
  const [modalEditChiPhi, setModalEditChiPhi] = useState<Booking | null>(null);
  const [formEditBooking, setFormEditBooking] = useState({ kocId: "", sanPhamId: "", soLuongGui: "1", chiPhiCast: "", ngayRaHang: "", ngayBat: "", ngayKet: "", ngayLenVideo: "", ghiChu: "" });
  const [formEditChiPhi, setFormEditChiPhi] = useState({ chiPhiCast: "", chiPhiSP: "" });
  const [modalLaunch, setModalLaunch] = useState<SanPham | null>(null);
  const [launchKOCs, setLaunchKOCs] = useState<Record<string, { checked: boolean; soLuong: string }>>({});
  const [launchNgayBat, setLaunchNgayBat] = useState("");
  const [launchNgayRaHang, setLaunchNgayRaHang] = useState("");
  const [launchSearch, setLaunchSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeXuat, setShowDeXuat] = useState(false);

  type PreviewRow = {
    rowIndex: number; kocName: string; kocId: string | null; kocTen: string | null;
    bookingId: string | null; bookingSP: string | null;
    giaCast: number; linkProfile: string;
    luotXem: number; donHang: number; doanhThu: number;
    sdt: string | null; diaChi: string | null;
    matched: boolean;
  };
  const [modalImport, setModalImport] = useState(false);
  const [importPreview, setImportPreview] = useState<PreviewRow[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const [manualMatches, setManualMatches] = useState<Record<number, {
    kocId: string; kocTen: string; bookingId: string; bookingSP: string | null;
  }>>({});
  const [addNewSelected, setAddNewSelected] = useState<Set<number>>(new Set());
  const [addingNew, setAddingNew] = useState(false);

  // Update contacts từ Sheet
  type ContactRow = {
    rowIndex: number; kocName: string; kocId: string | null; kocTen: string | null;
    oldSdt: string | null; oldDiaChi: string | null;
    newSdt: string | null; newDiaChi: string | null;
    matched: boolean;
  };
  const [modalContacts, setModalContacts] = useState(false);
  const [contactSheetUrl, setContactSheetUrl] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactPreview, setContactPreview] = useState<ContactRow[]>([]);
  const [contactConfirming, setContactConfirming] = useState(false);
  const [contactDone, setContactDone] = useState(false);

  const [kocViewThang, setKocViewThang] = useState("");
  const [kocFilterTT, setKocFilterTT] = useState("");
  const [kocFilterCreated, setKocFilterCreated] = useState("");
  const [selectedKocIds, setSelectedKocIds] = useState<Set<string>>(new Set());
  const [editingKocGCId, setEditingKocGCId] = useState<string | null>(null);
  const kocGcRef = useRef<HTMLTextAreaElement>(null);
  const [editingSpTikTok, setEditingSpTikTok] = useState<string | null>(null);
  const spTikTokRef = useRef<HTMLInputElement>(null);

  // ── Import TikTok ──
  const [tiktokImportLoading, setTiktokImportLoading] = useState(false);
  const [tiktokImportResult, setTiktokImportResult] = useState<{
    spSaved: number; spTotal: number; kocSaved: number;
    newKOCs: string[]; unmatchedProducts: string[]; thang: string;
  } | null>(null);

  const toNum = (v: unknown): number => {
    if (typeof v === "number") return v;
    let s = String(v ?? "").replace(/[^\d.,]/g, "").trim();
    if (!s) return 0;
    if (s.includes(".") && s.includes(",")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.includes(".")) {
      const parts = s.split(".");
      if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) s = s.replace(/\./g, "");
    } else if (s.includes(",")) { s = s.replace(",", "."); }
    return parseFloat(s) || 0;
  };

  async function handleTikTokImport(file: File) {
    setTiktokImportLoading(true);
    setTiktokImportResult(null);
    try {
      // Đọc tháng từ tên file: ...20260501-20260531...
      let thang = "";
      const m = file.name.match(/(\d{4})(\d{2})\d{2}[-_]\d{8}/);
      if (m) thang = `${m[1]}-${m[2]}`;
      // Luôn cho user xác nhận tháng
      const confirmed = prompt(
        `Tháng dữ liệu từ file:\n"${file.name}"\n\n→ Hệ thống đọc được: ${thang || "Không rõ"}\n\nNhập tháng đúng (VD: 2026-05) hoặc OK để dùng giá trị trên:`,
        thang
      );
      if (confirmed === null) { setTiktokImportLoading(false); return; }
      thang = confirmed.trim();
      if (!thang) { setTiktokImportLoading(false); return; }

      const data = await file.arrayBuffer();
      const XLSX = await import("xlsx");
      const wb = XLSX.read(new Uint8Array(data), { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][];

      // Tìm header row
      const headerIdx = allRows.findIndex(row =>
        (row as unknown[]).some(cell => {
          const s = String(cell ?? "").toLowerCase();
          return s.includes("id sản phẩm") || s.includes("product id") || s.includes("creator");
        })
      );
      if (headerIdx === -1) {
        const sample = allRows.slice(0, 5).map(r => (r as unknown[]).slice(0, 5).map(c => String(c ?? "")).join(" | ")).join("\n");
        alert(`Không tìm thấy header. 5 dòng đầu:\n${sample}`);
        setTiktokImportLoading(false);
        return;
      }

      const headers = (allRows[headerIdx] as unknown[]).map(h => String(h ?? "").toLowerCase().trim());
      const ci = (...kws: string[]) => headers.findIndex(h => kws.some(kw => h.includes(kw)));

      const cProductId = ci("id sản phẩm", "id san pham", "product id", "product_id", "mã sản phẩm");
      const cCreator   = ci("creator name", "creator", "tên nhà sáng tạo", "ten nha sang tao");
      const cDonHang   = ci("đơn hàng nhờ video", "don hang nho video", "orders");
      const cDoanhThu  = ci("gmv đến từ", "gmv den tu", "gmv liên kết", "gmv lien ket", "gmv");
      const cHoaHong   = ci("hoa hồng ước tính", "hoa hong uoc tinh", "estimated commission", "commission");
      const cHoanTien  = ci("hoàn tiền", "hoan tien", "refund");
      const cSoMon     = ci("số món bán ra", "so mon ban ra", "items sold", "quantity sold");

      if (cProductId === -1 || cCreator === -1) {
        alert(`Không nhận diện được cột.\nHeaders (${headers.length} cột):\n${headers.slice(0, 15).join(" | ")}`);
        setTiktokImportLoading(false);
        return;
      }

      const rows: { tiktokProductId: string; creatorName: string; donHang: number; doanhThu: number; hoaHong: number; hoanTien: number; soMon: number }[] = [];
      for (let i = headerIdx + 1; i < allRows.length; i++) {
        const r = allRows[i] as unknown[];
        const pid  = cProductId >= 0 ? String(r[cProductId] ?? "").trim() : "";
        const name = cCreator   >= 0 ? String(r[cCreator]   ?? "").trim() : "";
        if (!pid || !name) continue;
        rows.push({
          tiktokProductId: pid,
          creatorName: name,
          donHang:  cDonHang  >= 0 ? toNum(r[cDonHang])  : 0,
          doanhThu: cDoanhThu >= 0 ? toNum(r[cDoanhThu]) : 0,
          hoaHong:  cHoaHong  >= 0 ? toNum(r[cHoaHong])  : 0,
          hoanTien: cHoanTien >= 0 ? toNum(r[cHoanTien]) : 0,
          soMon:    cSoMon    >= 0 ? toNum(r[cSoMon])    : 0,
        });
      }

      if (rows.length === 0) {
        alert(`Không có dòng dữ liệu nào.\nCột Product ID: ${cProductId} | Creator: ${cCreator}`);
        setTiktokImportLoading(false);
        return;
      }

      // Kiểm tra tháng đã có data chưa
      const existingSP  = tiktokSP.some(r => r.thang === thang);
      const existingKOC = tiktokKOC.some(r => r.thang === thang);
      if (existingSP || existingKOC) {
        const [y, m] = thang.split("-");
        const confirmed = window.confirm(
          `Tháng ${m}/${y} đã có dữ liệu TikTok.\n\nBạn có muốn thay thế toàn bộ dữ liệu tháng này không?\n\n• OK → Thay thế\n• Hủy → Giữ nguyên`
        );
        if (!confirmed) {
          setTiktokImportLoading(false);
          return;
        }
      }

      const res = await fetch("/api/koc/import-tiktok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thang, rows }),
      });
      const text = await res.text();
      if (!text) throw new Error("Server trả về response rỗng");
      const result = JSON.parse(text);
      if (!res.ok) throw new Error(result.error);
      setTiktokImportResult(result);
      // Reload KOCs nếu có KOC mới + reload tiktok doanh thu
      if (result.newKOCs?.length > 0) {
        const kr = await fetch("/api/koc");
        const kd = await kr.json();
        setKocs(Array.isArray(kd) ? kd : kd.data ?? []);
      }
      fetchTiktokDoanhthu();
    } catch (err) {
      alert("Lỗi import: " + String(err));
    } finally {
      setTiktokImportLoading(false);
    }
  }

  const saveSpTikTokId = async (sp: SanPham) => {
    const value = spTikTokRef.current?.value ?? "";
    setEditingSpTikTok(null);
    if (value === (sp.tiktokProductId ?? "")) return;
    await fetch(`/api/kho/san-pham/${sp.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sp, tiktokProductId: value || null }),
    });
    setSanPhams(prev => prev.map(s => s.id === sp.id ? { ...s, tiktokProductId: value || null } : s));
  };

  // ── Import báo cáo hiệu quả KOC (TikTok/platform report) ──
  type ReportRow = { creatorName: string; gmv: number; donHang: number; hoantien: number; aov: number; hoaHong: number };
  const [reportDataMap, setReportDataMap] = useState<Record<string, ReportRow[]>>({});

  function importReportFile(groupKey: string, file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][];
      const headerIdx = rows.findIndex(row =>
        (row as unknown[]).some(cell => String(cell ?? "").toLowerCase().includes("creator"))
      );
      if (headerIdx === -1) { alert("Không tìm thấy cột 'Creator name'"); return; }
      const headers = (rows[headerIdx] as unknown[]).map(h => String(h ?? "").toLowerCase());
      const col = (kw: string) => headers.findIndex(h => h.includes(kw));
      const cCreator = col("creator");
      const cGMV     = headers.findIndex(h => h.includes("gmv") || h.includes("nhờ nhà") || h.includes("nho nha"));
      const cHoan    = headers.findIndex(h => h.includes("hoàn tiền") || h.includes("hoan tien"));
      const cDonHang = headers.findIndex(h => h.includes("đơn hàng") || h.includes("don hang"));
      const cAOV     = headers.findIndex(h => h.trim().toLowerCase() === "aov");
      const cHoaHong = headers.findIndex(h => h.includes("hoa hồng") || h.includes("hoa hong") || h.includes("commission"));
      const toNum = (v: unknown): number => {
        if (typeof v === "number") return v;
        let s = String(v ?? "").replace(/[^\d.,]/g, "").trim();
        if (!s) return 0;
        if (s.includes(".") && s.includes(",")) {
          s = s.replace(/\./g, "").replace(",", ".");
        } else if (s.includes(".")) {
          const parts = s.split(".");
          if (parts.length > 2 || (parts.length === 2 && parts[1].length > 2)) s = s.replace(/\./g, "");
        } else if (s.includes(",")) {
          s = s.replace(",", ".");
        }
        return parseFloat(s) || 0;
      };
      const parsed: ReportRow[] = [];
      for (let i = headerIdx + 1; i < rows.length; i++) {
        const r = rows[i] as unknown[];
        if (!r[cCreator]) continue;
        parsed.push({
          creatorName: String(r[cCreator] ?? "").trim(),
          gmv:      cGMV >= 0     ? toNum(r[cGMV])     : 0,
          hoantien: cHoan >= 0    ? toNum(r[cHoan])     : 0,
          donHang:  cDonHang >= 0 ? toNum(r[cDonHang])  : 0,
          aov:      cAOV >= 0     ? toNum(r[cAOV])      : 0,
          hoaHong:  cHoaHong >= 0 ? toNum(r[cHoaHong])  : 0,
        });
      }
      setReportDataMap(prev => ({ ...prev, [groupKey]: parsed }));

      // ── Tự động tạo KOC mới cho creator chưa có trong DB ──
      const existingNames = new Set(kocs.map(k => k.ten.toLowerCase()));
      const newCreators = parsed.filter(r => !existingNames.has(r.creatorName.toLowerCase()));
      if (newCreators.length === 0) {
        alert(`✅ Import xong! ${parsed.length} creator — tất cả đã có trong danh sách KOC.`);
        return;
      }
      // Tạo từng KOC mới
      let added = 0;
      for (const creator of newCreators) {
        const res = await fetch("/api/koc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten: creator.creatorName, platform: "tiktok", follower: 0, giaCast: 0 }),
        });
        if (res.ok) added++;
      }
      // Refresh danh sách KOC
      const refreshed = await fetch("/api/koc").then(r => r.json());
      if (Array.isArray(refreshed)) setKocs(refreshed);
      alert(`✅ Import xong!\n• ${parsed.length - newCreators.length} KOC đã có → bỏ qua\n• ${added} KOC mới đã thêm`);
    };
    reader.readAsArrayBuffer(file);
  }

  // Inline edit booking fields — dùng ref để tránh re-render mỗi keystroke
  const [editingSLId, setEditingSLId] = useState<string | null>(null);
  const [editingGCId, setEditingGCId] = useState<string | null>(null);
  const slRef = useRef<HTMLInputElement>(null);
  const gcRef = useRef<HTMLTextAreaElement>(null);

  // ── Reminder: bookings có ngayLenVideo trong 2 ngày tới ──
  const [reminders, setReminders] = useState<Booking[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  const patchBookingBackground = (id: string, data: Record<string, unknown>) => {
    // Fire-and-forget — không chờ response, UI đã cập nhật optimistic rồi
    fetch(`/api/koc/booking/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(res => {
      if (res.ok) res.json().then(updated => {
        // Sync lại từ server (chiPhiSP, chiPhi đã tính lại)
        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updated } : b));
      });
    }).catch(() => {/* ignore */});
  };

  const saveSoLuong = (b: Booking) => {
    const val = parseInt(slRef.current?.value ?? "") || b.soLuongGui;
    setEditingSLId(null);
    if (val === b.soLuongGui) return;
    // Optimistic: cập nhật UI ngay, tính tạm chiPhiSP
    const newChiPhiSP = (b.sanPham?.giaNhap ?? 0) * val;
    const newChiPhi = b.chiPhiCast + newChiPhiSP;
    setBookings(prev => prev.map(x => x.id === b.id
      ? { ...x, soLuongGui: val, chiPhiSP: newChiPhiSP, chiPhi: newChiPhi }
      : x
    ));
    patchBookingBackground(b.id, { soLuongGui: val });
  };

  const saveGhiChu = (b: Booking) => {
    const val = gcRef.current?.value ?? b.ghiChu ?? "";
    setEditingGCId(null);
    if (val === (b.ghiChu ?? "")) return;
    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, ghiChu: val || null } : x));
    patchBookingBackground(b.id, { ghiChu: val || null });
  };

  const saveKocGhiChu = (k: KOC) => {
    const val = kocGcRef.current?.value ?? k.ghiChu ?? "";
    setEditingKocGCId(null);
    if (val === (k.ghiChu ?? "")) return;
    setKocs(prev => prev.map(x => x.id === k.id ? { ...x, ghiChu: val || null } : x));
    fetch(`/api/koc/${k.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ghiChu: val || null }) });
  };

  // Tick duyệt booking
  const [approvedBookings, setApprovedBookings] = useState<Set<string>>(new Set());
  const toggleApprove = (id: string) => {
    setApprovedBookings(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const exportApproved = (groupItems: Booking[], spLabel: string) => {
    const rows = groupItems.filter(b => approvedBookings.has(b.id));
    if (rows.length === 0) return;
    const header = ["Tên KOC", "Platform", "SKU sản phẩm", "Tên sản phẩm", "Số lượng gửi", "SĐT", "Địa chỉ"];
    const lines = rows.map(b => [
      b.koc.ten,
      b.koc.platform.toUpperCase(),
      b.sanPham?.sku ?? "—",
      b.sanPham?.ten ?? "—",
      String(b.soLuongGui),
      b.koc.sdt ?? "—",
      b.koc.diaChi ?? "—",
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    const safeName = spLabel.replace(/[^a-zA-Z0-9À-ɏḀ-ỿ]/g, "_").slice(0, 40);
    a.download = `koc-${safeName}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Google Sheet import
  const [modalSheet, setModalSheet] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState("");

  const [formKOC, setFormKOC] = useState({ ten: "", platform: "tiktok", follower: "", giaCast: "", linkProfile: "", sdt: "", email: "", diaChi: "", ghiChu: "" });
  const [formEditKOC, setFormEditKOC] = useState({ ten: "", platform: "tiktok", follower: "", giaCast: "", linkProfile: "", sdt: "", email: "", diaChi: "", ghiChu: "" });
  const [linkInput, setLinkInput] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkEditInput, setLinkEditInput] = useState("");
  const [linkEditLoading, setLinkEditLoading] = useState(false);
  const [formBooking, setFormBooking] = useState({ kocId: "", sanPhamId: "", soLuongGui: "1", ngayRaHang: "", ngayBat: "", ngayLenVideo: "", ngayKet: "", ghiChu: "" });
  const [formUpdate, setFormUpdate] = useState({ doanhThu: "", donHang: "", luotXem: "", trangThai: "", ghiChu: "" });

  type TiktokSPRow = { id: string; sanPhamId: string; thang: string; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number; sanPham: { id: string; ten: string; sku: string } };
  type TiktokKOCRow = { id: string; kocId: string; thang: string; creatorName: string; tiktokProductId: string | null; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number; koc: { id: string; ten: string; platform: string } };
  const [tiktokSP, setTiktokSP] = useState<TiktokSPRow[]>([]);
  const [tiktokKOC, setTiktokKOC] = useState<TiktokKOCRow[]>([]);

  const fetchTiktokDoanhthu = async (thang?: string) => {
    const url = thang ? `/api/koc/tiktok-doanhthu?thang=${thang}` : "/api/koc/tiktok-doanhthu";
    const res = await fetch(url).then(r => r.json());
    setTiktokSP(res.spData ?? []);
    setTiktokKOC(res.kocData ?? []);
  };

  const fetchData = async () => {
    const [k, b, sp, rem] = await Promise.all([
      fetch("/api/koc").then((r) => r.json()),
      fetch("/api/koc/booking").then((r) => r.json()),
      fetch("/api/kho/san-pham").then((r) => r.json()),
      fetch("/api/koc/remind").then((r) => r.json()),
    ]);
    setKocs(Array.isArray(k) ? k : []);
    setBookings(Array.isArray(b) ? b : []);
    setSanPhams(Array.isArray(sp) ? sp : sp.data ?? []);
    if (Array.isArray(rem)) setReminders(rem);
  };

  useEffect(() => { fetchData(); fetchTiktokDoanhthu(); }, []);

  // Tính chi phí booking tự động
  const selectedKOC = useMemo(() => kocs.find(k => k.id === formBooking.kocId), [kocs, formBooking.kocId]);
  const selectedSP  = useMemo(() => sanPhams.find(s => s.id === formBooking.sanPhamId), [sanPhams, formBooking.sanPhamId]);
  const chiPhiCast  = selectedKOC?.giaCast ?? 0;
  const chiPhiSP    = selectedSP ? selectedSP.giaNhap * (Number(formBooking.soLuongGui) || 0) : 0;
  const tongChiPhiBooking = chiPhiCast + chiPhiSP;

  // Đề xuất KOC — sản phẩm mới trong 7 ngày chưa có booking
  const newSanPhams = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return sanPhams.filter(sp => {
      const age = new Date(sp.createdAt).getTime();
      const hasBooking = bookings.some(b => b.sanPhamId === sp.id);
      return age >= cutoff && !hasBooking;
    });
  }, [sanPhams, bookings]);

  // KOC mới thêm vào chưa có booking nào
  const newKOCs = useMemo(() => {
    return kocs.filter(k => !bookings.some(b => b.kocId === k.id));
  }, [kocs, bookings]);

  // KOC đã hợp tác từ 2 lần trở lên (gợi ý tái booking)
  const repeatKOCs = useMemo(() => {
    return kocs
      .map(k => {
        const myBookings = bookings.filter(b => b.kocId === k.id);
        const done = myBookings.filter(b => b.trangThai === "ket_thuc");
        const totalCost = done.reduce((s, b) => s + b.chiPhi, 0);
        const totalRev  = done.reduce((s, b) => s + b.doanhThu, 0);
        const roi = totalCost > 0 ? ((totalRev - totalCost) / totalCost * 100) : null;
        return { ...k, bookingCount: myBookings.length, doneCount: done.length, roi };
      })
      .filter(k => k.bookingCount >= 2)
      .sort((a, b) => (b.roi ?? -999) - (a.roi ?? -999));
  }, [kocs, bookings]);

  const kocRankings = useMemo(() => {
    return kocs.map(k => {
      const done = bookings.filter(b => b.kocId === k.id && b.trangThai === "ket_thuc");
      const totalCost = done.reduce((s, b) => s + b.chiPhi, 0);
      const totalRev  = done.reduce((s, b) => s + b.doanhThu, 0);
      const roi = totalCost > 0 ? ((totalRev - totalCost) / totalCost * 100) : null;
      return { ...k, roi, doneCount: done.length };
    }).sort((a, b) => {
      if (a.roi === null && b.roi === null) return 0;
      if (a.roi === null) return 1;
      if (b.roi === null) return -1;
      return b.roi - a.roi;
    });
  }, [kocs, bookings]);

  const fetchProfileFromLink = async (url: string, mode: "add" | "edit") => {
    if (!url.trim()) return;
    mode === "add" ? setLinkLoading(true) : setLinkEditLoading(true);
    try {
      const res = await fetch("/api/koc/fetch-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (mode === "add") {
        setFormKOC(prev => ({
          ...prev,
          ten: data.ten || prev.ten,
          platform: data.platform || prev.platform,
          linkProfile: data.linkProfile || prev.linkProfile,
        }));
      } else {
        setFormEditKOC(prev => ({
          ...prev,
          ten: data.ten || prev.ten,
          platform: data.platform || prev.platform,
          linkProfile: data.linkProfile || prev.linkProfile,
        }));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Không lấy được thông tin từ link này");
    } finally {
      mode === "add" ? setLinkLoading(false) : setLinkEditLoading(false);
    }
  };

  const handleAddKOC = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/koc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formKOC) });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalKOC(false);
      setFormKOC({ ten: "", platform: "tiktok", follower: "", giaCast: "", linkProfile: "", sdt: "", email: "", diaChi: "", ghiChu: "" });
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const payload = {
        ...formBooking,
        chiPhiCast,
        chiPhiSP,
      };
      const res = await fetch("/api/koc/booking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalBooking(false);
      setFormBooking({ kocId: "", sanPhamId: "", soLuongGui: "1", ngayRaHang: "", ngayBat: "", ngayLenVideo: "", ngayKet: "", ghiChu: "" });
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`/api/koc/booking/${modalUpdate!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formUpdate),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalUpdate(null);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const openUpdate = (b: Booking) => {
    setFormUpdate({ doanhThu: String(b.doanhThu), donHang: String(b.donHang), luotXem: String(b.luotXem), trangThai: b.trangThai, ghiChu: b.ghiChu || "" });
    setModalUpdate(b);
  };

  const openEditKOC = (k: KOC) => {
    setFormEditKOC({ ten: k.ten, platform: k.platform, follower: String(k.follower), giaCast: String(k.giaCast), linkProfile: k.linkProfile || "", sdt: k.sdt || "", email: k.email || "", diaChi: k.diaChi || "", ghiChu: k.ghiChu || "" });
    setLinkEditInput(k.linkProfile || "");
    setModalEditKOC(k);
  };

  const handleEditKOC = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`/api/koc/${modalEditKOC!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEditKOC),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalEditKOC(null);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const openLaunch = (sp: SanPham) => {
    const init: Record<string, { checked: boolean; soLuong: string }> = {};
    kocs.forEach(k => { init[k.id] = { checked: false, soLuong: "1" }; });
    setLaunchKOCs(init);
    setLaunchNgayBat(new Date().toISOString().slice(0, 10));
    setLaunchNgayRaHang("");
    setLaunchSearch("");
    setModalLaunch(sp);
  };

  const openEditBooking = (b: Booking) => {
    // Ưu tiên giá cast của booking; nếu chưa có (= 0) thì lấy từ hồ sơ KOC
    const defaultCast = b.chiPhiCast > 0 ? b.chiPhiCast : b.koc.giaCast;
    setFormEditBooking({
      kocId: b.kocId, sanPhamId: b.sanPhamId ?? "",
      soLuongGui: String(b.soLuongGui),
      chiPhiCast: String(defaultCast),
      ngayRaHang:   b.ngayRaHang   ? b.ngayRaHang.slice(0, 10)   : "",
      ngayBat:      b.ngayBat.slice(0, 10),
      ngayLenVideo: b.ngayLenVideo ? b.ngayLenVideo.slice(0, 10) : "",
      ngayKet:      b.ngayKet ? b.ngayKet.slice(0, 10) : "",
      ghiChu: b.ghiChu ?? "",
    });
    setModalEditBooking(b);
  };

  const handleSaveEditBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const chiPhiSP = modalEditBooking!.chiPhiSP; // giữ nguyên chi phí SP
      const res = await fetch(`/api/koc/booking/${modalEditBooking!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formEditBooking, chiPhiSP }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      // Cập nhật giaCast trong hồ sơ KOC theo giá mới nhất
      const newCast = Number(formEditBooking.chiPhiCast) || 0;
      if (newCast > 0) {
        await fetch(`/api/koc/${modalEditBooking!.kocId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giaCast: newCast }),
        });
      }
      setModalEditBooking(null); fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const openEditChiPhi = (b: Booking) => {
    setFormEditChiPhi({ chiPhiCast: String(b.chiPhiCast), chiPhiSP: String(b.chiPhiSP) });
    setModalEditChiPhi(b);
  };

  const handleSaveChiPhi = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const chiPhiCast = Number(formEditChiPhi.chiPhiCast) || 0;
      const chiPhiSP   = Number(formEditChiPhi.chiPhiSP)   || 0;
      const res = await fetch(`/api/koc/booking/${modalEditChiPhi!.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chiPhiCast, chiPhiSP }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      // Cập nhật giaCast trong hồ sơ KOC theo giá mới nhất
      if (chiPhiCast > 0) {
        await fetch(`/api/koc/${modalEditChiPhi!.kocId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ giaCast: chiPhiCast }),
        });
      }
      setModalEditChiPhi(null); fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const handleDeleteBooking = async (b: Booking) => {
    if (!confirm(`Xoá booking của ${b.koc.ten}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/koc/booking/${b.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi"); }
    finally { setLoading(false); }
  };

  const handleLaunchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected = kocs.filter(k => launchKOCs[k.id]?.checked);
    if (selected.length === 0) { alert("Chưa chọn KOC nào!"); return; }
    setLoading(true);
    try {
      await Promise.all(selected.map(k => {
        const soLuong = Number(launchKOCs[k.id]?.soLuong) || 1;
        const chiPhiCast = k.giaCast;
        const chiPhiSP = modalLaunch!.giaNhap * soLuong;
        return fetch("/api/koc/booking", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kocId: k.id,
            sanPhamId: modalLaunch!.id,
            soLuongGui: soLuong,
            chiPhiCast,
            chiPhiSP,
            ngayBat: launchNgayBat,
            ngayRaHang: launchNgayRaHang || null,
          }),
        });
      }));
      setModalLaunch(null);
      setTab("bookings");
      fetchData();
    } catch { alert("Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);
    setImportPreview([]);
    setImportDone(false);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/koc/import-excel", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportPreview(data.preview);
      setManualMatches({});
      setAddNewSelected(new Set());
      setModalImport(true);
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi đọc file"); }
    finally { setImportLoading(false); e.target.value = ""; }
  };

  const handleImportConfirm = async () => {
    // Gộp auto-matched + manual-matched
    const allRows = importPreview.map(r => {
      if (r.matched && r.bookingId) return r;
      const m = manualMatches[r.rowIndex];
      if (m?.bookingId) return { ...r, ...m, matched: true };
      return r;
    });
    const matched = allRows.filter(r => r.matched && r.bookingId);
    if (!matched.length) return;
    setImportLoading(true);
    try {
      const res = await fetch("/api/koc/import-confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: matched.map(r => ({ bookingId: r.bookingId, kocId: r.kocId, luotXem: r.luotXem, donHang: r.donHang, doanhThu: r.doanhThu, sdt: r.sdt, diaChi: r.diaChi })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportDone(true);
      fetchData();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "Lỗi import"); }
    finally { setImportLoading(false); }
  };

  const handleAddNewKOCs = async () => {
    const toAdd = importPreview.filter(r => addNewSelected.has(r.rowIndex) && !r.matched && !manualMatches[r.rowIndex]);
    if (!toAdd.length) return;
    setAddingNew(true);
    try {
      // Kiểm tra KOC đã tồn tại chưa → update thay vì tạo mới tránh trùng
      const existingKocs: KOC[] = await fetch("/api/koc").then(r => r.json());
      const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
      const added = await Promise.all(toAdd.map(r => {
        const existing = existingKocs.find(k => norm(k.ten) === norm(r.kocName));
        if (existing) {
          // Update KOC đã có
          return fetch(`/api/koc/${existing.id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ giaCast: r.giaCast || existing.giaCast, linkProfile: r.linkProfile || existing.linkProfile }),
          }).then(() => existing);
        }
        // Tạo mới
        return fetch("/api/koc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten: r.kocName, platform: "tiktok", follower: r.luotXem || 0, giaCast: r.giaCast || 0, linkProfile: r.linkProfile || "" }),
        }).then(res => res.json());
      }));
      // Auto-match những dòng vừa thêm vào manualMatches
      const newMatches: typeof manualMatches = { ...manualMatches };
      toAdd.forEach((r, i) => {
        const newKoc = added[i];
        if (newKoc?.id) {
          newMatches[r.rowIndex] = { kocId: newKoc.id, kocTen: newKoc.ten, bookingId: "", bookingSP: null };
        }
      });
      setManualMatches(newMatches);
      setAddNewSelected(new Set());
      await fetchData(); // refresh kocs list
      alert(`Đã thêm ${toAdd.length} KOC mới vào hệ thống!`);
    } catch {
      alert("Có lỗi khi thêm KOC");
    } finally {
      setAddingNew(false);
    }
  };

  const handleContactPreview = async () => {
    if (!contactSheetUrl.trim()) return;
    setContactLoading(true); setContactError(""); setContactPreview([]);
    try {
      const res = await fetch("/api/koc/update-contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: contactSheetUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContactPreview(data.preview);
      setContactDone(false);
    } catch (e: unknown) { setContactError(e instanceof Error ? e.message : "Lỗi"); }
    finally { setContactLoading(false); }
  };

  const handleContactConfirm = async () => {
    const toUpdate = contactPreview.filter(r => r.matched && r.kocId);
    if (!toUpdate.length) return;
    setContactConfirming(true);
    try {
      const res = await fetch("/api/koc/update-contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: toUpdate.map(r => ({ kocId: r.kocId, sdt: r.newSdt, diaChi: r.newDiaChi })) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContactDone(true);
      fetchData();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Lỗi"); }
    finally { setContactConfirming(false); }
  };

  const handleSheetImport = async () => {
    if (!sheetUrl.trim()) return;
    setSheetLoading(true);
    setSheetError("");
    try {
      const res = await fetch("/api/koc/import-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setImportPreview(data.preview);
      setImportDone(false);
      setManualMatches({});
      setAddNewSelected(new Set());
      setModalSheet(false);
      setModalImport(true);
    } catch (err: unknown) {
      setSheetError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSheetLoading(false);
    }
  };

  // Stats — lọc theo filterThang nếu có
  const bookingsInThang = filterThang
    ? bookings.filter(b => { const d = new Date(b.ngayBat); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` === filterThang; })
    : bookings;
  const tiktokSPInThang = filterThang ? tiktokSP.filter(r => r.thang === filterThang) : tiktokSP;
  const tongChiPhi         = bookingsInThang.reduce((s, b) => s + (b.chiPhi > 0 ? b.chiPhi : (b.koc.giaCast + b.chiPhiSP)), 0);
  const tongDoanhThuTiktok = tiktokSPInThang.reduce((s, r) => s + r.doanhThu, 0);
  const tongDonHangTiktok  = tiktokSPInThang.reduce((s, r) => s + r.donHang, 0);
  const tongHoaHong        = tiktokSPInThang.reduce((s, r) => s + r.hoaHong, 0);
  const tongDoanhThuDB     = bookingsInThang.reduce((s, b) => s + b.doanhThu, 0);
  const tongDonHangDB      = bookingsInThang.reduce((s, b) => s + b.donHang, 0);
  const tongDoanhThu = tongDoanhThuTiktok > 0 ? tongDoanhThuTiktok : tongDoanhThuDB;
  const tongDonHang  = tongDonHangTiktok  > 0 ? tongDonHangTiktok  : tongDonHangDB;
  const roiTB = tongChiPhi > 0 ? ((tongDoanhThu - tongChiPhi) / tongChiPhi * 100).toFixed(1) : "0";
  const thangListAll = Array.from(new Set([
    ...bookings.map(b => { const d = new Date(b.ngayBat); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; }),
    ...tiktokSP.map(r => r.thang),
    ...tiktokKOC.map(r => r.thang),
  ])).sort().reverse();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">KOC Booking</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý và đánh giá hiệu quả booking KOC</p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">
          {filterThang ? `Tháng ${filterThang.slice(5,7)}/${filterThang.slice(0,4)}` : "Tất cả thời gian"}
        </span>
        <select
          value={filterThang}
          onChange={e => setFilterThang(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
        >
          <option value="">Tất cả tháng</option>
          {thangListAll.map(t => (
            <option key={t} value={t}>{t.slice(0,4)}/{t.slice(5,7)}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-rose-400" /><p className="text-xs text-slate-500">Tổng KOC</p></div>
          <p className="text-xl font-bold text-slate-800">{kocs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-red-400" /><p className="text-xs text-slate-500">Chi phí booking</p></div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(tongChiPhi)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-400" />
            <p className="text-xs text-slate-500">Tổng doanh thu</p>
            {tongDoanhThuTiktok > 0 && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full ml-auto">TikTok</span>}
          </div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(tongDoanhThu)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={16} className="text-blue-400" />
            <p className="text-xs text-slate-500">Tổng đơn hàng</p>
            {tongDonHangTiktok > 0 && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full ml-auto">TikTok</span>}
          </div>
          <p className="text-xl font-bold text-slate-800">{tongDonHang.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-amber-400" />
            <p className="text-xs text-slate-500">Hoa hồng</p>
            {tongHoaHong > 0 && <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full ml-auto">TikTok</span>}
          </div>
          <p className="text-xl font-bold text-amber-600">{tongHoaHong > 0 ? formatCurrency(tongHoaHong) : "—"}</p>
        </div>
        <div className={`rounded-xl p-4 border ${Number(roiTB) >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-2"><Star size={16} className={Number(roiTB) >= 0 ? "text-green-500" : "text-red-400"} /><p className="text-xs text-slate-500">ROI trung bình</p></div>
          <p className={`text-xl font-bold ${Number(roiTB) >= 0 ? "text-green-600" : "text-red-600"}`}>{roiTB}%</p>
        </div>
      </div>

      {/* ── Reminder: lịch lên video sắp tới ── */}
      {reminders.length > 0 && (
        <div className="mb-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowReminder(v => !v)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/30 transition text-left"
          >
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 relative">
              <Bell size={14} className="text-white" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                {reminders.length}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">
                Lịch lên video sắp tới — {reminders.length} KOC
              </p>
              <p className="text-xs text-amber-600">Nhấn để {showReminder ? "thu gọn" : "xem chi tiết"}</p>
            </div>
            {showReminder ? <ChevronUp size={16} className="text-amber-400" /> : <ChevronDown size={16} className="text-amber-400" />}
          </button>

          {showReminder && (() => {
            const today     = reminders.filter(r => { const d = new Date(r.ngayLenVideo!); const now = new Date(); return d.toDateString() === now.toDateString(); });
            const tomorrow  = reminders.filter(r => { const d = new Date(r.ngayLenVideo!); const tm = new Date(); tm.setDate(tm.getDate() + 1); return d.toDateString() === tm.toDateString(); });
            const in2days   = reminders.filter(r => { const d = new Date(r.ngayLenVideo!); const t2 = new Date(); t2.setDate(t2.getDate() + 2); return d.toDateString() === t2.toDateString(); });

            const Section = ({ label, items, color }: { label: string; items: typeof reminders; color: string }) =>
              items.length === 0 ? null : (
                <div className="border-t border-amber-100 px-5 py-3">
                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${color}`}>{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(r => (
                      <div key={r.id} className="flex items-center gap-2 bg-white border border-amber-100 rounded-lg px-3 py-1.5 shadow-sm">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${color.replace("text-", "bg-")}`} />
                        <span className="text-xs font-semibold text-slate-700">{r.koc.ten}</span>
                        {r.sanPham && (
                          <>
                            <span className="text-amber-300">·</span>
                            <span className="text-xs text-slate-500 max-w-[120px] truncate">{r.sanPham.ten}</span>
                          </>
                        )}
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {r.ngayLenVideo ? new Date(r.ngayLenVideo).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }) : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );

            return (
              <>
                <Section label="🔴  Hôm nay" items={today}   color="text-red-600" />
                <Section label="🟠  1 ngày nữa" items={tomorrow} color="text-orange-500" />
                <Section label="🟡  2 ngày nữa" items={in2days}  color="text-amber-500" />
              </>
            );
          })()}
        </div>
      )}


      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["bookings", "kocs", "thanhTich", "schedule"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${tab === t ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t === "bookings" ? "Danh sách Booking" : t === "kocs" ? "Danh sách KOC" : t === "thanhTich" ? "Thành tích KOC" : "📅 Schedule"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer ${importLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={16} className="text-slate-500" />
            {importLoading ? "Đang đọc..." : "Import Excel"}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <label className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-violet-300 text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition cursor-pointer ${tiktokImportLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <TrendingUp size={16} />
            {tiktokImportLoading ? "Đang xử lý..." : "Import TikTok"}
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleTikTokImport(f); e.target.value = ""; }} />
          </label>
          <button
            onClick={() => { setSheetUrl(""); setSheetError(""); setModalSheet(true); }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <FileSpreadsheet size={16} /> Google Sheet
          </button>
          <button onClick={() => setModalKOC(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <Plus size={16} /> Thêm KOC
          </button>
          <button onClick={() => setModalPickSP(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
            <Package size={16} /> Booking theo SP
          </button>
        </div>
      </div>

      {/* Bookings — grouped by product */}
      {tab === "bookings" && (() => {
        const thangList = thangListAll;

        // Lọc bookings
        const filteredBookings = bookings.filter(b => {
          if (filterSP && b.sanPhamId !== filterSP) return false;
          if (filterThang && b.ngayBat?.slice(0, 7) !== filterThang) return false;
          return true;
        });

        // Nhóm booking theo sản phẩm
        const grouped: { key: string; label: string; sku: string; spId: string | null; items: Booking[] }[] = [];
        const seen = new Set<string>();
        filteredBookings.forEach(b => {
          const key = b.sanPhamId ?? "__none__";
          if (!seen.has(key)) {
            seen.add(key);
            grouped.push({
              key,
              spId: b.sanPhamId,
              label: b.sanPham?.ten ?? "Không có sản phẩm",
              sku: b.sanPham?.sku ?? "—",
              items: [],
            });
          }
          grouped.find(g => g.key === key)!.items.push(b);
        });

        return (
          <>
            {/* Filter bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Tháng:</label>
                <select value={filterThang} onChange={e => setFilterThang(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                  <option value="">Tất cả</option>
                  {thangList.map(t => {
                    const [y, m] = t.split("-");
                    return <option key={t} value={t}>Tháng {m}/{y}</option>;
                  })}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 whitespace-nowrap">Sản phẩm:</label>
                <select value={filterSP} onChange={e => setFilterSP(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white min-w-[200px]">
                  <option value="">Tất cả</option>
                  {sanPhams.filter(sp => bookings.some(b => b.sanPhamId === sp.id)).map(sp => (
                    <option key={sp.id} value={sp.id}>{sp.sku} — {sp.ten}</option>
                  ))}
                </select>
              </div>
              {(filterThang || filterSP) && (
                <button onClick={() => { setFilterThang(""); setFilterSP(""); }}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
                  ✕ Xoá lọc
                </button>
              )}
              <span className="text-xs text-slate-400 ml-auto">{filteredBookings.length} booking</span>
            </div>

            {grouped.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center text-slate-400">
                <Star size={32} className="mx-auto mb-2 opacity-40" />
                {filterThang || filterSP ? "Không có booking nào phù hợp với bộ lọc" : "Chưa có booking nào"}
              </div>
            ) : null}

            <div className="space-y-4">
            {grouped.map(group => {
              const totalCP    = group.items.reduce((s, b) => s + b.chiPhi, 0);
              const totalCast  = group.items.reduce((s, b) => s + (b.chiPhiCast > 0 ? b.chiPhiCast : b.koc.giaCast), 0);
              const totalSP    = group.items.reduce((s, b) => s + b.chiPhiSP, 0);
              const totalDTdb  = group.items.reduce((s, b) => s + b.doanhThu, 0);
              const totalDon   = group.items.reduce((s, b) => s + b.donHang, 0);
              const totalView  = group.items.reduce((s, b) => s + b.luotXem, 0);
              // Nếu có báo cáo Excel → ưu tiên dùng tổng GMV từ báo cáo
              const groupReport = reportDataMap[group.key] ?? [];
              // Doanh thu TikTok từ DB (lọc theo tháng nếu có)
              const groupTiktokId = sanPhams.find(s => s.id === group.spId)?.tiktokProductId;
              const tiktokSPRows = groupTiktokId
                ? tiktokSP.filter(r => (!filterThang || r.thang === filterThang) && sanPhams.find(s => s.id === r.sanPhamId)?.tiktokProductId === groupTiktokId)
                : tiktokSP.filter(r => r.sanPhamId === group.spId && (!filterThang || r.thang === filterThang));
              const tiktokDT  = tiktokSPRows.reduce((s, r) => s + r.doanhThu, 0);
              const tiktokDon = tiktokSPRows.reduce((s, r) => s + r.donHang, 0);
              const totalDT    = groupReport.length > 0
                ? groupReport.reduce((s, r) => s + r.gmv, 0)
                : tiktokDT > 0 ? tiktokDT : totalDTdb;
              const headerDon  = groupReport.length > 0
                ? groupReport.reduce((s, r) => s + r.donHang, 0)
                : tiktokDon > 0 ? tiktokDon : totalDon;
              const roi        = totalCP > 0 ? ((totalDT - totalCP) / totalCP * 100).toFixed(1) : "—";
              const roiNum     = totalCP > 0 ? (totalDT - totalCP) / totalCP * 100 : 0;
              const isOpen     = expandedSP === group.key;
              const subTab     = spSubTab[group.key] ?? "koc";

              const groupApprovedCount = group.items.filter(b => approvedBookings.has(b.id)).length;
              return (
                <div key={group.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header card — click để mở/đóng */}
                  <button
                    onClick={() => setExpandedSP(isOpen ? null : group.key)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Package size={15} className="text-slate-400" />
                        <span className="font-semibold text-slate-800">{group.label}</span>
                        <span className="text-xs text-slate-400 font-mono">{group.sku}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{group.items.length} KOC</span>
                        {group.spId && (() => {
                          const sp = sanPhams.find(s => s.id === group.spId);
                          if (!sp) return null;
                          return editingSpTikTok === group.spId ? (
                            <input
                              autoFocus
                              ref={spTikTokRef}
                              type="text"
                              defaultValue={sp.tiktokProductId ?? ""}
                              onClick={e => e.stopPropagation()}
                              onBlur={() => saveSpTikTokId(sp)}
                              onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") saveSpTikTokId(sp); if (e.key === "Escape") setEditingSpTikTok(null); }}
                              className="border border-violet-300 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-300 w-48"
                              placeholder="TikTok Product ID..."
                            />
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); setEditingSpTikTok(group.spId!); }}
                              className={`text-xs font-mono px-2 py-0.5 rounded border ${sp.tiktokProductId ? "border-violet-200 text-violet-600 bg-violet-50" : "border-dashed border-slate-300 text-slate-400 hover:border-violet-300 hover:text-violet-400"}`}
                            >
                              {sp.tiktokProductId ? `🔗 ${sp.tiktokProductId}` : "+ TikTok ID"}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Xuất đã duyệt — chỉ hiện khi có tick */}
                    {groupApprovedCount > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); exportApproved(group.items, group.label); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition flex-shrink-0"
                      >
                        <Download size={12} /> Xuất {groupApprovedCount} đã duyệt
                      </button>
                    )}
                    {/* Thêm KOC vào sản phẩm này */}
                    {group.spId && (() => {
                      const sp = sanPhams.find(s => s.id === group.spId);
                      return sp ? (
                        <button
                          onClick={e => { e.stopPropagation(); openLaunch(sp); }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition flex-shrink-0"
                        >
                          <Plus size={12} /> Thêm KOC
                        </button>
                      ) : null;
                    })()}
                    {/* Summary stats */}
                    <div className="flex items-center gap-6 text-sm">
                      {(() => {
                        const raHangDate = group.items.find(b => b.ngayRaHang)?.ngayRaHang;
                        return raHangDate ? (
                          <div className="text-right">
                            <p className="text-xs text-slate-400">🚀 Ra hàng</p>
                            <p className="font-semibold text-emerald-600">{formatDate(raHangDate)}</p>
                          </div>
                        ) : null;
                      })()}
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Tổng CP</p>
                        <p className="font-semibold text-slate-700">{formatCurrency(totalCP)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Doanh thu{groupReport.length > 0 ? " (GMV)" : ""}</p>
                        <p className="font-semibold text-green-600">{formatCurrency(totalDT)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Đơn hàng</p>
                        <p className="font-semibold text-slate-700">{headerDon.toLocaleString()}</p>
                      </div>
                      <div className="text-right min-w-[60px]">
                        <p className="text-xs text-slate-400">ROI</p>
                        <p className={`font-bold ${roi === "—" ? "text-slate-400" : roiNum >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {roi}{roi !== "—" ? "%" : ""}
                        </p>
                      </div>
                      <span className={`text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                    </div>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="border-t border-slate-100">
                      {/* Sub-tabs */}
                      <div className="flex gap-1 px-5 pt-3 pb-0 border-b border-slate-100">
                        {(["koc", "chiphi", "hieugua"] as const).map(st => (
                          <button key={st}
                            onClick={() => setSpSubTab(prev => ({ ...prev, [group.key]: st }))}
                            className={`px-4 py-1.5 text-xs rounded-t-lg font-medium transition border-b-2 ${subTab === st ? "border-rose-500 text-rose-600 bg-rose-50" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                            {st === "koc" ? "📋 Danh sách KOC" : st === "chiphi" ? "💰 Chi phí" : "📈 Hiệu quả"}
                          </button>
                        ))}
                      </div>

                      {/* Tab: KOC */}
                      {subTab === "koc" && (
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-3 py-2.5 w-10 text-center">
                                <span className="text-xs font-medium text-emerald-600">Duyệt</span>
                              </th>
                              <th className="text-left px-5 py-2.5 text-slate-500 font-medium text-xs">KOC</th>
                              <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Thời gian</th>
                              <th className="text-right px-4 py-2.5 text-slate-500 font-medium text-xs">Số lượng gửi</th>
                              <th className="text-right px-4 py-2.5 text-slate-500 font-medium text-xs">Giá cast</th>
                              <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Trạng thái</th>
                              <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Ghi chú</th>
                              <th className="text-center px-3 py-2.5 text-slate-500 font-medium text-xs">
                                <div className="flex items-center gap-1 justify-center"><CalendarDays size={11} /> Ngày lên video</div>
                              </th>
                              <th className="text-center px-3 py-2.5 text-slate-500 font-medium text-xs">
                                <div className="flex items-center gap-1 justify-center"><Send size={11} /> Đã gửi</div>
                              </th>
                              <th className="text-center px-3 py-2.5 text-slate-500 font-medium text-xs">
                                <div className="flex items-center gap-1 justify-center"><PackageCheck size={11} /> Đã nhận</div>
                              </th>
                              <th className="px-4 py-2.5"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map(b => {
                              const approved = approvedBookings.has(b.id);
                              return (
                              <tr key={b.id} className={`hover:bg-slate-50 transition-colors ${approved ? "bg-emerald-50/60" : ""}`}>
                                <td className="px-3 py-3 text-center">
                                  <button onClick={() => toggleApprove(b.id)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${approved ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-emerald-400 bg-white"}`}>
                                    {approved && <CheckCircle size={14} />}
                                  </button>
                                </td>
                                <td className="px-5 py-3">
                                  <p className="font-medium text-slate-800">{b.koc.ten}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${b.koc.platform === "tiktok" ? "bg-pink-100 text-pink-700" : b.koc.platform === "shopee" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                    {PLATFORM_LABEL[b.koc.platform]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">
                                  {b.ngayRaHang && (
                                    <p className="text-emerald-600 font-medium mb-0.5">🚀 {formatDate(b.ngayRaHang)}</p>
                                  )}
                                  {formatDate(b.ngayBat)}{b.ngayKet ? ` → ${formatDate(b.ngayKet)}` : " → ..."}
                                </td>
                                {/* Số lượng gửi — inline edit (uncontrolled, nhanh) */}
                                <td className="px-4 py-3 text-right">
                                  {editingSLId === b.id ? (
                                    <input
                                      type="number" min={1} autoFocus
                                      ref={slRef}
                                      defaultValue={b.soLuongGui}
                                      onBlur={() => saveSoLuong(b)}
                                      onKeyDown={e => { if (e.key === "Enter") saveSoLuong(b); if (e.key === "Escape") setEditingSLId(null); }}
                                      className="w-16 text-right text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingSLId(b.id)}
                                      className="text-xs text-slate-600 hover:text-blue-600 hover:underline cursor-pointer px-1"
                                      title="Click để sửa">
                                      {b.soLuongGui} cái
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right text-xs font-medium text-rose-600">
                                  {b.chiPhiCast > 0
                                    ? formatCurrency(b.chiPhiCast)
                                    : b.koc.giaCast > 0
                                      ? <span className="text-slate-400 italic">{formatCurrency(b.koc.giaCast)}</span>
                                      : <span className="text-slate-400">—</span>}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${TT_COLOR[b.trangThai]}`}>
                                    {TRANG_THAI_BOOKING[b.trangThai]}
                                  </span>
                                </td>
                                {/* Ghi chú — inline edit (uncontrolled) */}
                                <td className="px-4 py-3 max-w-[180px]">
                                  {editingGCId === b.id ? (
                                    <textarea
                                      autoFocus rows={2}
                                      ref={gcRef}
                                      defaultValue={b.ghiChu ?? ""}
                                      onBlur={() => saveGhiChu(b)}
                                      onKeyDown={e => { if (e.key === "Escape") setEditingGCId(null); }}
                                      className="w-full text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                      placeholder="Nhập ghi chú..."
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingGCId(b.id)}
                                      className="text-xs text-left w-full hover:text-blue-600 cursor-pointer"
                                      title="Click để sửa">
                                      {b.ghiChu
                                        ? <span className="text-slate-600 line-clamp-2">{b.ghiChu}</span>
                                        : <span className="text-slate-300 italic">+ ghi chú</span>}
                                    </button>
                                  )}
                                </td>
                                {/* Ngày lên video — date picker */}
                                <td className="px-3 py-3 text-center">
                                  {(() => {
                                    const isNear = b.ngayLenVideo
                                      ? (new Date(b.ngayLenVideo).getTime() - Date.now()) / 86400000 <= 2
                                        && new Date(b.ngayLenVideo) > new Date()
                                      : false;
                                    return (
                                      <div className="relative">
                                        <input
                                          type="date"
                                          defaultValue={b.ngayLenVideo ? b.ngayLenVideo.slice(0, 10) : ""}
                                          onChange={e => {
                                            const val = e.target.value || null;
                                            setBookings(prev => prev.map(x => x.id === b.id ? { ...x, ngayLenVideo: val } : x));
                                            patchBookingBackground(b.id, { ngayLenVideo: val });
                                          }}
                                          className={`text-xs px-2 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer
                                            ${isNear ? "border-orange-300 bg-orange-50 text-orange-700 font-semibold" : "border-slate-200 bg-white text-slate-600"}`}
                                        />
                                        {isNear && <Bell size={10} className="absolute -top-1 -right-1 text-orange-500 animate-pulse" />}
                                      </div>
                                    );
                                  })()}
                                </td>
                                {/* Đã gửi */}
                                <td className="px-3 py-3 text-center">
                                  <button onClick={() => {
                                    const next = !b.daSent;
                                    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, daSent: next } : x));
                                    patchBookingBackground(b.id, { daSent: next });
                                  }}
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                                      b.daSent ? "bg-blue-500 border-blue-500 text-white shadow-sm" : "border-slate-300 hover:border-blue-400 bg-white"
                                    }`}>
                                    {b.daSent ? <CheckCircle size={14} /> : <Circle size={14} className="text-slate-300" />}
                                  </button>
                                </td>
                                {/* Đã nhận */}
                                <td className="px-3 py-3 text-center">
                                  <button onClick={() => {
                                    const next = !b.daRecv;
                                    setBookings(prev => prev.map(x => x.id === b.id ? { ...x, daRecv: next } : x));
                                    patchBookingBackground(b.id, { daRecv: next });
                                  }}
                                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${
                                      b.daRecv ? "bg-green-500 border-green-500 text-white shadow-sm" : "border-slate-300 hover:border-green-400 bg-white"
                                    }`}>
                                    {b.daRecv ? <CheckCircle size={14} /> : <Circle size={14} className="text-slate-300" />}
                                  </button>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center gap-1 justify-end">
                                    <button onClick={() => openUpdate(b)} className="text-xs text-rose-500 hover:underline px-2 py-1">Kết quả</button>
                                    <button onClick={() => openEditBooking(b)} className="p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition" title="Sửa booking">
                                      <Pencil size={13} />
                                    </button>
                                    <button onClick={() => handleDeleteBooking(b)} className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Xoá">
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}

                      {/* Tab: Chi phí */}
                      {subTab === "chiphi" && (
                        <div className="p-5">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Chi phí Cast</p>
                              <p className="text-lg font-bold text-slate-800">{formatCurrency(totalCast)}</p>
                              <p className="text-xs text-slate-400 mt-1">{group.items.length} KOC × cast fee</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Chi phí Sản phẩm</p>
                              <p className="text-lg font-bold text-slate-800">{formatCurrency(totalSP)}</p>
                              <p className="text-xs text-slate-400 mt-1">{group.items.reduce((s,b)=>s+b.soLuongGui,0)} cái gửi KOC</p>
                            </div>
                            <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng Chi phí</p>
                              <p className="text-lg font-bold text-rose-600">{formatCurrency(totalCP)}</p>
                              <p className="text-xs text-slate-400 mt-1">Cast + Sản phẩm</p>
                            </div>
                          </div>
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50 rounded-lg">
                              <tr>
                                <th className="text-left px-3 py-2 text-slate-500">KOC</th>
                                <th className="text-right px-3 py-2 text-slate-500">Chi phí Cast</th>
                                <th className="text-right px-3 py-2 text-slate-500">Số lượng</th>
                                <th className="text-right px-3 py-2 text-slate-500">Chi phí SP</th>
                                <th className="text-right px-3 py-2 text-slate-500 font-semibold">Tổng</th>
                                <th className="px-3 py-2 w-8"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {group.items.map(b => (
                                <tr key={b.id} className="hover:bg-slate-50">
                                  <td className="px-3 py-2 font-medium text-slate-700">{b.koc.ten}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(b.chiPhiCast)}</td>
                                  <td className="px-3 py-2 text-right text-slate-600">{b.soLuongGui} cái</td>
                                  <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(b.chiPhiSP)}</td>
                                  <td className="px-3 py-2 text-right font-semibold text-slate-800">{formatCurrency(b.chiPhi)}</td>
                                  <td className="px-3 py-2 text-center">
                                    <button onClick={() => openEditChiPhi(b)} className="p-1 rounded hover:bg-blue-50 text-slate-300 hover:text-blue-500 transition" title="Sửa chi phí">
                                      <Pencil size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Tab: Hiệu quả — dữ liệu từ TikTok import */}
                      {subTab === "hieugua" && (() => {
                        // Lọc tiktokKOC theo tháng + tiktokProductId của nhóm sản phẩm này
                        const groupTikTokPid = sanPhams.find(s => s.id === group.spId)?.tiktokProductId ?? null;
                        const kocRows = tiktokKOC.filter(r =>
                          (!filterThang || r.thang === filterThang) &&
                          (groupTikTokPid
                            ? r.tiktokProductId === groupTikTokPid || r.tiktokProductId?.slice(0, 15) === groupTikTokPid?.slice(0, 15)
                            : true)
                        );
                        // Map booking theo kocId và tên để ghép chi phí
                        const bookingByKocId   = new Map(group.items.map(b => [b.kocId, b]));
                        const bookingByKocName = new Map(group.items.map(b => [b.koc.ten.toLowerCase().trim(), b]));
                        // Build rows từ tiktokKOC (tất cả creator trong file TikTok)
                        type HieuquaRow = { kocId: string; kocName: string; doanhThu: number; donHang: number; hoaHong: number; hoanTien: number; soMon: number; chiPhiCast: number; hasTiktok: boolean; hasBooking: boolean };
                        const mergedMap = new Map<string, HieuquaRow>();
                        for (const r of kocRows) {
                          const booking = bookingByKocId.get(r.kocId) ?? bookingByKocName.get(r.creatorName.toLowerCase().trim());
                          const key = r.kocId;
                          const existing = mergedMap.get(key);
                          if (existing) {
                            existing.doanhThu += r.doanhThu; existing.donHang += r.donHang;
                            existing.hoaHong  += r.hoaHong; existing.hoanTien += r.hoanTien; existing.soMon += r.soMon;
                          } else {
                            mergedMap.set(key, {
                              kocId: r.kocId, kocName: r.creatorName,
                              doanhThu: r.doanhThu, donHang: r.donHang, hoaHong: r.hoaHong, hoanTien: r.hoanTien, soMon: r.soMon,
                              chiPhiCast: booking?.chiPhiCast ?? 0,
                              hasTiktok: true, hasBooking: !!booking,
                            });
                          }
                        }
                        // Thêm KOC có booking nhưng không có trong TikTok
                        for (const b of group.items) {
                          const nameKey = b.koc.ten.toLowerCase().trim();
                          const alreadyAdded = [...mergedMap.values()].some(r => r.kocId === b.kocId || r.kocName.toLowerCase().trim() === nameKey);
                          if (!alreadyAdded) {
                            mergedMap.set(b.kocId, { kocId: b.kocId, kocName: b.koc.ten, doanhThu: 0, donHang: 0, hoaHong: 0, hoanTien: 0, soMon: 0, chiPhiCast: b.chiPhiCast, hasTiktok: false, hasBooking: true });
                          }
                        }
                        const sorted = [...mergedMap.values()].sort((a, b) => b.doanhThu - a.doanhThu);
                        const totalGMV  = sorted.reduce((s, r) => s + r.doanhThu, 0);
                        const totalChi  = sorted.reduce((s, r) => s + r.chiPhiCast, 0);
                        const roiNum    = totalChi > 0 ? (totalGMV - totalChi) / totalChi * 100 : 0;
                        const roiStr    = totalChi > 0 ? roiNum.toFixed(1) : "—";
                        const hasTiktokData = kocRows.length > 0;

                        return (
                        <div className="p-5 space-y-5">
                          {/* Stats */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Số KOC</p>
                              <p className="text-lg font-bold text-slate-800">{sorted.length}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng đơn hàng</p>
                              <p className="text-lg font-bold text-slate-800">{sorted.reduce((s,r)=>s+r.donHang,0).toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng GMV (TikTok)</p>
                              <p className="text-lg font-bold text-green-600">{totalGMV > 0 ? formatCurrency(totalGMV) : "—"}</p>
                            </div>
                            <div className={`rounded-xl p-4 border ${roiNum >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                              <p className="text-xs text-slate-500 mb-1">ROI tổng</p>
                              <p className={`text-lg font-bold ${roiNum >= 0 ? "text-green-600" : "text-red-600"}`}>{roiStr}{roiStr !== "—" ? "%" : ""}</p>
                            </div>
                          </div>

                          {!hasTiktokData && (
                            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                              <span>⚠️</span>
                              <span>Chưa có dữ liệu TikTok{filterThang ? ` tháng ${filterThang.slice(0,4)}/${filterThang.slice(5,7)}` : ""}. Hãy import file TikTok ở trên.</span>
                            </div>
                          )}
                          {hasTiktokData && (
                            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                              Hiển thị tất cả creator từ file TikTok{filterThang ? ` tháng ${filterThang.slice(0,4)}/${filterThang.slice(5,7)}` : ""} · {kocRows.length} creator
                            </div>
                          )}

                          {/* Table */}
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-3 py-2 text-slate-500">#</th>
                                <th className="text-left px-3 py-2 text-slate-500">KOC</th>
                                <th className="text-right px-3 py-2 text-slate-500">GMV</th>
                                <th className="text-right px-3 py-2 text-slate-500">Đơn hàng</th>
                                <th className="text-right px-3 py-2 text-slate-500">Hoàn tiền</th>
                                <th className="text-right px-3 py-2 text-slate-500">Hoa hồng</th>
                                <th className="text-right px-3 py-2 text-slate-500">Giá booking</th>
                                <th className="text-right px-3 py-2 text-slate-500 font-semibold">ROI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {sorted.map((r, i) => {
                                const rRoiNum = r.chiPhiCast > 0 ? (r.doanhThu - r.chiPhiCast) / r.chiPhiCast * 100 : 0;
                                const rRoi = r.chiPhiCast > 0 ? rRoiNum.toFixed(1) : "—";
                                return (
                                  <tr key={r.kocId} className={!r.hasTiktok ? "opacity-40" : ""}>
                                    <td className="px-3 py-2 text-slate-400">{i+1}</td>
                                    <td className="px-3 py-2 font-medium text-slate-700">
                                      {r.kocName}
                                      {r.hasBooking && <span className="ml-1.5 text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">đã booking</span>}
                                      {!r.hasTiktok && <span className="ml-1 text-[10px] text-amber-500">(chưa có data)</span>}
                                    </td>
                                    <td className="px-3 py-2 text-right text-green-700 font-semibold">{r.doanhThu > 0 ? formatCurrency(r.doanhThu) : "—"}</td>
                                    <td className="px-3 py-2 text-right text-slate-600">{r.donHang > 0 ? r.donHang.toLocaleString() : "—"}</td>
                                    <td className="px-3 py-2 text-right text-red-500">{r.hoanTien > 0 ? formatCurrency(r.hoanTien) : "—"}</td>
                                    <td className="px-3 py-2 text-right text-amber-600">{r.hoaHong > 0 ? formatCurrency(r.hoaHong) : "—"}</td>
                                    <td className="px-3 py-2 text-right text-slate-600">{r.chiPhiCast > 0 ? formatCurrency(r.chiPhiCast) : "—"}</td>
                                    <td className={`px-3 py-2 text-right font-bold ${rRoi === "—" ? "text-slate-400" : rRoiNum >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {rRoi}{rRoi !== "—" ? "%" : ""}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
        );
      })()}

      {/* KOC Table */}
      {tab === "kocs" && (() => {
        const [kocListThang, setKocListThang] = [filterThang, setFilterThang];
        const TRANG_THAI_HOP_TAC: Record<string, { label: string; color: string }> = {
          chua_tra_loi:  { label: "Chưa trả lời", color: "bg-slate-100 text-slate-500" },
          da_duyet:      { label: "Đã duyệt",     color: "bg-green-100 text-green-700" },
          dang_hop_tac:  { label: "Đang hợp tác", color: "bg-blue-100 text-blue-700"  },
          tu_choi:       { label: "Từ chối",       color: "bg-red-100 text-red-600"    },
        };
        const updateTrangThai = async (kocId: string, trangThaiHopTac: string) => {
          await fetch(`/api/koc/${kocId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trangThaiHopTac }) });
          setKocs(prev => prev.map(k => k.id === kocId ? { ...k, trangThaiHopTac } : k));
        };
        // Đếm booking theo tháng cho từng KOC
        const bookingCountMap = new Map<string, number>();
        for (const b of bookings) {
          if (kocListThang && b.ngayBat?.slice(0, 7) !== kocListThang) continue;
          bookingCountMap.set(b.kocId, (bookingCountMap.get(b.kocId) ?? 0) + 1);
        }
        // Danh sách tháng thêm KOC (từ createdAt)
        const createdThangList = Array.from(new Set(
          kocs.map(k => k.createdAt?.slice(0, 7)).filter(Boolean)
        )).sort().reverse() as string[];

        const kocSearchFiltered = kocs.filter(k => {
          if (searchKOC && !k.ten.toLowerCase().includes(searchKOC.toLowerCase())) return false;
          if (kocFilterCreated && k.createdAt?.slice(0, 7) !== kocFilterCreated) return false;
          return true;
        });

        // Stats tỉ lệ booking
        const totalInPeriod = kocSearchFiltered.length;
        const bookedInPeriod = kocSearchFiltered.filter(k => bookingCountMap.get(k.id) ?? (bookings.some(b => b.kocId === k.id))).length;
        const convRate = totalInPeriod > 0 ? (bookedInPeriod / totalInPeriod * 100).toFixed(1) : "0";

        return (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="relative max-w-xs flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchKOC} onChange={e => setSearchKOC(e.target.value)}
                placeholder="Tìm tên KOC..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Tháng booking:</label>
              <select value={kocListThang} onChange={e => setKocListThang(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200">
                <option value="">Tất cả</option>
                {thangListAll.map(t => { const [y, m] = t.split("-"); return <option key={t} value={t}>Tháng {m}/{y}</option>; })}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Thêm vào tháng:</label>
              <select value={kocFilterCreated} onChange={e => setKocFilterCreated(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200">
                <option value="">Tất cả</option>
                {createdThangList.map(t => { const [y, m] = t.split("-"); return <option key={t} value={t}>Tháng {m}/{y}</option>; })}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Trạng thái:</label>
              <select value={kocFilterTT} onChange={e => setKocFilterTT(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="">Tất cả</option>
                {Object.entries(TRANG_THAI_HOP_TAC).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
            </div>
            <span className="text-xs text-slate-400 ml-auto">{kocSearchFiltered.length} KOC</span>
          </div>

          {/* Stats tỉ lệ chuyển đổi */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Users size={15} className="text-blue-500" /></div>
              <div>
                <p className="text-xs text-slate-400">KOC{kocFilterCreated ? ` thêm T${kocFilterCreated.slice(5,7)}/${kocFilterCreated.slice(0,4)}` : " tổng"}</p>
                <p className="text-lg font-bold text-slate-800">{totalInPeriod}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><CheckCircle size={15} className="text-green-500" /></div>
              <div>
                <p className="text-xs text-slate-400">Đã có booking</p>
                <p className="text-lg font-bold text-green-600">{bookedInPeriod}</p>
              </div>
            </div>
            <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${Number(convRate) >= 50 ? "bg-green-50 border-green-200" : Number(convRate) >= 20 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${Number(convRate) >= 50 ? "bg-green-100" : Number(convRate) >= 20 ? "bg-amber-100" : "bg-red-100"}`}>
                <TrendingUp size={15} className={Number(convRate) >= 50 ? "text-green-600" : Number(convRate) >= 20 ? "text-amber-600" : "text-red-500"} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Tỉ lệ book được</p>
                <p className={`text-lg font-bold ${Number(convRate) >= 50 ? "text-green-600" : Number(convRate) >= 20 ? "text-amber-600" : "text-red-600"}`}>{convRate}%</p>
              </div>
            </div>
          </div>

          {(() => {
            const finalFiltered = kocSearchFiltered.filter(k => !kocFilterTT || (k.trangThaiHopTac || "chua_tra_loi") === kocFilterTT);
            return (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="rounded border-slate-300 cursor-pointer"
                      onChange={e => {
                        const ids = finalFiltered.map(k => k.id);
                        setSelectedKocIds(e.target.checked ? new Set(ids) : new Set());
                      }}
                      checked={finalFiltered.length > 0 && finalFiltered.every(k => selectedKocIds.has(k.id))} />
                  </th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">#</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Tên KOC</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Trạng thái</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Ghi chú</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Giá cast</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">Booking{kocListThang ? ` T${kocListThang.slice(5,7)}` : ""}</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">SĐT</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Địa chỉ</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Link</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalFiltered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-slate-400">Không có KOC nào</td></tr>
                ) : finalFiltered.map((k, i) => {
                  const tt = TRANG_THAI_HOP_TAC[k.trangThaiHopTac] ?? TRANG_THAI_HOP_TAC["chua_tra_loi"];
                  const bc = bookingCountMap.get(k.id) ?? 0;
                  return (
                  <tr key={k.id} className={`hover:bg-slate-50 ${selectedKocIds.has(k.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-slate-300 cursor-pointer"
                        checked={selectedKocIds.has(k.id)}
                        onChange={e => setSelectedKocIds(prev => { const s = new Set(prev); e.target.checked ? s.add(k.id) : s.delete(k.id); return s; })} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{k.ten}</td>
                    <td className="px-4 py-3">
                      <select
                        value={k.trangThaiHopTac || "chua_tra_loi"}
                        onChange={e => updateTrangThai(k.id, e.target.value)}
                        className={`text-xs rounded-lg px-2 py-1 border-0 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-300 ${tt.color}`}
                      >
                        {Object.entries(TRANG_THAI_HOP_TAC).map(([v, { label }]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    </td>
                    {/* Ghi chú — inline edit */}
                    <td className="px-4 py-3 max-w-[180px]">
                      {editingKocGCId === k.id ? (
                        <textarea autoFocus rows={2} ref={kocGcRef} defaultValue={k.ghiChu ?? ""}
                          onBlur={() => saveKocGhiChu(k)}
                          onKeyDown={e => { if (e.key === "Escape") setEditingKocGCId(null); }}
                          className="w-full text-xs border border-blue-300 rounded px-2 py-1 focus:outline-none resize-none" />
                      ) : (
                        <button onClick={() => setEditingKocGCId(k.id)} className="text-xs text-left w-full hover:text-blue-600 cursor-pointer">
                          {k.ghiChu ? <span className="text-slate-600 line-clamp-2">{k.ghiChu}</span> : <span className="text-slate-300 italic">+ ghi chú</span>}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">{k.giaCast > 0 ? formatCurrency(k.giaCast) : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {bc > 0 ? <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">{bc}</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{k.sdt || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs max-w-[120px] truncate">{k.diaChi || "—"}</td>
                    <td className="px-4 py-3">
                      {k.linkProfile ? <a href={k.linkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Profile</a> : "—"}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button onClick={() => openEditKOC(k)} className="text-xs text-rose-500 hover:underline">Sửa</button>
                      <button onClick={async () => {
                        if (!confirm(`Xóa KOC "${k.ten}"? Hành động không thể hoàn tác.`)) return;
                        await fetch(`/api/koc/${k.id}`, { method: "DELETE" });
                        setKocs(prev => prev.filter(x => x.id !== k.id));
                      }} className="text-xs text-slate-400 hover:text-red-500 hover:underline">Xóa</button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
            </div>
            );
          })()}
        </div>
        );
      })()}

      {tab === "thanhTich" && (() => {
        // ── Tổng hợp doanh thu từ TikTok import (lọc theo tháng) ──
        const filteredTiktokKOC = kocViewThang
          ? tiktokKOC.filter(r => r.thang === kocViewThang)
          : tiktokKOC;
        const kocGMVMap = new Map<string, number>();
        const kocDonMap = new Map<string, number>();
        for (const r of filteredTiktokKOC) {
          kocGMVMap.set(r.kocId, (kocGMVMap.get(r.kocId) ?? 0) + r.doanhThu);
          kocDonMap.set(r.kocId, (kocDonMap.get(r.kocId) ?? 0) + r.donHang);
        }
        // Chi phí cast từ bookings (lọc theo tháng nếu chọn)
        const kocChiMap = new Map<string, number>();
        for (const b of bookings) {
          if (kocViewThang && b.ngayBat?.slice(0, 7) !== kocViewThang) continue;
          kocChiMap.set(b.kocId, (kocChiMap.get(b.kocId) ?? 0) + b.chiPhiCast);
        }
        // Merge: KOC có doanh thu hoặc đã booking
        const kocStats = kocs.map(k => {
          const gmv = kocGMVMap.get(k.id) ?? 0;
          const chi = kocChiMap.get(k.id) ?? 0;
          const roi = chi > 0 ? (gmv - chi) / chi * 100 : null;
          const donHang = kocDonMap.get(k.id) ?? 0;
          const bookingCount = bookings.filter(b => b.kocId === k.id &&
            (!kocViewThang || b.ngayBat?.slice(0, 7) === kocViewThang)).length;
          return { koc: k, gmv, chi, roi, donHang, bookingCount };
        }).sort((a, b) => b.gmv - a.gmv);

        const hasReport = tiktokKOC.length > 0;
        const top20 = kocStats.filter(r => r.gmv > 0).slice(0, 20);
        const maxGMV = Math.max(...top20.map(r => r.gmv), 1);
        const chartH = 180;
        const barW = 22;
        const barGap = 8;
        const chartPadL = 75;
        const chartW = Math.max(700, top20.length * (barW + barGap) + chartPadL + 20);
        const lowROI = kocStats.filter(r => r.bookingCount > 0 && r.roi !== null && r.roi < 10);

        const searchFiltered = kocStats.filter(k =>
          !searchKOC || k.koc.ten.toLowerCase().includes(searchKOC.toLowerCase())
        );

        return (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="relative max-w-xs flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={searchKOC} onChange={e => setSearchKOC(e.target.value)}
                placeholder="Tìm tên KOC..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">Tháng:</label>
              <select value={kocViewThang} onChange={e => setKocViewThang(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                <option value="">Tất cả</option>
                {thangListAll.map(t => { const [y, m] = t.split("-"); return <option key={t} value={t}>Tháng {m}/{y}</option>; })}
              </select>
            </div>
            <button onClick={() => { setContactSheetUrl(""); setContactError(""); setContactPreview([]); setContactDone(false); setModalContacts(true); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition whitespace-nowrap ml-auto">
              <FileSpreadsheet size={15} /> Cập nhật SĐT/ĐCHI từ Sheet
            </button>
          </div>

          {/* Cảnh báo ROI thấp */}
          {lowROI.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-amber-700 mb-2">⚠️ {lowROI.length} KOC đã booking nhưng ROI &lt; 10%</p>
              <div className="flex flex-wrap gap-2">
                {lowROI.map(r => (
                  <span key={r.koc.id} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg">
                    {r.koc.ten} · ROI {r.roi!.toFixed(1)}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Biểu đồ GMV top KOC */}
          {hasReport && top20.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-3">📊 Top {top20.length} KOC theo doanh thu (GMV)</p>
              <div className="overflow-x-auto">
                <svg width={chartW} height={chartH + 55} className="block">
                  {[0,25,50,75,100].map(pct => {
                    const y = 10 + (chartH - 10) * (1 - pct / 100);
                    const label = pct === 0 ? "0" : (maxGMV * pct / 100 >= 1e6
                      ? (maxGMV * pct / 100 / 1e6).toFixed(0) + "tr"
                      : Math.round(maxGMV * pct / 100).toLocaleString("vi-VN"));
                    return (
                      <g key={pct}>
                        <line x1={chartPadL} x2={chartW - 10} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                        <text x={chartPadL - 4} y={y + 4} fontSize={9} fill="#94a3b8" textAnchor="end">{label}</text>
                      </g>
                    );
                  })}
                  {top20.map((r, i) => {
                    const x = chartPadL + i * (barW + barGap);
                    const h = Math.max(2, (r.gmv / maxGMV) * (chartH - 10));
                    const barY = chartH + 10 - h;
                    const roiOk = r.roi === null || r.roi >= 10;
                    return (
                      <g key={r.koc.id}>
                        <rect x={x} y={barY} width={barW} height={h}
                          fill={roiOk ? "#22c55e" : "#f59e0b"} rx={3} opacity={0.85}>
                          <title>{r.koc.ten}{"\n"}GMV: {formatCurrency(r.gmv)}{r.roi !== null ? `\nROI: ${r.roi.toFixed(1)}%` : ""}</title>
                        </rect>
                        {!roiOk && <text x={x + barW/2} y={barY - 3} fontSize={8} fill="#d97706" textAnchor="middle">⚠</text>}
                        <text x={x + barW/2} y={chartH + 22} fontSize={8} fill="#64748b" textAnchor="middle"
                          transform={`rotate(-40,${x + barW/2},${chartH + 22})`}>
                          {r.koc.ten.length > 12 ? r.koc.ten.slice(0,11)+"…" : r.koc.ten}
                        </text>
                      </g>
                    );
                  })}
                  <line x1={chartPadL} x2={chartW-10} y1={chartH+10} y2={chartH+10} stroke="#e2e8f0" strokeWidth={1}/>
                </svg>
              </div>
              <div className="flex gap-4 mt-1 px-1">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block"/><span className="text-xs text-slate-500">ROI ≥ 10%</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block"/><span className="text-xs text-slate-500">ROI &lt; 10% (cảnh báo)</span></div>
              </div>
            </div>
          )}

          {/* Bảng KOC */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Tên KOC</th>
                  {hasReport && <th className="text-right px-4 py-3 text-slate-600 font-medium">Doanh thu TikTok</th>}
                  {hasReport && <th className="text-right px-4 py-3 text-slate-600 font-medium">Đơn hàng</th>}
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Chi phí cast</th>
                  {hasReport && <th className="text-right px-4 py-3 text-slate-600 font-medium">ROI</th>}
                  <th className="text-right px-4 py-3 text-slate-600 font-medium">Booking</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">SĐT</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-medium">Link</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {searchFiltered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-10 text-slate-400">
                    {searchKOC ? `Không tìm thấy KOC nào với "${searchKOC}"` : "Chưa có KOC nào"}
                  </td></tr>
                ) : searchFiltered.map(({ koc: k, gmv, chi, roi, donHang, bookingCount }) => {
                  const warn = bookingCount > 0 && roi !== null && roi < 10;
                  return (
                    <tr key={k.id} className={`hover:bg-slate-50 ${warn ? "bg-amber-50/40" : ""}`}>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {k.ten}
                        {warn && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">ROI thấp</span>}
                      </td>
                      {hasReport && <td className="px-4 py-3 text-right font-semibold text-green-700">{gmv > 0 ? formatCurrency(gmv) : "—"}</td>}
                      {hasReport && <td className="px-4 py-3 text-right text-slate-600">{donHang > 0 ? donHang : "—"}</td>}
                      <td className="px-4 py-3 text-right text-slate-600">{chi > 0 ? formatCurrency(chi) : "—"}</td>
                      {hasReport && (
                        <td className={`px-4 py-3 text-right font-bold ${roi === null ? "text-slate-400" : roi < 10 ? "text-amber-600" : "text-green-600"}`}>
                          {roi !== null ? roi.toFixed(1) + "%" : "—"}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right font-medium text-rose-600">{bookingCount}</td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{k.sdt || "—"}</td>
                      <td className="px-4 py-3">
                        {k.linkProfile ? <a href={k.linkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs">Profile</a> : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openEditKOC(k)} className="text-xs text-rose-500 hover:underline">Sửa</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        );
      })()}

      {/* ═══ TAB SCHEDULE ═══ */}
      {tab === "schedule" && (() => {
        // Tất cả bookings (không lọc theo tháng để thấy full timeline)
        const allB = bookings.filter(b => b.ngayBat || b.ngayLenVideo || b.ngayRaHang);

        if (allB.length === 0) {
          return (
            <div className="text-center py-20 text-slate-400">
              <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
              <p>Chưa có booking nào có ngày</p>
            </div>
          );
        }

        // ── Tính khung ngày (min/max) ──
        const allMs: number[] = [];
        allB.forEach(b => {
          if (b.ngayRaHang)   allMs.push(new Date(b.ngayRaHang).getTime());
          if (b.ngayBat)      allMs.push(new Date(b.ngayBat).getTime());
          if (b.ngayLenVideo) allMs.push(new Date(b.ngayLenVideo).getTime());
        });
        const rawMin = new Date(Math.min(...allMs));
        const rawMax = new Date(Math.max(...allMs));
        rawMin.setDate(rawMin.getDate() - 4);
        rawMax.setDate(rawMax.getDate() + 7);
        const totalMs  = rawMax.getTime() - rawMin.getTime();
        const totalDays = totalMs / 86400000;

        function pct(dateStr: string): number {
          const t = new Date(dateStr).getTime();
          return Math.max(0, Math.min(100, ((t - rawMin.getTime()) / totalMs) * 100));
        }

        // ── Nhãn ngày trên trục ──
        const axisLabels: { d: Date; x: number }[] = [];
        for (let i = 0; i <= totalDays; i++) {
          const d = new Date(rawMin.getTime() + i * 86400000);
          if (d.getDate() % (totalDays > 30 ? 5 : totalDays > 14 ? 3 : 1) === 0) {
            axisLabels.push({ d, x: (i / totalDays) * 100 });
          }
        }

        const todayX = ((Date.now() - rawMin.getTime()) / totalMs) * 100;
        const showToday = todayX >= 0 && todayX <= 100;

        // ── Nhóm theo sản phẩm ──
        const groups: {
          spId: string | null; label: string; sku: string; mauSac: string | null;
          items: Booking[];
        }[] = [];
        const seenSP = new Set<string>();
        allB.forEach(b => {
          const key = b.sanPhamId ?? "__none__";
          if (!seenSP.has(key)) {
            seenSP.add(key);
            groups.push({
              spId: b.sanPhamId,
              label: b.sanPham?.ten ?? "Không có SP",
              sku: b.sanPham?.sku ?? "—",
              mauSac: b.sanPham?.mauSac ?? null,
              items: [],
            });
          }
          groups.find(g => (g.spId ?? "__none__") === key)!.items.push(b);
        });

        // Màu dải cho từng product row
        const TRACK_COLORS = ["#f43f5e","#8b5cf6","#0ea5e9","#10b981","#f59e0b","#ec4899","#14b8a6","#6366f1"];

        return (
          <div className="mt-2 space-y-4">
            {/* Legend + Tạo Booking */}
            <div className="flex flex-wrap items-center gap-5 bg-white border rounded-xl px-5 py-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-700 mr-1">Chú thích:</span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rotate-45 bg-emerald-500 rounded-sm" />
                🚀 Lịch ra hàng
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rotate-45 rounded-sm" style={{ backgroundColor: "#f43f5e" }} />
                📦 Lịch gửi hàng
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                🎬 Air video (tên KOC)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-0.5" style={{ borderTop: "2px dashed #f59e0b" }} />
                Hôm nay
              </span>
              <button
                onClick={() => { setModalBooking(true); }}
                className="ml-auto flex items-center gap-1.5 bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-600"
              >
                <Plus size={13} /> Tạo Booking
              </button>
            </div>

            {/* Timeline container */}
            <div className="bg-white border rounded-xl overflow-x-auto">
              {/* Axis header */}
              <div className="flex">
                <div className="w-52 flex-shrink-0 border-r border-b bg-slate-50 h-8" />
                <div className="flex-1 relative h-8 border-b bg-slate-50 min-w-[600px]">
                  {axisLabels.map((al, i) => (
                    <div key={i} className="absolute top-0 bottom-0" style={{ left: `${al.x}%` }}>
                      <div className="absolute top-0 bottom-0 w-px bg-slate-200" />
                      <span className="absolute top-1 left-1 text-[10px] text-slate-400 whitespace-nowrap">
                        {al.d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>
                  ))}
                  {showToday && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10" style={{ left: `${todayX}%` }}>
                      <span className="absolute -top-0 left-1 text-[9px] text-amber-600 font-semibold whitespace-nowrap">hôm nay</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Rows per product */}
              {groups.map((g, gi) => {
                const trackColor = TRACK_COLORS[gi % TRACK_COLORS.length];
                // unique send dates
                const sendDates = Array.from(new Set(g.items.map(b => b.ngayBat).filter(Boolean))) as string[];

                return (
                  <div key={g.spId ?? "none"} className="flex border-b last:border-0">
                    {/* Left label */}
                    <div className="w-52 flex-shrink-0 px-4 py-4 border-r bg-slate-50 flex flex-col justify-center gap-0.5">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate" title={g.label}>{g.label}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{g.sku}</p>
                      {g.mauSac && (
                        <span className="inline-flex items-center gap-1 mt-0.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 w-fit">
                          <span className="w-2 h-2 rounded-full border border-slate-300 inline-block" style={{ background: /^#/.test(g.mauSac) ? g.mauSac : "currentColor" }} />
                          {g.mauSac}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">{g.items.length} KOC</span>
                    </div>

                    {/* Timeline area */}
                    <div className="flex-1 relative min-w-[600px]" style={{ minHeight: Math.max(80, 60 + g.items.filter(b => b.ngayLenVideo).length * 22) }}>
                      {/* Grid lines */}
                      {axisLabels.map((al, i) => (
                        <div key={i} className="absolute top-0 bottom-0 w-px bg-slate-100" style={{ left: `${al.x}%` }} />
                      ))}
                      {/* Today */}
                      {showToday && (
                        <div className="absolute top-0 bottom-0 w-0.5 bg-amber-200 z-10" style={{ left: `${todayX}%` }} />
                      )}

                      {/* Track bar spanning ra hàng → latest video */}
                      {(() => {
                        const xs = [
                          ...g.items.filter(b => b.ngayRaHang).map(b => pct(b.ngayRaHang!)),
                          ...g.items.filter(b => b.ngayBat).map(b => pct(b.ngayBat!)),
                          ...g.items.filter(b => b.ngayLenVideo).map(b => pct(b.ngayLenVideo!)),
                        ];
                        if (xs.length < 2) return null;
                        const xMin = Math.min(...xs);
                        const xMax = Math.max(...xs);
                        return (
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full opacity-20"
                            style={{ left: `${xMin}%`, width: `${xMax - xMin}%`, backgroundColor: trackColor }}
                          />
                        );
                      })()}

                      {/* ── 🚀 Lịch ra hàng (ngayRaHang) — diamond xanh lá ── */}
                      {(() => {
                        const raDates = Array.from(new Set(g.items.map(b => b.ngayRaHang).filter(Boolean))) as string[];
                        return raDates.map((nd, si) => {
                          const x = pct(nd);
                          return (
                            <div key={`ra-${si}`} className="absolute z-20 flex flex-col items-center" style={{ left: `${x}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                              <div title={`Ra hàng: ${new Date(nd).toLocaleDateString("vi-VN")}`} className="w-4 h-4 rotate-45 rounded-sm shadow bg-emerald-500" />
                              <span className="absolute top-6 text-[9px] whitespace-nowrap font-semibold text-emerald-700">
                                {new Date(nd).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                              </span>
                              <span className="absolute -top-5 text-[9px] whitespace-nowrap text-emerald-600 font-medium">🚀 Ra hàng</span>
                            </div>
                          );
                        });
                      })()}

                      {/* ── 📦 Lịch gửi hàng (ngayBat) — diamond trackColor ── */}
                      {sendDates.map((nd, si) => {
                        const x = pct(nd);
                        return (
                          <div key={si} className="absolute z-20 flex flex-col items-center" style={{ left: `${x}%`, top: "50%", transform: "translate(-50%, -50%)" }}>
                            <div title={`Gửi hàng: ${new Date(nd).toLocaleDateString("vi-VN")}`} className="w-3.5 h-3.5 rotate-45 rounded-sm shadow-sm" style={{ backgroundColor: trackColor }} />
                            <span className="absolute top-5 text-[9px] whitespace-nowrap font-semibold" style={{ color: trackColor }}>
                              {new Date(nd).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                            </span>
                            <span className="absolute -top-4 text-[9px] whitespace-nowrap text-slate-500">📦 Gửi hàng</span>
                          </div>
                        );
                      })}

                      {/* ── 🎬 Air video (ngayLenVideo) — circle xanh + KOC name ── */}
                      {g.items.filter(b => b.ngayLenVideo).map((b, bi) => {
                        const x = pct(b.ngayLenVideo!);
                        const topOffset = 28 + bi * 22;
                        return (
                          <div key={b.id} className="absolute z-20 flex flex-col items-center" style={{ left: `${x}%`, top: `${topOffset}%`, transform: "translate(-50%, -50%)" }}>
                            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" title={`${b.koc.ten} — ${new Date(b.ngayLenVideo!).toLocaleDateString("vi-VN")}`} />
                            <span className="absolute top-4 text-[9px] text-blue-700 whitespace-nowrap font-medium max-w-[80px] truncate" title={b.koc.ten}>{b.koc.ten}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Summary: KOC nào chưa có ngày lên video ── */}
            {(() => {
              const missing = allB.filter(b => !b.ngayLenVideo);
              if (!missing.length) return null;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                  <p className="text-xs font-semibold text-amber-700 mb-2">⚠ {missing.length} KOC chưa điền ngày lên video:</p>
                  <div className="flex flex-wrap gap-2">
                    {missing.map(b => (
                      <span key={b.id} className="text-xs bg-white border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                        {b.koc.ten}
                        {b.sanPham ? ` · ${b.sanPham.ten}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Modal Chọn Sản phẩm để Booking */}
      {modalPickSP && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Chọn sản phẩm để Booking</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chọn sản phẩm → tích KOC → tạo booking</p>
              </div>
              <button onClick={() => { setModalPickSP(false); setPickSPSearch(""); }} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Tìm theo tên hoặc SKU..."
                  value={pickSPSearch}
                  onChange={e => setPickSPSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-3 space-y-2">
              {(() => {
                const filtered = sanPhams.filter(sp =>
                  sp.ten.toLowerCase().includes(pickSPSearch.toLowerCase()) ||
                  sp.sku.toLowerCase().includes(pickSPSearch.toLowerCase())
                );
                if (filtered.length === 0) return (
                  <p className="text-center text-slate-400 py-8">Không tìm thấy sản phẩm</p>
                );
                return filtered.map(sp => {
                const soBooking = bookings.filter(b => b.sanPhamId === sp.id).length;
                return (
                  <div key={sp.id} className="rounded-xl border border-slate-200 hover:border-rose-200 transition">
                    <button
                      onClick={() => { setModalPickSP(false); openLaunch(sp); }}
                      className="w-full flex items-center gap-4 p-4 text-left group"
                    >
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100">
                        <Package size={16} className="text-slate-400 group-hover:text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{sp.ten}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <span className="font-mono">{sp.sku}</span>
                          <span className="mx-2">·</span>
                          Giá nhập: {formatCurrency(sp.giaNhap)}
                          <span className="mx-2">·</span>
                          Tồn: {sp.tonKho}
                        </p>
                      </div>
                      {soBooking > 0 && (
                        <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-medium flex-shrink-0">
                          {soBooking} KOC
                        </span>
                      )}
                      <span className="text-rose-400 text-sm flex-shrink-0">→</span>
                    </button>
                    {/* TikTok ID inline */}
                    <div className="px-4 pb-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] text-slate-400 shrink-0">TikTok ID:</span>
                      {editingSpTikTok === sp.id ? (
                        <input
                          autoFocus
                          ref={spTikTokRef}
                          type="text"
                          defaultValue={sp.tiktokProductId ?? ""}
                          onBlur={() => saveSpTikTokId(sp)}
                          onKeyDown={e => { if (e.key === "Enter") saveSpTikTokId(sp); if (e.key === "Escape") setEditingSpTikTok(null); }}
                          className="flex-1 border border-violet-300 rounded px-2 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-300"
                          placeholder="Nhập TikTok Product ID..."
                        />
                      ) : (
                        <button
                          onClick={() => setEditingSpTikTok(sp.id)}
                          className={`text-xs font-mono ${sp.tiktokProductId ? "text-violet-600 hover:underline" : "text-slate-300 hover:text-violet-400"}`}
                        >
                          {sp.tiktokProductId ?? "+ Thêm ID"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modal Launch — chọn KOC cho sản phẩm */}
      {modalLaunch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Chọn KOC cho sản phẩm</h2>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{modalLaunch.sku}</span>
                <span className="font-medium text-slate-700">{modalLaunch.ten}</span>
                <span>Giá nhập: <b>{formatCurrency(modalLaunch.giaNhap)}</b></span>
                <span>Tồn: <b>{modalLaunch.tonKho}</b></span>
              </div>
            </div>

            <form onSubmit={handleLaunchSubmit} className="flex flex-col flex-1 overflow-hidden">
              {/* Lịch trình chung cho cả lô — Air video điền riêng theo từng KOC ở bảng sau khi tạo */}
              <div className="px-5 pt-4 pb-2 flex gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">🚀 Lịch ra hàng</label>
                  <input type="date" value={launchNgayRaHang} onChange={e => setLaunchNgayRaHang(e.target.value)} className="w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">📦 Ngày bắt đầu booking (gửi hàng) *</label>
                  <input required type="date" value={launchNgayBat} onChange={e => setLaunchNgayBat(e.target.value)} className="w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>

              {/* Tìm kiếm + Chọn tất cả */}
              <div className="px-5 py-2 border-b border-slate-100 space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={launchSearch}
                    onChange={e => setLaunchSearch(e.target.value)}
                    placeholder="Tìm tên KOC..."
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  {launchSearch && (
                    <button onClick={() => setLaunchSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chon-tat-ca"
                    className="rounded"
                    checked={kocs.every(k => launchKOCs[k.id]?.checked)}
                    onChange={(e) => {
                      const updated = { ...launchKOCs };
                      kocs.forEach(k => { updated[k.id] = { ...updated[k.id], checked: e.target.checked }; });
                      setLaunchKOCs(updated);
                    }}
                  />
                  <label htmlFor="chon-tat-ca" className="text-xs font-medium text-slate-600 cursor-pointer">
                    Chọn tất cả ({kocs.filter(k => launchKOCs[k.id]?.checked).length}/{kocs.length} đã chọn)
                  </label>
                </div>
              </div>

              {/* Danh sách KOC có thể scroll */}
              <div className="overflow-y-auto flex-1 px-5 py-2 space-y-1">
                {(() => {
                  const filtered = launchSearch
                    ? kocs.filter(k => k.ten.toLowerCase().includes(launchSearch.toLowerCase()))
                    : kocs;
                  if (filtered.length === 0) return (
                    <p className="text-center text-sm text-slate-400 py-6">Không tìm thấy KOC nào</p>
                  );
                  return filtered.map((k) => {
                    const item = launchKOCs[k.id] ?? { checked: false, soLuong: "1" };
                    const chiPhiSP = modalLaunch.giaNhap * (Number(item.soLuong) || 0);
                    const tongCP = k.giaCast + chiPhiSP;
                    return (
                      <div key={k.id} className={`flex items-center gap-3 p-3 rounded-lg border transition ${item.checked ? "border-rose-200 bg-rose-50" : "border-slate-100 hover:bg-slate-50"}`}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => setLaunchKOCs(prev => ({ ...prev, [k.id]: { ...prev[k.id], checked: e.target.checked } }))}
                          className="rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{k.ten}</p>
                          <p className="text-xs text-slate-400">
                            {PLATFORM_LABEL[k.platform]} · Cast: {k.giaCast > 0 ? formatCurrency(k.giaCast) : "Chưa có"}
                          </p>
                        </div>
                        {item.checked && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="text-right text-xs text-slate-400">
                              <p>SP: {formatCurrency(chiPhiSP)}</p>
                              <p className="font-medium text-rose-600">Tổng: {formatCurrency(tongCP)}</p>
                            </div>
                            <div>
                              <label className="text-xs text-slate-500 block mb-0.5">Số lượng</label>
                              <input
                                type="number" min="1" value={item.soLuong}
                                onChange={(e) => setLaunchKOCs(prev => ({ ...prev, [k.id]: { ...prev[k.id], soLuong: e.target.value } }))}
                                className="w-16 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-rose-300"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Tổng kết */}
              {kocs.some(k => launchKOCs[k.id]?.checked) && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex gap-6">
                  <span><b>{kocs.filter(k => launchKOCs[k.id]?.checked).length}</b> KOC được chọn</span>
                  <span>Tổng chi phí: <b className="text-rose-600">{formatCurrency(
                    kocs.filter(k => launchKOCs[k.id]?.checked).reduce((s, k) => {
                      const item = launchKOCs[k.id];
                      return s + k.giaCast + modalLaunch.giaNhap * (Number(item?.soLuong) || 1);
                    }, 0)
                  )}</b></span>
                </div>
              )}

              <div className="flex gap-2 p-5 border-t border-slate-200">
                <button type="button" onClick={() => setModalLaunch(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading || !kocs.some(k => launchKOCs[k.id]?.checked)} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {loading ? "Đang tạo..." : `Tạo ${kocs.filter(k => launchKOCs[k.id]?.checked).length} booking`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Google Sheet */}
      {modalSheet && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet size={18} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Import từ Google Sheets</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Dán link sheet chứa kết quả KOC</p>
                </div>
              </div>
              <button onClick={() => setModalSheet(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Hướng dẫn */}
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500 space-y-1.5">
                <p className="font-semibold text-slate-600">Cấu trúc sheet cần có các cột:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span> Tên kênh / KOC</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span> Lượt xem</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span> Đơn hàng</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span> Doanh thu</span>
                </div>
                <p className="text-slate-400 pt-1">Sheet phải được chia sẻ: <b className="text-slate-600">Anyone with the link → Viewer</b></p>
              </div>

              {/* URL Input */}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Link Google Sheets</label>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="url"
                    value={sheetUrl}
                    onChange={e => { setSheetUrl(e.target.value); setSheetError(""); }}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData("text");
                      if (pasted.includes("docs.google.com/spreadsheets")) {
                        e.preventDefault();
                        setSheetUrl(pasted.trim());
                        setSheetError("");
                      }
                    }}
                    onKeyDown={e => e.key === "Enter" && handleSheetImport()}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                {sheetError && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{sheetError}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 p-5 pt-0">
              <button
                onClick={() => setModalSheet(false)}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl hover:bg-slate-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleSheetImport}
                disabled={sheetLoading || !sheetUrl.trim()}
                className="flex-1 px-4 py-2.5 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition flex items-center justify-center gap-2 font-semibold"
              >
                {sheetLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Đang tải...</>
                  : <><FileSpreadsheet size={15} /> Tải & xem trước</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {modalImport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">Preview kết quả Import</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {importPreview.filter(r => r.matched).length + Object.keys(manualMatches).length}/{importPreview.length} dòng sẽ được cập nhật
                  {Object.keys(manualMatches).length > 0 && (
                    <span className="ml-1 text-blue-600 font-medium">({Object.keys(manualMatches).length} ghép thủ công)</span>
                  )}
                </p>
              </div>
              {importDone && (
                <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} /> Đã cập nhật thành công!
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5 w-8">
                      <input type="checkbox"
                        checked={importPreview.filter(r => !r.matched && !manualMatches[r.rowIndex]).length > 0 &&
                          importPreview.filter(r => !r.matched && !manualMatches[r.rowIndex]).every(r => addNewSelected.has(r.rowIndex))}
                        onChange={e => {
                          const unmatched = importPreview.filter(r => !r.matched && !manualMatches[r.rowIndex]).map(r => r.rowIndex);
                          setAddNewSelected(e.target.checked ? new Set(unmatched) : new Set());
                        }}
                        className="rounded" title="Chọn tất cả chưa khớp"
                      />
                    </th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium text-xs">Tên kênh (file)</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium text-xs">KOC trong hệ thống</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium text-xs">Sản phẩm</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium text-xs">SĐT (cột I)</th>
                    <th className="text-left px-4 py-2.5 text-slate-600 font-medium text-xs">ĐCHI (cột J)</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-medium text-xs">Lượt xem</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-medium text-xs">Đơn hàng</th>
                    <th className="text-right px-4 py-2.5 text-slate-600 font-medium text-xs">Doanh thu</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {importPreview.map((row) => (
                    <tr key={row.rowIndex} className={row.matched ? "bg-white" : manualMatches[row.rowIndex] ? "bg-blue-50" : addNewSelected.has(row.rowIndex) ? "bg-emerald-50" : "bg-amber-50"}>
                      <td className="px-3 py-2.5 text-center">
                        {!row.matched && !manualMatches[row.rowIndex] ? (
                          <input type="checkbox"
                            checked={addNewSelected.has(row.rowIndex)}
                            onChange={e => {
                              setAddNewSelected(prev => {
                                const n = new Set(prev);
                                e.target.checked ? n.add(row.rowIndex) : n.delete(row.rowIndex);
                                return n;
                              });
                            }}
                            className="rounded"
                          />
                        ) : null}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 text-xs font-medium">{row.kocName}</td>
                      <td className="px-4 py-2.5 text-xs">
                        {row.matched ? (
                          <span className="text-green-700 font-medium flex items-center gap-1">
                            <CheckCircle size={12} className="text-green-500" /> {row.kocTen}
                          </span>
                        ) : manualMatches[row.rowIndex] ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle size={12} className="text-blue-500 flex-shrink-0" />
                            <select
                              value={manualMatches[row.rowIndex]?.kocId ?? ""}
                              onChange={e => {
                                const kocId = e.target.value;
                                if (!kocId) { setManualMatches(prev => { const n = {...prev}; delete n[row.rowIndex]; return n; }); return; }
                                const koc = kocs.find(k => k.id === kocId);
                                const latestBooking = bookings.find(b => b.kocId === kocId);
                                setManualMatches(prev => ({ ...prev, [row.rowIndex]: { kocId, kocTen: koc?.ten ?? "", bookingId: latestBooking?.id ?? "", bookingSP: latestBooking?.sanPham?.ten ?? null } }));
                              }}
                              className="text-xs border border-blue-200 rounded px-1 py-0.5 bg-blue-50 text-blue-700 focus:outline-none max-w-[130px]"
                            >
                              <option value="">-- Xoá --</option>
                              {kocs.map(k => <option key={k.id} value={k.id}>{k.ten}</option>)}
                            </select>
                          </div>
                        ) : (
                          <select
                            defaultValue=""
                            onChange={e => {
                              const kocId = e.target.value;
                              if (!kocId) return;
                              const koc = kocs.find(k => k.id === kocId);
                              const latestBooking = bookings.find(b => b.kocId === kocId);
                              setManualMatches(prev => ({ ...prev, [row.rowIndex]: { kocId, kocTen: koc?.ten ?? "", bookingId: latestBooking?.id ?? "", bookingSP: latestBooking?.sanPham?.ten ?? null } }));
                            }}
                            className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none focus:border-rose-300 max-w-[150px] bg-amber-50"
                          >
                            <option value="">-- Chọn KOC --</option>
                            {kocs.map(k => <option key={k.id} value={k.id}>{k.ten}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">
                        {row.matched ? (row.bookingSP ?? "—") : (manualMatches[row.rowIndex]?.bookingSP ?? "—")}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {row.sdt
                          ? <span className="text-slate-700 font-mono">{row.sdt}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs max-w-[160px]">
                        {row.diaChi
                          ? <span className="text-slate-600 truncate block" title={row.diaChi}>{row.diaChi}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs text-slate-700">{row.luotXem.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-slate-700">{row.donHang.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-medium text-green-700">{formatCurrency(row.doanhThu)}</td>
                      <td className="px-4 py-2.5 text-center">
                        {row.matched
                          ? <CheckCircle size={14} className="text-green-500 mx-auto" />
                          : manualMatches[row.rowIndex]
                            ? <CheckCircle size={14} className="text-blue-500 mx-auto" />
                            : <XCircle size={14} className="text-amber-400 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Không khớp warning */}
            {importPreview.some(r => !r.matched) && (
              <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
                ⚠️ {importPreview.filter(r => !r.matched && !manualMatches[r.rowIndex]).length} dòng chưa khớp KOC
                {Object.keys(manualMatches).length > 0 && (
                  <span className="text-blue-600 ml-1 font-medium">· {Object.keys(manualMatches).length} đã ghép thủ công</span>
                )}
                <span className="text-slate-500 ml-1">— Chọn KOC từ dropdown để ghép thủ công.</span>
              </div>
            )}

            <div className="flex gap-2 p-5 border-t border-slate-200 flex-wrap">
              <button onClick={() => { setModalImport(false); setImportPreview([]); setImportDone(false); setAddNewSelected(new Set()); }}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                {importDone ? "Đóng" : "Huỷ"}
              </button>
              {/* Nút thêm mới KOC từ danh sách đã chọn */}
              {!importDone && addNewSelected.size > 0 && (
                <button
                  onClick={handleAddNewKOCs}
                  disabled={addingNew}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addingNew
                    ? <><Loader2 size={14} className="animate-spin" /> Đang thêm...</>
                    : <><Plus size={14} /> Thêm {addNewSelected.size} KOC mới</>}
                </button>
              )}
              {!importDone && (
                <button
                  onClick={handleImportConfirm}
                  disabled={importLoading || (!importPreview.some(r => r.matched) && Object.keys(manualMatches).length === 0)}
                  className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {importLoading
                    ? "Đang cập nhật..."
                    : <><Upload size={14} /> Cập nhật {importPreview.filter(r => r.matched).length + Object.keys(manualMatches).filter(k => manualMatches[+k]?.bookingId).length} booking</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Cập nhật SĐT/ĐCHI từ Sheet */}
      {modalContacts && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileSpreadsheet size={18} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Cập nhật SĐT & Địa chỉ KOC từ Google Sheets</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Cột I = SĐT · Cột J = Địa chỉ · Tên kênh tự ghép với KOC trong hệ thống</p>
                </div>
              </div>
              <button onClick={() => setModalContacts(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            {/* URL input */}
            <div className="p-5 border-b border-slate-100">
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="url"
                  value={contactSheetUrl}
                  onChange={e => { setContactSheetUrl(e.target.value); setContactError(""); }}
                  onPaste={e => {
                    const p = e.clipboardData.getData("text");
                    if (p.includes("docs.google.com/spreadsheets")) {
                      e.preventDefault(); setContactSheetUrl(p.trim()); setContactError("");
                      setTimeout(handleContactPreview, 100);
                    }
                  }}
                  onKeyDown={e => e.key === "Enter" && handleContactPreview()}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
                <button
                  onClick={handleContactPreview}
                  disabled={contactLoading || !contactSheetUrl.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition whitespace-nowrap"
                >
                  {contactLoading ? <><Loader2 size={14} className="animate-spin" /> Đang tải...</> : "Xem trước"}
                </button>
              </div>
              {contactError && <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{contactError}</p>}
            </div>

            {/* Preview table */}
            {contactPreview.length > 0 && (
              <>
                <div className="px-5 py-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <span className="font-semibold text-green-600">{contactPreview.filter(r => r.matched).length}</span> / {contactPreview.length} KOC khớp
                    {contactPreview.filter(r => !r.matched).length > 0 && (
                      <span className="ml-2 text-amber-600">{contactPreview.filter(r => !r.matched).length} không tìm thấy (sẽ bỏ qua)</span>
                    )}
                  </span>
                  {contactDone && <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={13} /> Đã cập nhật!</span>}
                </div>
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Tên kênh (sheet)</th>
                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">KOC trong hệ thống</th>
                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">SĐT hiện tại</th>
                        <th className="text-left px-4 py-2.5 text-xs text-green-600 font-semibold">SĐT mới (cột I)</th>
                        <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">ĐCHI hiện tại</th>
                        <th className="text-left px-4 py-2.5 text-xs text-green-600 font-semibold">ĐCHI mới (cột J)</th>
                        <th className="px-4 py-2.5 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {contactPreview.map(row => (
                        <tr key={row.rowIndex} className={row.matched ? "bg-white hover:bg-slate-50" : "bg-amber-50"}>
                          <td className="px-4 py-2.5 text-xs font-medium text-slate-700">{row.kocName}</td>
                          <td className="px-4 py-2.5 text-xs">
                            {row.matched
                              ? <span className="text-green-700 font-medium flex items-center gap-1"><CheckCircle size={11} className="text-green-500" />{row.kocTen}</span>
                              : <span className="text-amber-600 flex items-center gap-1"><XCircle size={11} />Không tìm thấy</span>}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{row.oldSdt || "—"}</td>
                          <td className="px-4 py-2.5 text-xs">
                            {row.newSdt
                              ? <span className={`font-mono font-semibold ${row.matched ? "text-green-700" : "text-slate-400"}`}>{row.newSdt}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-400 max-w-[150px]"><span className="truncate block">{row.oldDiaChi || "—"}</span></td>
                          <td className="px-4 py-2.5 text-xs max-w-[180px]">
                            {row.newDiaChi
                              ? <span className={`truncate block ${row.matched ? "text-green-700 font-medium" : "text-slate-400"}`} title={row.newDiaChi}>{row.newDiaChi}</span>
                              : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {row.matched ? <CheckCircle size={13} className="text-green-500 mx-auto" /> : <XCircle size={13} className="text-amber-400 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {contactPreview.length === 0 && !contactLoading && contactSheetUrl && !contactError && (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Không có dữ liệu SĐT/ĐCHI trong sheet
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 p-5 border-t border-slate-100">
              <button onClick={() => setModalContacts(false)} className="px-4 py-2 text-sm border border-slate-200 rounded-xl hover:bg-slate-50">
                {contactDone ? "Đóng" : "Huỷ"}
              </button>
              {!contactDone && contactPreview.some(r => r.matched) && (
                <button
                  onClick={handleContactConfirm}
                  disabled={contactConfirming}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition font-semibold"
                >
                  {contactConfirming
                    ? <><Loader2 size={14} className="animate-spin" />Đang cập nhật...</>
                    : <><CheckCircle size={14} />Cập nhật {contactPreview.filter(r => r.matched).length} KOC</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm KOC */}
      {modalKOC && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-800">Thêm KOC mới</h2></div>
            <form onSubmit={handleAddKOC} className="p-5 space-y-3">

              {/* Dán link tự động lấy thông tin */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Link2 size={13} /> Dán link profile để tự lấy thông tin
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkInput}
                    onChange={e => setLinkInput(e.target.value)}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData("text");
                      if (pasted.includes("tiktok.com") || pasted.includes("shopee.vn") || pasted.includes("instagram.com") || pasted.includes("facebook.com")) {
                        e.preventDefault();
                        setLinkInput(pasted.trim());
                        setTimeout(() => fetchProfileFromLink(pasted.trim(), "add"), 100);
                      }
                    }}
                    placeholder="https://www.tiktok.com/@username"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-300 bg-white"
                  />
                  <button
                    type="button"
                    disabled={linkLoading || !linkInput.trim()}
                    onClick={() => fetchProfileFromLink(linkInput, "add")}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition whitespace-nowrap"
                  >
                    {linkLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    {linkLoading ? "Đang lấy..." : "Lấy info"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">Hỗ trợ: TikTok, Shopee, Instagram, Facebook — dán link tự nhận diện</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Tên KOC *</label>
                  <input required value={formKOC.ten} onChange={(e) => setFormKOC({ ...formKOC, ten: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Nền tảng *</label>
                  <select value={formKOC.platform} onChange={(e) => setFormKOC({ ...formKOC, platform: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="tiktok">TikTok</option>
                    <option value="shopee">Shopee</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Follower</label>
                  <input type="number" min="0" value={formKOC.follower} onChange={(e) => setFormKOC({ ...formKOC, follower: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá cast (VNĐ)</label>
                  <input type="number" min="0" value={formKOC.giaCast} onChange={(e) => setFormKOC({ ...formKOC, giaCast: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">SĐT</label>
                  <input value={formKOC.sdt} onChange={(e) => setFormKOC({ ...formKOC, sdt: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="0901..." />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Link profile</label>
                  <input value={formKOC.linkProfile} onChange={(e) => setFormKOC({ ...formKOC, linkProfile: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Địa chỉ (ĐCHI)</label>
                  <input value={formKOC.diaChi} onChange={(e) => setFormKOC({ ...formKOC, diaChi: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                  <input value={formKOC.ghiChu} onChange={(e) => setFormKOC({ ...formKOC, ghiChu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => { setModalKOC(false); setLinkInput(""); }} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">{loading ? "Đang lưu..." : "Thêm KOC"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạo Booking */}
      {modalBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-800">Tạo Booking mới</h2></div>
            <form onSubmit={handleAddBooking} className="p-5 space-y-4">

              {/* KOC */}
              <div>
                <label className="text-xs text-slate-600 mb-1 block">KOC *</label>
                <select required value={formBooking.kocId} onChange={(e) => setFormBooking({ ...formBooking, kocId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                  <option value="">-- Chọn KOC --</option>
                  {kocs.map((k) => <option key={k.id} value={k.id}>{k.ten} {k.giaCast > 0 ? `· ${formatCurrency(k.giaCast)}` : ""}</option>)}
                </select>
                {selectedKOC && (
                  <p className="text-xs text-slate-400 mt-1">Giá cast: <span className="font-medium text-slate-700">{formatCurrency(selectedKOC.giaCast)}</span></p>
                )}
              </div>

              {/* Sản phẩm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block flex items-center gap-1"><Package size={12} /> Sản phẩm gửi KOC</label>
                  <select value={formBooking.sanPhamId} onChange={(e) => setFormBooking({ ...formBooking, sanPhamId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="">-- Không chọn --</option>
                    {sanPhams.map((s) => <option key={s.id} value={s.id}>{s.sku} — {s.ten}</option>)}
                  </select>
                  {selectedSP && (
                    <p className="text-xs text-slate-400 mt-1">Giá nhập: <span className="font-medium text-slate-700">{formatCurrency(selectedSP.giaNhap)}</span> · Tồn: {selectedSP.tonKho}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Số lượng gửi</label>
                  <input type="number" min="0" value={formBooking.soLuongGui} onChange={(e) => setFormBooking({ ...formBooking, soLuongGui: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>

              {/* Tổng chi phí preview */}
              <div className="bg-slate-50 rounded-lg p-3 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Chi phí cast</span>
                  <span>{formatCurrency(chiPhiCast)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Chi phí sản phẩm ({formBooking.soLuongGui || 0} × {selectedSP ? formatCurrency(selectedSP.giaNhap) : "0₫"})</span>
                  <span>{formatCurrency(chiPhiSP)}</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Tổng chi phí</span>
                  <span className="text-rose-600">{formatCurrency(tongChiPhiBooking)}</span>
                </div>
              </div>

              {/* Lịch trình — Air video không điền ở đây, nhân viên tự cập nhật sau theo từng KOC */}
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-3">
                <p className="text-xs font-semibold text-rose-700 flex items-center gap-1">📅 Lịch trình</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block font-medium">🚀 Lịch ra hàng</label>
                    <input type="date" value={formBooking.ngayRaHang} onChange={e => setFormBooking({ ...formBooking, ngayRaHang: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block font-medium">📦 Lịch gửi hàng *</label>
                    <input required type="date" value={formBooking.ngayBat} onChange={e => setFormBooking({ ...formBooking, ngayBat: e.target.value })} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white" />
                  </div>
                </div>
                <p className="text-[11px] text-rose-400">🎬 Lịch air video sẽ do nhân viên cập nhật riêng cho từng KOC sau, trong bảng booking hoặc tab Lịch trình.</p>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <input value={formBooking.ghiChu} onChange={(e) => setFormBooking({ ...formBooking, ghiChu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setModalBooking(false)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">{loading ? "Đang lưu..." : "Tạo Booking"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa KOC */}
      {modalEditKOC && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200"><h2 className="font-bold text-slate-800">Sửa thông tin KOC</h2></div>
            <form onSubmit={handleEditKOC} className="p-5 space-y-3">

              {/* Dán link để refresh thông tin */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Link2 size={13} /> Cập nhật qua link profile
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={linkEditInput}
                    onChange={e => setLinkEditInput(e.target.value)}
                    onPaste={e => {
                      const pasted = e.clipboardData.getData("text");
                      if (pasted.includes("tiktok.com") || pasted.includes("shopee.vn") || pasted.includes("instagram.com") || pasted.includes("facebook.com")) {
                        e.preventDefault();
                        setLinkEditInput(pasted.trim());
                        setTimeout(() => fetchProfileFromLink(pasted.trim(), "edit"), 100);
                      }
                    }}
                    placeholder="https://www.tiktok.com/@username"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-300 bg-white"
                  />
                  <button
                    type="button"
                    disabled={linkEditLoading || !linkEditInput.trim()}
                    onClick={() => fetchProfileFromLink(linkEditInput, "edit")}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition whitespace-nowrap"
                  >
                    {linkEditLoading ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    {linkEditLoading ? "Đang lấy..." : "Lấy info"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Tên KOC *</label>
                  <input required value={formEditKOC.ten} onChange={(e) => setFormEditKOC({ ...formEditKOC, ten: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Nền tảng *</label>
                  <select value={formEditKOC.platform} onChange={(e) => setFormEditKOC({ ...formEditKOC, platform: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="tiktok">TikTok</option>
                    <option value="shopee">Shopee</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Follower</label>
                  <input type="number" min="0" value={formEditKOC.follower} onChange={(e) => setFormEditKOC({ ...formEditKOC, follower: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Giá cast (VNĐ)</label>
                  <input type="number" min="0" value={formEditKOC.giaCast} onChange={(e) => setFormEditKOC({ ...formEditKOC, giaCast: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">SĐT</label>
                  <input value={formEditKOC.sdt} onChange={(e) => setFormEditKOC({ ...formEditKOC, sdt: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="0901..." />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Link profile</label>
                  <input value={formEditKOC.linkProfile} onChange={(e) => setFormEditKOC({ ...formEditKOC, linkProfile: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Địa chỉ (ĐCHI)</label>
                  <input value={formEditKOC.diaChi} onChange={(e) => setFormEditKOC({ ...formEditKOC, diaChi: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                  <input value={formEditKOC.ghiChu} onChange={(e) => setFormEditKOC({ ...formEditKOC, ghiChu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalEditKOC(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">{loading ? "Đang lưu..." : "Lưu"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa thông tin Booking */}
      {modalEditBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Sửa booking</h2>
              <p className="text-xs text-slate-400 mt-0.5">{modalEditBooking.koc.ten}{modalEditBooking.sanPham ? ` · ${modalEditBooking.sanPham.sku}` : ""}</p>
            </div>
            <form onSubmit={handleSaveEditBooking} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">KOC *</label>
                <select required value={formEditBooking.kocId} onChange={e => setFormEditBooking({...formEditBooking, kocId: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                  {kocs.map(k => <option key={k.id} value={k.id}>{k.ten}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Sản phẩm</label>
                  <select value={formEditBooking.sanPhamId} onChange={e => setFormEditBooking({...formEditBooking, sanPhamId: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="">-- Không --</option>
                    {sanPhams.map(s => <option key={s.id} value={s.id}>{s.sku}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Số lượng gửi</label>
                  <input type="number" min="0" value={formEditBooking.soLuongGui}
                    onChange={e => setFormEditBooking({...formEditBooking, soLuongGui: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Giá cast (VNĐ)</label>
                <input type="number" min="0" value={formEditBooking.chiPhiCast}
                  onChange={e => setFormEditBooking({...formEditBooking, chiPhiCast: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="0" />
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-rose-700">📅 Lịch trình</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">🚀 Ra hàng</label>
                    <input type="date" value={formEditBooking.ngayRaHang}
                      onChange={e => setFormEditBooking({...formEditBooking, ngayRaHang: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">📦 Gửi hàng *</label>
                    <input required type="date" value={formEditBooking.ngayBat}
                      onChange={e => setFormEditBooking({...formEditBooking, ngayBat: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">🎬 Air video</label>
                    <input type="date" value={formEditBooking.ngayLenVideo}
                      onChange={e => setFormEditBooking({...formEditBooking, ngayLenVideo: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white" />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <input value={formEditBooking.ghiChu} onChange={e => setFormEditBooking({...formEditBooking, ghiChu: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalEditBooking(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                  {loading ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Chi phí */}
      {modalEditChiPhi && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Cập nhật chi phí</h2>
              <p className="text-xs text-slate-400 mt-0.5">{modalEditChiPhi.koc.ten}{modalEditChiPhi.sanPham ? ` · ${modalEditChiPhi.sanPham.sku}` : ""}</p>
            </div>
            <form onSubmit={handleSaveChiPhi} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Chi phí Cast (VNĐ)</label>
                <input type="number" min="0" value={formEditChiPhi.chiPhiCast}
                  onChange={e => setFormEditChiPhi({...formEditChiPhi, chiPhiCast: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Chi phí Sản phẩm (VNĐ)</label>
                <input type="number" min="0" value={formEditChiPhi.chiPhiSP}
                  onChange={e => setFormEditChiPhi({...formEditChiPhi, chiPhiSP: e.target.value})}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-xs flex justify-between">
                <span className="text-slate-500">Tổng chi phí</span>
                <span className="font-bold text-rose-600">
                  {((Number(formEditChiPhi.chiPhiCast)||0) + (Number(formEditChiPhi.chiPhiSP)||0)).toLocaleString("vi-VN")}đ
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setModalEditChiPhi(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                  {loading ? "Đang lưu..." : "Lưu chi phí"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cập nhật kết quả */}
      {modalUpdate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-5 border-b border-slate-200">
              <h2 className="font-bold text-slate-800">Cập nhật kết quả</h2>
              <p className="text-xs text-slate-400 mt-0.5">{modalUpdate.koc.ten}{modalUpdate.sanPham ? ` · ${modalUpdate.sanPham.sku}` : ""}</p>
            </div>
            <form onSubmit={handleUpdateBooking} className="p-5 space-y-3">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Doanh thu (VNĐ)</label>
                <input type="number" min="0" value={formUpdate.doanhThu} onChange={(e) => setFormUpdate({ ...formUpdate, doanhThu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Số đơn hàng</label>
                <input type="number" min="0" value={formUpdate.donHang} onChange={(e) => setFormUpdate({ ...formUpdate, donHang: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Lượt xem</label>
                <input type="number" min="0" value={formUpdate.luotXem} onChange={(e) => setFormUpdate({ ...formUpdate, luotXem: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Trạng thái</label>
                <select value={formUpdate.trangThai} onChange={(e) => setFormUpdate({ ...formUpdate, trangThai: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                  {Object.entries(TRANG_THAI_BOOKING).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <input value={formUpdate.ghiChu} onChange={(e) => setFormUpdate({ ...formUpdate, ghiChu: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalUpdate(null)} className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">{loading ? "Đang lưu..." : "Lưu"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal kết quả Import TikTok ── */}
      {tiktokImportResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Kết quả Import TikTok — {tiktokImportResult.thang}</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1 bg-violet-50 border border-violet-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-violet-700">{tiktokImportResult.spSaved}/{tiktokImportResult.spTotal}</p>
                  <p className="text-xs text-violet-500 mt-0.5">Sản phẩm khớp</p>
                </div>
                <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{tiktokImportResult.kocSaved}</p>
                  <p className="text-xs text-green-500 mt-0.5">KOC đã lưu</p>
                </div>
              </div>
              {tiktokImportResult.newKOCs.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs font-bold text-blue-700 mb-1">KOC mới được tạo ({tiktokImportResult.newKOCs.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {tiktokImportResult.newKOCs.map(n => (
                      <span key={n} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                </div>
              )}
              {tiktokImportResult.unmatchedProducts.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-bold text-amber-700 mb-1">ID sản phẩm chưa có TikTok ID ({tiktokImportResult.unmatchedProducts.length})</p>
                  <p className="text-xs text-amber-600 mb-1">Vào trang Kho → điền TikTok ID cho các sản phẩm này rồi import lại.</p>
                  <div className="max-h-24 overflow-y-auto space-y-0.5">
                    {tiktokImportResult.unmatchedProducts.map(pid => (
                      <p key={pid} className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{pid}</p>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => setTiktokImportResult(null)}
                className="w-full px-4 py-2 text-sm bg-violet-500 text-white rounded-lg hover:bg-violet-600"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
