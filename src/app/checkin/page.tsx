"use client";
import { useEffect, useState } from "react";
import { MapPin, CheckCircle, XCircle, Loader2, User, Clock, LogIn, LogOut, Timer } from "lucide-react";

type NhanVien = {
  id: string; ten: string; maNV: string; phongBan?: string;
  loaiLuong: string;
  caLamViec?: { gioVao: string; gioRa: string; nghiTrua: number } | null;
  homNay?: { gioVao?: string; gioRa?: string; trangThai?: string } | null;
};

type Step = "xin-vitri" | "lay-vitri" | "chon-nv" | "dang-gui" | "thanh-cong" | "loi";
type ResultData = { action: string; time: string; location: string; tongGio?: number; tangCa?: number; gioVao?: string };

// Phát hiện webview (camera app mở link — không có quyền GPS)
function isWebView() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iOS webview: có AppleWebKit nhưng KHÔNG có Safari/
  const iosWebView = /iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
  // Android webview
  const androidWebView = /Android/.test(ua) && /wv/.test(ua);
  return iosWebView || androidWebView;
}
function isIOS() {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
}

export default function CheckInPage() {
  const [dsNV, setDsNV]         = useState<NhanVien[]>([]);
  const [selected, setSelected] = useState<NhanVien | null>(null);
  const [step, setStep]         = useState<Step>("xin-vitri");
  const [result, setResult]     = useState<ResultData | null>(null);
  const [errMsg, setErrMsg]     = useState("");
  const [search, setSearch]     = useState("");
  const [coords, setCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [inWebView, setInWebView] = useState(false);

  useEffect(() => {
    setInWebView(isWebView());
    fetch("/api/checkin")
      .then(r => r.json())
      .then(data => setDsNV(Array.isArray(data) ? data : []));
  }, []);

  function moTrongTrinh() {
    // Mở lại trang trong trình duyệt thật
    const url = window.location.href;
    if (isIOS()) {
      window.location.href = url; // iOS Safari sẽ hỏi "Mở trong Safari?"
    } else {
      // Android: thử intent
      window.location.href = "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;end";
    }
  }

  function xinViTri() {
    if (!navigator.geolocation) {
      setErrMsg("no-geo");
      setStep("loi"); return;
    }
    setStep("lay-vitri");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStep("chon-nv");
      },
      (err) => {
        setErrMsg(err.code === 1 ? "denied" : "fail");
        setStep("loi");
      },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  }

  const filtered = dsNV.filter(nv =>
    nv.ten.toLowerCase().includes(search.toLowerCase()) ||
    nv.maNV.toLowerCase().includes(search.toLowerCase())
  );

  // Badge trạng thái hôm nay
  function StatusBadge({ nv }: { nv: NhanVien }) {
    const h = nv.homNay;
    if (!h?.gioVao) return null;
    if (h.gioVao && h.gioRa)
      return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Vào {h.gioVao} · Ra {h.gioRa}</span>;
    return <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Vào {h.gioVao}</span>;
  }

  async function handleCheckin(nv: NhanVien) {
    if (!coords) return;
    setSelected(nv);
    setStep("dang-gui");
    setErrMsg("");
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nhanVienId: nv.id, lat: coords.lat, lng: coords.lng }),
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
  }

  function reset() {
    setStep("xin-vitri"); setSelected(null); setResult(null); setErrMsg(""); setSearch(""); setCoords(null);
    fetch("/api/checkin").then(r => r.json()).then(data => setDsNV(Array.isArray(data) ? data : []));
  }

  // ── Xin vị trí ───────────────────────────────────────────────────
  if (step === "xin-vitri") {
    // Đang trong webview (camera app) → không lấy được GPS → bảo mở Safari/Chrome
    if (inWebView) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-5">📱</div>
            <h1 className="text-xl font-bold text-stone-800 mb-2">Mở bằng trình duyệt</h1>
            <p className="text-stone-500 text-sm mb-6">
              Camera app không hỗ trợ GPS.<br/>
              Hãy mở trang này trong{" "}
              <strong>{isIOS() ? "Safari" : "Chrome"}</strong> để chấm công.
            </p>
            <div className="bg-white border border-amber-200 rounded-2xl px-5 py-4 mb-6 text-left space-y-2">
              {isIOS() ? (
                <>
                  <p className="text-sm text-stone-600">1. Bấm nút <strong>Chia sẻ</strong> (⬜↑) ở góc màn hình</p>
                  <p className="text-sm text-stone-600">2. Chọn <strong>"Mở trong Safari"</strong></p>
                </>
              ) : (
                <>
                  <p className="text-sm text-stone-600">1. Bấm <strong>⋮</strong> góc trên phải</p>
                  <p className="text-sm text-stone-600">2. Chọn <strong>"Mở trong Chrome"</strong></p>
                </>
              )}
            </div>
            <p className="text-stone-300 text-xs">hoặc copy link và dán vào trình duyệt</p>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(()=>{}); }}
              className="mt-3 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl text-sm"
            >
              📋 Copy link
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <MapPin size={40} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Chấm công</h1>
          <p className="text-stone-400 text-sm mb-8">Hệ thống cần xác nhận bạn đang ở<br/>trong khu vực làm việc</p>
          <button
            onClick={xinViTri}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-semibold text-lg
              hover:bg-rose-600 active:scale-[0.98] transition-all shadow-lg shadow-rose-200"
          >
            📍 Xác định vị trí của tôi
          </button>
          <p className="text-stone-300 text-xs mt-4">Khi hỏi quyền vị trí → bấm "Cho phép"</p>
        </div>
      </div>
    );
  }

  // ── Đang lấy vị trí ──────────────────────────────────────────────
  if (step === "lay-vitri") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={48} className="text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium text-lg">Đang lấy vị trí GPS...</p>
          <p className="text-stone-400 text-sm mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // ── Chọn nhân viên ───────────────────────────────────────────────
  if (step === "chon-nv") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin size={32} className="text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Chấm công</h1>
            <p className="text-stone-400 text-sm mt-1">Chọn tên của bạn</p>
          </div>

          <input
            type="text"
            placeholder="🔍 Tìm tên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-700
              placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-300 mb-3 text-base"
          />

          <div className="space-y-2 max-h-[65vh] overflow-y-auto pb-4">
            {filtered.length === 0 && (
              <p className="text-center text-stone-400 py-8">Không tìm thấy</p>
            )}
            {filtered.map(nv => {
              const h = nv.homNay;
              const daDu = !!(h?.gioVao && h?.gioRa);
              return (
                <button
                  key={nv.id}
                  onClick={() => !daDu && handleCheckin(nv)}
                  disabled={daDu}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl
                    border transition-all text-left shadow-sm
                    ${daDu
                      ? "border-emerald-100 bg-emerald-50/50 opacity-70 cursor-default"
                      : "border-stone-100 hover:border-rose-300 hover:bg-rose-50/50 active:scale-[0.98]"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                    ${daDu ? "bg-emerald-100" : "bg-rose-100"}`}>
                    <User size={18} className={daDu ? "text-emerald-500" : "text-rose-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-700 text-[15px] truncate">{nv.ten}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-stone-400">{nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}</span>
                      <StatusBadge nv={nv} />
                    </div>
                  </div>
                  {nv.caLamViec && !daDu && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[11px] text-stone-400">{nv.caLamViec.gioVao}–{nv.caLamViec.gioRa}</p>
                      <p className="text-[10px] text-stone-300">
                        {nv.loaiLuong === "gio" ? "Theo giờ" : "Cố định"}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Đang gửi ─────────────────────────────────────────────────────
  if (step === "dang-gui") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <Loader2 size={48} className="text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium text-lg">Đang xác nhận...</p>
          <p className="text-stone-400 text-sm mt-2">{selected?.ten}</p>
        </div>
      </div>
    );
  }

  // ── Thành công ────────────────────────────────────────────────────
  if (step === "thanh-cong" && result) {
    const isVao = result.action === "vao";
    const isRa  = result.action === "ra";
    const isTC  = result.action === "tang_ca";

    const bgColor = isTC ? "from-amber-50" : isVao ? "from-blue-50" : "from-emerald-50";
    const icon    = isTC
      ? <Timer size={64} className="text-amber-500 mx-auto mb-4" />
      : isVao
      ? <LogIn size={64} className="text-blue-500 mx-auto mb-4" />
      : <LogOut size={64} className="text-emerald-500 mx-auto mb-4" />;
    const title   = isTC ? "Đã ghi tăng ca!" : isVao ? "Chấm VÀO thành công!" : "Chấm RA thành công!";
    const color   = isTC ? "text-amber-600" : isVao ? "text-blue-600" : "text-emerald-600";

    return (
      <div className={`min-h-screen bg-gradient-to-b ${bgColor} to-white flex flex-col items-center justify-center px-4`}>
        <div className="text-center max-w-sm">
          {icon}
          <h2 className="text-2xl font-bold text-stone-800 mb-1">{title}</h2>
          <p className="text-stone-500 text-lg mb-1">{selected?.ten}</p>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm px-6 py-5 mt-5 space-y-3 text-left">
            <Row label="Thời gian" value={result.time} />
            <Row label="Địa điểm"  value={result.location} />
            {isRa && result.gioVao && (
              <Row label="Vào lúc" value={result.gioVao} />
            )}
            {isRa && result.tongGio != null && (
              <Row label="Tổng giờ làm" value={`${result.tongGio}h`} highlight={color} />
            )}
            {isTC && result.tangCa != null && (
              <Row label="Tăng ca" value={`${result.tangCa}h`} highlight="text-amber-600" />
            )}
            <Row label="Trạng thái"
              value={isTC ? "⏰ Tăng ca" : isVao ? "🟢 Vào làm" : "🏠 Tan ca"}
              highlight={color} />
          </div>

          <button
            onClick={reset}
            className={`mt-8 px-8 py-3 rounded-xl font-medium active:scale-95 transition-all text-white
              ${isTC ? "bg-amber-500 hover:bg-amber-600" : isVao ? "bg-blue-500 hover:bg-blue-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
          >
            Xong
          </button>
        </div>
      </div>
    );
  }

  // ── Lỗi ──────────────────────────────────────────────────────────
  const isDenied = errMsg === "denied" || errMsg === "no-geo";
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">{isDenied ? "🔒" : "❌"}</div>
        <h2 className="text-xl font-bold text-stone-800 mb-3">
          {isDenied ? "Chưa bật vị trí" : "Chấm công thất bại"}
        </h2>

        {errMsg === "denied" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 text-left space-y-2">
            {isIOS() ? (
              <>
                <p className="text-sm font-semibold text-amber-800">Cách bật trên iPhone:</p>
                <p className="text-sm text-stone-600">Cài đặt → Safari → Vị trí → <strong>Cho phép</strong></p>
                <p className="text-xs text-stone-400">Sau đó quay lại và thử lại</p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-amber-800">Cách bật trên Android:</p>
                <p className="text-sm text-stone-600">Cài đặt → Ứng dụng → Chrome → Quyền → Vị trí → <strong>Cho phép</strong></p>
                <p className="text-xs text-stone-400">Sau đó quay lại và thử lại</p>
              </>
            )}
          </div>
        )}

        {errMsg === "no-geo" && (
          <p className="text-stone-500 text-sm bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-5">
            Trình duyệt không hỗ trợ GPS.<br/>Hãy dùng Safari (iPhone) hoặc Chrome (Android).
          </p>
        )}

        {errMsg !== "denied" && errMsg !== "no-geo" && (
          <p className="text-stone-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
            {errMsg}
          </p>
        )}

        <button
          onClick={reset}
          className="w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 active:scale-95 transition-all"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-stone-400">{label}</span>
      <span className={`font-semibold ${highlight || "text-stone-700"}`}>{value}</span>
    </div>
  );
}
