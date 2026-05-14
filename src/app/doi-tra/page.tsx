"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Search, AlertTriangle, Pencil, Trash2, X, ChevronDown, Star, MessageSquare, RefreshCcw } from "lucide-react";
import { formatDateTime, formatCurrency, LOAI_VAN_DE, LOAI_FEEDBACK, KENH_FEEDBACK, LOI_BU, TRANG_THAI_BU } from "@/lib/utils";

type DoiTra = {
  id: string;
  maDoiTra: string;
  sdtHienTai: string | null;
  tenKhach: string;
  diaChi: string | null;
  skuHienTai: string | null;
  skuDoiSang: string | null;
  giaTriHang: number;
  loaiVanDe: string;
  ghiChu: string | null;
  phiShip: number;
  soChieuShip: number;
  maVanDon: string | null;
  nguoiXuLy: string | null;
  createdAt: string;
};

type SdtWarning = {
  count: number;
  records: { maDoiTra: string; tenKhach: string; loaiVanDe: string; maVanDon: string | null; ghiChu: string | null; createdAt: string }[];
};

type Feedback = {
  id: string;
  tenKhach: string | null;
  sdtKhach: string | null;
  sku: string | null;
  kenh: string;
  loai: string;
  noiDung: string;
  danhGia: number | null;
  nguoiGhiNhan: string | null;
  createdAt: string;
};

type BuTien = {
  id: string;
  tenKhach: string;
  sdtKhach: string | null;
  loiBu: string;
  soTien: number;
  trangThai: string;
  ghiChu: string | null;
  nguoiXuLy: string | null;
  createdAt: string;
};

const emptyBuTienForm = {
  tenKhach: "", loiBu: "hang_loi", soTien: "", ghiChu: "",
};

const emptyFeedbackForm = {
  tenKhach: "", sdtKhach: "", sku: "", kenh: "shopee",
  loai: "chat_lieu", noiDung: "", danhGia: "", nguoiGhiNhan: "",
};

const emptyForm = {
  sdtHienTai: "", tenKhach: "", diaChi: "",
  skuHienTai: "", skuDoiSang: "", giaTriHang: "",
  loaiVanDe: "doi_size", ghiChu: "",
  phiShip: "30000", phiShipThuCong: false,
  soChieuShip: "2", maVanDon: "", nguoiXuLy: "",
};

const THANG_LABEL = ["", "T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

export default function DoiTraPage() {
  const [records, setRecords] = useState<DoiTra[]>([]);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterXuLy, setFilterXuLy] = useState(""); // "" | "chua" | "da"
  const [filterThang, setFilterThang] = useState(""); // "" | "YYYY-MM"
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<DoiTra | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [sdtWarning, setSdtWarning] = useState<SdtWarning | null>(null);
  const [editMVD, setEditMVD] = useState<{ id: string; value: string } | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DoiTra | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  // ─── Tab & Feedback state ──────────────────────────────
  const [tab, setTab] = useState<"doi_hang" | "feedback" | "bu_tien">("doi_hang");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [fbForm, setFbForm] = useState({ ...emptyFeedbackForm });
  const [fbLoading, setFbLoading] = useState(false);
  const [fbSearch, setFbSearch] = useState("");
  const [fbFilterLoai, setFbFilterLoai] = useState("");
  const [fbFilterKenh, setFbFilterKenh] = useState("");
  const [fbDeleteTarget, setFbDeleteTarget] = useState<Feedback | null>(null);
  const [fbDeleteInput, setFbDeleteInput] = useState("");
  const [showFbForm, setShowFbForm] = useState(false);

  const fetchFeedbacks = async () => {
    const data = await fetch("/api/feedback").then((r) => r.json());
    setFeedbacks(Array.isArray(data) ? data : []);
  };

  // ─── BuTien state ──────────────────────────────────────
  const [buTiens, setBuTiens] = useState<BuTien[]>([]);
  const [btForm, setBtForm] = useState({ ...emptyBuTienForm });
  const [btLoading, setBtLoading] = useState(false);
  const [btShowModal, setBtShowModal] = useState(false);
  const [btEditRecord, setBtEditRecord] = useState<BuTien | null>(null);
  const [btDeleteTarget, setBtDeleteTarget] = useState<BuTien | null>(null);
  const [btDeleteInput, setBtDeleteInput] = useState("");

  const fetchBuTiens = async () => {
    const data = await fetch("/api/bu-tien").then((r) => r.json());
    setBuTiens(Array.isArray(data) ? data : []);
  };

  const fetchData = async () => {
    const data = await fetch("/api/doi-tra").then((r) => r.json());
    setRecords(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchData(); fetchFeedbacks(); fetchBuTiens(); }, []);

  // ─── Helpers ───────────────────────────────────────────
  const daDuocXuLy = (r: DoiTra) => !!r.maVanDon;

  const sdtCount = useMemo(() => {
    const m: Record<string, number> = {};
    records.forEach((r) => {
      if (r.sdtHienTai) m[r.sdtHienTai] = (m[r.sdtHienTai] || 0) + 1;
    });
    return m;
  }, [records]);

  const isDuplicate = (r: DoiTra) =>
    !!r.sdtHienTai && (sdtCount[r.sdtHienTai] || 0) > 1;

  // Phí ship: đổi size = 30k, lỗi shop = 0
  const handleLoaiChange = (loai: string, target: typeof form) => {
    const phiShop = LOAI_VAN_DE[loai]?.phiShop;
    return {
      ...target,
      loaiVanDe: loai,
      phiShip: phiShop ? "0" : loai === "doi_size" ? "30000" : target.phiShip,
    };
  };

  // ─── Check SĐT trùng ───────────────────────────────────
  const checkSdt = useCallback(async (sdt: string) => {
    if (!sdt || sdt.length < 9) { setSdtWarning(null); return; }
    const res = await fetch(`/api/doi-tra/check-sdt?sdt=${sdt}`).then((r) => r.json());
    setSdtWarning(res.count > 0 ? res : null);
  }, []);

  // ─── Tạo case ──────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/doi-tra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setShowModal(false);
      setForm({ ...emptyForm });
      setSdtWarning(null);
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally { setLoading(false); }
  };

  // ─── Sửa case ──────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/doi-tra/${editRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdtHienTai: form.sdtHienTai,
          tenKhach: form.tenKhach,
          diaChi: form.diaChi,
          skuHienTai: form.skuHienTai,
          skuDoiSang: form.skuDoiSang,
          giaTriHang: Number(form.giaTriHang),
          loaiVanDe: form.loaiVanDe,
          ghiChu: form.ghiChu,
          phiShip: Number(form.phiShip),
          soChieuShip: Number(form.soChieuShip),
          maVanDon: form.maVanDon,
          nguoiXuLy: form.nguoiXuLy,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setEditRecord(null);
      setForm({ ...emptyForm });
      fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally { setLoading(false); }
  };

  // ─── Inline cập nhật mã vận đơn ────────────────────────
  const saveMVD = async (id: string, value: string) => {
    await fetch(`/api/doi-tra/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maVanDon: value }),
    });
    setEditMVD(null);
    fetchData();
  };

  // ─── Xóa case ──────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget || deleteInput !== "12345") return;
    await fetch(`/api/doi-tra/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    setDeleteInput("");
    fetchData();
  };

  // ─── BuTien handlers ───────────────────────────────────
  const handleBtSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtLoading(true);
    try {
      const url = btEditRecord ? `/api/bu-tien/${btEditRecord.id}` : "/api/bu-tien";
      const method = btEditRecord ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...btForm, soTien: Number(btForm.soTien) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setBtShowModal(false);
      setBtEditRecord(null);
      setBtForm({ ...emptyBuTienForm });
      fetchBuTiens();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally { setBtLoading(false); }
  };

  const handleBtDelete = async () => {
    if (!btDeleteTarget || btDeleteInput !== "12345") return;
    await fetch(`/api/bu-tien/${btDeleteTarget.id}`, { method: "DELETE" });
    setBtDeleteTarget(null);
    setBtDeleteInput("");
    fetchBuTiens();
  };

  const openBtEdit = (r: BuTien) => {
    setBtForm({
      tenKhach: r.tenKhach, loiBu: r.loiBu,
      soTien: String(r.soTien), ghiChu: r.ghiChu || "",
    });
    setBtEditRecord(r);
    setBtShowModal(true);
  };

  // ─── Feedback handlers ─────────────────────────────────
  const handleFbCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fbForm, danhGia: fbForm.danhGia ? Number(fbForm.danhGia) : null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setFbForm({ ...emptyFeedbackForm });
      setShowFbForm(false);
      fetchFeedbacks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Lỗi");
    } finally { setFbLoading(false); }
  };

  const handleFbDelete = async () => {
    if (!fbDeleteTarget || fbDeleteInput !== "12345") return;
    await fetch(`/api/feedback/${fbDeleteTarget.id}`, { method: "DELETE" });
    setFbDeleteTarget(null);
    setFbDeleteInput("");
    fetchFeedbacks();
  };

  const openEdit = (r: DoiTra) => {
    setForm({
      sdtHienTai: r.sdtHienTai || "",
      tenKhach: r.tenKhach,
      diaChi: r.diaChi || "",
      skuHienTai: r.skuHienTai || "",
      skuDoiSang: r.skuDoiSang || "",
      giaTriHang: String(r.giaTriHang),
      loaiVanDe: r.loaiVanDe,
      ghiChu: r.ghiChu || "",
      phiShip: String(r.phiShip),
      phiShipThuCong: false,
      soChieuShip: String(r.soChieuShip),
      maVanDon: r.maVanDon || "",
      nguoiXuLy: r.nguoiXuLy || "",
    });
    setEditRecord(r);
  };

  // ─── Thống kê theo tháng ───────────────────────────────
  const statsByMonth = useMemo(() => {
    const map: Record<string, {
      total: number; chua: number;
      tongChiPhi: number; tongThuKhach: number;
      loai: Record<string, number>;
    }> = {};
    records.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { total: 0, chua: 0, tongChiPhi: 0, tongThuKhach: 0, loai: {} };
      map[key].total++;
      if (!daDuocXuLy(r)) map[key].chua++;
      map[key].tongChiPhi   += LOAI_VAN_DE[r.loaiVanDe]?.chiPhi ?? 0;
      map[key].tongThuKhach += r.phiShip;
      map[key].loai[r.loaiVanDe] = (map[key].loai[r.loaiVanDe] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [records]);

  // Danh sách tháng để filter
  const thangOptions = useMemo(() =>
    statsByMonth.map(([key]) => key), [statsByMonth]);

  // ─── Lọc danh sách ────────────────────────────────────
  const filtered = useMemo(() => records.filter((r) => {
    const s = search.toLowerCase();
    const matchSearch = !s ||
      r.tenKhach.toLowerCase().includes(s) ||
      (r.sdtHienTai || "").includes(s) ||
      r.maDoiTra.toLowerCase().includes(s) ||
      (r.skuDoiSang || "").toLowerCase().includes(s) ||
      (r.maVanDon || "").toLowerCase().includes(s);
    const matchLoai = !filterLoai || r.loaiVanDe === filterLoai;
    const matchXuLy = !filterXuLy ||
      (filterXuLy === "chua" && !daDuocXuLy(r)) ||
      (filterXuLy === "da" && daDuocXuLy(r));
    const matchThang = !filterThang || r.createdAt.startsWith(filterThang);
    return matchSearch && matchLoai && matchXuLy && matchThang;
  }), [records, search, filterLoai, filterXuLy, filterThang]);

  const chuaXuLy = records.filter((r) => !daDuocXuLy(r)).length;

  // ─── BuTien computed ───────────────────────────────────
  const btStatsByMonth = useMemo(() => {
    const map: Record<string, { total: number; tongTien: number }> = {};
    buTiens.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { total: 0, tongTien: 0 };
      map[key].total++;
      map[key].tongTien += r.soTien;
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [buTiens]);

  // ─── Feedback computed ─────────────────────────────────
  const fbFiltered = useMemo(() => feedbacks.filter((f) => {
    const s = fbSearch.toLowerCase();
    const matchSearch = !s || (f.noiDung.toLowerCase().includes(s)) ||
      (f.sku || "").toLowerCase().includes(s) ||
      (f.tenKhach || "").toLowerCase().includes(s);
    const matchLoai = !fbFilterLoai || f.loai === fbFilterLoai;
    const matchKenh = !fbFilterKenh || f.kenh === fbFilterKenh;
    return matchSearch && matchLoai && matchKenh;
  }), [feedbacks, fbSearch, fbFilterLoai, fbFilterKenh]);

  const fbStatsByLoai = useMemo(() => {
    const m: Record<string, { count: number; totalStar: number; starCount: number }> = {};
    feedbacks.forEach((f) => {
      if (!m[f.loai]) m[f.loai] = { count: 0, totalStar: 0, starCount: 0 };
      m[f.loai].count++;
      if (f.danhGia) { m[f.loai].totalStar += f.danhGia; m[f.loai].starCount++; }
    });
    return m;
  }, [feedbacks]);

  const fbStatsByMonth = useMemo(() => {
    const map: Record<string, {
      total: number;
      kenh: Record<string, number>;
      loai: Record<string, number>;
      totalStar: number; starCount: number;
    }> = {};
    feedbacks.forEach((f) => {
      const d = new Date(f.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { total: 0, kenh: {}, loai: {}, totalStar: 0, starCount: 0 };
      map[key].total++;
      map[key].kenh[f.kenh] = (map[key].kenh[f.kenh] || 0) + 1;
      map[key].loai[f.loai] = (map[key].loai[f.loai] || 0) + 1;
      if (f.danhGia) { map[key].totalStar += f.danhGia; map[key].starCount++; }
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [feedbacks]);

  const fbStatsBySku = useMemo(() => {
    const m: Record<string, { count: number; loai: Record<string, number> }> = {};
    feedbacks.forEach((f) => {
      const key = f.sku || "(Không rõ SKU)";
      if (!m[key]) m[key] = { count: 0, loai: {} };
      m[key].count++;
      m[key].loai[f.loai] = (m[key].loai[f.loai] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1].count - a[1].count);
  }, [feedbacks]);

  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Đổi trả / Sự cố</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý đổi hàng & ghi nhận feedback khách</p>
        </div>
        {tab === "doi_hang" && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition">
            <Plus size={15} /> Tạo case mới
          </button>
        )}
        {tab === "feedback" && (
          <button onClick={() => setShowFbForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
            <Plus size={15} /> Thêm feedback
          </button>
        )}
        {tab === "bu_tien" && (
          <button onClick={() => { setBtShowModal(true); setBtEditRecord(null); setBtForm({ ...emptyBuTienForm }); }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
            <Plus size={15} /> Tạo bù tiền
          </button>
        )}
      </div>

      {/* ── Tab switcher ── */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab("doi_hang")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${tab === "doi_hang" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <RefreshCcw size={15} /> Đổi hàng
          {chuaXuLy > 0 && <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{chuaXuLy}</span>}
        </button>
        <button onClick={() => setTab("feedback")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${tab === "feedback" ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          <MessageSquare size={15} /> Feedback
          {feedbacks.length > 0 && <span className="bg-teal-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{feedbacks.length}</span>}
        </button>
        <button onClick={() => setTab("bu_tien")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition ${tab === "bu_tien" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          💸 Bù tiền
          {buTiens.length > 0 && <span className="bg-indigo-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{buTiens.length}</span>}
        </button>
      </div>

      {/* ══════════════ TAB: ĐỔI HÀNG ══════════════ */}
      {tab === "doi_hang" && (<>

      {/* ── Thống kê theo tháng ── */}
      <div className="mb-5">
        <button onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mb-3 hover:text-slate-800">
          <ChevronDown size={16} className={`transition-transform ${showStats ? "" : "-rotate-90"}`} />
          Thống kê theo tháng
        </button>

        {showStats && (
          <div className="overflow-x-auto">
            <table className="text-sm border border-slate-200 rounded-xl overflow-hidden w-full">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Tháng</th>
                  <th className="px-4 py-2.5 text-center">Tổng case</th>
                  <th className="px-4 py-2.5 text-center text-amber-600">Chưa xử lý</th>
                  <th className="px-4 py-2.5 text-right text-red-500">Chi phí</th>
                  <th className="px-4 py-2.5 text-right text-blue-600">Thu khách</th>
                  <th className="px-4 py-2.5 text-right text-slate-700">Lợi / Lỗ</th>
                  {Object.entries(LOAI_VAN_DE).map(([k, v]) => (
                    <th key={k} className="px-4 py-2.5 text-center">{v.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {statsByMonth.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-4 text-slate-400 text-xs">Chưa có dữ liệu</td></tr>
                ) : statsByMonth.map(([key, stat]) => {
                  const [yr, mo] = key.split("-");
                  const loiNhuan = stat.tongThuKhach - stat.tongChiPhi;
                  return (
                    <tr key={key}
                      className={`cursor-pointer hover:bg-rose-50 transition ${filterThang === key ? "bg-rose-50" : ""}`}
                      onClick={() => setFilterThang(filterThang === key ? "" : key)}>
                      <td className="px-4 py-2.5 font-semibold text-slate-700">
                        {THANG_LABEL[parseInt(mo)]} {yr}
                        {filterThang === key && <span className="ml-2 text-xs text-rose-500">(đang lọc)</span>}
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-800">{stat.total}</td>
                      <td className={`px-4 py-2.5 text-center font-bold ${stat.chua > 0 ? "text-amber-600" : "text-slate-300"}`}>
                        {stat.chua > 0 ? stat.chua : "—"}
                      </td>
                      {/* Chi phí */}
                      <td className="px-4 py-2.5 text-right text-red-500 font-medium">
                        -{formatCurrency(stat.tongChiPhi)}
                      </td>
                      {/* Thu khách */}
                      <td className="px-4 py-2.5 text-right text-blue-600 font-medium">
                        {stat.tongThuKhach > 0 ? `+${formatCurrency(stat.tongThuKhach)}` : "—"}
                      </td>
                      {/* Lợi / Lỗ */}
                      <td className={`px-4 py-2.5 text-right font-bold ${loiNhuan >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {loiNhuan >= 0 ? `+${formatCurrency(loiNhuan)}` : formatCurrency(loiNhuan)}
                      </td>
                      {Object.keys(LOAI_VAN_DE).map((k) => (
                        <td key={k} className="px-4 py-2.5 text-center text-slate-600">
                          {stat.loai[k] || "—"}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs text-slate-400 mt-1.5">Click vào tháng để lọc · Chi phí = 25k/case · Thu khách = phí ship thu được</p>
          </div>
        )}
      </div>

      {/* ── Cảnh báo chưa xử lý ── */}
      {chuaXuLy > 0 && (
        <div
          className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition ${filterXuLy === "chua" ? "bg-amber-100 border-amber-400" : "bg-amber-50 border-amber-200 hover:bg-amber-100"}`}
          onClick={() => setFilterXuLy(filterXuLy === "chua" ? "" : "chua")}
        >
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">{chuaXuLy} case</span> chưa có mã vận đơn (chưa gửi hàng)
          </p>
          <span className="ml-auto text-xs text-amber-600 font-medium">
            {filterXuLy === "chua" ? "✕ Bỏ lọc" : "Lọc xem →"}
          </span>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input placeholder="Tìm SĐT, tên khách, SKU, mã vận đơn..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200" />
        </div>
        <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Tất cả loại</option>
          {Object.entries(LOAI_VAN_DE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterThang} onChange={(e) => setFilterThang(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Tất cả tháng</option>
          {thangOptions.map((t) => {
            const [yr, mo] = t.split("-");
            return <option key={t} value={t}>{THANG_LABEL[parseInt(mo)]} {yr}</option>;
          })}
        </select>
        {(filterLoai || filterThang || filterXuLy || search) && (
          <button onClick={() => { setFilterLoai(""); setFilterThang(""); setFilterXuLy(""); setSearch(""); }}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-500 border border-slate-200 rounded-lg px-2.5 py-2">
            <X size={13} /> Xoá lọc
          </button>
        )}
        <p className="text-xs text-slate-400 ml-auto">{filtered.length} / {records.length} case</p>
      </div>

      {/* ── Bảng danh sách ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-3 py-3 text-left">SĐT Khách</th>
              <th className="px-3 py-3 text-left">Tên KH</th>
              <th className="px-3 py-3 text-left">Địa chỉ</th>
              <th className="px-3 py-3 text-left">SKU đổi sang</th>
              <th className="px-3 py-3 text-right">Giá trị</th>
              <th className="px-3 py-3 text-left">Loại lỗi</th>
              <th className="px-3 py-3 text-right">Thu KH</th>
              <th className="px-3 py-3 text-center">Chiều</th>
              <th className="px-3 py-3 text-left">Mã vận đơn</th>
              <th className="px-3 py-3 text-left">Ngày tạo</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-14 text-slate-400">
                  <AlertTriangle size={28} className="mx-auto mb-2 opacity-20" />
                  Không có case nào
                </td>
              </tr>
            ) : filtered.map((r) => {
              const loaiInfo = LOAI_VAN_DE[r.loaiVanDe];
              const trung = isDuplicate(r);
              const daGui = daDuocXuLy(r);

              return (
                <tr key={r.id} className={`transition-colors ${
                  trung ? "bg-red-50 hover:bg-red-100" :
                  !daGui ? "bg-amber-50 hover:bg-amber-100" :
                  "hover:bg-slate-50"
                }`}>
                  {/* SĐT */}
                  <td className="px-3 py-2.5 font-mono font-medium">
                    <div className="flex items-center gap-1.5">
                      <span className={trung ? "text-red-600" : "text-slate-800"}>{r.sdtHienTai || "—"}</span>
                      {trung && <AlertTriangle size={13} className="text-red-500 shrink-0" />}
                    </div>
                    {trung && <p className="text-red-400 text-xs font-normal">⚠ đã có {sdtCount[r.sdtHienTai!]} lần</p>}
                  </td>

                  {/* Tên KH */}
                  <td className="px-3 py-2.5 font-medium text-slate-800 max-w-[120px] truncate">{r.tenKhach}</td>

                  {/* Địa chỉ */}
                  <td className="px-3 py-2.5 text-slate-500 max-w-[160px] truncate" title={r.diaChi || ""}>{r.diaChi || "—"}</td>

                  {/* SKU */}
                  <td className="px-3 py-2.5">
                    <div className="text-xs text-slate-400">{r.skuHienTai}</div>
                    <div className="font-medium text-slate-800">{r.skuDoiSang || "—"}</div>
                  </td>

                  {/* Giá trị */}
                  <td className="px-3 py-2.5 text-right text-slate-600">
                    {r.giaTriHang > 0 ? formatCurrency(r.giaTriHang) : "—"}
                  </td>

                  {/* Loại lỗi */}
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${loaiInfo?.color}`}>{loaiInfo?.label}</span>
                  </td>

                  {/* Thu KH */}
                  <td className={`px-3 py-2.5 text-right font-medium ${r.phiShip > 0 ? "text-rose-600" : "text-slate-400"}`}>
                    {r.phiShip > 0 ? formatCurrency(r.phiShip) : "0"}
                  </td>

                  {/* Chiều */}
                  <td className="px-3 py-2.5 text-center text-slate-600 text-xs">{r.soChieuShip}c</td>

                  {/* Mã vận đơn — click để điền */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {editMVD?.id === r.id ? (
                      <input autoFocus defaultValue={editMVD.value}
                        className="w-40 border border-rose-300 rounded px-1.5 py-0.5 text-sm font-mono"
                        onBlur={(e) => saveMVD(r.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveMVD(r.id, (e.target as HTMLInputElement).value);
                          if (e.key === "Escape") setEditMVD(null);
                        }} />
                    ) : (
                      <span onClick={() => setEditMVD({ id: r.id, value: r.maVanDon || "" })}
                        className={`cursor-text font-mono text-xs ${daGui ? "text-indigo-600 font-semibold" : "text-amber-500 italic"}`}>
                        {daGui ? r.maVanDon : "— chưa có —"}
                      </span>
                    )}
                    {daGui && <p className="text-xs text-green-600 mt-0.5">✓ Đã gửi</p>}
                  </td>

                  {/* Ngày */}
                  <td className="px-3 py-2.5 text-xs text-slate-400">{formatDateTime(r.createdAt)}</td>

                  {/* Nút sửa / xóa */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { setDeleteTarget(r); setDeleteInput(""); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>)}

      {/* ══════════════ TAB: FEEDBACK ══════════════ */}
      {tab === "feedback" && (
        <div className="space-y-5">
          {/* ── Bảng theo dõi theo tháng ── */}
          {fbStatsByMonth.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">📅 Theo dõi phản hồi theo tháng</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Tháng</th>
                    <th className="px-4 py-2.5 text-center">Số phản hồi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fbStatsByMonth.map(([key, stat]) => {
                    const [yr, mo] = key.split("-");
                    return (
                      <tr key={key} className="hover:bg-teal-50 transition">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">T{parseInt(mo)} {yr}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-800">{stat.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tổng hợp theo loại */}
          {feedbacks.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {Object.entries(LOAI_FEEDBACK).map(([k, v]) => {
                const s = fbStatsByLoai[k];
                if (!s) return null;
                const avgStar = s.starCount > 0 ? (s.totalStar / s.starCount).toFixed(1) : null;
                return (
                  <div key={k} onClick={() => setFbFilterLoai(fbFilterLoai === k ? "" : k)}
                    className={`bg-white rounded-xl border p-4 cursor-pointer transition ${fbFilterLoai === k ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-lg">{v.icon}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${v.color}`}>{s.count}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{v.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tổng hợp theo SKU */}
          {fbStatsBySku.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-700">📊 Tổng hợp theo sản phẩm (SKU)</span>
              </div>
              <div className="divide-y divide-slate-50">
                {fbStatsBySku.map(([sku, stat]) => (
                  <div key={sku} className="px-4 py-3 flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-slate-700 w-36 shrink-0">{sku}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 rounded px-2 py-0.5 font-medium">{stat.count} feedback</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(stat.loai).sort((a,b) => b[1]-a[1]).map(([loai, cnt]) => (
                        <span key={loai} className={`text-xs px-2 py-0.5 rounded font-medium ${LOAI_FEEDBACK[loai]?.color}`}>
                          {LOAI_FEEDBACK[loai]?.icon} {LOAI_FEEDBACK[loai]?.label} ×{cnt}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input placeholder="Tìm SKU, nội dung, tên khách..."
                value={fbSearch} onChange={(e) => setFbSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-200" />
            </div>
            <select value={fbFilterKenh} onChange={(e) => setFbFilterKenh(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">Tất cả kênh</option>
              {Object.entries(KENH_FEEDBACK).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={fbFilterLoai} onChange={(e) => setFbFilterLoai(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">Tất cả loại</option>
              {Object.entries(LOAI_FEEDBACK).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
            </select>
            {(fbSearch || fbFilterLoai || fbFilterKenh) && (
              <button onClick={() => { setFbSearch(""); setFbFilterLoai(""); setFbFilterKenh(""); }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-teal-500 border border-slate-200 rounded-lg px-2.5 py-2">
                <X size={13} /> Xoá lọc
              </button>
            )}
            <p className="text-xs text-slate-400 ml-auto">{fbFiltered.length} / {feedbacks.length} feedback</p>
          </div>

          {/* Danh sách feedback */}
          {fbFiltered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-slate-400 text-sm">Chưa có feedback nào</p>
              <button onClick={() => setShowFbForm(true)}
                className="mt-3 text-sm text-teal-500 hover:underline">+ Thêm feedback đầu tiên</button>
            </div>
          ) : (
            <div className="space-y-2">
              {fbFiltered.map((f) => {
                const loaiInfo = LOAI_FEEDBACK[f.loai];
                return (
                  <div key={f.id} className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-start gap-4">
                    <div className="text-2xl shrink-0 mt-0.5">{loaiInfo?.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${KENH_FEEDBACK[f.kenh]?.color}`}>{KENH_FEEDBACK[f.kenh]?.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${loaiInfo?.color}`}>{loaiInfo?.label}</span>
                        {f.sku && <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{f.sku}</span>}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{f.noiDung}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                        {f.tenKhach && <span>👤 {f.tenKhach}</span>}
                        {f.sdtKhach && <span>📞 {f.sdtKhach}</span>}
                        {f.nguoiGhiNhan && <span>✍️ {f.nguoiGhiNhan}</span>}
                        <span className="ml-auto">{formatDateTime(f.createdAt)}</span>
                      </div>
                    </div>
                    <button onClick={() => { setFbDeleteTarget(f); setFbDeleteInput(""); }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition shrink-0">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modal Xác nhận xóa ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Xác nhận xóa case</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hành động này <span className="font-semibold text-red-500">không thể hoàn tác</span></p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-sm space-y-1">
              <div><span className="text-slate-400">Mã case:</span> <span className="font-mono font-bold text-rose-600">{deleteTarget.maDoiTra}</span></div>
              <div><span className="text-slate-400">Khách:</span> <span className="font-medium text-slate-700">{deleteTarget.tenKhach}</span></div>
              <div><span className="text-slate-400">Loại:</span> <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${LOAI_VAN_DE[deleteTarget.loaiVanDe]?.color}`}>{LOAI_VAN_DE[deleteTarget.loaiVanDe]?.label}</span></div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-slate-600 mb-1.5 block">
                Nhập <span className="font-mono font-bold text-rose-600">12345</span> để xác nhận xóa
              </label>
              <input
                autoFocus
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleDelete(); if (e.key === "Escape") { setDeleteTarget(null); setDeleteInput(""); } }}
                placeholder="12345"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-200"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setDeleteTarget(null); setDeleteInput(""); }}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
              <button onClick={handleDelete}
                disabled={deleteInput !== "12345"}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition">
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Tạo / Sửa ── */}
      {(showModal || editRecord) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                {editRecord ? `Sửa case ${editRecord.maDoiTra}` : "Tạo case đổi trả mới"}
              </h2>
              <button onClick={() => { setShowModal(false); setEditRecord(null); setForm({ ...emptyForm }); setSdtWarning(null); }}
                className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            {/* ── Form inline (không dùng sub-component để tránh mất focus) ── */}
            <form onSubmit={!!editRecord ? handleEdit : handleCreate} className="p-5 space-y-5">
              {/* Khách hàng */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Thông tin khách hàng</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-600 mb-1 block">Số điện thoại *</label>
                    <input
                      value={form.sdtHienTai}
                      onChange={(e) => { setForm({ ...form, sdtHienTai: e.target.value }); checkSdt(e.target.value); }}
                      placeholder="0912345678"
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${sdtWarning ? "border-red-300 bg-red-50" : "border-slate-200"}`}
                    />
                    {sdtWarning && (
                      <div className="mt-1.5 bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold mb-2">
                          <AlertTriangle size={13} /> SĐT này đã có {sdtWarning.count} case trước đó!
                        </div>
                        <div className="space-y-2">
                          {sdtWarning.records.slice(0, 5).map((r) => (
                            <div key={r.maDoiTra} className="bg-white border border-red-100 rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="font-mono text-xs font-bold text-rose-600">{r.maDoiTra}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${LOAI_VAN_DE[r.loaiVanDe]?.color}`}>
                                  {LOAI_VAN_DE[r.loaiVanDe]?.label}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ml-auto ${r.maVanDon ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                  {r.maVanDon ? "✓ Đã gửi" : "⏳ Chưa gửi"}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                👤 {r.tenKhach} &nbsp;·&nbsp; 🕐 {formatDateTime(r.createdAt)}
                              </div>
                              {r.ghiChu && (
                                <div className="text-xs text-slate-400 mt-0.5 italic">💬 {r.ghiChu}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        {sdtWarning.count > 5 && (
                          <p className="text-xs text-red-400 mt-2 text-center">... và {sdtWarning.count - 5} case khác</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Tên khách hàng *</label>
                    <input required value={form.tenKhach} onChange={(e) => setForm({ ...form, tenKhach: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Địa chỉ giao hàng</label>
                    <input value={form.diaChi} onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>
              </div>

              {/* Hàng hóa */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Hàng hóa</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">SKU hiện tại</label>
                    <input value={form.skuHienTai} onChange={(e) => setForm({ ...form, skuHienTai: e.target.value })}
                      placeholder="SKU đang có" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">SKU muốn đổi sang</label>
                    <input value={form.skuDoiSang} onChange={(e) => setForm({ ...form, skuDoiSang: e.target.value })}
                      placeholder="SKU mới" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Giá trị hàng (VNĐ)</label>
                    <input type="number" min="0" value={form.giaTriHang} onChange={(e) => setForm({ ...form, giaTriHang: e.target.value })}
                      placeholder="Khai cho ĐVVC" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>
              </div>

              {/* Vận chuyển */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Phân loại & Vận chuyển</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Loại vấn đề *</label>
                    <select required value={form.loaiVanDe}
                      onChange={(e) => setForm(handleLoaiChange(e.target.value, form))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200">
                      {Object.entries(LOAI_VAN_DE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <p className={`text-xs mt-1 ${LOAI_VAN_DE[form.loaiVanDe]?.phiShop ? "text-green-600" : "text-rose-500"}`}>
                      {LOAI_VAN_DE[form.loaiVanDe]?.phiShop ? "✓ Shop chịu phí ship" : "→ Thu khách phí ship"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Số chiều ship</label>
                    <div className="flex gap-2">
                      {["1", "2"].map((c) => (
                        <button key={c} type="button" onClick={() => setForm({ ...form, soChieuShip: c })}
                          className={`flex-1 py-2 text-sm rounded-lg border font-medium transition ${form.soChieuShip === c ? "bg-rose-500 text-white border-rose-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          {c} chiều
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">
                      Phí ship thu KH (VNĐ)
                      <button type="button" onClick={() => setForm({ ...form, phiShipThuCong: !form.phiShipThuCong })}
                        className="ml-2 text-rose-400 hover:underline text-xs">(sửa thủ công)</button>
                    </label>
                    <input type="number" min="0" value={form.phiShip}
                      readOnly={!form.phiShipThuCong && LOAI_VAN_DE[form.loaiVanDe]?.phiShop}
                      onChange={(e) => setForm({ ...form, phiShip: e.target.value })}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 ${!form.phiShipThuCong && LOAI_VAN_DE[form.loaiVanDe]?.phiShop ? "bg-slate-50 text-slate-400 border-slate-100" : "border-slate-200"}`} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 mb-1 block">Người xử lý</label>
                    <input value={form.nguoiXuLy} onChange={(e) => setForm({ ...form, nguoiXuLy: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  {!!editRecord && (
                    <div className="col-span-2">
                      <label className="text-xs text-slate-600 mb-1 block">Mã vận đơn</label>
                      <input value={form.maVanDon} onChange={(e) => setForm({ ...form, maVanDon: e.target.value })}
                        placeholder="Nhập mã vận đơn khi đã gửi hàng"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                    <textarea rows={2} value={form.ghiChu} onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowModal(false); setEditRecord(null); setForm({ ...emptyForm }); setSdtWarning(null); }}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2.5 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 font-medium">
                  {loading ? "Đang lưu..." : !!editRecord ? "Lưu thay đổi" : "Tạo case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ══════════════ TAB: BÙ TIỀN ══════════════ */}
      {tab === "bu_tien" && (
        <div className="space-y-5">

          {/* Bảng tổng hợp theo tháng */}
          {btStatsByMonth.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">📊 Tổng tiền bù theo tháng</span>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Tháng</th>
                    <th className="px-4 py-2.5 text-center">Số case</th>
                    <th className="px-4 py-2.5 text-right text-red-500">Tổng tiền bù</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {btStatsByMonth.map(([key, s]) => {
                    const [yr, mo] = key.split("-");
                    return (
                      <tr key={key} className="hover:bg-indigo-50 transition">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">T{parseInt(mo)} {yr}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-slate-800">{s.total}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-red-600">{formatCurrency(s.tongTien)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Danh sách */}
          {buTiens.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
              <p className="text-slate-400 text-sm">Chưa có case bù tiền nào</p>
              <button onClick={() => setBtShowModal(true)}
                className="mt-3 text-sm text-indigo-500 hover:underline">+ Tạo case đầu tiên</button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-3 text-left">Thời gian</th>
                    <th className="px-3 py-3 text-left">Khách hàng</th>
                    <th className="px-3 py-3 text-left">Lỗi bù</th>
                    <th className="px-3 py-3 text-right">Số tiền bù</th>
                    <th className="px-3 py-3 text-left">Ghi chú</th>
                    <th className="px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buTiens.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-3 py-2.5 text-xs text-slate-400">{formatDateTime(r.createdAt)}</td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{r.tenKhach}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${LOI_BU[r.loiBu]?.color}`}>{LOI_BU[r.loiBu]?.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-600">{formatCurrency(r.soTien)}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-xs max-w-[200px] truncate">{r.ghiChu || "—"}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openBtEdit(r)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => { setBtDeleteTarget(r); setBtDeleteInput(""); }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Thêm Feedback ── */}
      {showFbForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">Thêm feedback khách hàng</h2>
              <button onClick={() => { setShowFbForm(false); setFbForm({ ...emptyFeedbackForm }); }}
                className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleFbCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Kênh *</label>
                  <select value={fbForm.kenh} onChange={(e) => setFbForm({ ...fbForm, kenh: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200">
                    {Object.entries(KENH_FEEDBACK).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Loại feedback *</label>
                  <select required value={fbForm.loai} onChange={(e) => setFbForm({ ...fbForm, loai: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200">
                    {Object.entries(LOAI_FEEDBACK).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">SKU sản phẩm</label>
                  <input value={fbForm.sku} onChange={(e) => setFbForm({ ...fbForm, sku: e.target.value })}
                    placeholder="VD: OR02XNM"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-200" />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Nội dung feedback *</label>
                <textarea required rows={3} value={fbForm.noiDung} onChange={(e) => setFbForm({ ...fbForm, noiDung: e.target.value })}
                  placeholder="Khách phản hồi gì về sản phẩm..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Tên khách</label>
                  <input value={fbForm.tenKhach} onChange={(e) => setFbForm({ ...fbForm, tenKhach: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" />
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Người ghi nhận</label>
                  <input value={fbForm.nguoiGhiNhan} onChange={(e) => setFbForm({ ...fbForm, nguoiGhiNhan: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setShowFbForm(false); setFbForm({ ...emptyFeedbackForm }); }}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={fbLoading}
                  className="flex-1 px-4 py-2.5 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium">
                  {fbLoading ? "Đang lưu..." : "Lưu feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Tạo / Sửa Bù tiền ── */}
      {btShowModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-lg">
                {btEditRecord ? "Sửa case bù tiền" : "Tạo case bù tiền mới"}
              </h2>
              <button onClick={() => { setBtShowModal(false); setBtEditRecord(null); setBtForm({ ...emptyBuTienForm }); }}
                className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleBtSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Tên khách hàng *</label>
                <input required value={btForm.tenKhach} onChange={(e) => setBtForm({ ...btForm, tenKhach: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Lỗi bù *</label>
                  <select required value={btForm.loiBu} onChange={(e) => setBtForm({ ...btForm, loiBu: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                    {Object.entries(LOI_BU).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Số tiền bù (VNĐ) *</label>
                  <input required type="number" min="0" value={btForm.soTien} onChange={(e) => setBtForm({ ...btForm, soTien: e.target.value })}
                    placeholder="50000"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Ghi chú</label>
                <textarea rows={2} value={btForm.ghiChu} onChange={(e) => setBtForm({ ...btForm, ghiChu: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => { setBtShowModal(false); setBtEditRecord(null); setBtForm({ ...emptyBuTienForm }); }}
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
                <button type="submit" disabled={btLoading}
                  className="flex-1 px-4 py-2.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 font-medium">
                  {btLoading ? "Đang lưu..." : btEditRecord ? "Lưu thay đổi" : "Tạo case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Xóa Bù tiền ── */}
      {btDeleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Xóa case bù tiền?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hành động này <span className="font-semibold text-red-500">không thể hoàn tác</span></p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-sm space-y-1">
              <div><span className="text-slate-400">Khách:</span> <span className="font-medium">{btDeleteTarget.tenKhach}</span></div>
              <div><span className="text-slate-400">Số tiền:</span> <span className="font-bold text-red-600">{formatCurrency(btDeleteTarget.soTien)}</span></div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-600 mb-1.5 block">Nhập <span className="font-mono font-bold text-rose-600">12345</span> để xác nhận</label>
              <input autoFocus value={btDeleteInput} onChange={(e) => setBtDeleteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleBtDelete(); if (e.key === "Escape") { setBtDeleteTarget(null); setBtDeleteInput(""); } }}
                placeholder="12345"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-200" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setBtDeleteTarget(null); setBtDeleteInput(""); }}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
              <button onClick={handleBtDelete} disabled={btDeleteInput !== "12345"}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 font-medium">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Xóa Feedback ── */}
      {fbDeleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Xóa feedback này?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Hành động này <span className="font-semibold text-red-500">không thể hoàn tác</span></p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4 text-sm text-slate-600 line-clamp-3">{fbDeleteTarget.noiDung}</div>
            <div className="mb-4">
              <label className="text-xs text-slate-600 mb-1.5 block">Nhập <span className="font-mono font-bold text-rose-600">12345</span> để xác nhận</label>
              <input autoFocus value={fbDeleteInput} onChange={(e) => setFbDeleteInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleFbDelete(); if (e.key === "Escape") { setFbDeleteTarget(null); setFbDeleteInput(""); } }}
                placeholder="12345"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-200" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setFbDeleteTarget(null); setFbDeleteInput(""); }}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Huỷ</button>
              <button onClick={handleFbDelete} disabled={fbDeleteInput !== "12345"}
                className="flex-1 px-4 py-2.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
