"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, X, Users, Printer, CalendarDays, Trash2, RotateCcw, Lock, Unlock } from "lucide-react";

type LuongCBHistory = { thangApDung: string; luongCB: number };
type NhanVien = {
  id: string; maNV: string; ten: string;
  chucVu: string | null; phongBan: string | null;
  loaiLuong: string | null;
  luongCB: number | null; phuCapChuyenCan: number | null; phuCapAn: number | null; phuCapDacBiet: number | null; heSoTC: number;
  soChNhatHopDong: number;
  ngaySinh: string | null;
  ngayNghiViec?: string | null;
  active: boolean;
  luongCBHistory?: LuongCBHistory[];
};

// Lương CB áp dụng cho 1 tháng cụ thể — lấy bản ghi lịch sử gần nhất có
// thangApDung <= thang đang xem; nếu chưa có lịch sử thì dùng luongCB hiện tại (tương thích dữ liệu cũ).
function getLcbForMonth(nv: NhanVien, thang: string): number {
  const hist = nv.luongCBHistory ?? [];
  const applicable = hist.filter(h => h.thangApDung <= thang).sort((a, b) => b.thangApDung.localeCompare(a.thangApDung));
  if (applicable.length > 0) return applicable[0].luongCB;
  return nv.luongCB ?? 0;
}

const HO_LIST = [
  { key: "nguyen_cong_uoc", label: "Nguyễn Công Ước", color: "indigo", emoji: "🏭" },
  { key: "meisy",           label: "Meisy",            color: "rose",   emoji: "🌸" },
] as const;

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
  gioVao?: string | null; gioRa?: string | null; tongGio?: number | null;
};

// Trạng thái chấm công
const TRANG_THAI = [
  { key: "da_dang_ky", label: "Đ",   title: "Đã đăng ký",   bg: "bg-violet-100",  text: "text-violet-600",  border: "border-violet-200" },
  { key: "di_lam",     label: "✓",   title: "Đi làm",       bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300" },
  { key: "nghi_phep",  label: "NP",  title: "Nghỉ phép",     bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-300" },
  { key: "vang",       label: "V",   title: "Vắng",          bg: "bg-red-100",     text: "text-red-700",     border: "border-red-300" },
  { key: "di_muon",    label: "M",   title: "Đi muộn",       bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-300" },
  { key: "nua_ngay",   label: "½",   title: "Nửa ngày",      bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-300" },
  { key: "nghi_le",    label: "L",   title: "Nghỉ lễ",       bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-300" },
];
const TT_MAP = Object.fromEntries(TRANG_THAI.map(t => [t.key, t]));
// da_dang_ky không nằm trong CYCLE bình thường — click đặc biệt → di_lam
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

// Helper: lấy hộ kinh doanh dựa theo phòng ban
type HoKey = "nguyen_cong_uoc" | "meisy";
const getHo = (nv: { phongBan?: string | null }): HoKey =>
  nv.phongBan?.toUpperCase() === "MAY" ? "nguyen_cong_uoc" : "meisy";

export default function ChamCongPage() {
  const now = new Date();
  const [thang, setThang] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  // Tích lũy tổng Thực lĩnh khi render bảng lương — reset đầu mỗi lần build bảng, đọc lại ở dòng Tổng
  const tongThucLinhRef = useRef(0);

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
  const [ccLoading, setCcLoading] = useState(false); // spinner nhẹ khi đổi tháng
  // Khoá bảng chấm công — lưu server-side, áp dụng cho mọi người
  const [locked, setLocked] = useState<boolean>(false);
  const [lockLoading, setLockLoading] = useState(false);

  // Fetch lock status từ server khi thang thay đổi
  useEffect(() => {
    fetch(`/api/cham-cong/lock?thang=${thang}`)
      .then(r => r.json())
      .then(d => setLocked(d.locked === true))
      .catch(() => setLocked(false));
  }, [thang]);

  const toggleLock = async () => {
    const next = !locked;
    // Mở khoá → yêu cầu mật khẩu ADMIN
    if (next === false) {
      const pin = prompt("Nhập mật khẩu ADMIN để mở khoá bảng chấm công:");
      if (!pin) return;
      if (pin !== getAdminPin()) { alert("Sai mật khẩu ADMIN!"); return; }
    }
    setLockLoading(true);
    try {
      const res = await fetch("/api/cham-cong/lock", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thang, locked: next }),
      });
      if (res.ok) setLocked(next);
      else alert("Lỗi khi cập nhật trạng thái khoá!");
    } catch { alert("Lỗi kết nối!"); }
    finally { setLockLoading(false); }
  };
  // savingSet: dùng Set để track ô đang save — chỉ block double-click trên cùng 1 ô
  const savingSetRef = React.useRef(new Set<string>());

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
  const [activeTab, setActiveTab] = useState<"chamcong" | "luong" | "dang_ky">("chamcong");

  // ── Đăng ký lịch đi làm ──
  type LichRow = { id: string; nhanVienId: string; ngay: string; ca: string | null; gioVao: string | null; gioRa: string | null; ghiChu: string | null; trangThai: string; adminNote: string | null; nhanVien: { ten: string; maNV: string; phongBan: string | null } };
  const [lichList, setLichList] = useState<LichRow[]>([]);
  const [lichLoading, setLichLoading] = useState(false);
  const [lichTT, setLichTT] = useState<"cho_duyet" | "da_duyet" | "tu_choi" | "">("");
  const [lichCount, setLichCount] = useState(0);
  const [adminNoteInput, setAdminNoteInput] = useState<Record<string, string>>({});
  const [selectedLichId, setSelectedLichId] = useState<string | null>(null);
  const [selectedLichDate, setSelectedLichDate] = useState<string | null>(null);

  const fetchLich = async () => {
    setLichLoading(true);
    try {
      const tt = lichTT ? `&trangThai=${lichTT}` : "";
      const bust = `&_t=${Date.now()}`;
      const res = await fetch(`/api/lich-di-lam?thang=${thang}${tt}${bust}`);
      const d = await res.json();
      const list = Array.isArray(d) ? d : [];
      setLichList(list);
      // Count chờ duyệt
      const all = await fetch(`/api/lich-di-lam?thang=${thang}${bust}`).then(r => r.json()).catch(() => []);
      setLichCount((Array.isArray(all) ? all : []).filter((r: LichRow) => r.trangThai === "cho_duyet").length);
    } catch { setLichList([]); }
    finally { setLichLoading(false); }
  };

  useEffect(() => { if (activeTab === "dang_ky") fetchLich(); }, [activeTab, thang, lichTT]);

  const handleDuyetLich = async (id: string, trangThai: "da_duyet" | "tu_choi") => {
    const note = adminNoteInput[id] || "";
    // Optimistic update: cập nhật UI ngay lập tức
    setLichList(prev => prev.map(r => r.id === id ? { ...r, trangThai, adminNote: note || r.adminNote } : r));
    setLichCount(prev => {
      // Nếu bản ghi đang "cho_duyet" → đã được xử lý → giảm count
      const wasChoduyet = lichList.find(r => r.id === id)?.trangThai === "cho_duyet";
      return wasChoduyet ? Math.max(0, prev - 1) : prev;
    });
    try {
      const res = await fetch(`/api/lich-di-lam/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trangThai, adminNote: note }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        alert(`Lỗi: ${err.error || "Không thể cập nhật"}`);
        // Rollback: tải lại dữ liệu thực
        fetchLich();
        return;
      }
    } catch (e) {
      alert("Lỗi kết nối, thử lại.");
      fetchLich(); // Rollback
      return;
    }
    // Refresh nhẹ để sync dữ liệu thực từ server (background)
    fetchLich();
  };

  const handleXoaLich = async (id: string) => {
    if (!confirm("Xóa đăng ký này?")) return;
    await fetch(`/api/lich-di-lam/${id}`, { method: "DELETE" });
    fetchLich();
  };
  const [blAuth, setBlAuth] = useState<string>("");
  const [blInput, setBlInput] = useState("");
  const [blPass, setBlPass] = useState("");
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

  // Đổi mật khẩu ADMIN bảng lương
  const ADMIN_PIN_KEY = "luong-admin-pin";
  const getAdminPin = () => typeof window !== "undefined" ? (localStorage.getItem(ADMIN_PIN_KEY) || "1234") : "1234";
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [changePinForm, setChangePinForm] = useState({ oldPin: "", newPin: "", confirm: "" });
  const [changePinError, setChangePinError] = useState("");
  const submitChangePin = () => {
    if (changePinForm.oldPin !== getAdminPin()) { setChangePinError("Mật khẩu cũ không đúng"); return; }
    if (changePinForm.newPin.length < 4) { setChangePinError("Mật khẩu mới tối thiểu 4 ký tự"); return; }
    if (changePinForm.newPin !== changePinForm.confirm) { setChangePinError("Xác nhận không khớp"); return; }
    localStorage.setItem(ADMIN_PIN_KEY, changePinForm.newPin);
    setShowChangePinModal(false); setChangePinForm({ oldPin: "", newPin: "", confirm: "" }); setChangePinError("");
    alert("Đã đổi mật khẩu thành công!");
  };

  // Modal quản lý NV
  const [showNVModal, setShowNVModal] = useState(false);
  const [allNVs, setAllNVs] = useState<NhanVien[]>([]);
  const [nvForm, setNvForm] = useState({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", soChNhatHopDong: "0", ngaySinh: "", thangApDung: thang });
  const [editingNV, setEditingNV] = useState<NhanVien | null>(null);
  const [savingNV, setSavingNV] = useState(false);
  const [nghiViecModal, setNghiViecModal] = useState<{ nv: NhanVien; date: string } | null>(null);
  const [nvError, setNvError] = useState("");

  // Phụ cấp theo tháng: { [nvId]: { phuCapCC, phuCapAn, phuCapDB, heSoTC? } }
  type PhuCapMap = Record<string, { phuCapCC: number; phuCapAn: number; phuCapDB: number; heSoTC?: number | null }>;
  const [phuCapMap, setPhuCapMap] = useState<PhuCapMap>({});

  const fetchPhuCap = useCallback(async () => {
    // Giữ lại cho POST (lưu phụ cấp) — GET đã gộp vào fetchData
  }, []);

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

  // Fetch NhanVien riêng — dùng sau khi sửa NV (thêm/xóa)
  const fetchNV = useCallback(async (withHistory = false) => {
    try {
      const url = withHistory ? "/api/cham-cong/nhan-vien?h=1" : "/api/cham-cong/nhan-vien";
      const res  = await fetch(url);
      const data = await res.json();
      if (!res.ok) { console.error("fetchNV error:", data); return; }
      const list = Array.isArray(data) ? data as NhanVien[] : [];
      setNhanViens(list.filter(nv => nv.active)); // bảng chấm công chỉ hiện NV active
      setAllNVs(list); // modal NV hiện tất cả (kể cả đã nghỉ)
    } catch (e) { console.error("fetchNV error:", e); }
  }, []);

  // Fetch CC riêng — dùng sau khi click ô chấm công
  const fetchCC = useCallback(async () => {
    try {
      const data = await fetch(`/api/cham-cong?thang=${thang}`).then(r => r.json());
      setChamCongs(Array.isArray(data.chamCongs) ? data.chamCongs as ChamCong[] : []);
    } catch (e) { console.error("fetchCC error:", e); }
  }, [thang]);

  // ★ Fetch tất cả 1 lần — NV + CC + PhuCap gộp 1 request
  const nvLoadedRef = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const fetchData = useCallback(async (withHistory = false) => {
    // Hủy request trước nếu đang bay
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const nvAlreadyLoaded = nvLoadedRef.current && !withHistory;
    if (!nvAlreadyLoaded) setLoading(true);
    else setCcLoading(true);

    try {
      const h   = withHistory ? "&h=1" : "";
      const nv  = nvAlreadyLoaded ? "&nv=0" : ""; // bỏ qua query NV khi đổi tháng
      const res = await fetch(`/api/cham-cong/load?thang=${thang}${h}${nv}`, { signal: ctrl.signal });
      const data = await res.json();
      if (data.error) { console.error("fetchData error:", data.error); }

      if (!nvAlreadyLoaded) {
        const list = Array.isArray(data.nhanViens) ? data.nhanViens as NhanVien[] : [];
        setNhanViens(list);
        setAllNVs(list);
        nvLoadedRef.current = true;
      }
      setChamCongs(Array.isArray(data.chamCongs) ? data.chamCongs as ChamCong[] : []);
      setPhuCapMap(data.phuCaps && typeof data.phuCaps === "object" ? data.phuCaps : {});
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return; // request bị hủy bình thường
      console.error("fetchData error:", e);
    } finally {
      if (!ctrl.signal.aborted) { setLoading(false); setCcLoading(false); }
    }
  }, [thang]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Khi bảng lương tab được mở → load lại với history để tính lương đúng
  const historyLoadedRef = React.useRef(false);
  useEffect(() => {
    if (activeTab === "luong" && !historyLoadedRef.current) {
      historyLoadedRef.current = true;
      fetchData(true); // withHistory=true
    }
  }, [activeTab, fetchData]);

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

  // Map "chưa ra": nvId_ngay → true nếu có gioVao nhưng không có gioRa (hôm nay, đã qua 13h)
  const chuaRaMap = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nowH = new Date().getHours() + new Date().getMinutes() / 60;
    if (nowH < 13) return {}; // trước 13h chưa cần cảnh báo
    const m: Record<string, boolean> = {};
    chamCongs.forEach(c => {
      const dateKey = c.ngay.slice(0, 10);
      if (dateKey === todayStr && c.gioVao && !c.gioRa) {
        m[`${c.nhanVienId}_${dateKey}`] = true;
      }
    });
    return m;
  }, [chamCongs]);

  // Map ghiChu: "nvId_ngayISO" → ghi chú (giờ muộn, lý do...)
  const ghiChuMap = useMemo(() => {
    const m: Record<string, string> = {};
    chamCongs.forEach(c => { if (c.ghiChu) m[`${c.nhanVienId}_${c.ngay.slice(0, 10)}`] = c.ghiChu; });
    return m;
  }, [chamCongs]);

  // Map về sớm: "nvId_ngayISO" → true nếu ghiChu chứa "Về sớm"
  const veSomMap = useMemo(() => {
    const m: Record<string, true> = {};
    chamCongs.forEach(c => {
      if (c.ghiChu?.includes("Về sớm")) m[`${c.nhanVienId}_${c.ngay.slice(0, 10)}`] = true;
    });
    return m;
  }, [chamCongs]);

  // Map giờ vào/ra: "nvId_ngayISO" → { gioVao, gioRa, tongGio }
  const gioMap = useMemo(() => {
    const m: Record<string, { gioVao?: string | null; gioRa?: string | null; tongGio?: number | null }> = {};
    chamCongs.forEach(c => {
      if (c.gioVao || c.gioRa) {
        m[`${c.nhanVienId}_${c.ngay.slice(0, 10)}`] = { gioVao: c.gioVao, gioRa: c.gioRa, tongGio: c.tongGio };
      }
    });
    return m;
  }, [chamCongs]);

  // Hover card — hiện chi tiết khi rê chuột vào ô
  const [hoverCard, setHoverCard] = useState<{
    x: number; y: number;
    ten: string; ngay: string; trangThai: string;
    gioVao?: string | null; gioRa?: string | null; tongGio?: number | null; ghiChu?: string | null;
  } | null>(null);
  const [winW, setWinW] = useState(1200);
  useEffect(() => { setWinW(window.innerWidth); }, []);

  // Popover ghi chú ô chấm công
  const [notePopover, setNotePopover] = useState<{
    key: string; nvId: string; day: number; ngay: string;
    pos: { top: number; left: number };
  } | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  // Đóng popover khi click ra ngoài
  useEffect(() => {
    if (!notePopover) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById("cc-note-popover");
      if (el && !el.contains(e.target as Node)) setNotePopover(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notePopover]);

  const saveNote = async (nvId: string, ngay: string, ghiChu: string, trangThai: string) => {
    // Optimistic
    setChamCongs(prev => prev.map(c =>
      c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, ghiChu: ghiChu || null } : c
    ));
    setNotePopover(null);
    await fetch("/api/cham-cong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhanVienId: nvId, ngay, trangThai, ghiChu: ghiChu || null }),
    });
  };

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
    if (locked) return; // bảng đang khoá
    // Xác nhận khi bấm vào ngày CN (chưa có dữ liệu)
    const key = getKey(nvId, day);
    const cur = ccMap[key] ?? "";
    if (isSunday(day) && !cur) {
      if (!confirm(`Ngày ${day}/${month} là Chủ Nhật.\nBạn có chắc muốn chấm công ngày này không?`)) return;
    }
    // Click vào "Đã đăng ký" → xác nhận Đi làm (không chạy CYCLE bình thường)
    const next = cur === "da_dang_ky"
      ? "di_lam"
      : CYCLE[(CYCLE.indexOf(cur) + 1) % CYCLE.length];
    const ngay = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // Optimistic update
    setChamCongs(prev => {
      const existing = prev.find(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay);
      if (!next) return prev.filter(c => !(c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay));
      if (existing) return prev.map(c => c.nhanVienId === nvId && c.ngay.slice(0, 10) === ngay ? { ...c, trangThai: next } : c);
      return [...prev, { id: "tmp", nhanVienId: nvId, ngay: ngay + "T00:00:00.000Z", trangThai: next, tangCa: null, ghiChu: null }];
    });

    savingSetRef.current.add(key);
    const payload = JSON.stringify({ nhanVienId: nvId, ngay, trangThai: next || null });
    try {
      let res = await fetch("/api/cham-cong", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      // Retry 1 lần nếu lỗi thoáng qua (Vercel cold start)
      if (!res.ok) {
        await new Promise(r => setTimeout(r, 800));
        res = await fetch("/api/cham-cong", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      }
      if (!res.ok) {
        await fetchCC();
        alert("Lưu chấm công thất bại, đã tải lại dữ liệu mới nhất.");
      }
    } catch {
      // Retry 1 lần
      try {
        await new Promise(r => setTimeout(r, 800));
        await fetch("/api/cham-cong", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload });
      } catch {
        await fetchCC();
        alert("Mất kết nối, đã tải lại dữ liệu.");
      }
    } finally {
      savingSetRef.current.delete(key);
    }
  };

  // Tăng ca: lưu số giờ
  const handleTCChange = async (nvId: string, day: number, val: string) => {
    if (locked) return; // bảng đang khoá
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
    }).catch(() => fetchCC());
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
        body: JSON.stringify({ nhanVienId: nvId, ngay, trangThai: null }),
      });
    })).catch(() => fetchCC());
  };

  // Summary per employee
  const getSummary = (nvId: string) => {
    const counts: Record<string, number> = {};
    days.forEach(d => {
      const tt = ccMap[getKey(nvId, d)] ?? "";
      if (isHoliday(d) && !isSunday(d)) {
        // Ngày lễ luôn được trả lương (mặc định +1 công), dù không chấm công.
        // Nếu thực tế đi làm ngày lễ (tick đi làm/đi muộn) → +1 công nữa (tổng 2 công),
        // và vẫn tính là 1 ngày đi làm thật (để cộng phụ cấp ăn/ngày đúng).
        counts["nghi_le"] = (counts["nghi_le"] ?? 0) + 1;
        if (tt === "di_lam" || tt === "di_muon") {
          counts["nghi_le"] += 1;
          counts["le_di_lam"] = (counts["le_di_lam"] ?? 0) + 1;
        } else if (tt === "nua_ngay") {
          counts["nghi_le"] += 0.5;
        }
        return;
      }
      // Chủ nhật mặc định không tính công, nhưng nếu đã chấm công
      // (đi làm/½ ngày...) cho ngày đó thì vẫn tính bình thường.
      if (!tt && isSunday(d)) return;
      if (tt) counts[tt] = (counts[tt] ?? 0) + (tt === "nua_ngay" ? 0.5 : 1);
    });
    return counts;
  };

  // Working days in month — chỉ trừ Chủ nhật, KHÔNG trừ ngày lễ (ngày lễ vẫn được trả lương)
  const soNgayLamViec = days.filter(d => !isSunday(d)).length;

  // Auto-generate maNV: NV001, NV002...
  const genMaNV = (list: NhanVien[]) => {
    const nums = list.map(n => parseInt(n.maNV.replace(/\D/g, ""))).filter(n => !isNaN(n));
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
    return `NV${String(next).padStart(3, "0")}`;
  };

  // Open NV modal — hiển thị ngay với data đã có, fetch refresh ngầm
  const openNVModal = () => {
    // Dùng nhanViensAll đã load sẵn để mở modal tức thì
    const current = nhanViensAll.length > 0 ? nhanViensAll : allNVs;
    setAllNVs(current);
    setNvForm(f => ({ ...f, maNV: genMaNV(current) }));
    setNvError("");
    setShowNVModal(true);
    // Fetch fresh data ngầm
    fetch("/api/cham-cong/nhan-vien").then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : [];
      setAllNVs(list);
      setNvForm(f => ({ ...f, maNV: genMaNV(list) }));
    }).catch(() => {});
  };

  const saveNV = async () => {
    setNvError("");
    if (!nvForm.ten.trim()) { setNvError("Vui lòng nhập họ tên nhân viên"); return; }
    if (!nvForm.maNV.trim()) { setNvError("Vui lòng nhập mã nhân viên"); return; }
    setSavingNV(true);
    try {
      if (editingNV) {
        const lcbDaThayDoi = Number(nvForm.luongCB || 0) !== getLcbForMonth(editingNV, thang);
        const res = await fetch(`/api/cham-cong/nhan-vien/${editingNV.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ten: nvForm.ten, chucVu: nvForm.chucVu, phongBan: nvForm.phongBan, loaiLuong: nvForm.loaiLuong,
            luongCB: nvForm.luongCB, soChNhatHopDong: Number(nvForm.soChNhatHopDong),
            ngaySinh: nvForm.ngaySinh || null,
            thangApDung: lcbDaThayDoi ? nvForm.thangApDung : undefined,
          }),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi cập nhật"); return; }
      } else {
        const res = await fetch("/api/cham-cong/nhan-vien", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nvForm),
        });
        if (!res.ok) { const e = await res.json(); setNvError(e.error ?? "Lỗi thêm nhân viên"); return; }
      }
      await fetchNV(); // refresh NV sau khi sửa (cập nhật cả nhanViensAll + allNVs)
      // Dùng nhanViensAll (sau khi fetchNV) để gen maNV tiếp theo
      setNvForm(f => ({ ...f, maNV: genMaNV(nhanViensAll), ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", soChNhatHopDong: "0", ngaySinh: "", thangApDung: thang }));
      setEditingNV(null);
    } finally {
      setSavingNV(false);
    }
  };

  const toggleActiveNV = (nv: NhanVien) => {
    if (nv.active) {
      // Hiện dialog hỏi ngày nghỉ việc
      const today = new Date().toISOString().slice(0, 10);
      setNghiViecModal({ nv, date: today });
    } else {
      // Kích hoạt lại → không cần hỏi
      fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true, ngayNghiViec: null }),
      }).then(() => fetchNV());
    }
  };

  const [savingNghiViec, setSavingNghiViec] = useState(false);
  const confirmNghiViec = async () => {
    if (!nghiViecModal) return;
    setSavingNghiViec(true);
    try {
      const res = await fetch(`/api/cham-cong/nhan-vien/${nghiViecModal.nv.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false, ngayNghiViec: nghiViecModal.date }),
      });
      const data = await res.json();
      if (!res.ok) { alert("Lỗi: " + (data?.error || res.status)); return; }
      setNghiViecModal(null);
      await fetchNV();
    } catch (e) {
      alert("Lỗi kết nối: " + String(e));
    } finally {
      setSavingNghiViec(false);
    }
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
      {/* Print styles — chuyển đổi giữa in phiếu cá nhân, bảng lương, bảng chấm công */}
      <style>{phieuLuong ? `
        @media print {
          body * { visibility: hidden !important; }
          #phieu-luong-overlay, #phieu-luong-overlay * { visibility: visible !important; }
          #phieu-luong-overlay { position: static !important; height: auto !important; padding: 0 !important; display: block !important; }
          #phieu-luong-modal { position: absolute !important; top: 0; left: 0; width: 100% !important; max-width: 100% !important; background: white; }
          .no-print { display: none !important; }
          @page { size: A5; margin: 12mm; }
        }
      ` : activeTab === "luong" ? `
        @media print {
          body * { visibility: hidden !important; }
          #bang-luong-in, #bang-luong-in * { visibility: visible !important; }
          #bang-luong-in { position: absolute; top: 0; left: 0; width: 100%; }
          @page { size: A4 landscape; margin: 10mm 8mm; }
        }
      ` : `
        @media print {
          body * { visibility: hidden !important; }
          #bang-chamcong-in, #bang-chamcong-in * { visibility: visible !important; }
          #bang-chamcong-in { position: absolute; top: 0; left: 0; width: 100%; }
          @page { size: A3 landscape; margin: 8mm; }
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
          {/* Nút khoá/mở khoá bảng — server-side, áp dụng cho tất cả */}
          <button
            onClick={toggleLock}
            disabled={lockLoading}
            title={locked ? "Đang khoá (tất cả máy) — nhấn để mở khoá (cần mật khẩu ADMIN)" : "Đang mở — nhấn để khoá bảng cho tất cả nhân viên"}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition disabled:opacity-60
              ${locked
                ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
          >
            {lockLoading
              ? <span className="inline-block w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              : locked ? <Lock size={14} /> : <Unlock size={14} />
            }
            {locked ? "Đã khoá" : "Khoá"}
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
        <button onClick={() => setActiveTab("dang_ky")}
          className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "dang_ky" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          📅 Đăng ký lịch
          {lichCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {lichCount > 9 ? "9+" : lichCount}
            </span>
          )}
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-sm">
          <button onClick={prevMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronLeft size={16} /></button>
          <span className="text-base font-bold text-slate-800 min-w-[140px] text-center flex items-center justify-center gap-1.5">
            Tháng {month}/{year}
            {ccLoading && <span className="inline-block w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />}
          </span>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-slate-100 transition"><ChevronRight size={16} /></button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 flex-wrap">
          {TRANG_THAI.filter(tt => !["nghi_phep", "vang", "di_muon"].includes(tt.key)).map(tt => (
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
        <div id="bang-chamcong-in" className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="hidden print:block px-4 pt-3 pb-1 text-center">
            <p className="text-[11px] text-slate-500">Hộ kinh doanh: <strong>{currentHo.label}</strong></p>
            <h2 className="text-base font-bold uppercase">Bảng Chấm Công</h2>
            <p className="text-[12px] text-slate-600">Tháng {month}/{year}</p>
          </div>
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
                          {!locked && (
                            <button
                              title="Xoá toàn bộ chấm công tháng này"
                              onClick={() => resetEmployee(nv.id, nv.ten)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all shrink-0"
                            >
                              <RotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      {/* Cells chấm công */}
                      {days.map(d => {
                        const key = getKey(nv.id, d);
                        const tt = ccMap[key] ?? "";
                        const info = TT_MAP[tt];
                        const sun = isSunday(d);
                        const holiday = isHoliday(d);
                        const defaultBg = sun ? "bg-slate-100/80" : holiday ? "bg-purple-50/60" : "";
                        const chuaRa = chuaRaMap[key]; // có vào nhưng chưa ra
                        const gio = gioMap[key];
                        const ngayStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                        return (
                          <td key={d}
                            className={`p-0 text-center select-none border-x border-slate-100 transition-colors ${defaultBg} ${locked ? "cursor-default" : "cursor-pointer hover:bg-slate-200/40 active:bg-slate-300/50"}`}
                            onClick={() => handleCellClick(nv.id, d)}
                            onMouseEnter={e => {
                              if (!info && !chuaRa) return; // ô trống / CN / lễ không cần card
                              const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                              setHoverCard({
                                x: r.left + r.width / 2,
                                y: r.top,
                                ten: nv.ten,
                                ngay: `${DAY_OF_WEEK[new Date(ngayStr).getDay()]} ${d}/${month}`,
                                trangThai: chuaRa ? "Chưa chấm ra" : info?.title ?? "",
                                gioVao: chuaRa ? gio?.gioVao : gio?.gioVao,
                                gioRa: gio?.gioRa,
                                tongGio: gio?.tongGio,
                                ghiChu: ghiChuMap[key] || null,
                              });
                            }}
                            onMouseLeave={() => setHoverCard(null)}
                          >
                            {info ? (
                              <div className={`relative flex items-center justify-center w-full h-8 text-[11px] font-bold rounded-sm ${info.bg} ${info.text} group/cell`}>
                                {info.label}
                                {chuaRa && (
                                  <span className="absolute top-0 right-0 w-2 h-2 bg-orange-400 rounded-full border border-white" title="Chưa chấm ra" />
                                )}
                                {/* Badge "S" nếu về sớm */}
                                {veSomMap[key] && !chuaRa && (
                                  <span
                                    className="absolute bottom-0 left-0 px-[3px] text-[7px] font-bold bg-rose-500 text-white rounded-tr leading-[11px]"
                                    title={ghiChuMap[key] ?? "Về sớm"}
                                  >S</span>
                                )}
                                {/* Chấm xanh nếu có ghi chú nhưng không phải về sớm */}
                                {ghiChuMap[key] && !chuaRa && !veSomMap[key] && (
                                  <span className="absolute top-0 left-0 w-1.5 h-1.5 bg-sky-400 rounded-full" title={ghiChuMap[key]} />
                                )}
                                {/* Icon ghi chú — chỉ hiện khi hover, không khoá */}
                                {!locked && (
                                  <button
                                    className="absolute bottom-0 right-0 w-4 h-4 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity bg-white/70 rounded-tl text-[9px] text-slate-500 hover:text-slate-700 hover:bg-white"
                                    title={ghiChuMap[key] ? `Ghi chú: ${ghiChuMap[key]}` : "Thêm ghi chú (giờ muộn...)"}
                                    onClick={e => {
                                      e.stopPropagation();
                                      const r = e.currentTarget.getBoundingClientRect();
                                      const ngay = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                                      setNotePopover({ key, nvId: nv.id, day: d, ngay, pos: { top: r.bottom + 4, left: r.left } });
                                      setNoteDraft(ghiChuMap[key] || "");
                                    }}
                                  >
                                    ✏
                                  </button>
                                )}
                              </div>
                            ) : sun ? (
                              <div className="flex items-center justify-center w-full h-8 text-[10px] text-slate-300">CN</div>
                            ) : holiday ? (
                              <div className="flex items-center justify-center w-full h-8 text-[10px] text-purple-300">L</div>
                            ) : (
                              <div className="flex items-center justify-center w-full h-8 text-[10px] text-slate-200 hover:text-slate-400" />
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
                          <td key={d} className={`p-0 border-x border-slate-100 ${sun ? "bg-slate-100/60" : "bg-orange-50/40"}`}>
                            <input
                              type="number"
                              min="0"
                              max="24"
                              step="0.5"
                              value={tc ?? ""}
                              disabled={locked}
                              onChange={e => {
                                if (locked) return;
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
                              className={`w-full h-8 text-center text-xs font-bold border-0 border-t focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
                                ${locked
                                  ? "bg-slate-100/60 text-slate-400 cursor-not-allowed"
                                  : sun
                                    ? "bg-transparent text-slate-500 border-slate-200 focus:ring-1 focus:ring-orange-400 focus:bg-orange-50"
                                    : "bg-transparent text-orange-700 border-orange-200 focus:ring-1 focus:ring-orange-400 focus:bg-orange-50"
                                }`}
                              title={locked ? "🔒 Bảng đang khoá" : "Số giờ tăng ca"}
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
          <div className="hidden print:grid print:grid-cols-2 gap-8 text-center text-[12px] px-8 py-10">
            <div>
              <p className="font-semibold text-slate-700 mb-12">Người chấm công</p>
              <div className="border-t border-slate-400 pt-2 text-slate-400">(Ký, ghi rõ họ tên)</div>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-12">Người đại diện ký trả lương</p>
              <div className="border-t border-slate-400 pt-2 text-slate-400">(Ký, ghi rõ họ tên)</div>
            </div>
          </div>
        </div>
      ))}

      {/* ─── TAB BẢNG LƯƠNG ─── */}
      {activeTab === "luong" && !blAuth && (
        <div className="max-w-sm mx-auto mt-8 space-y-4">
          {/* Xem lương cá nhân */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center text-xl">💰</div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Xem lương cá nhân</h2>
                <p className="text-xs text-slate-400">Nhập mã nhân viên của bạn</p>
              </div>
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
                placeholder="Mã nhân viên (VD: NV01)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 font-mono" />
              {blError && !blPass && <p className="text-xs text-red-500">{blError}</p>}
              <button type="submit" className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700">
                Xem lương
              </button>
            </form>
          </div>

          {/* Đăng nhập ADMIN */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🔐</div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Quản trị viên</h2>
                <p className="text-xs text-slate-400">Nhập mật khẩu để xem toàn bộ bảng lương</p>
              </div>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              if (!blPass) return;
              if (blPass !== getAdminPin()) { setBlError("admin-wrong"); setBlPass(""); return; }
              setBlAuth("ADMIN");
              setBlError("");
            }} className="space-y-3">
              <input type="password" value={blPass}
                onChange={e => { setBlPass(e.target.value); setBlError(""); }}
                placeholder="Mật khẩu ADMIN"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300" />
              {blError === "admin-wrong" && <p className="text-xs text-red-500">Sai mật khẩu ADMIN</p>}
              <button type="submit" className="w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600">
                Đăng nhập ADMIN
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "luong" && blAuth && (
        <div id="bang-luong-in" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Bảng Lương — Tháng {month}/{year}</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {blAuth === "ADMIN" ? "Xem toàn bộ" : `Đang xem: ${blAuth}`}
                <button onClick={() => { setBlAuth(""); setBlInput(""); setBlPass(""); }} className="ml-2 text-violet-500 hover:underline">Đăng xuất</button>
              </p>
            </div>
            {blAuth === "ADMIN" && (
              <div className="flex gap-2 print:hidden">
                <button onClick={() => { setShowChangePinModal(true); setChangePinForm({ oldPin: "", newPin: "", confirm: "" }); setChangePinError(""); }}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-500 text-sm rounded-xl hover:bg-slate-50 transition">
                  🔑 Đổi mật khẩu
                </button>
                <button onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition">
                  <Printer size={14} /> In bảng lương
                </button>
              </div>
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
                  tongThucLinhRef.current = 0;
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
                    const cong = (sum["di_lam"] ?? 0) + (sum["di_muon"] ?? 0) + (sum["nua_ngay"] ?? 0) + (sum["nghi_phep"] ?? 0) + (sum["nghi_le"] ?? 0);
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
                          return s + gioCoBan * (phuCapMap[n.id]?.heSoTC ?? n.heSoTC ?? 1.5);
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
                  const lcb = getLcbForMonth(nv, thang);

                  // Ngày công tính lương: có mặt + muộn + ½×0.5 + phép + lễ (vắng = không tính)
                  const congCoMat  = summary["di_lam"]    ?? 0;
                  const congMuon   = summary["di_muon"]   ?? 0;
                  const congNuaNgay= summary["nua_ngay"]  ?? 0;
                  const congPhep   = summary["nghi_phep"] ?? 0;
                  const congLe     = summary["nghi_le"]   ?? 0;
                  const congVang   = summary["vang"]      ?? 0;
                  const congTinhLuong = congCoMat + congMuon + congNuaNgay + congPhep + congLe;

                  const heSoTC        = phuCapMap[nv.id]?.heSoTC ?? nv.heSoTC ?? 1.5;
                  // Phụ cấp theo tháng (ưu tiên) → fallback về NV default
                  const pcThang       = phuCapMap[nv.id];
                  const phuCapCC      = pcThang?.phuCapCC   ?? 0;
                  const phuCapAnNgay  = pcThang?.phuCapAn   ?? 0;
                  const phuCapDB      = pcThang?.phuCapDB   ?? 0;
                  // Ngày đủ công cho PC ăn = di_lam + di_muon + ngày lễ có đi làm thật
                  const congLeDiLam   = summary["le_di_lam"] ?? 0;
                  const ngayAnDuCong  = congCoMat + congMuon + congLeDiLam;
                  const tongPhuCap    = phuCapCC + phuCapAnNgay * ngayAnDuCong + phuCapDB;
                  // congChuan = T2-T7 trong tháng + số CN theo HĐ
                  const congChuan     = soNgayLamViec + (nv.soChNhatHopDong ?? 0);
                  const luongNgay     = congChuan > 0 ? lcb / congChuan : 0;
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

                  // Thời vụ: không chấm công hàng ngày (chưa có lcb, không có công) nhưng có giờ TC
                  // → lương = số giờ TC × Hệ số TC (dùng Hệ số TC như đơn giá/giờ)
                  // Không tính nghỉ lễ (tự động +1) vào điều kiện "không chấm công" của thời vụ
                  const isThoiVu      = !isKhoan && !isCoBanMay && lcb === 0
                    && (congCoMat + congMuon + congNuaNgay + congPhep) === 0 && tongTC > 0;
                  const luongThoiVu   = isThoiVu ? heSoTC * tongTC : 0;
                  const thucLinhThoiVu = isThoiVu ? luongThoiVu + tongPhuCap : thucLinh;

                  // Cộng dồn vào tổng Thực lĩnh toàn bảng — đúng theo giá trị hiển thị từng dòng
                  const thucLinhFinal = isKhoan ? thucLinhKhoan : isCoBanMay ? thucLinhCoBanMay : isThoiVu ? thucLinhThoiVu : (lcb > 0 ? thucLinh : 0);
                  tongThucLinhRef.current += thucLinhFinal;

                  return (
                    <tr key={nv.id} className={`border-b border-slate-50 ${idx % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                      <td className="px-3 py-2 text-center text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <p className="font-semibold text-slate-800">{nv.ten}</p>
                        {nv.chucVu && <p className="text-xs text-slate-400">{nv.chucVu}</p>}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">
                        {(isKhoan || isCoBanMay)
                          ? (
                            <button
                              title="Nhấn để đổi Khoán ↔ Tiếng"
                              onClick={async () => {
                                const next = nv.loaiLuong === "khoan" ? "co_ban" : "khoan";
                                // Cập nhật state ngay (optimistic) — UI đổi tức thì
                                setNhanViens(prev => prev.map(n =>
                                  n.id === nv.id ? { ...n, loaiLuong: next } : n
                                ));
                                const res = await fetch(`/api/cham-cong/nhan-vien/${nv.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ loaiLuong: next }),
                                });
                                if (!res.ok) {
                                  // Rollback nếu lưu thất bại
                                  setNhanViens(prev => prev.map(n =>
                                    n.id === nv.id ? { ...n, loaiLuong: nv.loaiLuong } : n
                                  ));
                                }
                              }}
                              className={`text-xs px-1.5 py-0.5 rounded font-semibold cursor-pointer hover:opacity-70 transition-opacity
                                ${isKhoan ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {isKhoan ? "Khoán" : "Tiếng"}
                            </button>
                          )
                          : lcb > 0 ? fmt(lcb) + "₫" : isThoiVu ? <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-teal-100 text-teal-700">Thời vụ</span> : <span className="text-slate-300 text-xs">Chưa có</span>}
                      </td>
                      <td className="px-3 py-2 text-center font-semibold text-emerald-700">{congTinhLuong || "—"}</td>
                      <td className="px-3 py-2 text-center text-blue-600">{congPhep || ""}</td>
                      <td className="px-3 py-2 text-center text-red-500 font-semibold">{congVang || ""}</td>
                      <td className="px-3 py-2 text-center text-amber-600">{congMuon || ""}</td>
                      <td className="px-3 py-2 text-center text-cyan-600">{congNuaNgay || ""}</td>
                      <td className="px-3 py-2 text-center text-orange-600 font-semibold">{tongTC > 0 ? tongTC : ""}</td>
                      {/* Hệ số TC — inline edit (per-month) */}
                      <td className="px-2 py-1.5 text-center">
                        {locked
                          ? <span className="text-xs font-semibold text-orange-600">{fmt(heSoTC)}</span>
                          : <input
                              type="number" step="1000" min="0"
                              key={`${nv.id}-${thang}-${heSoTC}`}
                              defaultValue={heSoTC}
                              onBlur={async e => {
                                const val = parseFloat(e.target.value) || 0;
                                const cur = phuCapMap[nv.id] ?? { phuCapCC: 0, phuCapAn: 0, phuCapDB: 0 };
                                const updated = { ...cur, heSoTC: val };
                                setPhuCapMap(prev => ({ ...prev, [nv.id]: updated }));
                                await fetch("/api/cham-cong/phu-cap", {
                                  method: "POST", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ nhanVienId: nv.id, thang, ...updated }),
                                });
                              }}
                              onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                              className="w-20 text-center text-xs font-semibold text-orange-600 border border-orange-200 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400 bg-orange-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                        }
                      </td>
                      <td className="px-3 py-2 text-right text-slate-700">
                        {isKhoan
                          ? (donGiaGioKhoan > 0 && gioNV > 0
                            ? <span className="text-amber-600 font-semibold">{fmt(Math.round(luongKhoan))}₫<br/><span className="text-[10px] font-normal text-slate-400">{fmt(gioNV)}h × {fmt(Math.round(donGiaGioKhoan))}₫/h</span></span>
                            : <span className="text-slate-300 text-xs">—</span>)
                          : isCoBanMay
                            ? (gioNV > 0
                              ? <span className="text-blue-600 font-semibold">{fmt(Math.round(luongCoBanMay))}₫<br/><span className="text-[10px] font-normal text-slate-400">{fmt(gioNV)}h × {fmt(heSoTC)}₫/h</span></span>
                              : <span className="text-slate-300 text-xs">—</span>)
                            : isThoiVu
                              ? <span className="text-teal-600 font-semibold">{fmt(Math.round(luongThoiVu))}₫<br/><span className="text-[10px] font-normal text-slate-400">{fmt(tongTC)}h × {fmt(heSoTC)}₫/h</span></span>
                              : (lcb > 0 && congTinhLuong > 0 ? fmt(Math.round(luongCong)) + "₫" : <span className="text-slate-300">—</span>)
                        }
                      </td>
                      <td className="px-3 py-2 text-right text-orange-600">
                        {(isKhoan || isCoBanMay || isThoiVu) ? "" : (lcb > 0 && tongTC > 0 ? fmt(Math.round(luongTC)) + "₫" : "")}
                      </td>
                      {/* Phụ cấp — theo tháng (CC, Ăn, ĐB) */}
                      <td className="px-2 py-1">
                        <div className="flex flex-col gap-0.5">
                          {([
                            { key: "CC",  field: "phuCapCC",  val: phuCapCC,     step: 50000,  label: "CC" },
                            { key: "An",  field: "phuCapAn",  val: phuCapAnNgay, step: 10000,  label: "Ăn" },
                            { key: "DB",  field: "phuCapDB",  val: phuCapDB,     step: 50000,  label: "ĐB" },
                          ] as const).map(({ key, field, val, step, label }) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 w-7 shrink-0">{label}</span>
                              {locked
                                ? <span className="text-xs font-semibold text-teal-700 w-20 text-right pr-1">{val ? fmt(val) : "—"}</span>
                                : <input
                                    key={`${thang}_${nv.id}_${field}_${val}`}
                                    type="number" step={step} min="0"
                                    defaultValue={val || ""}
                                    placeholder="0"
                                    onBlur={async e => {
                                      const newVal = parseFloat(e.target.value) || 0;
                                      const cur = phuCapMap[nv.id] ?? { phuCapCC, phuCapAn: phuCapAnNgay, phuCapDB };
                                      const updated = { ...cur, [field]: newVal };
                                      setPhuCapMap(prev => ({ ...prev, [nv.id]: updated }));
                                      await fetch("/api/cham-cong/phu-cap", {
                                        method: "POST", headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ nhanVienId: nv.id, thang, ...updated }),
                                      }).catch(() => fetchPhuCap());
                                    }}
                                    onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                                    className="w-20 text-right text-xs font-semibold text-teal-700 border border-teal-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-teal-50/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  />
                              }
                              {label === "Ăn" && phuCapAnNgay > 0 && <span className="text-[10px] text-slate-400">×{ngayAnDuCong}ng</span>}
                            </div>
                          ))}
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
                            : isThoiVu
                              ? (thucLinhThoiVu > 0 ? fmt(Math.round(thucLinhThoiVu)) + "₫" : <span className="text-slate-300 font-normal">—</span>)
                              : (lcb > 0 && thucLinh > 0 ? fmt(Math.round(thucLinh)) + "₫" : <span className="text-slate-300 font-normal">—</span>)
                        }
                      </td>
                      <td className="px-1 py-2 text-center">
                        <button
                          title="In phiếu lương"
                          onClick={() => setPhieuLuong({
                            nv, lcb, soNgayLamViec: congChuan, congCoMat, congMuon, congNuaNgay, congPhep, congLe, congVang, congTinhLuong, tongTC, heSoTC,
                            luongCong: isKhoan ? Math.round(luongKhoan) : isCoBanMay ? Math.round(luongCoBanMay) : Math.round(luongCong),
                            luongTC: (isKhoan || isCoBanMay) ? 0 : Math.round(luongTC),
                            phuCapCC, phuCapAnNgay, ngayAnDuCong, phuCapDB, tongPhuCap: Math.round(tongPhuCap),
                            thucLinh: isKhoan ? Math.round(thucLinhKhoan) : isCoBanMay ? Math.round(thucLinhCoBanMay) : Math.round(thucLinh),
                            isKhoan, isCoBanMay,
                            gioNV: (isKhoan || isCoBanMay) ? gioNV : undefined,
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
                        return s + (sum["di_lam"]??0) + (sum["di_muon"]??0) + (sum["nua_ngay"]??0) + (sum["nghi_phep"]??0) + (sum["nghi_le"]??0);
                      }, 0) || "—"}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-center text-orange-600">
                      {nhanViens.reduce((s, nv) => s + days.reduce((ds, d) => ds + (tcMap[getKey(nv.id, d)] ?? 0), 0), 0) || ""}
                    </td>
                    <td colSpan={4}></td>
                    <td className="px-3 py-2 text-right text-indigo-700 bg-indigo-50/50 border-l border-indigo-100">
                      {fmt(Math.round(tongThucLinhRef.current))}₫
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

      {/* ═══ TAB ĐĂNG KÝ LỊCH ĐI LÀM ═══ */}
      {activeTab === "dang_ky" && (() => {
        const DOW = ["CN","T2","T3","T4","T5","T6","T7"];
        const caLabel = (r: LichRow) => {
          if (r.ca === "ca1") return "Ca 1";
          if (r.ca === "ca2") return "Ca 2";
          if (r.ca === "ca3") return "Ca 3";
          if (r.gioVao && r.gioRa) return `${r.gioVao}–${r.gioRa}`;
          return "Khác";
        };

        // Build calendar days for current month
        const [y, m] = thang.split("-").map(Number);
        const firstDay = new Date(y, m - 1, 1).getDay(); // 0=CN
        const daysInMonth = new Date(y, m, 0).getDate();
        // Build grid cells: nulls for padding + day numbers
        const cells: (number | null)[] = [
          ...Array(firstDay).fill(null),
          ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ];
        // Pad to complete last row
        while (cells.length % 7 !== 0) cells.push(null);

        // Map: "YYYY-MM-DD" → LichRow[]
        const byDate = lichList.reduce<Record<string, LichRow[]>>((acc, r) => {
          (acc[r.ngay] = acc[r.ngay] || []).push(r);
          return acc;
        }, {});

        const toDateStr = (day: number) =>
          `${y}-${String(m).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const todayStr = new Date().toISOString().slice(0, 10);

        // Rows for selected date
        const dateRows = selectedLichDate ? (byDate[selectedLichDate] ?? []) : [];
        const pendingAll = lichList.filter(r => r.trangThai === "cho_duyet");

        const duyetTatCa = async () => {
          for (const r of pendingAll) await handleDuyetLich(r.id, "da_duyet");
        };

        return (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">📅 Đăng ký lịch đi làm</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nhân viên đăng ký tại{" "}
                  <a href="/lich-di-lam" target="_blank" className="text-violet-500 underline font-medium">/lich-di-lam</a>
                  {" "}→ Admin duyệt tại đây
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {(["", "cho_duyet", "da_duyet", "tu_choi"] as const).map(tt => (
                  <button key={tt} onClick={() => { setLichTT(tt); setSelectedLichDate(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                      ${lichTT === tt ? "bg-violet-500 text-white border-violet-500" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {tt === "" ? "Tất cả" : tt === "cho_duyet" ? `Chờ duyệt${lichCount > 0 ? ` (${lichCount})` : ""}` : tt === "da_duyet" ? "Đã duyệt" : "Từ chối"}
                  </button>
                ))}
                {pendingAll.length > 0 && (
                  <button onClick={duyetTatCa}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition flex items-center gap-1.5">
                    ⚡ Duyệt tất cả ({pendingAll.length})
                  </button>
                )}
              </div>
            </div>

            {lichLoading ? (
              <div className="flex justify-center py-12">
                <span className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex gap-4 items-start">
                {/* ── Calendar grid ── */}
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
                  {/* Day-of-week header */}
                  <div className="grid grid-cols-7 border-b border-slate-100">
                    {DOW.map(d => (
                      <div key={d} className={`py-2.5 text-center text-xs font-semibold
                        ${d === "CN" ? "text-red-400" : "text-slate-400"}`}>
                        {d}
                      </div>
                    ))}
                  </div>
                  {/* Calendar cells */}
                  <div className="grid grid-cols-7">
                    {cells.map((day, idx) => {
                      if (!day) return <div key={`pad-${idx}`} className="border-b border-r border-slate-50 min-h-[80px]" />;
                      const dateStr = toDateStr(day);
                      const rows = byDate[dateStr] ?? [];
                      const isToday = dateStr === todayStr;
                      const isSelected = selectedLichDate === dateStr;
                      const hasPending = rows.some(r => r.trangThai === "cho_duyet");
                      const dow = (firstDay + day - 1) % 7;
                      const isSun = dow === 0;

                      return (
                        <div key={dateStr}
                          onClick={() => rows.length > 0 && setSelectedLichDate(isSelected ? null : dateStr)}
                          className={`border-b border-r border-slate-50 min-h-[80px] p-1.5 transition-all
                            ${rows.length > 0 ? "cursor-pointer hover:bg-violet-50/40" : ""}
                            ${isSelected ? "bg-violet-50 ring-2 ring-inset ring-violet-300" : ""}`}>
                          {/* Day number */}
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                              ${isToday ? "bg-violet-500 text-white" : isSun ? "text-red-400" : "text-slate-500"}`}>
                              {day}
                            </span>
                            {hasPending && (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            )}
                          </div>
                          {/* Employee badges */}
                          <div className="space-y-0.5">
                            {rows.slice(0, 3).map(r => (
                              <div key={r.id}
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight
                                  ${r.trangThai === "da_duyet" ? "bg-emerald-100 text-emerald-700" :
                                    r.trangThai === "tu_choi"  ? "bg-red-100 text-red-600" :
                                                                  "bg-amber-100 text-amber-700"}`}>
                                {r.nhanVien.ten.split(" ").pop()} · {caLabel(r)}
                              </div>
                            ))}
                            {rows.length > 3 && (
                              <div className="text-[10px] text-slate-400 pl-1">+{rows.length - 3} khác</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Detail panel ── */}
                {selectedLichDate ? (
                  <div className="w-72 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                      <div>
                        {(() => {
                          const d = new Date(selectedLichDate + "T00:00:00");
                          return (
                            <>
                              <p className="text-sm font-bold text-slate-800">
                                {DOW[d.getDay()]} {d.getDate()}/{d.getMonth()+1}/{d.getFullYear()}
                              </p>
                              <p className="text-xs text-slate-400">{dateRows.length} đăng ký</p>
                            </>
                          );
                        })()}
                      </div>
                      <button onClick={() => setSelectedLichDate(null)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition text-lg leading-none">
                        ×
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
                      {dateRows.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-8">Không có đăng ký</p>
                      ) : dateRows.map(r => (
                        <div key={r.id} className="px-4 py-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-violet-600">{r.nhanVien.ten.split(" ").pop()?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{r.nhanVien.ten}</p>
                              <p className="text-[10px] text-slate-400">{r.nhanVien.maNV}{r.nhanVien.phongBan ? ` · ${r.nhanVien.phongBan}` : ""}</p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                              ${r.trangThai === "da_duyet" ? "bg-emerald-100 text-emerald-700" :
                                r.trangThai === "tu_choi"  ? "bg-red-100 text-red-600" :
                                                              "bg-amber-100 text-amber-700"}`}>
                              {r.trangThai === "da_duyet" ? "✓ Duyệt" : r.trangThai === "tu_choi" ? "✗ Từ chối" : "Chờ"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium pl-9">{caLabel(r)}</div>
                          {r.ghiChu && <p className="text-[10px] text-slate-400 italic pl-9">"{r.ghiChu}"</p>}
                          {r.adminNote && <p className="text-[10px] text-slate-400 pl-9">Admin: {r.adminNote}</p>}
                          {r.trangThai === "cho_duyet" && (
                            <div className="pl-9 space-y-1.5">
                              <input
                                placeholder="Ghi chú (tuỳ chọn)"
                                value={adminNoteInput[r.id] ?? ""}
                                onChange={e => setAdminNoteInput(p => ({ ...p, [r.id]: e.target.value }))}
                                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-200"
                              />
                              <div className="flex gap-1.5">
                                <button onClick={() => handleDuyetLich(r.id, "da_duyet")}
                                  className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-1.5 rounded-lg transition">
                                  ✓ Duyệt
                                </button>
                                <button onClick={() => handleDuyetLich(r.id, "tu_choi")}
                                  className="flex-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-1.5 rounded-lg transition">
                                  ✗ Từ chối
                                </button>
                              </div>
                            </div>
                          )}
                          {r.trangThai !== "cho_duyet" && (
                            <div className="pl-9">
                              <button onClick={() => handleXoaLich(r.id)}
                                className="text-[10px] text-slate-400 hover:text-red-500 transition">
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-64 flex-shrink-0 bg-white/60 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-3xl mb-2">👆</p>
                    <p className="text-xs text-slate-400">Click vào ngày có<br/>đăng ký để xem chi tiết</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

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
              <button onClick={() => { setShowNVModal(false); setEditingNV(null); setNvError(""); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", soChNhatHopDong: "0", ngaySinh: "", thangApDung: thang }); }}
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
                    {editingNV && Number(nvForm.luongCB || 0) !== getLcbForMonth(editingNV, thang) && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <label className="text-[11px] text-amber-700 font-medium block mb-1">⚠ Áp dụng lương mới từ tháng nào?</label>
                        <input type="month" value={nvForm.thangApDung} onChange={e => setNvForm(f => ({ ...f, thangApDung: e.target.value }))}
                          className="border border-amber-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
                        <p className="text-[11px] text-amber-600 mt-1">Các tháng trước {nvForm.thangApDung} vẫn giữ nguyên lương cũ, không bị thay đổi.</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">📅 Số CN phải làm / tháng (theo HĐ)</label>
                    <div className="flex gap-2">
                      {[
                        { value: "0", label: "0 CN", desc: "Chỉ T2–T7" },
                        { value: "2", label: "+ 2 CN", desc: "T2–T7 + 2CN" },
                        { value: "4", label: "+ 4 CN", desc: "T2–T7 + 4CN" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNvForm(f => ({ ...f, soChNhatHopDong: opt.value }))}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${
                            nvForm.soChNhatHopDong === opt.value
                              ? "border-violet-400 bg-violet-50 text-violet-700"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          <div>{opt.label}</div>
                          <div className="text-[10px] opacity-60">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Công chuẩn = số ngày T2–T7 trong tháng + số CN theo HĐ
                      <br/>
                      <span className="text-violet-500">VD: tháng 28 ngày có 24 ngày T2-T7 → NV "0 CN" = 24 công chuẩn</span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">🎂 Ngày sinh</label>
                    <input type="date" value={nvForm.ngaySinh} onChange={e => setNvForm(f => ({ ...f, ngaySinh: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {editingNV && (
                    <button onClick={() => { setEditingNV(null); setNvForm({ maNV: "", ten: "", chucVu: "", phongBan: "", loaiLuong: "co_ban", luongCB: "", soChNhatHopDong: "0", ngaySinh: "", thangApDung: thang }); }}
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
                  <div key={nv.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${nv.active ? "bg-white border border-slate-100" : "bg-red-50 border border-red-100"}`}>
                    <div>
                      <span className="font-mono text-xs text-slate-400 mr-2">{nv.maNV}</span>
                      <span className={`font-medium text-sm ${nv.active ? "text-slate-800" : "text-slate-400 line-through"}`}>{nv.ten}</span>
                      {nv.chucVu && <span className="text-xs text-slate-400 ml-2">{nv.chucVu}</span>}
                      {nv.luongCB && <span className="text-xs text-emerald-600 ml-2">{fmt(nv.luongCB)}₫</span>}
                      {(nv.soChNhatHopDong ?? 0) > 0 && <span className="text-xs text-violet-600 ml-2">+{nv.soChNhatHopDong}CN</span>}
                      {nv.ngaySinh && <span className="text-xs text-pink-500 ml-2">🎂 {new Date(nv.ngaySinh).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit" })}</span>}
                      {!nv.active && nv.ngayNghiViec && <span className="text-xs text-red-400 ml-2">Nghỉ {new Date(nv.ngayNghiViec).toLocaleDateString("vi-VN")}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingNV(nv); setNvForm({ maNV: nv.maNV, ten: nv.ten, chucVu: nv.chucVu ?? "", phongBan: nv.phongBan ?? "", loaiLuong: (nv as {loaiLuong?: string}).loaiLuong ?? "co_ban", luongCB: String(getLcbForMonth(nv, thang) || ""), soChNhatHopDong: String(nv.soChNhatHopDong ?? 0), ngaySinh: nv.ngaySinh ? nv.ngaySinh.slice(0,10) : "", thangApDung: thang }); }}
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

      {/* ═══ MODAL ĐỔI MẬT KHẨU ADMIN ═══ */}
      {showChangePinModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-slate-800 text-base mb-4">Đổi mật khẩu ADMIN</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Mật khẩu hiện tại</label>
                <input type="password" value={changePinForm.oldPin}
                  onChange={e => { setChangePinForm(f => ({ ...f, oldPin: e.target.value })); setChangePinError(""); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Mật khẩu mới</label>
                <input type="password" value={changePinForm.newPin}
                  onChange={e => { setChangePinForm(f => ({ ...f, newPin: e.target.value })); setChangePinError(""); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Xác nhận mật khẩu mới</label>
                <input type="password" value={changePinForm.confirm}
                  onChange={e => { setChangePinForm(f => ({ ...f, confirm: e.target.value })); setChangePinError(""); }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
              </div>
              {changePinError && <p className="text-xs text-red-500">{changePinError}</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={submitChangePin}
                className="flex-1 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition">
                Lưu mật khẩu
              </button>
              <button onClick={() => setShowChangePinModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition">
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ DIALOG XÁC NHẬN NGHỈ VIỆC ═══ */}
      {nghiViecModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-slate-800 text-base mb-1">Xác nhận nghỉ việc</h3>
            <p className="text-sm text-slate-500 mb-4">
              <span className="font-semibold text-slate-700">{nghiViecModal.nv.ten}</span> nghỉ việc từ ngày nào?
            </p>
            <div className="mb-5">
              <label className="text-xs text-slate-500 mb-1 block">Ngày nghỉ việc</label>
              <input
                type="date"
                value={nghiViecModal.date}
                onChange={e => setNghiViecModal(m => m && ({ ...m, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={confirmNghiViec} disabled={savingNghiViec}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50">
                {savingNghiViec ? "Đang lưu..." : "Xác nhận nghỉ việc"}
              </button>
              <button onClick={() => setNghiViecModal(null)}
                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition">
                Huỷ
              </button>
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
          <div id="phieu-luong-overlay" className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto print:bg-transparent print:inset-auto print:block print:overflow-visible">
            <div id="phieu-luong-modal" className="bg-white rounded-2xl shadow-2xl w-full max-w-sm print:shadow-none print:rounded-none print:max-w-full">
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

      {/* ═══ HOVER CARD CHI TIẾT Ô CHẤM CÔNG ═══ */}
      {hoverCard && (
        <div
          className="pointer-events-none fixed z-[9998] bg-slate-800 text-white rounded-xl shadow-2xl px-3.5 py-2.5 text-xs min-w-[160px] max-w-[240px] border border-slate-600"
          style={{
            left: Math.min(hoverCard.x, winW - 250),
            top: hoverCard.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="font-semibold text-slate-100 truncate mb-1">{hoverCard.ten}</p>
          <p className="text-slate-400 text-[10px] mb-1.5">{hoverCard.ngay}</p>
          <p className={`font-medium mb-1 ${
            hoverCard.trangThai === "Đi muộn" ? "text-amber-400" :
            hoverCard.trangThai === "Chưa chấm ra" ? "text-orange-400" :
            hoverCard.trangThai === "Vắng" ? "text-red-400" :
            "text-emerald-400"
          }`}>{hoverCard.trangThai}</p>
          {hoverCard.gioVao && (
            <p className="text-slate-300">🕐 Vào: <span className="font-semibold text-white">{hoverCard.gioVao}</span></p>
          )}
          {hoverCard.gioRa && (
            <p className="text-slate-300">🕕 Ra: <span className="font-semibold text-white">{hoverCard.gioRa}</span></p>
          )}
          {hoverCard.tongGio != null && (
            <p className="text-slate-300">⏱ Tổng: <span className="font-semibold text-white">{hoverCard.tongGio}h</span></p>
          )}
          {hoverCard.ghiChu && (
            <p className="text-amber-300 mt-1 border-t border-slate-700 pt-1 leading-relaxed">{hoverCard.ghiChu}</p>
          )}
          {!hoverCard.gioVao && !hoverCard.ghiChu && hoverCard.trangThai !== "Chưa chấm ra" && (
            <p className="text-slate-500 italic text-[10px]">Chấm thủ công (không có giờ)</p>
          )}
        </div>
      )}

      {/* ═══ POPOVER GHI CHÚ Ô CHẤM CÔNG ═══ */}
      {notePopover && (
        <div
          id="cc-note-popover"
          style={{ position: "fixed", top: notePopover.pos.top, left: notePopover.pos.left, zIndex: 9999 }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-64"
        >
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
            ✏️ Ghi chú ngày {notePopover.day}/{month}
            <span className="ml-1 text-amber-600">{TT_MAP[ccMap[notePopover.key] ?? ""]?.title ?? ""}</span>
          </p>
          <input
            autoFocus
            value={noteDraft}
            onChange={e => setNoteDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveNote(notePopover.nvId, notePopover.ngay, noteDraft, ccMap[notePopover.key] ?? "di_muon");
              if (e.key === "Escape") setNotePopover(null);
            }}
            placeholder="VD: đến 8:45, muộn 15 phút..."
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-300 mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={() => saveNote(notePopover.nvId, notePopover.ngay, noteDraft, ccMap[notePopover.key] ?? "di_muon")}
              className="flex-1 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
            >
              Lưu
            </button>
            {ghiChuMap[notePopover.key] && (
              <button
                onClick={() => saveNote(notePopover.nvId, notePopover.ngay, "", ccMap[notePopover.key] ?? "di_muon")}
                className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition"
                title="Xoá ghi chú"
              >
                Xoá
              </button>
            )}
            <button
              onClick={() => setNotePopover(null)}
              className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs hover:bg-slate-200 transition"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
