"use client";
import { useState, useEffect } from "react";
import { DatabaseBackup, X, Download } from "lucide-react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "meisy_last_backup_date";
const REMIND_DAYS = 7; // nhắc mỗi 7 ngày

export default function BackupReminder() {
  const [show, setShow] = useState(false);
  const [daysSince, setDaysSince] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const lastBackup = localStorage.getItem(STORAGE_KEY);
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=CN, 1=T2

    if (!lastBackup) {
      // Chưa backup lần nào → hiện ngay
      setDaysSince(999);
      setShow(true);
      return;
    }

    const last = new Date(lastBackup);
    const diff = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    setDaysSince(diff);

    // Hiện banner nếu: đã quá 7 ngày HOẶC hôm nay là thứ 2 và chưa backup tuần này
    if (diff >= REMIND_DAYS || (dayOfWeek === 1 && diff >= 5)) {
      setShow(true);
    }
  }, []);

  function handleGoBackup() {
    router.push("/backup");
    setShow(false);
  }

  function handleDismiss() {
    // Bấm "Để sau" — ẩn 1 ngày
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    localStorage.setItem("meisy_remind_snooze", tomorrow.toISOString());
    setShow(false);
  }

  function markBackupDone() {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setShow(false);
  }

  if (!show) return null;

  const isUrgent = daysSince >= 14;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full shadow-xl rounded-2xl border p-4
      ${isUrgent
        ? "bg-red-50 border-red-200"
        : "bg-amber-50 border-amber-200"
      }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${isUrgent ? "bg-red-100" : "bg-amber-100"}`}>
          <DatabaseBackup size={20} className={isUrgent ? "text-red-500" : "text-amber-500"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${isUrgent ? "text-red-700" : "text-amber-700"}`}>
            {isUrgent ? "🚨 Chưa backup hơn 2 tuần!" : "⚠️ Nhắc backup dữ liệu"}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">
            {daysSince >= 999
              ? "Bạn chưa backup lần nào. Xuất file ngay để bảo vệ dữ liệu!"
              : `Lần backup cuối: ${daysSince} ngày trước. Nên backup mỗi tuần.`}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleGoBackup}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition
                ${isUrgent ? "bg-red-500 hover:bg-red-600" : "bg-amber-500 hover:bg-amber-600"}`}>
              <Download size={12} /> Backup ngay
            </button>
            <button
              onClick={markBackupDone}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition">
              Đã backup rồi ✓
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 transition">
              Để sau
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-slate-300 hover:text-slate-500 shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
