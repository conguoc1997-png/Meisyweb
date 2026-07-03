"use client";
import QRCode from "react-qr-code";
import { useState } from "react";
import { Printer, MapPin } from "lucide-react";

const CHECKIN_URL = "https://meisyweb.vercel.app/checkin";

export default function QRPage() {
  const [size, setSize] = useState(256);

  return (
    <div className="min-h-screen bg-[#fdfaf8] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">Mã QR Chấm công</h1>
          <p className="text-stone-400 text-sm mt-1">In và dán tại cổng xưởng</p>
        </div>

        {/* QR Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-stone-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl border-2 border-stone-100">
              <QRCode
                value={CHECKIN_URL}
                size={size}
                bgColor="#ffffff"
                fgColor="#1c1917"
                level="M"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-stone-500 text-sm mb-2">
            <MapPin size={14} className="text-rose-400" />
            <span>Quét để chấm công</span>
          </div>
          <p className="text-stone-300 text-xs">{CHECKIN_URL}</p>
        </div>

        {/* Hướng dẫn */}
        <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-sm text-amber-800 space-y-1.5">
          <p className="font-semibold text-amber-900">Hướng dẫn nhân viên:</p>
          <p>1. Mở camera điện thoại → quét mã QR</p>
          <p>2. Bấm <strong>Đồng ý</strong> cho phép truy cập vị trí</p>
          <p>3. Chọn tên của mình → chấm công tự động</p>
        </div>

        {/* Nút in */}
        <div className="mt-6 flex gap-3">
          <select
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            className="flex-1 px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-600 bg-white"
          >
            <option value={200}>Nhỏ (200px)</option>
            <option value={256}>Vừa (256px)</option>
            <option value={320}>Lớn (320px)</option>
          </select>
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
              bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600
              active:scale-95 transition-all text-sm"
          >
            <Printer size={16} />
            In QR
          </button>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .qr-print, .qr-print * { visibility: visible; }
        }
      `}</style>
    </div>
  );
}
