"use client";
import { useEffect, useState } from "react";
import { MapPin, Loader2, LogIn, LogOut, Timer, ChevronRight, Check, Clock, Search, ArrowLeft } from "lucide-react";

type NhanVien = {
  id: string; ten: string; maNV: string; phongBan?: string;
  loaiLuong: string;
  caLamViec?: { gioVao: string; gioRa: string; nghiTrua: number } | null;
  homNay?: { gioVao?: string; gioRa?: string; trangThai?: string } | null;
};
type Step = "xin-vitri" | "lay-vitri" | "chon-nv" | "dang-gui" | "thanh-cong" | "loi";
type ResultData = { action: string; time: string; location: string; tongGio?: number; tangCa?: number; gioVao?: string; diMuon?: boolean; phutMuon?: number; gioVaoCa?: string };

function isWebView() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iosWV = /iPhone|iPad|iPod/.test(ua) && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
  const andWV = /Android/.test(ua) && /wv/.test(ua);
  return iosWV || andWV;
}
function isIOS() {
  return typeof navigator !== "undefined" && /iPhone|iPad|iPod/.test(navigator.userAgent);
}

// Màu avatar theo phòng ban / tên
const AVATAR_COLORS = [
  "bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500",
  "bg-rose-500","bg-cyan-500","bg-fuchsia-500","bg-orange-500",
];
function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}
function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Clock24() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

function todayLabel() {
  const d = new Date();
  return `${["CN","T2","T3","T4","T5","T6","T7"][d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

export default function CheckInPage() {
  const [dsNV, setDsNV]           = useState<NhanVien[]>([]);
  const [selected, setSelected]   = useState<NhanVien | null>(null);
  const [step, setStep]           = useState<Step>("xin-vitri");
  const [result, setResult]       = useState<ResultData | null>(null);
  const [errMsg, setErrMsg]       = useState("");
  const [search, setSearch]       = useState("");
  const [coords, setCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [inWebView, setInWebView] = useState(false);
  const [copied, setCopied]       = useState(false);

  useEffect(() => {
    setInWebView(isWebView());
    fetch("/api/checkin").then(r => r.json()).then(d => setDsNV(Array.isArray(d) ? d : []));
  }, []);

  function xinViTri() {
    if (!navigator.geolocation) { setErrMsg("no-geo"); setStep("loi"); return; }
    setStep("lay-vitri");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStep("chon-nv"); },
      (err) => { setErrMsg(err.code === 1 ? "denied" : "fail"); setStep("loi"); },
      { timeout: 15000, maximumAge: 0, enableHighAccuracy: true }
    );
  }

  async function handleCheckin(nv: NhanVien) {
    if (!coords) return;
    setSelected(nv); setStep("dang-gui"); setErrMsg("");
    try {
      const res  = await fetch("/api/checkin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nhanVienId: nv.id, lat: coords.lat, lng: coords.lng }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setErrMsg(data.error || "Lỗi không xác định"); setStep("loi"); }
      else { setResult(data); setStep("thanh-cong"); }
    } catch { setErrMsg("Không thể kết nối máy chủ"); setStep("loi"); }
  }

  function reset() {
    setStep("xin-vitri"); setSelected(null); setResult(null); setErrMsg(""); setSearch(""); setCoords(null);
    fetch("/api/checkin").then(r => r.json()).then(d => setDsNV(Array.isArray(d) ? d : []));
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  const filtered = dsNV.filter(nv =>
    nv.ten.toLowerCase().includes(search.toLowerCase()) ||
    nv.maNV.toLowerCase().includes(search.toLowerCase())
  );

  // ── Webview: hướng dẫn mở trình duyệt ───────────────────────────
  if (step === "xin-vitri" && inWebView) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center mx-auto mb-4 text-4xl">📱</div>
            <h1 className="text-white text-xl font-bold mb-2">Cần mở trong trình duyệt</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Camera app không thể truy cập GPS.<br/>
              Hãy mở link trong <span className="text-amber-400 font-semibold">{isIOS() ? "Safari" : "Chrome"}</span>.
            </p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-5 mb-5 space-y-4">
            <p className="text-slate-300 text-xs uppercase tracking-widest font-semibold">Các bước thực hiện</p>
            {isIOS() ? (
              <>
                <Step label="1" text={<>Bấm nút <span className="text-white font-bold">Chia sẻ ⬜↑</span> ở dưới màn hình</>} />
                <Step label="2" text={<>Chọn <span className="text-amber-400 font-bold">"Mở trong Safari"</span></>} />
                <Step label="3" text="Bấm Cho phép khi hỏi vị trí" />
              </>
            ) : (
              <>
                <Step label="1" text={<>Bấm <span className="text-white font-bold">⋮</span> góc trên phải</>} />
                <Step label="2" text={<>Chọn <span className="text-amber-400 font-bold">"Mở trong Chrome"</span></>} />
                <Step label="3" text="Bấm Cho phép khi hỏi vị trí" />
              </>
            )}
          </div>

          <button onClick={copyLink}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all active:scale-[0.98]
              ${copied ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-200 hover:bg-slate-600"}`}>
            {copied ? "✓ Đã copy!" : "📋 Copy link để dán vào trình duyệt"}
          </button>
        </div>
      </div>
    );
  }

  // ── Xin vị trí ───────────────────────────────────────────────────
  if (step === "xin-vitri") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 pb-4">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-rose-500/20 rounded-[28px] flex items-center justify-center mx-auto mb-6">
              <MapPin size={44} className="text-rose-400" />
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">Chấm công</h1>
            <p className="text-slate-400 text-base">{todayLabel()}</p>
            <p className="text-rose-400 text-2xl font-mono font-semibold mt-1"><Clock24 /></p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button onClick={xinViTri}
              className="w-full py-5 bg-rose-500 text-white rounded-2xl font-bold text-lg
                hover:bg-rose-600 active:scale-[0.98] transition-all shadow-xl shadow-rose-500/30">
              📍 Xác định vị trí của tôi
            </button>
            <p className="text-center text-slate-500 text-xs">Khi hỏi quyền vị trí → bấm "Cho phép"</p>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-slate-600 text-xs">Meisy · Hệ thống chấm công GPS</p>
        </div>
      </div>
    );
  }

  // ── Đang lấy vị trí / gửi ────────────────────────────────────────
  if (step === "lay-vitri" || step === "dang-gui") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5">
        <div className="text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 size={36} className="text-rose-400 animate-spin" />
          </div>
          <p className="text-white font-semibold text-xl mb-2">
            {step === "lay-vitri" ? "Đang lấy GPS..." : "Đang xác nhận..."}
          </p>
          <p className="text-slate-400 text-sm">
            {step === "lay-vitri" ? "Vui lòng chờ trong giây lát" : selected?.ten}
          </p>
        </div>
      </div>
    );
  }

  // ── Chọn nhân viên ───────────────────────────────────────────────
  if (step === "chon-nv") {
    const daCham  = filtered.filter(nv => nv.homNay?.gioVao);
    const chuaCham = filtered.filter(nv => !nv.homNay?.gioVao);

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-5 pt-12 pb-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-white text-xl font-bold">Chọn tên của bạn</h1>
            <div className="text-right">
              <p className="text-rose-400 font-mono font-semibold text-base"><Clock24 /></p>
              <p className="text-slate-500 text-xs">{todayLabel()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Đã xác định vị trí</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text" placeholder="Tìm tên hoặc mã NV..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 text-white placeholder-slate-500 pl-10 pr-4 py-3
                rounded-xl border border-slate-700 focus:outline-none focus:border-rose-500 text-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6">
          {/* Chưa chấm */}
          {chuaCham.length > 0 && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">Chưa chấm hôm nay</p>
              <div className="space-y-2">
                {chuaCham.map(nv => {
                  const hasVao = !!nv.homNay?.gioVao;
                  return (
                    <button key={nv.id} onClick={() => handleCheckin(nv)}
                      className="w-full flex items-center gap-4 bg-slate-800 hover:bg-slate-750
                        border border-slate-700 hover:border-rose-500/50 rounded-2xl px-4 py-3.5
                        transition-all active:scale-[0.98] text-left">
                      <div className={`w-12 h-12 ${avatarColor(nv.ten)} rounded-xl flex items-center
                        justify-center text-white font-bold text-base flex-shrink-0`}>
                        {initials(nv.ten)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-[15px] truncate">{nv.ten}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}
                          {nv.caLamViec ? ` · ${nv.caLamViec.gioVao}–${nv.caLamViec.gioRa}` : ""}
                        </p>
                      </div>
                      {hasVao && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30
                          px-2 py-1 rounded-lg font-medium flex-shrink-0">
                          Vào {nv.homNay?.gioVao}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Đã chấm đủ */}
          {daCham.filter(nv => nv.homNay?.gioVao && nv.homNay?.gioRa).length > 0 && (
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3">Đã chấm đủ hôm nay</p>
              <div className="space-y-2">
                {daCham.filter(nv => nv.homNay?.gioVao && nv.homNay?.gioRa).map(nv => (
                  <div key={nv.id}
                    className="w-full flex items-center gap-4 bg-slate-800/50 rounded-2xl px-4 py-3.5 opacity-50">
                    <div className={`w-12 h-12 ${avatarColor(nv.ten)} rounded-xl flex items-center
                      justify-center text-white font-bold text-base flex-shrink-0 grayscale`}>
                      {initials(nv.ten)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 font-semibold text-[15px] truncate">{nv.ten}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{nv.maNV}{nv.phongBan ? ` · ${nv.phongBan}` : ""}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-emerald-500">
                        <Check size={12} />
                        <span className="text-xs font-medium">Hoàn thành</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {nv.homNay?.gioVao} → {nv.homNay?.gioRa}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-500">Không tìm thấy nhân viên</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Thành công ────────────────────────────────────────────────────
  if (step === "thanh-cong" && result) {
    const isVao = result.action === "vao";
    const isRa  = result.action === "ra";
    const isTC  = result.action === "tang_ca";

    const isMuon = isVao && result.diMuon;
    const accent = isTC ? "amber" : isMuon ? "orange" : isVao ? "blue" : "emerald";
    const accentMap: Record<string, string> = {
      amber:   "bg-amber-500 text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-amber-500/20",
      orange:  "bg-orange-500 text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-orange-500/20",
      blue:    "bg-blue-500 text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-blue-500/20",
      emerald: "bg-emerald-500 text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20",
    };
    const [btnBg, textColor, iconBg, iconBorder, shadowColor] = accentMap[accent].split(" ");

    const icon  = isTC ? "⏰" : isMuon ? "⚠️" : isVao ? "🟢" : "🏁";
    const title = isTC ? "Đã ghi tăng ca!" : isMuon ? "Vào muộn!" : isVao ? "Chấm VÀO thành công!" : "Chấm RA thành công!";

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm text-center">
          {/* Big icon */}
          <div className={`w-28 h-28 ${iconBg} border-2 ${iconBorder} rounded-3xl flex items-center
            justify-center mx-auto mb-6 text-5xl shadow-2xl ${shadowColor}`}>
            {icon}
          </div>

          <h2 className="text-white text-2xl font-bold mb-1">{title}</h2>
          <p className={`text-lg font-semibold mb-1 ${textColor}`}>{selected?.ten}</p>
          <p className="text-slate-500 text-sm">{todayLabel()}</p>

          {/* Banner muộn */}
          {isMuon && (
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-2.5 mt-4">
              <p className="text-orange-400 text-sm font-semibold">
                Muộn {result.phutMuon} phút so với ca ({result.gioVaoCa})
              </p>
              <p className="text-slate-400 text-xs mt-0.5">Đã tự động ghi trạng thái "Đi muộn"</p>
            </div>
          )}

          {/* Info card */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mt-4 space-y-3 text-left">
            <InfoRow label="Thời gian" value={result.time} valueClass="text-white font-bold" />
            <InfoRow label="Địa điểm"  value={result.location} valueClass="text-slate-300" />
            {isRa && result.gioVao && (
              <InfoRow label="Vào lúc" value={result.gioVao} valueClass="text-slate-300" />
            )}
            {isRa && result.tongGio != null && (
              <InfoRow label="Tổng giờ làm" value={`${result.tongGio}h`} valueClass={`${textColor} font-bold`} />
            )}
            {isTC && result.tangCa != null && (
              <InfoRow label="Tăng ca" value={`+${result.tangCa}h`} valueClass="text-amber-400 font-bold" />
            )}
          </div>

          <button onClick={reset}
            className={`mt-6 w-full py-4 ${btnBg} text-white rounded-2xl font-bold text-base
              active:scale-[0.98] transition-all shadow-xl ${shadowColor}`}>
            Xong
          </button>
        </div>
      </div>
    );
  }

  // ── Lỗi ──────────────────────────────────────────────────────────
  const isDenied = errMsg === "denied" || errMsg === "no-geo";
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-5 pb-10">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 bg-red-500/10 border-2 border-red-500/30 rounded-3xl flex items-center
          justify-center mx-auto mb-6 text-5xl">
          {isDenied ? "🔒" : "❌"}
        </div>

        <h2 className="text-white text-xl font-bold mb-1">
          {isDenied ? "Chưa bật vị trí" : "Chấm công thất bại"}
        </h2>

        {errMsg === "denied" && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-5 py-4 mt-4 text-left space-y-2">
            <p className="text-amber-400 text-sm font-semibold">
              {isIOS() ? "Cách bật trên iPhone:" : "Cách bật trên Android:"}
            </p>
            {isIOS() ? (
              <p className="text-slate-300 text-sm">Cài đặt → Safari → Vị trí → <strong>Cho phép</strong></p>
            ) : (
              <p className="text-slate-300 text-sm">Cài đặt → Chrome → Quyền → Vị trí → <strong>Cho phép</strong></p>
            )}
            <p className="text-slate-500 text-xs">Sau đó quay lại và bấm Thử lại</p>
          </div>
        )}

        {errMsg === "no-geo" && (
          <p className="text-slate-400 text-sm bg-slate-800 rounded-2xl px-5 py-4 mt-4">
            Trình duyệt không hỗ trợ GPS.<br/>Dùng Safari (iPhone) hoặc Chrome (Android).
          </p>
        )}

        {errMsg !== "denied" && errMsg !== "no-geo" && errMsg && (
          <p className="text-slate-400 text-sm bg-slate-800 rounded-2xl px-5 py-4 mt-4">
            {errMsg}
          </p>
        )}

        <button onClick={reset}
          className="mt-6 w-full py-4 bg-rose-500 text-white rounded-2xl font-bold text-base
            active:scale-[0.98] transition-all hover:bg-rose-600">
          ← Thử lại
        </button>
      </div>
    </div>
  );
}

function Step({ label, text }: { label: string; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center
        justify-center text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5">
        {label}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
