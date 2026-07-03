"use client";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle, XCircle, Loader2, User } from "lucide-react";

type NhanVien = { id: string; ten: string; maNV: string; phongBan?: string };
type Step = "chon-nv" | "dang-lay-gps" | "dang-gui" | "thanh-cong" | "loi";

export default function CheckInPage() {
  const [dsNV, setDsNV]         = useState<NhanVien[]>([]);
  const [selected, setSelected] = useState<NhanVien | null>(null);
  const [step, setStep]         = useState<Step>("chon-nv");
  const [result, setResult]     = useState<{ action: string; time: string; location: string } | null>(null);
  const [errMsg, setErrMsg]     = useState("");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/checkin")
      .then(r => r.json())
      .then(data => setDsNV(Array.isArray(data) ? data : []));
  }, []);

  const filtered = dsNV.filter(nv =>
    nv.ten.toLowerCase().includes(search.toLowerCase()) ||
    nv.maNV.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCheckin(nv: NhanVien) {
    setSelected(nv);
    setStep("dang-lay-gps");
    setErrMsg("");

    if (!navigator.geolocation) {
      setErrMsg("Điện thoại không hỗ trợ GPS");
      setStep("loi");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setStep("dang-gui");
        try {
          const res = await fetch("/api/checkin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nhanVienId: nv.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            }),
          });
          const data = await res.json();
          if (!res.ok || data.error) {
            setErrMsg(data.error || "Lỗi không xác định");
            setStep("loi");
          } else {
            setResult(data);
            setStep("thanh-cong");
          }
        } catch {
          setErrMsg("Không thể kết nối máy chủ");
          setStep("loi");
        }
      },
      (err) => {
        setErrMsg(
          err.code === 1
            ? "Bạn chưa cho phép truy cập vị trí. Vào Cài đặt → trình duyệt → bật Vị trí."
            : "Không lấy được GPS. Vui lòng thử lại."
        );
        setStep("loi");
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  }

  function reset() {
    setStep("chon-nv");
    setSelected(null);
    setResult(null);
    setErrMsg("");
    setSearch("");
  }

  // ── Màn hình chọn nhân viên ──────────────────────────────────────
  if (step === "chon-nv") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} className="text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Chấm công</h1>
            <p className="text-stone-400 text-sm mt-1">Chọn tên của bạn để chấm công</p>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Tìm tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700
              placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300 mb-3 text-base"
          />

          {/* Danh sách NV */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-stone-400 py-8">Không tìm thấy</p>
            )}
            {filtered.map(nv => (
              <button
                key={nv.id}
                onClick={() => handleCheckin(nv)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl
                  border border-stone-100 hover:border-rose-300 hover:bg-rose-50/50
                  active:scale-[0.98] transition-all text-left shadow-sm"
              >
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-stone-700 text-[15px]">{nv.ten}</p>
                  <p className="text-[12px] text-stone-400">{nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Đang lấy GPS ──────────────────────────────────────────────────
  if (step === "dang-lay-gps" || step === "dang-gui") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={48} className="text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium text-lg">
            {step === "dang-lay-gps" ? "Đang lấy vị trí GPS..." : "Đang xác nhận..."}
          </p>
          <p className="text-stone-400 text-sm mt-2">
            {step === "dang-lay-gps" ? "Vui lòng cho phép truy cập vị trí" : selected?.ten}
          </p>
        </div>
      </div>
    );
  }

  // ── Thành công ────────────────────────────────────────────────────
  if (step === "thanh-cong" && result) {
    const isVao = result.action === "vao";
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-stone-800 mb-1">
            {isVao ? "Chấm vào thành công!" : "Chấm ra thành công!"}
          </h2>
          <p className="text-stone-500 text-lg mb-1">{selected?.ten}</p>
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-6 py-5 mt-6 space-y-2">
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-400">Thời gian</span>
              <span className="font-semibold text-stone-700">{result.time}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-400">Địa điểm</span>
              <span className="font-semibold text-stone-700">{result.location}</span>
            </div>
            <div className="flex justify-between text-[15px]">
              <span className="text-stone-400">Trạng thái</span>
              <span className={`font-semibold ${isVao ? "text-emerald-600" : "text-rose-500"}`}>
                {isVao ? "✅ Vào làm" : "🏠 Tan ca"}
              </span>
            </div>
          </div>
          <button
            onClick={reset}
            className="mt-8 px-8 py-3 bg-emerald-500 text-white rounded-xl font-medium
              hover:bg-emerald-600 active:scale-95 transition-all"
          >
            Xong
          </button>
        </div>
      </div>
    );
  }

  // ── Lỗi ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <XCircle size={64} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-800 mb-2">Chấm công thất bại</h2>
        <p className="text-stone-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {errMsg}
        </p>
        <button
          onClick={reset}
          className="mt-8 px-8 py-3 bg-rose-500 text-white rounded-xl font-medium
            hover:bg-rose-600 active:scale-95 transition-all"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
