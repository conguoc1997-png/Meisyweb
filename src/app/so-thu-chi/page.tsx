"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Check, X, Wallet, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, Clock, ChevronDown,
  Pencil, Trash2, BookOpen, Printer, Lock, LockOpen
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Ho = "meisy" | "nguyen_cong_uoc";

interface TaiKhoanQuy {
  id: string;
  ho: Ho;
  tenHo: string;
  soDuDauKy: number;
  thang: string;
  daChot: boolean;
  ngayChot: string | null;
}

interface PhieuThuChi {
  id: string;
  ho: Ho;
  loai: "thu" | "chi";
  soTien: number;
  danhMuc: string;
  dienGiai: string;
  nguoiDeXuat: string | null;
  trangThai: "cho_duyet" | "da_duyet" | "tu_choi" | "da_chi";
  ghiChuDuyet: string | null;
  ngay: string;
  thang: string;
  nguoiDuyet: string | null;
  ngayDuyet: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HO_LABELS: Record<Ho, { label: string; icon: string; color: string; bg: string; border: string }> = {
  meisy:            { label: "Meisy",            icon: "🌸", color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200" },
  nguyen_cong_uoc:  { label: "Nguyễn Công Ước", icon: "🏭", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
};

const DANH_MUC_OPTIONS = [
  { value: "doanh_thu_ban_hang", label: "🛍️ Doanh thu bán hàng" },
  { value: "luong",       label: "💰 Lương & thưởng" },
  { value: "van_phong",   label: "🖊️ Văn phòng phẩm" },
  { value: "nguyen_lieu", label: "📦 Nguyên liệu" },
  { value: "van_chuyen",  label: "🚚 Vận chuyển" },
  { value: "dien_nuoc",   label: "💡 Điện, nước" },
  { value: "thue",        label: "🏛️ Thuế & phí" },
  { value: "khac",        label: "📋 Khác" },
];

const DANH_MUC_LABEL: Record<string, string> = Object.fromEntries(
  DANH_MUC_OPTIONS.map(d => [d.value, d.label])
);

const CUSTOM_DANH_MUC_KEY = "meisy_custom_danh_muc";

function loadCustomDanhMuc(): { value: string; label: string }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_DANH_MUC_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveCustomDanhMuc(list: { value: string; label: string }[]) {
  localStorage.setItem(CUSTOM_DANH_MUC_KEY, JSON.stringify(list));
}

const TRANG_THAI_CONFIG = {
  cho_duyet: { label: "Chờ duyệt", color: "text-amber-600",  bg: "bg-amber-50",  icon: Clock },
  da_duyet:  { label: "Đã duyệt",  color: "text-blue-600",   bg: "bg-blue-50",   icon: Check },
  tu_choi:   { label: "Từ chối",   color: "text-red-500",    bg: "bg-red-50",    icon: X },
  da_chi:    { label: "Đã chi",    color: "text-green-600",  bg: "bg-green-50",  icon: Check },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtSo(n: number) {
  return n.toLocaleString("vi-VN");
}

function fmtNgay(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function currentThang() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Modal Phiếu ─────────────────────────────────────────────────────────────

interface ModalPhieuProps {
  defaultHo?: Ho;
  editing?: PhieuThuChi | null;
  onClose: () => void;
  onSave: (data: Partial<PhieuThuChi>) => Promise<void>;
}

function ModalPhieu({ defaultHo, editing, onClose, onSave }: ModalPhieuProps) {
  const [ho, setHo] = useState<Ho>(editing?.ho ?? defaultHo ?? "meisy");
  const [loai, setLoai] = useState<"thu" | "chi">(editing?.loai ?? "chi");
  const [soTien, setSoTien] = useState(editing?.soTien?.toString() ?? "");
  const [danhMuc, setDanhMuc] = useState(editing?.danhMuc ?? "khac");
  const [customDanhMucs, setCustomDanhMucs] = useState<{ value: string; label: string }[]>([]);
  const [addingDanhMuc, setAddingDanhMuc] = useState(false);
  const [newDanhMucLabel, setNewDanhMucLabel] = useState("");

  useEffect(() => {
    setCustomDanhMucs(loadCustomDanhMuc());
  }, []);

  function handleAddDanhMuc() {
    const label = newDanhMucLabel.trim();
    if (!label) return;
    const value = `📋 ${label}`;
    const next = [...customDanhMucs, { value, label: value }];
    setCustomDanhMucs(next);
    saveCustomDanhMuc(next);
    setDanhMuc(value);
    setNewDanhMucLabel("");
    setAddingDanhMuc(false);
  }
  const [dienGiai, setDienGiai] = useState(editing?.dienGiai ?? "");
  const [nguoiDeXuat, setNguoiDeXuat] = useState(editing?.nguoiDeXuat ?? "");
  const [ngay, setNgay] = useState(
    editing?.ngay
      ? new Date(editing.ngay).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!soTien || !dienGiai) return;
    setSaving(true);
    await onSave({ ho, loai, soTien: Number(soTien), danhMuc, dienGiai, nguoiDeXuat: nguoiDeXuat || undefined, ngay });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800 text-[15px]">
            {editing ? "Sửa phiếu" : "Tạo đề xuất thu chi"}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Hộ */}
          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Hộ kinh doanh</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(HO_LABELS) as [Ho, typeof HO_LABELS[Ho]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setHo(key)}
                  className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-1.5
                    ${ho === key ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-stone-200 text-stone-400 hover:border-stone-300"}`}
                >
                  <span>{cfg.icon}</span> {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loại */}
          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Loại</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLoai("chi")}
                className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-1.5
                  ${loai === "chi" ? "bg-red-50 border-red-200 text-red-600" : "border-stone-200 text-stone-400 hover:border-stone-300"}`}
              >
                <ArrowDownCircle size={14} /> Khoản chi
              </button>
              <button
                onClick={() => setLoai("thu")}
                className={`py-2 px-3 rounded-xl border text-[13px] font-medium transition-all flex items-center gap-1.5
                  ${loai === "thu" ? "bg-green-50 border-green-200 text-green-600" : "border-stone-200 text-stone-400 hover:border-stone-300"}`}
              >
                <ArrowUpCircle size={14} /> Khoản thu
              </button>
            </div>
          </div>

          {/* Số tiền */}
          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Số tiền (VNĐ) *</label>
            <input
              type="number"
              placeholder="0"
              value={soTien}
              onChange={e => setSoTien(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300"
            />
          </div>

          {/* Danh mục */}
          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Danh mục</label>
            {!addingDanhMuc ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={danhMuc}
                    onChange={e => setDanhMuc(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300 appearance-none bg-white pr-8"
                  >
                    {[...DANH_MUC_OPTIONS, ...customDanhMucs].map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={() => setAddingDanhMuc(true)}
                  title="Thêm danh mục mới"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-500 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="Tên danh mục mới..."
                  value={newDanhMucLabel}
                  onChange={e => setNewDanhMucLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddDanhMuc(); } if (e.key === "Escape") setAddingDanhMuc(false); }}
                  className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300"
                />
                <button type="button" onClick={handleAddDanhMuc} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-colors">
                  <Check size={16} />
                </button>
                <button type="button" onClick={() => { setAddingDanhMuc(false); setNewDanhMucLabel(""); }} className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:text-stone-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Diễn giải */}
          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Diễn giải *</label>
            <textarea
              placeholder="Mô tả khoản thu/chi..."
              value={dienGiai}
              onChange={e => setDienGiai(e.target.value)}
              rows={2}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300 resize-none"
            />
          </div>

          {/* Người đề xuất & Ngày */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Người đề xuất</label>
              <input
                type="text"
                placeholder="Tên..."
                value={nguoiDeXuat}
                onChange={e => setNguoiDeXuat(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Ngày phát sinh</label>
              <input
                type="date"
                value={ngay}
                onChange={e => setNgay(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:border-rose-300"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !soTien || !dienGiai}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Đang lưu..." : editing ? "Cập nhật" : "Tạo đề xuất"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Duyệt ─────────────────────────────────────────────────────────────

interface ModalDuyetProps {
  phieu: PhieuThuChi;
  action: "da_duyet" | "tu_choi" | "da_chi";
  onClose: () => void;
  onConfirm: (ghiChu: string) => Promise<void>;
}

function ModalDuyet({ phieu, action, onClose, onConfirm }: ModalDuyetProps) {
  const [ghiChu, setGhiChu] = useState("");
  const [saving, setSaving] = useState(false);

  const cfg = {
    da_duyet: { label: "Duyệt đề xuất",  btnColor: "bg-blue-500 hover:bg-blue-600",   title: "Xác nhận duyệt?" },
    tu_choi:  { label: "Từ chối",         btnColor: "bg-red-500 hover:bg-red-600",     title: "Từ chối đề xuất?" },
    da_chi:   { label: "Xác nhận đã chi", btnColor: "bg-green-500 hover:bg-green-600", title: "Xác nhận đã chi?" },
  }[action];

  async function handleConfirm() {
    setSaving(true);
    await onConfirm(ghiChu);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="font-semibold text-stone-800 text-[15px] mb-1">{cfg.title}</h3>
          <p className="text-[13px] text-stone-500 mb-4">
            <span className={`font-medium ${phieu.loai === "chi" ? "text-red-500" : "text-green-600"}`}>
              {phieu.loai === "chi" ? "-" : "+"}{fmtSo(phieu.soTien)} đ
            </span>
            {" — "}{phieu.dienGiai}
          </p>

          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">
              Ghi chú {action === "tu_choi" ? "(lý do từ chối)" : "(tuỳ chọn)"}
            </label>
            <textarea
              value={ghiChu}
              onChange={e => setGhiChu(e.target.value)}
              rows={2}
              placeholder="Nhập ghi chú..."
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:border-rose-300 resize-none"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              className={`flex-1 py-2.5 rounded-xl text-white text-[13px] font-medium disabled:opacity-50 transition-colors ${cfg.btnColor}`}
            >
              {saving ? "Đang xử lý..." : cfg.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Số dư đầu kỳ ──────────────────────────────────────────────────────

interface ModalSoDuProps {
  ho: Ho;
  currentSoDu: number;
  thang: string;
  onClose: () => void;
  onSave: (soDu: number) => Promise<void>;
}

function ModalSoDu({ ho, currentSoDu, thang, onClose, onSave }: ModalSoDuProps) {
  const [soDu, setSoDu] = useState(currentSoDu.toString());
  const [saving, setSaving] = useState(false);
  const cfg = HO_LABELS[ho];

  async function handleSave() {
    setSaving(true);
    await onSave(Number(soDu));
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6">
          <h3 className="font-semibold text-stone-800 text-[15px] mb-1">
            {cfg.icon} Số dư đầu kỳ — {cfg.label}
          </h3>
          <p className="text-[12px] text-stone-400 mb-4">Tháng {thang.split("-").reverse().join("/")}</p>

          <div>
            <label className="text-[12px] font-medium text-stone-500 mb-1.5 block">Số dư đầu kỳ (VNĐ)</label>
            <input
              type="number"
              value={soDu}
              onChange={e => setSoDu(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-[15px] font-medium focus:outline-none focus:border-rose-300"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-[13px] text-stone-500 hover:bg-stone-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 disabled:opacity-50 transition-colors">
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SoThuChiPage() {
  const [thang, setThang] = useState(currentThang);
  const [selectedHo, setSelectedHo] = useState<Ho>("meisy");
  const [phieus, setPhieus] = useState<PhieuThuChi[]>([]);
  const [taiKhoans, setTaiKhoans] = useState<TaiKhoanQuy[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"so" | "cho_duyet">("so");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<PhieuThuChi | null>(null);
  const [duyetTarget, setDuyetTarget] = useState<{ phieu: PhieuThuChi; action: "da_duyet" | "tu_choi" | "da_chi" } | null>(null);
  const [soDuModal, setSoDuModal] = useState(false);

  // ─── Fetch ───────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/so-thu-chi?thang=${thang}&ho=${selectedHo}`);
      const data = await res.json();
      setPhieus(Array.isArray(data.phieus) ? data.phieus : []);
      setTaiKhoans(Array.isArray(data.taiKhoans) ? data.taiKhoans : []);
    } catch (e) {
      console.error("fetchData error:", e);
    }
    setLoading(false);
  }, [thang, selectedHo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Tài khoản hiện tại ──────────────────────────────────────────────────

  const taiKhoan  = taiKhoans.find(t => t.ho === selectedHo);
  const soDuDauKy = taiKhoan?.soDuDauKy ?? 0;
  const daChot    = taiKhoan?.daChot ?? false;

  const { tongThu, tongChi, choDuyet } = useMemo(() => {
    let tongThu = 0, tongChi = 0;
    const choDuyet: PhieuThuChi[] = [];

    phieus.forEach(p => {
      if (p.trangThai === "cho_duyet") { choDuyet.push(p); return; }
      if (p.trangThai === "tu_choi") return;
      if (p.loai === "thu") tongThu += p.soTien;
      else tongChi += p.soTien;
    });

    return { tongThu, tongChi, choDuyet };
  }, [phieus]);

  const soDuCuoiKy = soDuDauKy + tongThu - tongChi;

  const soThiThang = phieus.filter(p =>
    p.trangThai !== "cho_duyet" && p.trangThai !== "tu_choi"
  ).sort((a, b) => new Date(b.ngay).getTime() - new Date(a.ngay).getTime());

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function handleCreate(data: Partial<PhieuThuChi>) {
    await fetch("/api/so-thu-chi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    fetchData();
  }

  async function handleEdit(data: Partial<PhieuThuChi>) {
    if (!editing) return;
    await fetch(`/api/so-thu-chi/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setEditing(null);
    fetchData();
  }

  async function handleDuyet(ghiChu: string) {
    if (!duyetTarget) return;
    await fetch(`/api/so-thu-chi/${duyetTarget.phieu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trangThai: duyetTarget.action,
        ghiChuDuyet: ghiChu || null,
        ngayDuyet: new Date().toISOString(),
      }),
    });
    setDuyetTarget(null);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa phiếu này?")) return;
    await fetch(`/api/so-thu-chi/${id}`, { method: "DELETE" });
    fetchData();
  }

  async function handleChotThang() {
    const action = daChot ? "mở khóa" : "chốt";
    if (!confirm(`Bạn có chắc muốn ${action} tháng ${thang} cho hộ ${hoCfg.label}?`)) return;
    const cfg = HO_LABELS[selectedHo];
    await fetch("/api/so-thu-chi/tai-khoan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ho: selectedHo,
        tenHo: cfg.label,
        daChot: !daChot,
        ngayChot: !daChot ? new Date().toISOString() : null,
      }),
    });
    fetchData();
  }

  function handleInSo() {
    window.open(`/so-thu-chi/in?ho=${selectedHo}&thang=${thang}`, "_blank");
  }

  async function handleSaveSoDu(soDu: number) {
    const cfg = HO_LABELS[selectedHo];
    await fetch("/api/so-thu-chi/tai-khoan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ho: selectedHo, tenHo: cfg.label, soDuDauKy: soDu, thang }),
    });
    setSoDuModal(false);
    fetchData();
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  const hoCfg = HO_LABELS[selectedHo];
  const pendingCount = choDuyet.length;

  return (
    <div className="min-h-screen bg-stone-50/60">
      {/* ── Header ── */}
      <div className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BookOpen size={18} className="text-emerald-500" />
            </div>
            <div>
              <h1 className="font-semibold text-stone-800 text-[16px]">Sổ Thu Chi</h1>
              <p className="text-[11px] text-stone-400">Theo dõi tài chính theo hộ kinh doanh</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Month picker */}
            <input
              type="month"
              value={thang}
              onChange={e => setThang(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-1.5 text-[13px] text-stone-600 focus:outline-none focus:border-rose-300"
            />
            <button
              onClick={handleInSo}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white text-stone-600 text-[13px] font-medium hover:bg-stone-50 transition-colors"
            >
              <Printer size={14} /> In sổ
            </button>
            <button
              onClick={handleChotThang}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors
                ${daChot
                  ? "bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-100"
                  : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                }`}
            >
              {daChot ? <><LockOpen size={14} /> Mở khóa</> : <><Lock size={14} /> Chốt tháng</>}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              disabled={daChot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[13px] font-medium hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={14} /> Tạo đề xuất
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Chọn hộ ── */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(HO_LABELS) as [Ho, typeof HO_LABELS[Ho]][]).map(([key, cfg]) => {
            const tk = taiKhoans.find(t => t.ho === key);
            const thu = phieus.filter(p => p.ho === key && p.trangThai !== "cho_duyet" && p.trangThai !== "tu_choi" && p.loai === "thu").reduce((s, p) => s + p.soTien, 0);
            const chi = phieus.filter(p => p.ho === key && p.trangThai !== "cho_duyet" && p.trangThai !== "tu_choi" && p.loai === "chi").reduce((s, p) => s + p.soTien, 0);
            const soDu = (tk?.soDuDauKy ?? 0) + thu - chi;
            const isActive = selectedHo === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedHo(key)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all
                  ${isActive ? `${cfg.border} ${cfg.bg} shadow-sm` : "border-stone-200 bg-white hover:border-stone-300"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cfg.icon}</span>
                  <span className={`font-semibold text-[14px] ${isActive ? cfg.color : "text-stone-600"}`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mb-0.5">Số dư hiện tại</p>
                <p className={`text-[18px] font-bold ${soDu >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {fmtSo(soDu)} <span className="text-[12px] font-normal text-stone-400">đ</span>
                </p>
              </button>
            );
          })}
        </div>

        {/* ── Tóm tắt tháng ── */}
        <div className={`rounded-2xl border ${hoCfg.border} ${hoCfg.bg} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className={`font-semibold text-[14px] ${hoCfg.color}`}>
                {hoCfg.icon} {hoCfg.label} — Tháng {thang.split("-").reverse().join("/")}
              </h2>
              {daChot && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                  <Lock size={9} /> Đã chốt
                </span>
              )}
            </div>
            <button
              onClick={() => setSoDuModal(true)}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-600 transition-colors border border-stone-200 rounded-lg px-2 py-1 bg-white"
            >
              <Pencil size={10} /> Sửa số dư đầu kỳ
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet size={13} className="text-stone-400" />
                <span className="text-[11px] text-stone-400">Đầu kỳ</span>
              </div>
              <p className="text-[15px] font-bold text-stone-700">{fmtSo(soDuDauKy)} đ</p>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={13} className="text-green-500" />
                <span className="text-[11px] text-stone-400">Tổng thu</span>
              </div>
              <p className="text-[15px] font-bold text-green-600">+{fmtSo(tongThu)} đ</p>
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingDown size={13} className="text-red-500" />
                <span className="text-[11px] text-stone-400">Tổng chi</span>
              </div>
              <p className="text-[15px] font-bold text-red-500">-{fmtSo(tongChi)} đ</p>
            </div>

            <div className={`rounded-xl p-3 shadow-sm ${soDuCuoiKy >= 0 ? "bg-emerald-500" : "bg-red-500"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet size={13} className="text-white/70" />
                <span className="text-[11px] text-white/80">Số dư cuối kỳ</span>
              </div>
              <p className="text-[15px] font-bold text-white">{fmtSo(soDuCuoiKy)} đ</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-stone-100/80 p-1 rounded-xl w-fit">
          <button
            onClick={() => setTab("so")}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all
              ${tab === "so" ? "bg-white text-stone-700 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
          >
            Sổ thu chi
          </button>
          <button
            onClick={() => setTab("cho_duyet")}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5
              ${tab === "cho_duyet" ? "bg-white text-stone-700 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
          >
            Chờ duyệt
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab: Sổ thu chi ── */}
        {tab === "so" && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-stone-400 text-[13px]">
                Đang tải...
              </div>
            ) : soThiThang.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-stone-400">
                <BookOpen size={32} className="mb-2 opacity-30" />
                <p className="text-[13px]">Chưa có giao dịch nào được ghi nhận</p>
                <p className="text-[11px] mt-1">Tạo đề xuất → Admin duyệt → Đã chi sẽ hiện ở đây</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/50">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide w-[90px]">Ngày</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Diễn giải</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Danh mục</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Thu</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">Chi</th>
                      <th className="text-center px-4 py-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wide">TT</th>
                      <th className="px-4 py-3 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {soThiThang.map((p) => {
                      const ttCfg = TRANG_THAI_CONFIG[p.trangThai];
                      const TtIcon = ttCfg.icon;
                      return (
                        <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                          <td className="px-4 py-3 text-[12px] text-stone-400">{fmtNgay(p.ngay)}</td>
                          <td className="px-4 py-3">
                            <p className="text-[13px] text-stone-700 font-medium leading-tight">{p.dienGiai}</p>
                            {p.nguoiDeXuat && (
                              <p className="text-[11px] text-stone-400 mt-0.5">{p.nguoiDeXuat}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] text-stone-500 bg-stone-100 rounded-lg px-2 py-0.5">
                              {DANH_MUC_LABEL[p.danhMuc] ?? p.danhMuc}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.loai === "thu" && (
                              <span className="text-[13px] font-semibold text-green-600">
                                +{fmtSo(p.soTien)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {p.loai === "chi" && (
                              <span className="text-[13px] font-semibold text-red-500">
                                -{fmtSo(p.soTien)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${ttCfg.bg} ${ttCfg.color}`}>
                              <TtIcon size={9} />
                              {ttCfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {p.trangThai === "da_duyet" && (
                                <button
                                  onClick={() => setDuyetTarget({ phieu: p, action: "da_chi" })}
                                  title="Xác nhận đã chi"
                                  className="p-1 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                                >
                                  <Check size={13} />
                                </button>
                              )}
                              <button
                                onClick={() => setEditing(p)}
                                title="Sửa"
                                className="p-1 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(p.id)}
                                title="Xóa"
                                className="p-1 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Dòng tổng */}
                  <tfoot>
                    <tr className="bg-stone-50 border-t-2 border-stone-200">
                      <td colSpan={3} className="px-4 py-3 text-[12px] font-semibold text-stone-500">Tổng cộng tháng {thang.split("-").reverse().join("/")}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-green-600">+{fmtSo(tongThu)}</td>
                      <td className="px-4 py-3 text-right text-[13px] font-bold text-red-500">-{fmtSo(tongChi)}</td>
                      <td colSpan={2} className="px-4 py-3 text-right text-[13px] font-bold text-stone-700">
                        {tongThu - tongChi >= 0 ? "+" : ""}{fmtSo(tongThu - tongChi)} đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Chờ duyệt ── */}
        {tab === "cho_duyet" && (
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-2xl border border-stone-100 py-12 flex items-center justify-center text-stone-400 text-[13px]">
                Đang tải...
              </div>
            ) : choDuyet.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 py-12 flex flex-col items-center justify-center text-stone-400">
                <Check size={32} className="mb-2 opacity-30 text-green-400" />
                <p className="text-[13px]">Không có đề xuất nào chờ duyệt</p>
              </div>
            ) : (
              choDuyet.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5
                          ${p.loai === "chi" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}>
                          {p.loai === "chi" ? <ArrowDownCircle size={10} /> : <ArrowUpCircle size={10} />}
                          {p.loai === "chi" ? "Khoản chi" : "Khoản thu"}
                        </span>
                        <span className="text-[11px] text-stone-400">{fmtNgay(p.ngay)}</span>
                        {p.nguoiDeXuat && (
                          <span className="text-[11px] text-stone-400">• {p.nguoiDeXuat}</span>
                        )}
                      </div>

                      <p className="text-[14px] font-semibold text-stone-800 mb-0.5">{p.dienGiai}</p>
                      <p className="text-[12px] text-stone-400">{DANH_MUC_LABEL[p.danhMuc] ?? p.danhMuc}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-[18px] font-bold ${p.loai === "chi" ? "text-red-500" : "text-green-600"}`}>
                        {p.loai === "chi" ? "-" : "+"}{fmtSo(p.soTien)}
                        <span className="text-[11px] font-normal text-stone-400 ml-0.5">đ</span>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-stone-50">
                    <button
                      onClick={() => setDuyetTarget({ phieu: p, action: "da_duyet" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Check size={12} /> Duyệt
                    </button>
                    <button
                      onClick={() => setDuyetTarget({ phieu: p, action: "tu_choi" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-[12px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <X size={12} /> Từ chối
                    </button>
                    <button
                      onClick={() => setEditing(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 text-stone-500 text-[12px] font-medium hover:bg-stone-100 transition-colors ml-auto"
                    >
                      <Pencil size={12} /> Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-50 text-red-400 text-[12px] font-medium hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showCreate && (
        <ModalPhieu
          defaultHo={selectedHo}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
        />
      )}

      {editing && (
        <ModalPhieu
          editing={editing}
          onClose={() => setEditing(null)}
          onSave={handleEdit}
        />
      )}

      {duyetTarget && (
        <ModalDuyet
          phieu={duyetTarget.phieu}
          action={duyetTarget.action}
          onClose={() => setDuyetTarget(null)}
          onConfirm={handleDuyet}
        />
      )}

      {soDuModal && (
        <ModalSoDu
          ho={selectedHo}
          currentSoDu={soDuDauKy}
          thang={thang}
          onClose={() => setSoDuModal(false)}
          onSave={handleSaveSoDu}
        />
      )}
    </div>
  );
}
