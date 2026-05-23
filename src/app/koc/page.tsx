"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Star, TrendingUp, Eye, ShoppingBag, DollarSign, Users, Package, Upload, CheckCircle, XCircle, Search, Sparkles, ChevronDown, ChevronUp, Link2, Loader2, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, PLATFORM_LABEL, TRANG_THAI_BOOKING } from "@/lib/utils";

type SanPham = { id: string; ten: string; sku: string; giaNhap: number; giaBan: number; tonKho: number; createdAt: string };
type KOC = { id: string; ten: string; platform: string; follower: number; giaCast: number; linkProfile: string | null; sdt: string | null; email: string | null; diaChi: string | null; ghiChu: string | null };
type Booking = {
  id: string; kocId: string; sanPhamId: string | null;
  soLuongGui: number; chiPhiCast: number; chiPhiSP: number; chiPhi: number;
  ngayBat: string; ngayKet: string | null;
  trangThai: string; doanhThu: number; donHang: number; luotXem: number; ghiChu: string | null;
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
  const [tab, setTab] = useState<"bookings" | "kocs">("bookings");
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
  const [formEditBooking, setFormEditBooking] = useState({ kocId: "", sanPhamId: "", soLuongGui: "1", chiPhiCast: "", ngayBat: "", ngayKet: "", ghiChu: "" });
  const [formEditChiPhi, setFormEditChiPhi] = useState({ chiPhiCast: "", chiPhiSP: "" });
  const [modalLaunch, setModalLaunch] = useState<SanPham | null>(null);
  const [launchKOCs, setLaunchKOCs] = useState<Record<string, { checked: boolean; soLuong: string }>>({});
  const [launchNgayBat, setLaunchNgayBat] = useState("");
  const [launchSearch, setLaunchSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeXuat, setShowDeXuat] = useState(false);

  type PreviewRow = {
    rowIndex: number; kocName: string; kocId: string | null; kocTen: string | null;
    bookingId: string | null; bookingSP: string | null;
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
  const [formBooking, setFormBooking] = useState({ kocId: "", sanPhamId: "", soLuongGui: "1", ngayBat: "", ngayKet: "", ghiChu: "" });
  const [formUpdate, setFormUpdate] = useState({ doanhThu: "", donHang: "", luotXem: "", trangThai: "", ghiChu: "" });

  const fetchData = async () => {
    const [k, b, sp] = await Promise.all([
      fetch("/api/koc").then((r) => r.json()),
      fetch("/api/koc/booking").then((r) => r.json()),
      fetch("/api/kho/san-pham").then((r) => r.json()),
    ]);
    setKocs(k);
    setBookings(b);
    setSanPhams(Array.isArray(sp) ? sp : sp.data ?? []);
  };

  useEffect(() => { fetchData(); }, []);

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
      setFormBooking({ kocId: "", sanPhamId: "", soLuongGui: "1", ngayBat: "", ngayKet: "", ghiChu: "" });
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
      ngayBat: b.ngayBat.slice(0, 10),
      ngayKet: b.ngayKet ? b.ngayKet.slice(0, 10) : "",
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
      const added = await Promise.all(toAdd.map(r =>
        fetch("/api/koc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten: r.kocName, platform: "tiktok", follower: 0, giaCast: 0 }),
        }).then(res => res.json())
      ));
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

  // Stats
  const tongChiPhi  = bookings.reduce((s, b) => s + b.chiPhi, 0);
  const tongDoanhThu = bookings.reduce((s, b) => s + b.doanhThu, 0);
  const tongDonHang  = bookings.reduce((s, b) => s + b.donHang, 0);
  const roiTB = tongChiPhi > 0 ? ((tongDoanhThu - tongChiPhi) / tongChiPhi * 100).toFixed(1) : "0";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">KOC Booking</h1>
        <p className="text-slate-500 text-sm mt-1">Quản lý và đánh giá hiệu quả booking KOC</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><Users size={16} className="text-rose-400" /><p className="text-xs text-slate-500">Tổng KOC</p></div>
          <p className="text-xl font-bold text-slate-800">{kocs.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={16} className="text-red-400" /><p className="text-xs text-slate-500">Tổng chi phí</p></div>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(tongChiPhi)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-400" /><p className="text-xs text-slate-500">Tổng doanh thu</p></div>
          <p className="text-xl font-bold text-green-600">{formatCurrency(tongDoanhThu)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-2"><ShoppingBag size={16} className="text-blue-400" /><p className="text-xs text-slate-500">Tổng đơn hàng</p></div>
          <p className="text-xl font-bold text-slate-800">{tongDonHang.toLocaleString()}</p>
        </div>
        <div className={`rounded-xl p-4 border ${Number(roiTB) >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-2 mb-2"><Star size={16} className={Number(roiTB) >= 0 ? "text-green-500" : "text-red-400"} /><p className="text-xs text-slate-500">ROI trung bình</p></div>
          <p className={`text-xl font-bold ${Number(roiTB) >= 0 ? "text-green-600" : "text-red-600"}`}>{roiTB}%</p>
        </div>
      </div>

      {/* Đề xuất KOC — sản phẩm mới chưa có booking */}
      {newSanPhams.length > 0 && (
        <div className="mb-5 bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDeXuat(v => !v)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/30 transition text-left"
          >
            <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-rose-700">
                Đề xuất Booking — {newSanPhams.length} sản phẩm mới chưa có KOC
              </p>
              <p className="text-xs text-rose-500">Sản phẩm thêm trong 7 ngày qua • Nhấn để {showDeXuat ? "thu gọn" : "xem"}</p>
            </div>
            {showDeXuat ? <ChevronUp size={16} className="text-rose-400" /> : <ChevronDown size={16} className="text-rose-400" />}
          </button>

          {showDeXuat && (
            <div className="border-t border-rose-100 divide-y divide-rose-100">
              {newSanPhams.map(sp => {
                const daysSince = Math.floor((Date.now() - new Date(sp.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                const top3 = kocRankings.slice(0, 3);
                return (
                  <div key={sp.id} className="px-5 py-4">
                    {/* Sản phẩm header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-white rounded-lg border border-rose-200 flex items-center justify-center flex-shrink-0">
                        <Package size={14} className="text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 text-sm truncate">{sp.ten}</span>
                          <span className="text-xs font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{sp.sku}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                            {daysSince === 0 ? "Hôm nay" : `${daysSince} ngày trước`}
                          </span>
                          {sp.giaNhap > 0 && (
                            <span className="text-xs text-slate-400">Giá nhập: {formatCurrency(sp.giaNhap)}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openLaunch(sp)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition flex-shrink-0 font-medium"
                      >
                        <Plus size={12} /> Booking ngay
                      </button>
                    </div>

                    {/* Gợi ý top KOC */}
                    {top3.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-2 ml-11">Gợi ý KOC theo hiệu quả:</p>
                        <div className="ml-11 flex flex-wrap gap-2">
                          {top3.map((k, idx) => (
                            <div
                              key={k.id}
                              className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs"
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-slate-400" : "bg-orange-300"}`}>
                                {idx + 1}
                              </span>
                              <div>
                                <p className="font-medium text-slate-800">{k.ten}</p>
                                <p className="text-slate-400">
                                  {k.roi !== null
                                    ? <span className={k.roi >= 0 ? "text-green-600 font-semibold" : "text-red-500"}>ROI {k.roi >= 0 ? "+" : ""}{k.roi.toFixed(0)}%</span>
                                    : <span className="text-slate-400">Chưa có dữ liệu</span>
                                  }
                                  {k.doneCount > 0 && <span className="ml-1 text-slate-400">· {k.doneCount} chiến dịch</span>}
                                </p>
                              </div>
                            </div>
                          ))}
                          {kocRankings.length === 0 && (
                            <span className="text-xs text-slate-400 italic">Chưa có KOC nào trong hệ thống</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {(["bookings", "kocs"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 text-sm rounded-lg font-medium transition ${tab === t ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {t === "bookings" ? "Danh sách Booking" : "Danh sách KOC"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className={`flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer ${importLoading ? "opacity-50 pointer-events-none" : ""}`}>
            <Upload size={16} className="text-slate-500" />
            {importLoading ? "Đang đọc..." : "Import Excel"}
            <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
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
        // Tạo danh sách tháng có booking
        const thangSet = new Set<string>();
        bookings.forEach(b => {
          const d = new Date(b.ngayBat);
          thangSet.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
        });
        const thangList = Array.from(thangSet).sort().reverse();

        // Lọc bookings
        const filteredBookings = bookings.filter(b => {
          if (filterThang) {
            const d = new Date(b.ngayBat);
            const bThang = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
            if (bThang !== filterThang) return false;
          }
          if (filterSP && b.sanPhamId !== filterSP) return false;
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
              const totalCast  = group.items.reduce((s, b) => s + b.chiPhiCast, 0);
              const totalSP    = group.items.reduce((s, b) => s + b.chiPhiSP, 0);
              const totalDT    = group.items.reduce((s, b) => s + b.doanhThu, 0);
              const totalDon   = group.items.reduce((s, b) => s + b.donHang, 0);
              const totalView  = group.items.reduce((s, b) => s + b.luotXem, 0);
              const roi        = totalCP > 0 ? ((totalDT - totalCP) / totalCP * 100).toFixed(1) : "—";
              const roiNum     = totalCP > 0 ? (totalDT - totalCP) / totalCP * 100 : 0;
              const isOpen     = expandedSP === group.key;
              const subTab     = spSubTab[group.key] ?? "koc";

              return (
                <div key={group.key} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header card — click để mở/đóng */}
                  <button
                    onClick={() => setExpandedSP(isOpen ? null : group.key)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package size={15} className="text-slate-400" />
                        <span className="font-semibold text-slate-800">{group.label}</span>
                        <span className="text-xs text-slate-400 font-mono">{group.sku}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{group.items.length} KOC</span>
                      </div>
                    </div>
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
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Tổng CP</p>
                        <p className="font-semibold text-slate-700">{formatCurrency(totalCP)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Doanh thu</p>
                        <p className="font-semibold text-green-600">{formatCurrency(totalDT)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Đơn hàng</p>
                        <p className="font-semibold text-slate-700">{totalDon.toLocaleString()}</p>
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
                              <th className="text-left px-5 py-2.5 text-slate-500 font-medium text-xs">KOC</th>
                              <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Thời gian</th>
                              <th className="text-right px-4 py-2.5 text-slate-500 font-medium text-xs">Số lượng gửi</th>
                              <th className="text-left px-4 py-2.5 text-slate-500 font-medium text-xs">Trạng thái</th>
                              <th className="px-4 py-2.5"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map(b => (
                              <tr key={b.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3">
                                  <p className="font-medium text-slate-800">{b.koc.ten}</p>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${b.koc.platform === "tiktok" ? "bg-pink-100 text-pink-700" : b.koc.platform === "shopee" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                    {PLATFORM_LABEL[b.koc.platform]}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-slate-500">
                                  {formatDate(b.ngayBat)}{b.ngayKet ? ` → ${formatDate(b.ngayKet)}` : " → ..."}
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-slate-600">{b.soLuongGui} cái</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${TT_COLOR[b.trangThai]}`}>
                                    {TRANG_THAI_BOOKING[b.trangThai]}
                                  </span>
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
                            ))}
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

                      {/* Tab: Hiệu quả */}
                      {subTab === "hieugua" && (
                        <div className="p-5">
                          <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng lượt xem</p>
                              <p className="text-lg font-bold text-slate-800">{totalView.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng đơn hàng</p>
                              <p className="text-lg font-bold text-slate-800">{totalDon.toLocaleString()}</p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                              <p className="text-xs text-slate-500 mb-1">Tổng doanh thu</p>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(totalDT)}</p>
                            </div>
                            <div className={`rounded-xl p-4 border ${roiNum >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                              <p className="text-xs text-slate-500 mb-1">ROI tổng</p>
                              <p className={`text-lg font-bold ${roiNum >= 0 ? "text-green-600" : "text-red-600"}`}>{roi}{roi !== "—" ? "%" : ""}</p>
                            </div>
                          </div>
                          <table className="w-full text-xs">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left px-3 py-2 text-slate-500">KOC</th>
                                <th className="text-right px-3 py-2 text-slate-500">Lượt xem</th>
                                <th className="text-right px-3 py-2 text-slate-500">Đơn hàng</th>
                                <th className="text-right px-3 py-2 text-slate-500">Doanh thu</th>
                                <th className="text-right px-3 py-2 text-slate-500">Chi phí</th>
                                <th className="text-right px-3 py-2 text-slate-500 font-semibold">ROI</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {group.items.map(b => {
                                const bRoi = b.chiPhi > 0 ? ((b.doanhThu - b.chiPhi) / b.chiPhi * 100).toFixed(1) : "—";
                                const bRoiNum = b.chiPhi > 0 ? (b.doanhThu - b.chiPhi) / b.chiPhi * 100 : 0;
                                return (
                                  <tr key={b.id}>
                                    <td className="px-3 py-2 font-medium text-slate-700">{b.koc.ten}</td>
                                    <td className="px-3 py-2 text-right text-slate-600">{b.luotXem > 0 ? b.luotXem.toLocaleString() : "—"}</td>
                                    <td className="px-3 py-2 text-right text-slate-600">{b.donHang}</td>
                                    <td className="px-3 py-2 text-right text-green-700">{formatCurrency(b.doanhThu)}</td>
                                    <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(b.chiPhi)}</td>
                                    <td className={`px-3 py-2 text-right font-bold ${bRoi === "—" ? "text-slate-400" : bRoiNum >= 0 ? "text-green-600" : "text-red-600"}`}>
                                      {bRoi}{bRoi !== "—" ? "%" : ""}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
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
      {tab === "kocs" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Search bar + action */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchKOC}
                onChange={e => setSearchKOC(e.target.value)}
                placeholder="Tìm tên KOC..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
              {searchKOC && (
                <button onClick={() => setSearchKOC("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
              )}
            </div>
            <button
              onClick={() => { setContactSheetUrl(""); setContactError(""); setContactPreview([]); setContactDone(false); setModalContacts(true); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-green-300 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition whitespace-nowrap"
            >
              <FileSpreadsheet size={15} /> Cập nhật SĐT/ĐCHI từ Sheet
            </button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Tên KOC</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">Giá cast</th>
                <th className="text-right px-4 py-3 text-slate-600 font-medium">Booking</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">SĐT</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Địa chỉ</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Link</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(() => {
                const filtered = kocs.filter(k => !searchKOC || k.ten.toLowerCase().includes(searchKOC.toLowerCase()));
                if (filtered.length === 0) return (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">
                    {searchKOC ? `Không tìm thấy KOC nào với "${searchKOC}"` : "Chưa có KOC nào"}
                  </td></tr>
                );
                return filtered.map((k) => {
                const kocBookings = bookings.filter((b) => b.kocId === k.id);
                return (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{k.ten}</td>
                    <td className="px-4 py-3 text-right text-slate-700">{k.giaCast > 0 ? formatCurrency(k.giaCast) : "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">{kocBookings.length}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{k.sdt || "—"}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm max-w-[180px]">
                      <span className="truncate block" title={k.diaChi || ""}>{k.diaChi || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {k.linkProfile ? <a href={k.linkProfile} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-xs truncate block max-w-32">Xem profile</a> : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEditKOC(k)} className="text-xs text-rose-500 hover:underline">Sửa</button>
                    </td>
                  </tr>
                );
              })})()}
            </tbody>
          </table>
        </div>
      )}

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
                  <button
                    key={sp.id}
                    onClick={() => { setModalPickSP(false); openLaunch(sp); }}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition text-left group"
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
              {/* Ngày bắt đầu */}
              <div className="px-5 pt-4 pb-2">
                <label className="text-xs text-slate-600 mb-1 block">Ngày bắt đầu booking *</label>
                <input required type="date" value={launchNgayBat} onChange={e => setLaunchNgayBat(e.target.value)} className="w-48 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
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

              {/* Thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ngày bắt đầu *</label>
                  <input required type="date" value={formBooking.ngayBat} onChange={(e) => setFormBooking({ ...formBooking, ngayBat: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ngày kết thúc</label>
                  <input type="date" value={formBooking.ngayKet} onChange={(e) => setFormBooking({ ...formBooking, ngayKet: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ngày bắt đầu *</label>
                  <input required type="date" value={formEditBooking.ngayBat}
                    onChange={e => setFormEditBooking({...formEditBooking, ngayBat: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Ngày kết thúc</label>
                  <input type="date" value={formEditBooking.ngayKet}
                    onChange={e => setFormEditBooking({...formEditBooking, ngayKet: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
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
    </div>
  );
}
