"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, X, Users, Printer, CalendarDays, Trash2, RotateCcw } from "lucide-react";

type NhanVien = {
  id: string; maNV: string; ten: string;
  chucVu: string | null; phongBan: string | null;
  loaiLuong: string | null;
  luongCB: number | null; phuCapChuyenCan: number | null; phuCapAn: number | null; phuCapDacBiet: number | null; heSoTC: number;
  ngaySinh: string | null;
  active: boolean;
};

const HO_LIST = [
  { key: "nguyen_cong_uoc", label: "Nguyễn Công Ước", color: "indigo", emoji: "🏭" },
  { key: "meisy",           label: "Meisy",            color: "rose",   emoji: "🌸" },
] as const;
type HoKey = typeof HO_LIST[number]["key"];

type LocatStats = { dai_thuong: number; dai_kieu: number; short: number };
const LOAI_HANG_LABEL: Record<string, string> = {
  dai_thuong: "Dài thường",
  dai_kieu:   "Dài kiểu",
  short:      "Short",
};
const LOAI_HANG_KEYS = ["dai_thuong", "dai_kieu", "short"] as const;

type ChamCong = {
  id: string; nhanVienId: string; ngay: string; trangThai: string;
  tangCa: number | null; ghiChu: string | null;
};

// Trạng thái chấm công
const TRANG_THAI = [
  { key: "di_lam",     label: "✓",   title: "Đi làm",       bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  { key: "nghi_phep",  label: "NP",  title: "Nghỉ phép",     bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-300" },
  { key: "vang",       label: "V",   title: "Vắng",          bg: "bg-red-100",     text: "text-red-700",     border: "border-red-300" },
  { key: "di_muon",    label: "M",   title: "Đi muộn",       bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-300" },
  { key: "nua_ngay",   label: "½",   title: "Nửa ngày",      bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-300" },
  { key: "nghi_le",    label: "L",   title: "Nghỉ lễ",       bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-300" },
];
const TT_MAP = Object.fromEntries(TRANG_THAI.map(t => [t.key, t]));
const CYCLE = ["di_lam", "nghi_phep", "vang", "di_muon", "nua_ngay", "nghi_le", ""];

const fmt = (n: number) => n.toLocaleString("vi-VN");
const DAY_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

// Ngày lễ cố định hàng năm (MM-DD)
const FIXED_HOLIDAYS: { key: string; label: string }[] = [
  { key: "01-01", label: "Tết Dương lịch" },
  { key: "04-30", label: "Giải phóng miền Nam" },
  { key: "05-01", label: "Quốc tế Lao động" },
  { key: "09-02", label: "Quốc khánh" },
];

// Tạo danh sách ngày lễ mặc định cho 1 năm (YYYY-MM-DD)
const buildDefaultHolidays = (y: number): string[] =>
  FIXED_HOLIDAYS.map(h => `${y}-${h.key}`);

export default function ChamCongPage() {
  const now = new Date();
  const [thang, setThang] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  // Hộ kinh doanh đang chọn — lưu localStorage
  const [selectedHo, setSelectedHoRaw] = useState<HoKey | null>(() => {
    try { return (localStorage.getItem("meisy_selected_ho") as HoKey) || null; } catch { return null; }
  });
  const setSelectedHo = (ho: HoKey | null) => {
    setSelectedHoRaw(ho);
    try { if (ho) localStorage.setItem("meisy_selected_ho", ho); else localStorage.removeItem("meisy_selected_ho"); } catch {}
  };

  const [nhanViensAll, setNhanViens] = useState<NhanVien[]>([]);
  const [chamCongs, setChamCongs] = useState<ChamCong[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // "nvId_ngay"

  // Ngày lễ — lưu vào localStorage theo năm
  const [holidays, setHolidaysRaw] = useState<string[]>(() => {
    try {
      const y = new Date().getFullYear();
      const saved = localStorage.getItem(`meisy_holidays_${y}`);
      return saved ? JSON.parse(saved) : buildDefaultHolidays(y);
    } catch { return buildDefaultHolidays(new Date().getFullYear()); }
  });
  const setHolidays = (list: string[]) => {
    setHolidaysRaw(list);
    try { localStorage.setItem(`meisy_holidays_${year}`, JSON.stringify(list)); } catch {}
  };
  const [activeTab, setActiveTab] = useState<"chamcong" | "luong">("chamcong");
  const [blAuth, setBlAuth] = useState<string>("");
  const [blInput, setBlInput] = useState("");
  const [blError, setBlError] = useState("");
  // Danh sách phòng ban — lưu localStorage
  const DEFAULT_PHONG_BAN = ["Kho", "May", "CSKH", "Livestream"];
  const [phongBanList, setPhongBanListRaw] = useState<string[]>(() => {
    try { const s = localStorage.getItem("meisy_phong_ban"); return s ? JSON.parse(s) : DEFAULT_PHONG_BAN; } catch { return DEFAULT_PHONG_BAN; }
  });
  const setPhongBanList = (list: string[]) => {
    setPhongBanListRaw(list);
    try { localStorage.setItem("meisy_phong_ban", JSON.stringify(list)); } catch {}
  };
  const [newPhongBan, setNewPhongBan] = useState("");

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  // Lưu nhãn ngày lễ
  const [holidayLabels, setHolidayLabelsRaw] = useState<Record<string, string>>(() => {
    try { const s = localStorage.getItem("meisy_holiday_labels"); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });
  const setHolidayLabels = (m: Record<string, string>) => {
    setHolidayLabelsRaw(m); try { localStorage.setItem("meisy_holiday_labels", JSON.stringify(m)); } catch {};
  };

  // Phiếu lương cá nhân
  type PhieuLuong = {
    nv: NhanVien;
    lcb: number; soNgayLamViec: number;
    congCoMat: number; congMuon: number; congNuaNgay: number;
    congPhep: number; congLe: number; congVang: number; congTinhLuong: number;
    tongTC: number; heSoTC: number;
    luongCong: number; luongTC: number;
    phuCapCC: number; phuCapAnNgay: number; ngayAnDuCong: number; phuCapDB: number; tongPhuCap: number;
    thucLinh: number;
    // May special
    isKhoan?: boolean; isCoBanMay?: boolean;
    gioNV?: number; donGiaGio?: number; luongMay?: number;
  };
  const [phieuLuong, setPhieuLuong] = useState<PhieuLuong | null>(null);

  const printPhieuLuong = () => {
    if (!phieuLuong) return;
    const p = phieuLuong;
    const fv = (n: number) => n > 0 ? n.toLocaleString("vi-VN") + " ₫" : "—";
    const f  = (n: number) => n.toLocaleString("vi-VN");

    const rows = p.isKhoan || p.isCoBanMay ? `
      <tr style="background:#fffbeb">
        <td style="padding:6px 10px;font-weight:600;color:#b45309">${p.isKhoan ? "Lương khoán" : "Lương theo giờ"}</td>
        <td style="padding:6px 10px;text-align:right;font-size:11px;color:#888">${p.gioNV}h × ${f(p.donGiaGio ?? 0)}₫/h</td>
        <td style="padding:6px 10px;text-align:right;font-weight:600;color:#b45309">${fv(p.luongMay ?? 0)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:5px 10px;font-size:11px;color:#888">Chấm công (${p.congTinhLuong} ngày)
          ${p.congCoMat ? ` · Đi làm: ${p.congCoMat}` : ""}${p.congMuon ? ` · Muộn: ${p.congMuon}` : ""}${p.congVang ? `<span style="color:red"> · Vắng: ${p.congVang}</span>` : ""}
        </td><td></td>
      </tr>
    ` : `
      <tr>
        <td style="padding:6px 10px;color:#555">Lương cơ bản</td>
        <td style="padding:6px 10px;text-align:right;font-size:11px;color:#888">${f(p.lcb)} ÷ ${p.soNgayLamViec} ngày</td>
        <td style="padding:6px 10px;text-align:right">${fv(p.lcb)}</td>
      </tr>
      <tr style="background:#f0fdf4">
        <td style="padding:6px 10px;color:#16a34a;font-weight:600">Ngày công (${p.congTinhLuong} ngày)</td>
        <td style="padding:6px 10px;text-align:right;font-size:11px;color:#888;line-height:1.5">
          ${p.congCoMat > 0 ? `Đi làm: ${p.congCoMat}<br>` : ""}${p.congMuon > 0 ? `Đi muộn: ${p.congMuon}<br>` : ""}${p.congNuaNgay > 0 ? `½ ngày: ${p.congNuaNgay}<br>` : ""}${p.congPhep > 0 ? `Nghỉ phép: ${p.congPhep}<br>` : ""}${p.congVang > 0 ? `<span style="color:red">Vắng: ${p.congVang}</span>` : ""}
        </td>
        <td style="padding:6px 10px;text-align:right;font-weight:600;color:#16a34a">${fv(p.luongCong)}</td>
      </tr>
      ${p.tongTC > 0 ? `<tr><td style="padding:6px 10px;color:#ea580c">Tăng ca</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#888">${p.tongTC}h × ${f(p.heSoTC)}₫/h</td><td style="padding:6px 10px;text-align:right;color:#ea580c;font-weight:600">${fv(p.luongTC)}</td></tr>` : ""}
    `;

    const pcRows = `
      ${p.phuCapCC > 0 ? `<tr><td style="padding:6px 10px;color:#0d9488">PC Chuyên cần</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#888">${p.congVang > 0 ? "Không đủ điều kiện" : "Đủ điều kiện"}</td><td style="padding:6px 10px;text-align:right;color:#0d9488;font-weight:600">${p.congVang > 0 ? "—" : fv(p.phuCapCC)}</td></tr>` : ""}
      ${p.phuCapAnNgay > 0 ? `<tr><td style="padding:6px 10px;color:#0d9488">PC Ăn ca</td><td style="padding:6px 10px;text-align:right;font-size:11px;color:#888">${f(p.phuCapAnNgay)} × ${p.ngayAnDuCong} ngày</td><td style="padding:6px 10px;text-align:right;color:#0d9488;font-weight:600">${fv(p.phuCapAnNgay * p.ngayAnDuCong)}</td></tr>` : ""}
    `;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>Phiếu Lương — ${p.nv.ten}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0; }
        .info-box { background: #f8fafc; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
        th { background: #f1f5f9; padding: 7px 10px; text-align: left; font-size: 11px; color: #64748b; }
        th:last-child, td:last-child { text-align: right; }
        tr { border-bottom: 1px solid #f1f5f9; }
        .tfoot-row td { border-top: 2px solid #8b5cf6; background: #f5f3ff; padding: 10px; font-weight: 700; font-size: 15px; color: #5b21b6; }
        .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #666; }
        .sign-name { font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 40px; }
        .sign-line { border-top: 1px solid #aaa; padding-top: 4px; }
        @media print { body { padding: 0; } @page { size: A5; margin: 12mm; } }
      </style>
    </head><body>
      <div class="header">
        <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase">Meisy Inhouse</div>
        <div style="font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:4px 0">Phiếu Lương</div>
        <div style="font-size:13px;font-weight:600;color:#7c3aed">Tháng ${month}/${year}</div>
      </div>
      <div class="info-box">
        <div class="info-row"><span style="color:#64748b">Họ và tên:</span><strong>${p.nv.ten}</strong></div>
        <div class="info-row"><span style="color:#64748b">Mã NV:</span><span>${p.nv.maNV}</span></div>
        ${p.nv.chucVu ? `<div class="info-row"><span style="color:#64748b">Chức vụ:</span><span>${p.nv.chucVu}</span></div>` : ""}
        ${p.nv.phongBan ? `<div class="info-row"><span style="color:#64748b">Bộ phận:</span><span>${p.nv.phongBan}</span></div>` : ""}
      </div>
      <table>
        <thead><tr><th>Khoản mục</th><th style="text-align:right">Số liệu</th><th style="text-align:right">Thành tiền</th></tr></thead>
        <tbody>${rows}${pcRows}</tbody>
        <tfoot><tr class="tfoot-row"><td colspan="2">THỰC LĨNH</td><td>${fv(p.thucLinh)}</td></tr></tfoot>
      </table>
      <div class="sign">
        <div><div class="sign-name">Người nhận</div><div class="sign-line">(Ký, ghi rõ họ tên)</div></div>
        <div><div class="sign-name">Kế toán</div><div class="sign-line">(Ký, ghi rõ họ tên)</div></div>
      </div>
      <div style="text-align:center;font-size:10px;color:#ccc;margin-top:12px">Ngày in: ${new Date().toLocaleDateString("vi-VN")}</div>
      <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
    </body></html>`;

    const win = window.open("", "_blank", "width=480,height=750");
    win?.document.write(html);
    win?.document.close();
  };

  // Modal quản lý NV
  const [showNVModal, setShowNVModal] = useState(false);
  const [allNVs, setAllNVs] = useState<NhanVien[]>([]);
  const [nvForm, setNvForm] = useState({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", ngaySinh: "" });
  const [editingNV, setEditingNV] = useState<NhanVien | null>(null);
  const [savingNV, setSavingNV] = useState(false);
  const [nvError, setNvError] = useState("");

  // Khoán May
  const [locatStats, setLocatStats] = useState<LocatStats>({ dai_thuong: 0, dai_kieu: 0, short: 0 });
  const [khoanPrices, setKhoanPrices] = useState<Record<string, string>>({ dai_thuong: "", dai_kieu: "", short: "" });

  // Parse tháng
  const [year, month] = thang.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setThang(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };
  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setThang(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const isSunday = (day: number) => new Date(year, month - 1, day).getDay() === 0;
  const isSaturday = (day: number) => new Date(year, month - 1, day).getDay() === 6;
  const isHoliday = (day: number) => {
    const key = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return holidays.includes(key);
  };
  // Ngày nghỉ mặc định = CN hoặc ngày lễ (nhưng vẫn click được)
  const isDayOff = (day: number) => isSunday(day) || isHoliday(day);
  const getDayLabel = (day: number) => DAY_OF_WEEK[new Date(year, month - 1, day).getDay()];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cham-cong?thang=${thang}`);
      const text = await res.text();
      let data: { nhanViens?: unknown[]; chamCongs?: unknown[]; error?: string } = {};
      try { data = JSON.parse(text); } catch { console.error("API không trả JSON:", text.slice(0, 500)); }
      if (data.error) console.error("API error:", data.error);
      setNhanViens(Array.isArray(data.nhanViens) ? data.nhanViens as NhanVien[] : []);
      setChamCongs(Array.isArray(data.chamCongs) ? data.chamCongs as ChamCong[] : []);
    } catch (e) {
      console.error("fetchData error:", e);
    }
    setLoading(false);
  }, [thang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Load khoán prices + SL từ localStorage khi đổi tháng
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`khoan-prices-${thang}`) || "{}");
      setKhoanPrices({ dai_thuong: saved.dai_thuong ?? "", dai_kieu: saved.dai_kieu ?? "", short: saved.short ?? "" });
    } catch { setKhoanPrices({ dai_thuong: "", dai_kieu: "", short: "" }); }
    try {
      const savedSL = JSON.parse(localStorage.getItem(`khoan-sl-${thang}`) || "{}");
      setLocatStats({ dai_thuong: savedSL.dai_thuong ?? 0, dai_kieu: savedSL.dai_kieu ?? 0, short: savedSL.short ?? 0 });
    } catch { setLocatStats({ dai_thuong: 0, dai_kieu: 0, short: 0 }); }
  }, [thang]);

  // Map nhanh: "nvId_ngayISO" → trangThai
  const ccMap = useMemo(() => {
    const m: Record<string, string> = {};
    chamCongs.forEach(c => {
      const dateKey = c.ngay.slice(0, 10);
      m[`${c.nhanVienId}_${dateKey}`] = c.trangThai;
    });
    return m;
  }, [chamCongs]);

  // Map tăng ca: "nvId_ngayISO" → số giờ TC
  const tcMap = useMemo(() => {
    const m: Record<string, number> = {};
    chamCongs.forEach(c => {
      if (c.tangCa != null && c.tangCa > 0) {
        const dateKey = c.ngay.slice(0, 10);
        m[`${c.nhanVienId}_${dateKey}`] = c.tangCa;
      }
    });
    return m;
  }, [chamCongs]);

  const getKey = (nvId: string, day: number) =>
    `${nvId}_${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  // Filter nhân viên theo hộ đang chọn (getHo defined above)
  const nhanViens = useMemo(() =>
    selectedHo ? nhanViensAll.filter(nv => getHo(nv) === selectedHo) : nhanViensAll,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [nhanViensAll, selectedHo]);

  // ── Birthday notifications ──
  const birthdayAlerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alerts: { nv: NhanVien; daysLeft: number; bdStr: string }[] = [];
    for (const nv of [...nhanViens, ...allNVs.filter(a => !nhanViens.find(n => n.id === a.id))]) {
      if (!nv.ngaySinh) continue;
      const bd = new Date(nv.ngaySinh);
      // Sinh nhật năm nay
      let bdThisYear = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
      // Nếu đã qua → sang năm sau
      if (bdThisYear < today) bdThisYear = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
      const diffMs = bdThisYear.getTime() - today.getTime();
      const daysLeft = Math.round(diffMs / 86400000);
      if (daysLeft <= 3) {
        const bdStr = `${String(bd.getDate()).padStart(2,"0")}/${String(bd.getMonth()+1).padStart(2,"0")}`;
        alerts.push({ nv, daysLeft, bdStr });
      }
    }
    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [nhanViens, allNVs]);

  const handleCellClick = async (nvId: string, day: number) => {
    // Xác nhận khi bấm vào ngày CN (chưa có dữ liệu)
    const key = getKey(nvId, day);
    const cur = ccMap[key] ?? "";
    if (isSunday(day) && !cur) {
      if (!confirm(`Ngày ${day}/${month} là Chủ Nhật.\nBạn có chắc muốn chấm công ngày này không?`)) return;
    }
    const next = CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    const ngay = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Optimistic update
    setChamCongs(prev => {
      const existing = prev.find(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay);
      if (!next) return prev.filter(c => !(c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay));
      if (existing) return prev.map(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, trangThai: next } : c);
      return [...prev, { id: "tmp", nhanVienId: nvId, ngay: ngay + "T00:00:00.000Z", trangThai: next, tangCa: null, ghiChu: null }];
    });

    setSaving(key);
    await fetch("/api/cham-cong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId: nvId, ngay, trangThai: next || null }),
    }).catch(() => fetchData());
    setSaving(null);
  };

  // Tăng ca: lưu số giờ
  const handleTCChange = async (nvId: string, day: number, val: string) => {
    const ngay = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const tangCa = val === "" ? null : parseFloat(val);
    // Optimistic
    setChamCongs(prev => {
      const existing = prev.find(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay);
      if (existing) return prev.map(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, tangCa } : c);
      if (!tangCa) return prev;
      return [...prev, { id: "tmp2", nhanVienId: nvId, ngay: ngay + "T00:00:00.000Z", trangThai: "", tangCa, ghiChu: null }];
    });
    await fetch("/api/cham-cong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId: nvId, ngay, tangCa }),
    }).catch(() => fetchData());
  };

  // Reset toàn bộ chấm công 1 nhân viên trong tháng
  const resetEmployee = async (nvId: string, tenNV: string) => {
    if (!confirm(`Xoá toàn bộ chấm công của "${tenNV}" tháng ${month}/${year}?\nHành động này không thể hoàn tác.`)) return;
    const daysWithData = days.filter(d => ccMap[getKey(nvId, d)]);
    if (daysWithData.length === 0) { alert("Chưa có dữ liệu chấm công để xoá."); return; }
    // Optimistic: xoá khỏi UI ngay
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    setChamCongs(prev => prev.filter(c => !(c.nhanVienId === nvId && c.ngay.startsWith(prefix))));
    // Gọi API xoá từng ngày song song
    await Promise.all(daysWithData.map(d => {
      const ngay = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return fetch("/api/cham-cong", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nhanVienId: nvId, ngay, trangThai: null, tangCa: null }),
      });
    })).catch(() => fetchData());
  };

  // Summary per employee
  const getSummary = (nvId: string) => {
    const counts: Record<string, number> = {};
    days.forEach(d => {
      if (isDayOff(d)) return;
      const tt = ccMap[getKey(nvId, d)] ?? "";
      if (tt) counts[tt] = (counts[tt] ?? 0) + (tt === "nua_ngay" ? 0.5 : 1);
    });
    return counts;
  };

  // Working days in month (excluding weekends)
  const soNgayLamViec = days.filter(d => !isDayOff(d)).length;

  // Auto-generate maNV: NV001, NV002...
  const genMaNV = (list: NhanVien[]) => {
    const nums = list.map(n => parseInt(n.maNV.replace(/\D/g, ""))).filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `NV${String(next).padStart(3, "0")}`;
  };

  // Open NV modal
  const openNVModal = async () => {
    const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
    const list = Array.isArray(data) ? data : [];
    setAllNVs(list);
    // Tự điền maNV tiếp theo
    setNvForm(f => ({ ...f, maNV: genMaNV(list) }));
    setNvError("");
    setShowNVModal(true);
  };

  const saveNV = async () => {
    setNvError("");
    if (!nvForm.ten.trim()) { setNvError("Vui lòng nhập họ tên nhân viên"); return; }
    if (!nvForm.maNV.trim()) { setNvError("Vui lòng nhập mã nhân viên"); return; }
    setSavingNV(true);
    try {
      if (editingNV) {
        const res = await fetch(`/api/cham-cong/nhan-vien/${editingNV.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ten: nvForm.ten, chucVu: nvForm.chucVu, phongBan: nvForm.phongBan, loaiLuong: nvForm.loaiLuong, luongCB: nvForm.luongCB, ngaySinh: nvForm.ngaySinh || null }),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi cập nhật"); return; }
      } else {
        const res = await fetch("/api/cham-cong/nhan-vien", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nvForm),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi thêm nhân viên"); return; }
      }
      const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
      const list = Array.isArray(data) ? data : [];
      setAllNVs(list);
      setNvForm({ maNV: genMaNV(list), ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", ngaySinh: "" });
      setEditingNV(null);
      fetchData();
    } finally {
      setSavingNV(false);
    }
  };

  const toggleActiveNV = async (nv: NhanVien) => {
    await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !nv.active }),
    });
    const data = await fetch("/api/cham-cong/nhan-vien").then(r => r.json());
    setAllNVs(Array.isArray(data) ? data : []);
    fetchData();
  };

  // Helper: lấy hộ của NV dựa theo phongBan
  const getHo = (nv: NhanVien): HoKey => {
    return nv.phongBan?.toUpperCase() === "MAY" ? "nguyen_cong_uoc" : "meisy";
  };

  // ── Màn hình chọn hộ ──
  if (!selectedHo) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-8">
        <div className="text-center max-w-md w-full">
          <div className="text-4xl mb-3">📋</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Chấm Công & Bảng Lương</h1>
          <p className="text-slate-400 text-sm mb-8">Chọn hộ kinh doanh để tiếp tục</p>
          <div className="grid grid-cols-2 gap-4">
            {HO_LIST.map(ho => (
              <button
                key={ho.key}
                onClick={() => setSelectedHo(ho.key)}
                className={`group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all shadow-sm hover:shadow-md
                  ${ho.color === "indigo"
                    ? "border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                    : "border-rose-200 hover:border-rose-400 hover:bg-rose-50"}`}
              >
                <span className="text-4xl">{ho.emoji}</span>
                <span className={`text-base font-bold ${ho.color === "indigo" ? "text-indigo-700" : "text-rose-600"}`}>
                  {ho.label}
                </span>
                <span className="text-xs text-slate-400">
                  {nhanViensAll.filter(nv => getHo(nv) === ho.key).length} nhân viên
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentHo = HO_LIST.find(h => h.key === selectedHo)!;

  return (
    <div className="p-5">
      {/* Print styles — chuyển đổi giữa in phiếu cá nhân và bảng lương */}
      <style>{phieuLuong ? `
        @media print {
          body * { visibility: hidden !important; }
          #phieu-luong-modal, #phieu-luong-modal * { visibility: visible !important; }
          #phieu-luong-modal { position: fixed; top: 0; left: 0; width: 100%; background: white; }
          .no-print { display: none !important; }
          @page { size: A5; margin: 12mm; }
        }
      ` : `
        @media print {
          body * { visibility: hidden !important; }
          #bang-luong-in, #bang-luong-in * { visibility: visible !important; }
          #bang-luong-in { position: fixed; top: 0; left: 0; width: 100%; }
          @page { size: A4 landscape; margin: 10mm 8mm; }
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-2xl font-bold text-slate-800">Chấm Công</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              currentHo.color === "indigo"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-rose-100 text-rose-600"
            }`}>
              {currentHo.emoji} {currentHo.label}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">{nhanViens.length} nhân viên · {soNgayLamViec} ngày làm việc tháng này</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedHo(null)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-500 hover:bg-slate-50 transition">
            ⇄ Đổi hộ
          </button>
          <button onClick={() => setShowHolidayModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 text-sm text-purple-600 hover:bg-purple-50 transition">
            <CalendarDays size={14} /> Ngày lễ
          </button>
          <button onClick={openNVModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
            <Users size={14} /> Nhân viên
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
            <Printer size={14} /> In bảng
          </button>
        </div>
      </div>

      {/* ── Birthday banners ── */}
      {birthdayAlerts.length > 0 && (
        <div className="space-y-2 mb-4">
          {birthdayAlerts.map(({ nv, daysLeft, bdStr }) => {
            const isToday = daysLeft === 0;
            const cfg = isToday
              ? { bg: "bg-pink-50", border: "border-pink-300", icon: "🎂", iconBg: "bg-pink-100", text: "text-pink-800", badge: "bg-pink-500 text-white", badgeText: "Hôm nay!" }
              : daysLeft === 1
              ? { bg: "bg-orange-50", border: "border-orange-200", icon: "🎁", iconBg: "bg-orange-100", text: "text-orange-800", badge: "bg-orange-400 text-white", badgeText: "Còn 1 ngày" }
              : daysLeft === 2
              ? { bg: "bg-amber-50", border: "border-amber-200", icon: "🎈", iconBg: "bg-amber-100", text: "text-amber-800", badge: "bg-amber-400 text-white", badgeText: "Còn 2 ngày" }
              : { bg: "bg-yellow-50", border: "border-yellow-200", icon: "🎉", iconBg: "bg-yellow-100", text: "text-yellow-800", badge: "bg-yellow-400 text-white", badgeText: "Còn 3 ngày" };
            return (
              <div key={nv.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                <div className={`w-9 h-9 rounded-full ${cfg.iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${cfg.text}`}>
                    {isToday ? `Hôm nay là sinh nhật của ` : `Sinh nhật sắp tới: `}
                    <span className="font-bold">{nv.ten}</span>
                    {nv.chucVu && <span className="font-normal opacity-70"> · {nv.chucVu}</span>}
                  </p>
                  <p className={`text-xs ${cfg.text} opacity-70 mt-0.5`}>
                    {isToday ? `🎊 Chúc mừng sinh nhật! Sinh ngày ${bdStr}` : `Sinh ngày ${bdStr}`}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cfg.badge}`}>
                  {cfg.badgeText}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-4">
        <button onClick={() => setActiveTab("chamcong")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "chamcong" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          📋 Chấm công
        </button>
        <button onClick={() => setActiveTab("luong")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "luong" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          💰 Bảng lương
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronLeft size={16} /></button>
          <span className="text-base font-bold text-slate-800 min-w-[140px] text-center">
            Tháng {month}/{year}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronRight size={16} /></button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          {TRANG_THAI.map(tt => (
            <span key={tt.key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${tt.bg} ${tt.text}`}>
              <span className="font-bold">{tt.label}</span> {tt.title}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">T7/CN xám</span>
        </div>
      </div>

      {/* ─── TAB CHẤM CÔNG ─── */}
      {activeTab === "chamcong" && (loading ? (
        <div className="text-center py-16 text-slate-400">Đang tải...</div>
      ) : nhanViens.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Chưa có nhân viên. <button onClick={openNVModal} className="text-rose-500 hover:underline">Thêm nhân viên</button></p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="text-xs border-collapse" style={{ minWidth: `${80 + 180 + daysInMonth * 34 + 180}px` }}>
              <thead>
                {/* Row 1: tháng + ngày */}
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 border-r border-slate-200 w-8">STT</th>
                  <th className="sticky left-8 z-10 bg-slate-50 px-3 py-2 text-left font-semibold text-slate-600 border-r border-slate-200 min-w-[160px]">Nhân viên</th>
                  {days.map(d => (
                    <th key={d} className={`px-0 py-1 text-center w-[34px] font-semibold
                      ${isSunday(d) ? "bg-slate-100 text-slate-400" : isHoliday(d) ? "bg-purple-50 text-purple-500" : "text-slate-600"}`}>
                      <div>{d}</div>
                      <div className="text-[10px] font-normal">{getDayLabel(d)}</div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-center font-semibold text-emerald-700 bg-emerald-50 border-l border-slate-200 w-10">Công</th>
                  <th className="px-2 py-2 text-center font-semibold text-blue-700 bg-blue-50 w-8">NP</th>
                  <th className="px-2 py-2 text-center font-semibold text-red-700 bg-red-50 w-8">V</th>
                  <th className="px-2 py-2 text-center font-semibold text-amber-700 bg-amber-50 w-8">M</th>
                  <th className="px-2 py-2 text-center font-semibold text-cyan-700 bg-cyan-50 w-8">½</th>
                  <th className="px-2 py-2 text-center font-semibold text-purple-700 bg-purple-50 w-8">L</th>
                  <th className="px-2 py-2 text-center font-semibold text-orange-700 bg-orange-50 border-l border-orange-200 w-10">TC giờ</th>
                </tr>
              </thead>
              <tbody>
                {nhanViens.length === 0 && (
                  <tr><td colSpan={50} className="text-center py-10 text-slate-400">Chưa có nhân viên</td></tr>
                )}
                {(() => {
                  // Group theo phòng ban
                  const groups = new Map<string, typeof nhanViens>();
                  nhanViens.forEach(nv => {
                    const pb = nv.phongBan?.trim() || "Chưa phân phòng";
                    if (!groups.has(pb)) groups.set(pb, []);
                    groups.get(pb)!.push(nv);
                  });
                  let globalIdx = 0;
                  return Array.from(groups.entries()).map(([phongBan, nvList]) => (
                    <React.Fragment key={`group-${phongBan}`}>
                      {/* Header phòng ban */}
                      <tr>
                        <td colSpan={50} className="bg-indigo-50 border-y border-indigo-200 px-4 py-1.5">
                          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                            🏢 {phongBan}
                          </span>
                          <span className="ml-2 text-xs text-indigo-400">({nvList.length} NV)</span>
                        </td>
                      </tr>
                      {nvList.map((nv) => {
                  const idx = globalIdx++;
                  const summary = getSummary(nv.id);
                  const cong = (summary["di_lam"] ?? 0) + (summary["di_muon"] ?? 0) + (summary["nua_ngay"] ?? 0);
                  const tongTC = days.reduce((s, d) => s + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  return (
                    <React.Fragment key={nv.id}>
                    {/* ── Dòng 1: chấm công ── */}
                    <tr className={`${rowBg} hover:bg-rose-50/20 transition`}>
                      {/* STT — rowSpan=2 */}
                      <td rowSpan={2} className={`sticky left-0 z-10 px-3 py-1.5 text-center text-slate-400 border-r border-slate-100 border-b-2 border-b-slate-200 ${rowBg}`}>
                        {idx + 1}
                      </td>
                      {/* Tên NV — rowSpan=2 */}
                      <td rowSpan={2} className={`sticky left-8 z-10 px-3 py-1.5 border-r border-slate-100 border-b-2 border-b-slate-200 ${rowBg}`}>
                        <div className="flex items-center justify-between gap-1 group">
                          <div>
                            <p className="font-semibold text-slate-800 text-[13px]">{nv.ten}</p>
                            {nv.chucVu && <p className="text-[11px] text-slate-400">{nv.chucVu}</p>}
                          </div>
                          <button
                            title="Xoá toàn bộ chấm công tháng này"
                            onClick={() => resetEmployee(nv.id, nv.ten)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all shrink-0"
                          >
                            <RotateCcw size={13} />
                          </button>
                        </div>
                      </td>
                      {/* Cells chấm công */}
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tt = ccMap[key] ?? "";
                        const info = TT_MAP[tt];
                        const isSaving = saving === key;
                        const sun = isSunday(d);
                        const holiday = isHoliday(d);
                        const defaultBg = sun ? "bg-slate-100/80" : holiday ? "bg-purple-50/60" : "";
                        return (
                          <td key={d}
                            className={`p-0 text-center cursor-pointer select-none border-x border-slate-100 transition hover:brightness-95 ${defaultBg} ${isSaving ? "opacity-50" : ""}`}
                            onClick={() => handleCellClick(nv.id, d)}
                            title={info?.title ?? (sun ? "Chủ nhật" : holiday ? (holidayLabels[`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`] ?? "Ngày lễ") : "Click để chấm công")}
                          >
                            {info ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold ${info.bg} ${info.text}`}>
                                {info.label}
                              </span>
                            ) : sun ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-slate-300">CN</span>
                            ) : holiday ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-purple-300">L</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 text-[10px] text-slate-200 hover:text-slate-400"></span>
                            )}
                          </td>
                        );
                      })}
                      {/* Summary row 1 — rowSpan=2 */}
                      <td rowSpan={2} className="px-2 py-1.5 text-center font-bold text-emerald-700 bg-emerald-50/50 border-l border-slate-200 border-b-2 border-b-slate-200">{cong || "—"}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-blue-700 bg-blue-50/50 border-b-2 border-b-slate-200">{summary["nghi_phep"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-red-700 bg-red-50/50 font-semibold border-b-2 border-b-slate-200">{summary["vang"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-amber-700 bg-amber-50/50 border-b-2 border-b-slate-200">{summary["di_muon"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-cyan-700 bg-cyan-50/50 border-b-2 border-b-slate-200">{summary["nua_ngay"] || ""}</td>
                      <td rowSpan={2} className="px-2 py-1.5 text-center text-purple-700 bg-purple-50/50 border-b-2 border-b-slate-200">{summary["nghi_le"] || ""}</td>
                      <td rowSpan={2} className={`px-1 py-1.5 text-center font-bold border-l border-orange-200 border-b-2 border-b-slate-200 ${tongTC > 0 ? "text-orange-700 bg-orange-50/60" : "bg-orange-50/20 text-slate-300"}`}>
                        {tongTC > 0 ? tongTC : "—"}
                      </td>
                    </tr>
                    {/* ── Dòng 2: tăng ca ── */}
                    <tr key={`${nv.id}-tc`} className={`border-b-2 border-slate-200 ${rowBg}`}>
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tc = tcMap[key];
                        const sun = isSunday(d);
                        return (
                          <td key={d} className={`p-px border-x border-slate-100 ${sun ? "bg-slate-100/60" : "bg-orange-50/40"}`}>
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={tc ?? ""}
                              onChange={e => {
                                const val = e.target.value;
                                const tcVal = val === "" ? null : Math.min(24, parseFloat(val));
                                setChamCongs(prev => {
                                  const ngay = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                                  const existing = prev.find(c => c.nhanVienId === nv.id && c.ngay.slice(0,10) === ngay);
                                  if (existing) return prev.map(c => c.nhanVienId === nv.id && c.ngay.slice(0,10) === ngay ? { ...c, tangCa: tcVal } : c);
                                  if (!tcVal) return prev;
                                  return [...prev, { id: "tmp3", nhanVienId: nv.id, ngay: ngay + "T00:00:00.000Z", trangThai: "", tangCa: tcVal, ghiChu: null }];
                                });
                              }}
                              onBlur={e => handleTCChange(nv.id, d, e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              placeholder=""
                              className={`w-full h-7 text-center text-xs font-bold bg-transparent border rounded focus:outline-none focus:ring-1 focus:ring-orange-400 focus:bg-orange-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                ${sun ? "text-slate-500 border-slate-300" : "text-orange-700 border-orange-300"}`}
                              title="Số giờ tăng ca"
                            />
                          </td>
                        );
                      })}
                    </tr>
                    </React.Fragment>
                  );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </tbody>
              {/* Footer tổng */}
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold text-[12px]">
                <tr>
                  <td colSpan={2} className="sticky left-0 z-10 bg-slate-100 px-3 py-2 border-r border-slate-200 text-slate-600">
                    Tổng ({nhanViens.length} NV)
                  </td>
                  {days.map(d => {
                    const count = nhanViens.filter(nv => {
                      const tt = ccMap[getKey(nv.id, d)] ?? "";
                      return tt === "di_lam" || tt === "di_muon";
                    }).length;
                    const weekend = isDayOff(d);
                    return (
                      <td key={d} className={`text-center py-2 ${weekend ? "bg-slate-200/60 text-slate-400" : count > 0 ? "text-slate-700" : "text-slate-300"}`}>
                        {!weekend && count > 0 ? count : ""}
                      </td>
                    );
                  })}
                  <td colSpan={6} className="bg-slate-100 border-l border-slate-200"></td>
                  <td className="bg-orange-50/60 border-l border-orange-200 text-center text-orange-700">
                    {(() => {
                      const total = nhanViens.reduce((s, nv) => s + days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0), 0);
                      return total > 0 ? total : "";
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* ─── TAB BẢNG LƯƠNG ─── */}
      {activeTab === "luong" && !blAuth && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm mx-auto mt-8">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">💰</div>
            <h2 className="font-bold text-slate-800">Xem bảng lương</h2>
            <p className="text-xs text-slate-400 mt-1">Nhập mã nhân viên để xem lương của bạn</p>
          </div>
          <form onSubmit={e => {
            e.preventDefault();
            const val = blInput.trim().toUpperCase();
            if (!val) return;
            setBlAuth(val);
            setBlError("");
          }} className="space-y-3">
            <input autoFocus value={blInput}
              onChange={e => { setBlInput(e.target.value); setBlError(""); }}
              placeholder="VD: NV001 hoặc ADMIN"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 font-mono" />
            {blError && <p className="text-xs text-red-500">{blError}</p>}
            <button type="submit" className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700">
              Xem lương
            </button>
          </form>
        </div>
      )}

      {activeTab === "luong" && blAuth && (
        <div id="bang-luong-in" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Bảng Lương — Tháng {month}/{year}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {blAuth === "ADMIN" ? "Xem toàn bộ" : `Đang xem: ${blAuth}`}
                <button onClick={() => { setBlAuth(""); setBlInput(""); }} className="ml-2 text-violet-500 hover:underline">Đăng xuất</button>
              </p>
            </div>
            {blAuth === "ADMIN" && (
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition print:hidden">
                <Printer size={14} /> In bảng lương
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-3 py-2.5 text-left text-slate-500 w-8">STT</th>
                  <th className="px-3 py-2.5 text-left text-slate-500 min-w-[150px]">Nhân viên</th>
                  <th className="px-3 py-2.5 text-right text-slate-500">Lương CB</th>
                  <th className="px-3 py-2.5 text-center text-emerald-600">Công</th>
                  <th className="px-3 py-2.5 text-center text-blue-600">NP</th>
                  <th className="px-3 py-2.5 text-center text-red-500">Vắng</th>
                  <th className="px-3 py-2.5 text-center text-amber-600">Muộn</th>
                  <th className="px-3 py-2.5 text-center text-cyan-600">½</th>
                  <th className="px-3 py-2.5 text-center text-orange-600">TC giờ</th>
                  <th className="px-3 py-2.5 text-center text-orange-500">Hệ số TC</th>
                  <th className="px-3 py-2.5 text-right text-slate-500">Lương công</th>
                  <th className="px-3 py-2.5 text-right text-orange-600">Lương TC</th>
                  <th className="px-3 py-2.5 text-center text-teal-600 min-w-[130px]">Phụ cấp<div className="text-[10px] font-normal text-slate-400">CC + Ăn/ngày</div></th>
                  <th className="px-3 py-2.5 text-right font-bold text-indigo-700 bg-indigo-50 border-l border-indigo-100">Thực lĩnh</th>
                  <th className="px-2 py-2.5 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {nhanViens.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-10 text-slate-400">Chưa có nhân viên</td></tr>
                )}
                {(() => {
                  const isAdmin = blAuth === "ADMIN";
                  const visibleNV = isAdmin
                    ? nhanViens
                    : nhanViens.filter(nv => nv.maNV?.toUpperCase() === blAuth.toUpperCase());
                  const groups = new Map<string, typeof nhanViens>();
                  visibleNV.forEach(nv => {
                    const pb = nv.phongBan?.trim() || "Chưa phân phòng";
                    if (!groups.has(pb)) groups.set(pb, []);
                    groups.get(pb)!.push(nv);
                  });
                  let globalIdx = 0;
                  // ── Tính khoán May ──────────────────────────────────────
                  const isMayGroup = (pb: string) => pb.trim().toLowerCase() === "may";

                  const getHoursNV = (nvId: string) => {
                    const sum = getSummary(nvId);
                    const cong = (sum["di_lam"] ?? 0) + (sum["di_muon"] ?? 0) + (sum["nua_ngay"] ?? 0) * 0.5 + (sum["nghi_phep"] ?? 0) + (sum["nghi_le"] ?? 0);
                    const tc   = days.reduce((s, d) => s + (tcMap[getKey(nvId, d)] ?? 0), 0);
                    return cong * 8 + tc;
                  };

                  const khoanPool = LOAI_HANG_KEYS.reduce((s, k) => {
                    const price = parseFloat(khoanPrices[k] || "0") || 0;
                    return s + (locatStats[k] ?? 0) * price;
                  }, 0);

                  return Array.from(groups.entries()).map(([phongBan, nvList]) => {
                    // ── Khoán May: tổng giờ & khấu trừ co_ban ──────────────
                    const tongGioKhoanNhom = isMayGroup(phongBan)
                      ? nvList.filter(n => n.loaiLuong === "khoan").reduce((s, n) => s + getHoursNV(n.id), 0)
                      : 0;

                    // Phần co_ban nhận từ pool = Σ(tổng giờ đi làm × heSoTC) của NV co_ban
                    const totalCoBanTC = isMayGroup(phongBan)
                      ? nvList.filter(n => n.loaiLuong !== "khoan").reduce((s, n) => {
                          const gioCoBan = getHoursNV(n.id);
                          return s + gioCoBan * (n.heSoTC ?? 1.5);
                        }, 0)
                      : 0;

                    // Pool còn lại sau khi trừ phần co_ban TC
                    const khoanRemainder  = Math.max(0, khoanPool - totalCoBanTC);
                    const donGiaGioKhoan  = tongGioKhoanNhom > 0 ? khoanRemainder / tongGioKhoanNhom : 0;

                    return (
                    <React.Fragment key={`group-luong-${phongBan}`}>
                      <tr>
                        <td colSpan={15} className="bg-indigo-50 border-y border-indigo-200 px-4 py-1.5">
                          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">🏢 {phongBan}</span>
                          <span className="ml-2 text-xs text-indigo-400">({nvList.length} NV)</span>
                        </td>
                      </tr>

                      {/* ── Panel khoán May ────────────────────────── */}
                      {isMayGroup(phongBan) && (
                        <tr>
                          <td colSpan={15} className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                            <div className="flex items-start gap-6 flex-wrap">
                              <div>
                                <p className="text-xs font-bold text-amber-700 mb-2">🧩 Bảng khoán tháng {month}/{year}</p>
                                <table className="text-xs border-collapse">
                                  <thead>
                                    <tr className="text-amber-600">
                                      <th className="pr-4 pb-1 text-left font-semibold">Loại hàng</th>
                                      <th className="px-3 pb-1 text-right font-semibold">SL (cái)</th>
                                      <th className="px-3 pb-1 text-right font-semibold">Đơn giá (₫)</th>
                                      <th className="px-3 pb-1 text-right font-semibold">Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {LOAI_HANG_KEYS.map(k => {
                                      const sl    = locatStats[k] ?? 0;
                                      const price = parseFloat(khoanPrices[k] || "0") || 0;
                                      return (
                                        <tr key={k} className="border-t border-amber-100">
                                          <td className="pr-4 py-1 font-medium text-slate-700">{LOAI_HANG_LABEL[k]}</td>
                                          <td className="px-3 py-1">
                                            <input
                                              type="number" min="0" step="1"
                                              value={sl || ""}
                                              placeholder="0"
                                              onChange={e => {
                                                const next = { ...locatStats, [k]: parseFloat(e.target.value) || 0 };
                                                setLocatStats(next);
                                                try { localStorage.setItem(`khoan-sl-${thang}`, JSON.stringify(next)); } catch {}
                                              }}
                                              className="w-20 text-right text-xs font-semibold text-slate-700 border border-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                          </td>
                                          <td className="px-3 py-1">
                                            <input
                                              type="number" min="0" step="1000"
                                              value={khoanPrices[k]}
                                              placeholder="0"
                                              onChange={e => {
                                                const next = { ...khoanPrices, [k]: e.target.value };
                                                setKhoanPrices(next);
                                                try { localStorage.setItem(`khoan-prices-${thang}`, JSON.stringify(next)); } catch {}
                                              }}
                                              className="w-24 text-right text-xs font-semibold text-amber-700 border border-amber-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                          </td>
                                          <td className="px-3 py-1 text-right font-semibold text-amber-700">
                                            {sl > 0 && price > 0 ? fmt(Math.round(sl * price)) + "₫" : <span className="text-slate-300">—</span>}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                              <div className="flex flex-col gap-1 text-xs pt-5">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 w-40">Pool cả đội:</span>
                                  <span className="font-bold text-amber-700 text-sm">{fmt(Math.round(khoanPool))}₫</span>
                                </div>
                                {totalCoBanTC > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500 w-40">Trừ TC (lương CB):</span>
                                    <span className="font-semibold text-red-500">−{fmt(Math.round(totalCoBanTC))}₫</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 border-t border-amber-200 pt-1 mt-0.5">
                                  <span className="text-slate-500 w-40">Pool chia khoán:</span>
                                  <span className="font-bold text-emerald-700 text-sm">{fmt(Math.round(khoanRemainder))}₫</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 w-40">Tổng giờ (NV khoán):</span>
                                  <span className="font-semibold text-slate-700">{Math.round(tongGioKhoanNhom)} giờ</span>
                                </div>
                                <div className="flex items-center gap-2 border-t border-amber-200 pt-1 mt-1">
                                  <span className="text-slate-500 w-40">Đơn giá / giờ khoán:</span>
                                  <span className="font-bold text-rose-600">{donGiaGioKhoan > 0 ? fmt(Math.round(donGiaGioKhoan)) + "₫/h" : "—"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {nvList.map((nv) => {
                  const idx = globalIdx++;
                  const summary = getSummary(nv.id);
                  const tongTC = days.reduce((s, d) => s + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                  const lcb = nv.luongCB ?? 0;

                  // Ngày công tính lương: có mặt + muộn + ½×0.5 + phép + lễ (vắng = không tính)
                  const congCoMat  = summary["di_lam"]    ?? 0;
                  const congMuon   = summary["di_muon"]   ?? 0;
                  const congNuaNgay= summary["nua_ngay"]  ?? 0;
                  const congPhep   = summary["nghi_phep"] ?? 0;
                  const congLe     = summary["nghi_le"]   ?? 0;
                  const congVang   = summary["vang"]      ?? 0;
                  const congTinhLuong = congCoMat + congMuon + congNuaNgay * 0.5 + congPhep + congLe;

                  const heSoTC        = nv.heSoTC ?? 1.5;
                  const phuCapCC      = nv.phuCapChuyenCan ?? 0;
                  const phuCapAnNgay  = nv.phuCapAn ?? 0;
                  const phuCapDB      = nv.phuCapDacBiet ?? 0;
                  // Ngày đủ công cho PC ăn = chỉ di_lam + di_muon (đủ 1 ngày)
                  const ngayAnDuCong  = congCoMat + congMuon;
                  const tongPhuCap    = phuCapCC + phuCapAnNgay * ngayAnDuCong + phuCapDB;
                  const luongNgay     = soNgayLamViec > 0 ? lcb / soNgayLamViec : 0;
                  const luongCong     = luongNgay * congTinhLuong;
                  const luongTC       = heSoTC * tongTC; // đơn giá/giờ × số giờ TC
                  const thucLinh      = luongCong + luongTC + tongPhuCap;

                  // Khoán / co_ban May
                  const isKhoan       = nv.loaiLuong === "khoan" && isMayGroup(phongBan);
                  const isCoBanMay    = nv.loaiLuong !== "khoan"  && isMayGroup(phongBan);
                  const gioNV         = (isKhoan || isCoBanMay) ? congTinhLuong * 8 + tongTC : 0;
                  const luongKhoan    = isKhoan    ? donGiaGioKhoan * gioNV : 0;
                  const luongCoBanMay = isCoBanMay ? gioNV * (nv.heSoTC ?? 1.5) : 0;
                  const thucLinhKhoan    = isKhoan    ? luongKhoan    + tongPhuCap : thucLinh;
                  const thucLinhCoBanMay = isCoBanMay ? luongCoBanMay + tongPhuCap : thucLinh;

                  return (
                    <tr key={nv.id} className={`border-b border-slate-50 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                      <td className="px-3 py-2 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800">{nv.ten}</p>
                        {nv.chucVu && <p className="text-xs text-slate-400">{nv.chucVu}</p>}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {isKhoan
                          ? <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-semibold">Khoán</span>
                          : isCoBanMay
                            ? <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">Tiếng</span>
                            : lcb > 0 ? fmt(lcb) + "₫" : <span className="text-slate-300 text-xs">Chưa có</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-emerald-700">{congTinhLuong || "—"}</td>
                      <td className="px-3 py-2 text-center text-blue-600">{congPhep || ""}</td>
                      <td className="px-3 py-2 text-center text-red-500 font-semibold">{congVang || ""}</td>
                      <td className="px-3 py-2 text-center text-amber-600">{congMuon || ""}</td>
                      <td className="px-3 py-2 text-center text-cyan-600">{congNuaNgay || ""}</td>
                      <td className="px-3 py-2 text-center text-orange-600 font-semibold">{tongTC > 0 ? tongTC : ""}</td>
                      {/* Hệ số TC — inline edit */}
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number" step="0.1" min="1" max="5"
                          defaultValue={heSoTC}
                          onBlur={async e => {
                            const val = parseFloat(e.target.value) || 1.5;
                            await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                              method: "PATCH", headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ heSoTC: val }),
                            });
                            fetchData();
                          }}
                          onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          className="w-14 text-center text-xs font-semibold text-orange-600 border border-orange-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-orange-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {isKhoan
                          ? (donGiaGioKhoan > 0 && gioNV > 0
                            ? <span className="text-amber-600 font-semibold">{fmt(Math.round(luongKhoan))}₫<br/><span className="text-[10px] font-normal text-slate-400">{Math.round(gioNV)}h × {fmt(Math.round(donGiaGioKhoan))}₫/h</span></span>
                            : <span className="text-slate-300 text-xs">—</span>)
                          : isCoBanMay
                            ? (gioNV > 0
                              ? <span className="text-blue-600 font-semibold">{fmt(Math.round(luongCoBanMay))}₫<br/><span className="text-[10px] font-normal text-slate-400">{Math.round(gioNV)}h × {fmt(nv.heSoTC ?? 1.5)}₫/h</span></span>
                              : <span className="text-slate-300 text-xs">—</span>)
                            : (lcb > 0 && congTinhLuong > 0 ? fmt(Math.round(luongCong)) + "₫" : <span className="text-slate-300">—</span>)
                        }
                      </td>
                      <td className="px-3 py-2 text-right text-orange-600">
                        {(isKhoan || isCoBanMay) ? "" : (lcb > 0 && tongTC > 0 ? fmt(Math.round(luongTC)) + "₫" : "")}
                      </td>
                      {/* Phụ cấp — 2 ô: Chuyên cần + Ăn/ngày */}
                      <td className="px-2 py-1">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 w-7 shrink-0">CC</span>
                            <input
                              type="number" step="50000" min="0"
                              defaultValue={phuCapCC || ""}
                              placeholder="0"
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phuCapChuyenCan: val || null }),
                                });
                                fetchData();
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 w-7 shrink-0">Ăn</span>
                            <input
                              type="number" step="10000" min="0"
                              defaultValue={phuCapAnNgay || ""}
                              placeholder="0"
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phuCapAn: val || null }),
                                });
                                fetchData();
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            {phuCapAnNgay > 0 && <span className="text-[10px] text-slate-400">×{ngayAnDuCong}ng</span>}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 w-7 shrink-0">ĐB</span>
                            <input
                              type="number" step="50000" min="0"
                              defaultValue={phuCapDB || ""}
                              placeholder="0"
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ phuCapDacBiet: val || null }),
                                });
                                fetchData();
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                          </div>
                          {tongPhuCap > 0 && (
                            <div className="text-[11px] font-bold text-teal-700 text-right pr-1">
                              = {fmt(Math.round(tongPhuCap))}₫
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                        {isKhoan
                          ? (thucLinhKhoan > 0 ? fmt(Math.round(thucLinhKhoan)) + "₫" : <span className="text-slate-300 font-normal">—</span>)
                          : isCoBanMay
                            ? (thucLinhCoBanMay > 0 ? fmt(Math.round(thucLinhCoBanMay)) + "₫" : <span className="text-slate-300 font-normal">—</span>)
                            : (lcb > 0 && thucLinh > 0 ? fmt(Math.round(thucLinh)) + "₫" : <span className="text-slate-300 font-normal">—</span>)
                        }
                      </td>
                      <td className="px-1 py-2 text-center">
                        <button
                          title="In phiếu lương"
                          onClick={() => setPhieuLuong({
                            nv, lcb, soNgayLamViec, congCoMat, congMuon, congNuaNgay, congPhep, congLe, congVang, congTinhLuong, tongTC, heSoTC,
                            luongCong: isKhoan ? Math.round(luongKhoan) : isCoBanMay ? Math.round(luongCoBanMay) : Math.round(luongCong),
                            luongTC: (isKhoan || isCoBanMay) ? 0 : Math.round(luongTC),
                            phuCapCC, phuCapAnNgay, ngayAnDuCong, phuCapDB, tongPhuCap: Math.round(tongPhuCap),
                            thucLinh: isKhoan ? Math.round(thucLinhKhoan) : isCoBanMay ? Math.round(thucLinhCoBanMay) : Math.round(thucLinh),
                            isKhoan, isCoBanMay,
                            gioNV: (isKhoan || isCoBanMay) ? Math.round(gioNV) : undefined,
                            donGiaGio: isKhoan ? Math.round(donGiaGioKhoan) : isCoBanMay ? (nv.heSoTC ?? 1.5) : undefined,
                            luongMay: isKhoan ? Math.round(luongKhoan) : isCoBanMay ? Math.round(luongCoBanMay) : undefined,
                          })}
                          className="p-1.5 rounded-lg hover:bg-violet-100 text-slate-300 hover:text-violet-600 transition">
                          <Printer size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                      })}
                    </React.Fragment>
                  );
                  });
                })()}
              </tbody>
              {nhanViens.length > 0 && (
                <tfoot className="bg-slate-100 border-t-2 border-slate-200 font-semibold text-xs">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-slate-600">Tổng ({nhanViens.length} NV)</td>
                    <td className="px-3 py-2 text-center text-emerald-700">
                      {nhanViens.reduce((s, nv) => {
                        const sum = getSummary(nv.id);
                        return s + (sum["di_lam"]??0) + (sum["di_muon"]??0) + (sum["nua_ngay"]??0)*0.5 + (sum["nghi_phep"]??0) + (sum["nghi_le"]??0);
                      }, 0) || "—"}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-center text-orange-600">
                      {nhanViens.reduce((s, nv) => s + days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0), 0) || ""}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-right text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                      {fmt(Math.round(nhanViens.reduce((s, nv) => {
                        const sum = getSummary(nv.id);
                        const tongTC = days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0);
                        const lcb = nv.luongCB ?? 0;
                        const cong = (sum["di_lam"]??0) + (sum["di_muon"]??0) + (sum["nua_ngay"]??0)*0.5 + (sum["nghi_phep"]??0) + (sum["nghi_le"]??0);
                        const luongCong = soNgayLamViec > 0 ? (lcb / soNgayLamViec) * cong : 0;
                        const luongTC = soNgayLamViec > 0 ? (lcb / (soNgayLamViec * 8)) * 1.5 * tongTC : 0;
                        return s + luongCong + luongTC;
                      }, 0)))}₫
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
          <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400">
            💡 Lương CB: Lương TC = giờ TC × <b>Hệ số TC</b> &nbsp;|&nbsp; Đội May: Lương theo khoán sản phẩm (không tính TC riêng) &nbsp;|&nbsp; Thực lĩnh = Lương + Phụ cấp &nbsp;|&nbsp; Vắng không tính lương
          </div>
        </div>
      )}

      {/* ═══ MODAL NGÀY LỄ ═══ */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quản lý Ngày lễ</h2>
                <p className="text-xs text-slate-400 mt-0.5">Ngày nghỉ lễ — CN luôn nghỉ, lễ hiển thị chữ L tím (vẫn bấm được để override)</p>
              </div>
              <button onClick={() => setShowHolidayModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Thêm ngày lễ */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Ngày (YYYY-MM-DD)</label>
                  <input type="date" value={newHolidayDate} onChange={e => setNewHolidayDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Tên ngày lễ</label>
                  <input value={newHolidayLabel} onChange={e => setNewHolidayLabel(e.target.value)}
                    placeholder="VD: Giỗ Tổ Hùng Vương"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <button
                  onClick={() => {
                    if (!newHolidayDate) return;
                    if (!holidays.includes(newHolidayDate)) {
                      setHolidays([...holidays, newHolidayDate].sort());
                      if (newHolidayLabel) setHolidayLabels({ ...holidayLabels, [newHolidayDate]: newHolidayLabel });
                    }
                    setNewHolidayDate(""); setNewHolidayLabel("");
                  }}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition whitespace-nowrap">
                  + Thêm
                </button>
              </div>

              {/* Danh sách ngày lễ */}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                <p className="text-xs font-semibold text-slate-500 mb-2">Danh sách ngày lễ ({year})</p>
                {holidays.filter(h => h.startsWith(String(year))).length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Chưa có ngày lễ nào</p>
                )}
                {holidays.filter(h => h.startsWith(String(year))).sort().map(date => {
                  const d = new Date(date + "T00:00:00");
                  const label = holidayLabels[date] ?? FIXED_HOLIDAYS.find(f => date.endsWith(f.key))?.label ?? "";
                  return (
                    <div key={date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
                      <div>
                        <span className="font-semibold text-purple-700 text-sm">
                          {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">{DAY_OF_WEEK[d.getDay()]}</span>
                        {label && <span className="text-xs text-purple-600 ml-2 italic">{label}</span>}
                      </div>
                      <button onClick={() => {
                        setHolidays(holidays.filter(h => h !== date));
                        const { [date]: _, ...rest } = holidayLabels; void _; setHolidayLabels(rest);
                      }} className="text-slate-300 hover:text-red-500 transition p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Nút thêm nhanh ngày lễ cố định năm hiện tại */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-2">Thêm nhanh ngày lễ cố định {year}:</p>
                <div className="flex flex-wrap gap-2">
                  {FIXED_HOLIDAYS.map(h => {
                    const full = `${year}-${h.key}`;
                    const added = holidays.includes(full);
                    return (
                      <button key={h.key} onClick={() => {
                        if (!added) { setHolidays([...holidays, full].sort()); setHolidayLabels({ ...holidayLabels, [full]: h.label }); }
                      }}
                        className={`text-xs px-3 py-1 rounded-full border transition ${added ? "bg-purple-100 text-purple-600 border-purple-200 cursor-default" : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50"}`}>
                        {added ? "✓" : "+"} {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL NHÂN VIÊN ═══ */}
      {showNVModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-10 px-4 pb-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Quản lý Nhân viên</h2>
              <button onClick={() => { setShowNVModal(false); setEditingNV(null); setNvError(""); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", ngaySinh: "" }); }}
                className="p-1.5 rounded-lg hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Form thêm/sửa */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700">{editingNV ? `Sửa: ${editingNV.ten}` : "Thêm nhân viên"}</h3>
                {nvError && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{nvError}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Mã NV *</label>
                    <input value={nvForm.maNV} onChange={e => setNvForm(f => ({ ...f, maNV: e.target.value }))}
                      disabled={!!editingNV}
                      placeholder="VD: NV001"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:bg-slate-100" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Họ tên *</label>
                    <input value={nvForm.ten} onChange={e => setNvForm(f => ({ ...f, ten: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Chức vụ</label>
                    <input value={nvForm.chucVu} onChange={e => setNvForm(f => ({ ...f, chucVu: e.target.value }))}
                      placeholder="Nhân viên kho..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Phòng ban</label>
                    <select value={nvForm.phongBan} onChange={e => setNvForm(f => ({ ...f, phongBan: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white">
                      <option value="">— Chọn phòng ban —</option>
                      {phongBanList.map(pb => <option key={pb} value={pb}>{pb}</option>)}
                    </select>
                    {/* Thêm phòng ban mới */}
                    <div className="flex gap-1 mt-1.5">
                      <input value={newPhongBan} onChange={e => setNewPhongBan(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && newPhongBan.trim()) {
                            if (!phongBanList.includes(newPhongBan.trim())) setPhongBanList([...phongBanList, newPhongBan.trim()]);
                            setNewPhongBan("");
                          }
                        }}
                        placeholder="Thêm phòng ban mới..."
                        className="flex-1 border border-dashed border-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-rose-200" />
                      <button type="button"
                        onClick={() => {
                          if (!newPhongBan.trim()) return;
                          if (!phongBanList.includes(newPhongBan.trim())) setPhongBanList([...phongBanList, newPhongBan.trim()]);
                          setNewPhongBan("");
                        }}
                        className="px-2 py-1 bg-rose-500 text-white rounded-lg text-xs hover:bg-rose-600 transition">+</button>
                    </div>
                    {/* Danh sách quick-delete */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {phongBanList.map(pb => (
                        <span key={pb} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-600">
                          {pb}
                          <button onClick={() => setPhongBanList(phongBanList.filter(p => p !== pb))}
                            className="text-slate-400 hover:text-red-500 transition leading-none">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Hình thức lương</label>
                    <div className="flex gap-2">
                      {[
                        { value: "co_ban", label: "Lương cơ bản", icon: "💼" },
                        { value: "khoan",  label: "Khoán",         icon: "🧩" },
                      ].map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => setNvForm(f => ({ ...f, loaiLuong: opt.value }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-all
                            ${nvForm.loaiLuong === opt.value
                              ? "border-rose-400 bg-rose-50 text-rose-700 shadow-sm"
                              : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"}`}>
                          <span>{opt.icon}</span>{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">
                      {nvForm.loaiLuong === "khoan" ? "Đơn giá khoán / sản phẩm" : "Lương cơ bản"}
                    </label>
                    <input type="number" value={nvForm.luongCB} onChange={e => setNvForm(f => ({ ...f, luongCB: e.target.value }))}
                      placeholder={nvForm.loaiLuong === "khoan" ? "VD: 50000" : "VD: 5000000"}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200" />
                    {nvForm.loaiLuong === "khoan" && (
                      <p className="text-[11px] text-slate-400 mt-1">Lương sẽ tính theo số sản phẩm hoàn thành trong tháng</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">🎂 Ngày sinh</label>
                    <input type="date" value={nvForm.ngaySinh} onChange={e => setNvForm(f => ({ ...f, ngaySinh: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {editingNV && (
                    <button onClick={() => { setEditingNV(null); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", ngaySinh: "" }); }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-100 transition">Huỷ</button>
                  )}
                  <button onClick={saveNV} disabled={savingNV}
                    className="px-5 py-2 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition disabled:opacity-60">
                    {savingNV ? "Đang lưu..." : editingNV ? "Cập nhật" : "+ Thêm"}
                  </button>
                </div>
              </div>

              {/* Danh sách NV */}
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {allNVs.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Chưa có nhân viên</p>}
                {allNVs.map(nv => (
                  <div key={nv.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${nv.active ? "bg-white border border-slate-100" : "bg-slate-50 opacity-60"}`}>
                    <div>
                      <span className="font-mono text-xs text-slate-400 mr-2">{nv.maNV}</span>
                      <span className="font-medium text-slate-800 text-sm">{nv.ten}</span>
                      {nv.chucVu && <span className="text-xs text-slate-400 ml-2">{nv.chucVu}</span>}
                      {nv.luongCB && <span className="text-xs text-emerald-600 ml-2">{fmt(nv.luongCB)}₫</span>}
                      {nv.ngaySinh && <span className="text-xs text-pink-500 ml-2">🎂 {new Date(nv.ngaySinh).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" })}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingNV(nv); setNvForm({ maNV: nv.maNV, ten: nv.ten, chucVu: nv.chucVu ?? "", phongBan: nv.phongBan ?? "", loaiLuong: (nv as {loaiLuong?: string}).loaiLuong ?? "co_ban", luongCB: nv.luongCB ? String(nv.luongCB) : "", ngaySinh: nv.ngaySinh ? nv.ngaySinh.slice(0,10) : "" }); }}
                        className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-50 transition">Sửa</button>
                      <button onClick={() => toggleActiveNV(nv)}
                        className={`text-xs px-2 py-1 rounded transition ${nv.active ? "text-slate-400 hover:bg-red-50 hover:text-red-500" : "text-green-600 hover:bg-green-50"}`}>
                        {nv.active ? "Ẩn" : "Kích hoạt"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL PHIẾU LƯƠNG CÁ NHÂN ═══ */}
      {phieuLuong && (() => {
        const { nv, lcb, soNgayLamViec: ngayLV, congCoMat, congMuon, congNuaNgay, congPhep, congLe, congVang,
          congTinhLuong, tongTC, heSoTC, luongCong, luongTC, phuCapCC, phuCapAnNgay, ngayAnDuCong, phuCapDB, tongPhuCap, thucLinh,
          isKhoan, isCoBanMay, gioNV, donGiaGio, luongMay } = phieuLuong;
        const fmtVND = (n: number) => n > 0 ? n.toLocaleString("vi-VN") + " ₫" : "—";
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto print:bg-transparent print:inset-auto print:block print:overflow-visible">
            <div id="phieu-luong-modal" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm print:shadow-none print:rounded-none">
              {/* Toolbar — ẩn khi in */}
              <div className="no-print flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Phiếu lương cá nhân</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition">
                    <Printer size={12} /> In phiếu
                  </button>
                  <button onClick={() => setPhieuLuong(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
                </div>
              </div>

              {/* Nội dung phiếu */}
              <div className="p-5">
                {/* Header công ty */}
                <div className="text-center mb-4 pb-3 border-b border-slate-200">
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">Meisy Inhouse</p>
                  <p className="text-base font-bold text-slate-800 mt-0.5 uppercase tracking-wide">Phiếu Lương</p>
                  <p className="text-sm font-semibold text-violet-700 mt-0.5">Tháng {month}/{year}</p>
                </div>

                {/* Thông tin NV */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Họ tên</span>
                    <span className="font-bold text-slate-800">{nv.ten}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Mã NV</span>
                    <span className="font-mono text-slate-600">{nv.maNV}</span>
                  </div>
                  {nv.chucVu && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Chức vụ</span>
                      <span className="text-slate-700">{nv.chucVu}</span>
                    </div>
                  )}
                  {nv.phongBan && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Phòng ban</span>
                      <span className="text-slate-700">{nv.phongBan}</span>
                    </div>
                  )}
                </div>

                {/* Bảng chi tiết */}
                <table className="w-full text-sm mb-4">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="text-left px-3 py-1.5 text-xs text-slate-500 font-medium rounded-l-lg">Khoản mục</th>
                      <th className="text-right px-3 py-1.5 text-xs text-slate-500 font-medium">Số liệu</th>
                      <th className="text-right px-3 py-1.5 text-xs text-slate-500 font-medium rounded-r-lg">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* ── May khoán / tiếng ─────────────────────── */}
                    {(isKhoan || isCoBanMay) ? (
                      <>
                        <tr className="bg-amber-50/50">
                          <td className="px-3 py-2 font-medium text-amber-700">{isKhoan ? "Lương khoán" : "Lương theo giờ"}</td>
                          <td className="px-3 py-2 text-right text-xs text-slate-400">{gioNV}h × {fmt(donGiaGio ?? 0)}₫/h</td>
                          <td className="px-3 py-2 text-right font-semibold text-amber-700">{fmtVND(luongMay ?? 0)}</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="px-3 py-2 text-slate-500 text-xs" colSpan={2}>Chấm công ({congTinhLuong} ngày)</td>
                          <td className="px-3 py-2 text-right text-[11px] text-slate-400 leading-4">
                            {congCoMat > 0 && <div>Đi làm: {congCoMat}</div>}
                            {congMuon > 0 && <div>Đi muộn: {congMuon}</div>}
                            {congNuaNgay > 0 && <div>½ ngày: {congNuaNgay}</div>}
                            {congVang > 0 && <div className="text-red-500">Vắng: {congVang}</div>}
                          </td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="px-3 py-2 text-slate-600">Lương cơ bản</td>
                          <td className="px-3 py-2 text-right text-slate-500 text-xs">{fmt(lcb)} ÷ {ngayLV} ngày</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-700">{fmtVND(lcb)}</td>
                        </tr>
                        <tr className="bg-emerald-50/50">
                          <td className="px-3 py-2 text-emerald-700 font-medium">Ngày công ({congTinhLuong} ngày)</td>
                          <td className="px-3 py-2 text-right text-[11px] text-slate-400 leading-4">
                            {congCoMat > 0 && <div>Đi làm: {congCoMat}</div>}
                            {congMuon > 0 && <div>Đi muộn: {congMuon}</div>}
                            {congNuaNgay > 0 && <div>½ ngày: {congNuaNgay}</div>}
                            {congPhep > 0 && <div>Nghỉ phép: {congPhep}</div>}
                            {congLe > 0 && <div>Nghỉ lễ: {congLe}</div>}
                            {congVang > 0 && <div className="text-red-500">Vắng: {congVang}</div>}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-emerald-700">{fmtVND(luongCong)}</td>
                        </tr>
                        {tongTC > 0 && (
                          <tr>
                            <td className="px-3 py-2 text-orange-600">Tăng ca</td>
                            <td className="px-3 py-2 text-right text-xs text-slate-400">{tongTC}h × hệ số {heSoTC}</td>
                            <td className="px-3 py-2 text-right font-semibold text-orange-600">{fmtVND(luongTC)}</td>
                          </tr>
                        )}
                      </>
                    )}
                    {phuCapCC > 0 && (
                      <tr>
                        <td className="px-3 py-2 text-teal-600">PC Chuyên cần</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-400">{congVang > 0 ? <span className="text-red-400">Không đủ điều kiện</span> : "Đủ điều kiện"}</td>
                        <td className="px-3 py-2 text-right font-semibold text-teal-600">{congVang > 0 ? "—" : fmtVND(phuCapCC)}</td>
                      </tr>
                    )}
                    {phuCapAnNgay > 0 && (
                      <tr>
                        <td className="px-3 py-2 text-teal-600">PC Ăn</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-400">{fmt(phuCapAnNgay)} × {ngayAnDuCong} ngày</td>
                        <td className="px-3 py-2 text-right font-semibold text-teal-600">{fmtVND(phuCapAnNgay * ngayAnDuCong)}</td>
                      </tr>
                    )}
                    {phuCapDB > 0 && (
                      <tr>
                        <td className="px-3 py-2 text-teal-600">PC Đặc biệt</td>
                        <td className="px-3 py-2 text-right text-xs text-slate-400"></td>
                        <td className="px-3 py-2 text-right font-semibold text-teal-600">{fmtVND(phuCapDB)}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-violet-300 bg-violet-50">
                      <td colSpan={2} className="px-3 py-3 font-bold text-violet-800 text-base rounded-l-lg">THỰC LĨNH</td>
                      <td className="px-3 py-3 text-right font-bold text-violet-800 text-base rounded-r-lg">{fmtVND(thucLinh)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Ký tên */}
                <div className="grid grid-cols-2 gap-4 text-center text-[11px] text-slate-500 mt-5 pt-4 border-t border-slate-100">
                  <div>
                    <p className="font-semibold uppercase tracking-wide mb-10">Người nhận</p>
                    <p className="border-t border-slate-300 pt-1">(Ký, ghi rõ họ tên)</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase tracking-wide mb-10">Kế toán</p>
                    <p className="border-t border-slate-300 pt-1">(Ký, ghi rõ họ tên)</p>
                  </div>
                </div>
                <p className="text-center text-[10px] text-slate-300 mt-3">Ngày in: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
