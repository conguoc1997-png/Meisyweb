"use client";
import { useState, useRef } from "react";
import { Download, Upload, CheckCircle, AlertTriangle, Database, RefreshCw } from "lucide-react";

export default function BackupPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Export ──────────────────────────────────────────────
  async function handleExport() {
    setExporting(true);
    setResult(null);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Export thất bại");
      const data = await res.json();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `meisy-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Tổng số records
      const total = Object.values(data.tables as Record<string, unknown[]>)
        .reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
      setResult({ type: "success", msg: `✅ Xuất thành công ${total} records — file: meisy-backup-${date}.json` });
    } catch (e) {
      setResult({ type: "error", msg: "❌ " + (e instanceof Error ? e.message : "Lỗi export") });
    }
    setExporting(false);
  }

  // ── Import ──────────────────────────────────────────────
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm(`⚠️ Import sẽ GHI ĐÈ data hiện tại bằng file "${file.name}".\n\nBạn chắc chắn không?`)) {
      e.target.value = "";
      return;
    }
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const total = Object.values(json.restored as Record<string, number>).reduce((s, n) => s + n, 0);
      const detail = Object.entries(json.restored as Record<string, number>)
        .filter(([, n]) => n > 0)
        .map(([k, n]) => `${k}: ${n}`)
        .join(", ");
      setResult({ type: "success", msg: `✅ Restore thành công ${total} records\n${detail}` });
    } catch (e) {
      setResult({ type: "error", msg: "❌ " + (e instanceof Error ? e.message : "File lỗi hoặc không hợp lệ") });
    }
    setImporting(false);
    e.target.value = "";
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Database size={24} className="text-indigo-600" /> Backup & Restore
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Xuất toàn bộ dữ liệu ra file JSON và khôi phục khi cần
        </p>
      </div>

      {/* Hướng dẫn */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
        <p className="font-semibold">⚠️ Khuyến nghị backup mỗi tuần</p>
        <p>Supabase Free tier có thể mất data bất ngờ. File backup giúp bạn khôi phục toàn bộ dữ liệu.</p>
      </div>

      {/* Export */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Download size={18} className="text-indigo-500" /> Xuất dữ liệu (Export)
        </h2>
        <p className="text-sm text-slate-500">
          Tải về file <code className="bg-slate-100 px-1 rounded">.json</code> chứa toàn bộ:
          Đổi trả, Lô cắt, Vải tồn, KOC, Nhập kho, Vật tư, Chấm công...
        </p>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {exporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
          {exporting ? "Đang xuất..." : "Xuất toàn bộ dữ liệu"}
        </button>
      </div>

      {/* Import */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <Upload size={18} className="text-emerald-500" /> Khôi phục dữ liệu (Import)
        </h2>
        <p className="text-sm text-slate-500">
          Chọn file <code className="bg-slate-100 px-1 rounded">meisy-backup-*.json</code> đã xuất trước đó để restore.
          Data hiện tại sẽ được <span className="text-amber-600 font-medium">ghi đè</span>.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {importing ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
          {importing ? "Đang khôi phục..." : "Chọn file backup để restore"}
        </button>
      </div>

      {/* Kết quả */}
      {result && (
        <div className={`flex gap-3 p-4 rounded-xl text-sm whitespace-pre-line ${
          result.type === "success"
            ? "bg-green-50 border border-green-200 text-green-800"
            : "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {result.type === "success"
            ? <CheckCircle size={18} className="shrink-0 mt-0.5" />
            : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
          <span>{result.msg}</span>
        </div>
      )}

      {/* Lịch nhắc */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-600">📅 Lịch backup đề xuất:</p>
        <p>• Mỗi <strong>thứ 2</strong> đầu tuần — trước khi bắt đầu làm việc</p>
        <p>• Sau mỗi lần <strong>nhập liệu lớn</strong> (lô cắt mới, nhập kho...)</p>
        <p>• Trước khi <strong>deploy code mới</strong></p>
      </div>
    </div>
  );
}
