"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus, X, CheckCircle, AlertCircle, TrendingUp, TrendingDown,
  Wallet, RefreshCw, ChevronDown
} from "lucide-react";

// ────────── Types ──────────
type CongNoNCC = {
  id: string; ho: string; ngay: string; thang: string;
  tenNCC: string; soHoaDon: string | null;
  soTienHoaDon: number; chiPhiThucNhap: number;
  daTra: number; conLai: number; trangThai: string;
  ghiChu: string | null; nguoiTao: string | null;
};

type CongNoKH = {
  id: string; ho: string; ngay: string; thang: string;
  tenKhachHang: string; soTien: number; daTra: number;
  conLai: number; trangThai: string; ghiChu: string | null;
  doanhThu?: { soTien: number; giaVon: number; loiNhuan: number } | null;
};

// ────────── Helpers ──────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + " ₫";
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN");
const trangThaiNCC: Record<string, { label: string; cls: string }> = {
  con_no:           { label: "Còn nợ",        cls: "bg-red-50 text-red-700 border-red-200" },
  thanh_toan_1_phan:{ label: "Trả 1 phần",    cls: "bg-amber-50 text-amber-700 border-amber-200" },
  da_thanh_toan:    { label: "Đã thanh toán", cls: "bg-green-50 text-green-700 border-green-200" },
};
const trangThaiKH: Record<string, { label: string; cls: string }> = {
  con_no:           { label: "Chưa thu",       cls: "bg-orange-50 text-orange-700 border-orange-200" },
  thanh_toan_1_phan:{ label: "Thu 1 phần",     cls: "bg-amber-50 text-amber-700 border-amber-200" },
  da_thanh_toan:    { label: "Đã thu",         cls: "bg-green-50 text-green-700 border-green-200" },
};

const HO_LIST = [
  { key: "meisy",          label: "Meisy" },
  { key: "nguyen_cong_uoc", label: "Nguyễn Công Ước" },
];

const thangHienTai = new Date().toISOString().slice(0, 7);

export default function CongNoPage() {
  const [tab, setTab] = useState<"ncc" | "kh">("ncc");
  const [ho, setHo] = useState("meisy");
  const [thang, setThang] = useState(thangHienTai);

  // Data
  const [nccList, setNccList] = useState<CongNoNCC[]>([]);
  const [khList, setKhList]   = useState<CongNoKH[]>([]);
  const [loading, setLoading]  = useState(false);

  // Modal tạo NCC
  const [showCreateNCC, setShowCreateNCC] = useState(false);
  const [nccForm, setNccForm] = useState({
    ngay: new Date().toISOString().slice(0, 10),
    tenNCC: "", soHoaDon: "",
    soTienHoaDon: "", chiPhiThucNhap: "", ghiChu: "",
  });

  // Modal trả nợ NCC
  const [payNCC, setPayNCC] = useState<CongNoNCC | null>(null);
  const [payNccAmount, setPayNccAmount] = useState("");

  // Modal tạo KH thủ công
  const [showCreateKH, setShowCreateKH] = useState(false);
  const [khForm, setKhForm] = useState({
    ngay: new Date().toISOString().slice(0, 10),
    tenKhachHang: "", soTien: "", ghiChu: "",
  });

  // Modal thu KH
  const [payKH, setPayKH]   = useState<CongNoKH | null>(null);
  const [payKhAmount, setPayKhAmount] = useState("");

  // ─── Fetch ───
  async function fetchData() {
    setLoading(true);
    try {
      if (tab === "ncc") {
        const data = await fetch(`/api/cong-no-ncc?ho=${ho}&thang=${thang}`).then(r => r.json());
        if (Array.isArray(data)) setNccList(data);
      } else {
        const data = await fetch(`/api/cong-no-khach-hang?ho=${ho}&thang=${thang}`).then(r => r.json());
        if (Array.isArray(data)) setKhList(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [tab, ho, thang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Summary NCC ───
  const summaryNCC = useMemo(() => {
    const tongHoaDon  = nccList.reduce((s, r) => s + r.soTienHoaDon, 0);
    const tongThuc    = nccList.reduce((s, r) => s + r.chiPhiThucNhap, 0);
    const tongConNo   = nccList.filter(r => r.trangThai !== "da_thanh_toan").reduce((s, r) => s + r.conLai, 0);
    return { tongHoaDon, tongThuc, tongConNo };
  }, [nccList]);

  // ─── Summary KH ───
  const summaryKH = useMemo(() => {
    const tongDoanhThu = khList.reduce((s, r) => s + r.soTien, 0);
    const tongDaThu    = khList.reduce((s, r) => s + r.daTra, 0);
    const tongConNo    = khList.filter(r => r.trangThai !== "da_thanh_toan").reduce((s, r) => s + r.conLai, 0);
    return { tongDoanhThu, tongDaThu, tongConNo };
  }, [khList]);

  // ─── Create NCC ───
  async function handleCreateNCC() {
    const res = await fetch("/api/cong-no-ncc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...nccForm, ho }),
    });
    if (!res.ok) { alert("Lỗi tạo công nợ"); return; }
    setShowCreateNCC(false);
    setNccForm({ ngay: new Date().toISOString().slice(0, 10), tenNCC: "", soHoaDon: "", soTienHoaDon: "", chiPhiThucNhap: "", ghiChu: "" });
    fetchData();
  }

  // ─── Create KH thủ công ───
  async function handleCreateKH() {
    const res = await fetch("/api/cong-no-khach-hang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...khForm, ho }),
    });
    if (!res.ok) { alert("Lỗi tạo công nợ khách hàng"); return; }
    setShowCreateKH(false);
    setKhForm({ ngay: new Date().toISOString().slice(0, 10), tenKhachHang: "", soTien: "", ghiChu: "" });
    fetchData();
  }

  // ─── Pay NCC ───
  async function handlePayNCC() {
    if (!payNCC) return;
    const res = await fetch(`/api/cong-no-ncc/${payNCC.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soTienTra: payNccAmount }),
    });
    if (!res.ok) { alert("Lỗi ghi nhận trả nợ"); return; }
    setPayNCC(null);
    setPayNccAmount("");
    fetchData();
  }

  // ─── Pay KH ───
  async function handlePayKH() {
    if (!payKH) return;
    const res = await fetch(`/api/cong-no-khach-hang/${payKH.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ soTienThu: payKhAmount }),
    });
    if (!res.ok) { alert("Lỗi ghi nhận thu tiền"); return; }
    setPayKH(null);
    setPayKhAmount("");
    fetchData();
  }

  // ─── Render ───
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Công Nợ</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý công nợ NCC và khách hàng</p>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Hộ */}
          <select
            value={ho}
            onChange={e => setHo(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
          >
            {HO_LIST.map(h => (
              <option key={h.key} value={h.key}>{h.label}</option>
            ))}
          </select>
          {/* Tháng */}
          <input
            type="month"
            value={thang}
            onChange={e => setThang(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
          />
          <button onClick={fetchData} className="p-1.5 text-slate-500 hover:text-slate-800">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-5 w-fit">
        {([
          { key: "ncc", label: "Công nợ NCC" },
          { key: "kh",  label: "Công nợ Khách hàng" },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB NCC ═══ */}
      {tab === "ncc" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-xs text-slate-500 mb-1">Tổng hoá đơn</p>
              <p className="text-lg font-bold text-slate-800">{fmt(summaryNCC.tongHoaDon)}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-xs text-slate-500 mb-1">Chi phí thực</p>
              <p className="text-lg font-bold text-blue-600">{fmt(summaryNCC.tongThuc)}</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs text-red-500 mb-1">Còn nợ NCC</p>
              <p className="text-lg font-bold text-red-600">{fmt(summaryNCC.tongConNo)}</p>
            </div>
          </div>

          {/* Button thêm */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowCreateNCC(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Plus size={16} /> Thêm công nợ NCC
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-left">Nhà CC</th>
                  <th className="px-4 py-3 text-left">Hoá đơn</th>
                  <th className="px-4 py-3 text-right">Tiền HĐ</th>
                  <th className="px-4 py-3 text-right">Chi phí thực</th>
                  <th className="px-4 py-3 text-right">Đã trả</th>
                  <th className="px-4 py-3 text-right">Còn lại</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">Đang tải...</td></tr>
                )}
                {!loading && nccList.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-8 text-slate-400">Không có dữ liệu</td></tr>
                )}
                {nccList.map(r => {
                  const st = trangThaiNCC[r.trangThai] || trangThaiNCC.con_no;
                  const chenhLech = r.soTienHoaDon - r.chiPhiThucNhap;
                  return (
                    <tr key={r.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{fmtDate(r.ngay)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.tenNCC}</td>
                      <td className="px-4 py-3 text-slate-500">{r.soHoaDon || "—"}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmt(r.soTienHoaDon)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-blue-700">{fmt(r.chiPhiThucNhap)}</span>
                        {chenhLech !== 0 && (
                          <span className={`ml-1 text-xs ${chenhLech > 0 ? "text-green-600" : "text-red-500"}`}>
                            ({chenhLech > 0 ? "+" : ""}{fmt(chenhLech)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{fmt(r.daTra)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-600">{fmt(r.conLai)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.trangThai !== "da_thanh_toan" && (
                          <button
                            onClick={() => { setPayNCC(r); setPayNccAmount(String(r.conLai)); }}
                            className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded hover:bg-red-100"
                          >
                            Trả nợ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ═══ TAB KH ═══ */}
      {tab === "kh" && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-white rounded-xl p-4 border">
              <p className="text-xs text-slate-500 mb-1">Tổng doanh thu</p>
              <p className="text-lg font-bold text-slate-800">{fmt(summaryKH.tongDoanhThu)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-xs text-green-600 mb-1">Đã thu</p>
              <p className="text-lg font-bold text-green-600">{fmt(summaryKH.tongDaThu)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-xs text-orange-500 mb-1">Còn phải thu</p>
              <p className="text-lg font-bold text-orange-600">{fmt(summaryKH.tongConNo)}</p>
            </div>
          </div>

          {/* Button thêm thủ công */}
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setShowCreateKH(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <Plus size={16} /> Thêm công nợ KH
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Ngày</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-right">Doanh thu</th>
                  <th className="px-4 py-3 text-right">Giá vốn</th>
                  <th className="px-4 py-3 text-right">Đã thu</th>
                  <th className="px-4 py-3 text-right">Còn lại</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400">Đang tải...</td></tr>
                )}
                {!loading && khList.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-8 text-slate-400">Không có dữ liệu</td></tr>
                )}
                {khList.map(r => {
                  const st = trangThaiKH[r.trangThai] || trangThaiKH.con_no;
                  return (
                    <tr key={r.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{fmtDate(r.ngay)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{r.tenKhachHang}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{fmt(r.soTien)}</td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {r.doanhThu ? fmt(r.doanhThu.giaVon) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">{fmt(r.daTra)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">{fmt(r.conLai)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {r.trangThai !== "da_thanh_toan" && (
                          <button
                            onClick={() => { setPayKH(r); setPayKhAmount(String(r.conLai)); }}
                            className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-1 rounded hover:bg-green-100"
                          >
                            Thu tiền
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══ Modal tạo công nợ NCC ══ */}
      {showCreateNCC && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Thêm công nợ NCC</h3>
              <button onClick={() => setShowCreateNCC(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ngày *</label>
                  <input type="date" value={nccForm.ngay} onChange={e => setNccForm(p => ({ ...p, ngay: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Số hoá đơn</label>
                  <input value={nccForm.soHoaDon} onChange={e => setNccForm(p => ({ ...p, soHoaDon: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="HĐ-001" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tên nhà cung cấp *</label>
                <input value={nccForm.tenNCC} onChange={e => setNccForm(p => ({ ...p, tenNCC: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Công ty vải Hạc Long..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Tiền hoá đơn</label>
                  <input type="number" value={nccForm.soTienHoaDon} onChange={e => setNccForm(p => ({ ...p, soTienHoaDon: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Chi phí thực nhập *</label>
                  <input type="number" value={nccForm.chiPhiThucNhap} onChange={e => setNccForm(p => ({ ...p, chiPhiThucNhap: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              {nccForm.soTienHoaDon && nccForm.chiPhiThucNhap && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <span className="text-slate-600">Chênh lệch: </span>
                  <span className={`font-semibold ${parseFloat(nccForm.soTienHoaDon) - parseFloat(nccForm.chiPhiThucNhap) >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {fmt(parseFloat(nccForm.soTienHoaDon) - parseFloat(nccForm.chiPhiThucNhap))}
                  </span>
                </div>
              )}
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Ghi chú</label>
                <input value={nccForm.ghiChu} onChange={e => setNccForm(p => ({ ...p, ghiChu: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateNCC(false)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button
                onClick={handleCreateNCC}
                disabled={!nccForm.tenNCC || !nccForm.chiPhiThucNhap}
                className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Tạo công nợ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal trả nợ NCC ══ */}
      {payNCC && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Trả nợ NCC</h3>
              <button onClick={() => setPayNCC(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-slate-800">{payNCC.tenNCC}</p>
              <p className="text-slate-500">Còn nợ: <span className="text-red-600 font-semibold">{fmt(payNCC.conLai)}</span></p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-1 block">Số tiền trả *</label>
              <input
                type="number"
                value={payNccAmount}
                onChange={e => setPayNccAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mb-4">
              ⚠ Sẽ tạo phiếu chi &quot;Chờ duyệt&quot; trong Sổ Thu Chi
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPayNCC(null)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600">Huỷ</button>
              <button
                onClick={handlePayNCC}
                disabled={!payNccAmount || parseFloat(payNccAmount) <= 0}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                Xác nhận trả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal thu tiền KH ══ */}
      {payKH && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Ghi nhận thu tiền</h3>
              <button onClick={() => setPayKH(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm">
              <p className="font-semibold text-slate-800">{payKH.tenKhachHang}</p>
              <p className="text-slate-500">Còn phải thu: <span className="text-orange-600 font-semibold">{fmt(payKH.conLai)}</span></p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 mb-1 block">Số tiền thu *</label>
              <input
                type="number"
                value={payKhAmount}
                onChange={e => setPayKhAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <p className="text-xs text-green-700 bg-green-50 rounded-lg p-2 mb-4">
              ✓ Sẽ tạo phiếu thu &quot;Đã duyệt&quot; trong Sổ Thu Chi
            </p>
            <div className="flex gap-3">
              <button onClick={() => setPayKH(null)} className="flex-1 border rounded-lg py-2 text-sm text-slate-600">Huỷ</button>
              <button
                onClick={handlePayKH}
                disabled={!payKhAmount || parseFloat(payKhAmount) <= 0}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Xác nhận thu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ══ Modal tạo công nợ KH thủ công ══ */}
      {showCreateKH && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-800 text-lg">Thêm công nợ Khách hàng</h3>
              <button onClick={() => setShowCreateKH(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Ngày *</label>
                  <input type="date" value={khForm.ngay}
                    onChange={e => setKhForm(p => ({ ...p, ngay: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Số tiền *</label>
                  <input type="number" value={khForm.soTien}
                    onChange={e => setKhForm(p => ({ ...p, soTien: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tên khách hàng *</label>
                <input value={khForm.tenKhachHang}
                  onChange={e => setKhForm(p => ({ ...p, tenKhachHang: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Công ty ABC, Chị Lan..." />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Ghi chú</label>
                <input value={khForm.ghiChu}
                  onChange={e => setKhForm(p => ({ ...p, ghiChu: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Đơn hàng tháng 6..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreateKH(false)}
                className="flex-1 border rounded-lg py-2 text-sm text-slate-600 hover:bg-slate-50">
                Huỷ
              </button>
              <button
                onClick={handleCreateKH}
                disabled={!khForm.tenKhachHang || !khForm.soTien}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Tạo công nợ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
