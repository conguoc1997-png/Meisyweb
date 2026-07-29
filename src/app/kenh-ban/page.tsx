"use client";
import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

type ChartDay = { date: string; shopee: number; tiktok: number; shopeeOrders: number; tiktokOrders: number };
type ChannelStat = { total: number; newOrders: number; shipping: number; done: number; cancelled: number; cancelledRevenue: number; revenue: number };
type Order = { id: number; createdAt: number; saleChannel: number; status: number; revenue: number; appOrderId: string; customerName: string };
type Data = { days: number; chart: ChartDay[]; shopee: ChannelStat; tiktok: ChannelStat; recentOrders: Order[] };

const DAYS_OPTIONS = [
  { label: "Hôm nay", value: 1 },
  { label: "7 ngày", value: 7 },
  { label: "14 ngày", value: 14 },
  { label: "30 ngày", value: 30 },
];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
}

function fmtDate(ts: number) {
  const d = new Date(ts * 1000);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function KenhBanPage() {
  const [days, setDays] = useState(1);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterChannel, setFilterChannel] = useState<"all" | "shopee" | "tiktok">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "shipping" | "done" | "cancelled">("all");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [includeCancel, setIncludeCancel] = useState(false);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/nhanh/orders?days=${d}`);
      const text = await res.text();
      let json: Data | null = null;
      try { json = JSON.parse(text); } catch { setError("Lỗi parse JSON: " + text.slice(0, 100)); return; }
      if (!res.ok) setError((json as unknown as { error?: string })?.error ?? `HTTP ${res.status}`);
      else { setData(json); setLastUpdated(new Date()); }
    } catch (e) {
      setError("Lỗi fetch: " + String(e));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  // Tự động cập nhật mỗi 5 phút
  useEffect(() => {
    const timer = setInterval(() => load(days), 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, [days, load]);

  // Dữ liệu đã lọc theo kênh
  const empty: ChannelStat = { total: 0, newOrders: 0, shipping: 0, done: 0, cancelled: 0, cancelledRevenue: 0, revenue: 0 };
  const shopee = data?.shopee ?? empty;
  const tiktok = data?.tiktok ?? empty;
  const visibleShopee = filterChannel !== "tiktok" ? shopee : empty;
  const visibleTiktok = filterChannel !== "shopee" ? tiktok : empty;
  const effectiveRevenue = (s: ChannelStat) => s.revenue + (includeCancel ? s.cancelledRevenue : 0);
  const effectiveTotal = (s: ChannelStat) => s.total + (includeCancel ? s.cancelled : 0);
  const totalRevenue = effectiveRevenue(visibleShopee) + effectiveRevenue(visibleTiktok);
  const totalOrders = effectiveTotal(visibleShopee) + effectiveTotal(visibleTiktok);

  const maxBar = data ? Math.max(...data.chart.map((d) => d.shopee + d.tiktok), 1) : 1;

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Kênh bán</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {lastUpdated ? `Cập nhật lúc ${lastUpdated.getHours()}:${String(lastUpdated.getMinutes()).padStart(2,"0")} · tự động mỗi 5 phút` : "Đang tải..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Filter kênh */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            {(["all","shopee","tiktok"] as const).map((ch) => (
              <button key={ch} onClick={() => setFilterChannel(ch)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterChannel === ch ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                {ch === "all" ? "Tất cả" : ch === "shopee" ? "🛍 Shopee" : "🎵 TikTok"}
              </button>
            ))}
          </div>
          {/* Filter ngày */}
          <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
            {DAYS_OPTIONS.map((o) => (
              <button key={o.value} onClick={() => setDays(o.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${days === o.value ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"}`}>
                {o.label}
              </button>
            ))}
          </div>
          <button onClick={() => setIncludeCancel(v => !v)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${includeCancel ? "bg-red-50 border-red-200 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            Hoàn/Hủy
          </button>
          <button onClick={() => load(days)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Làm mới">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {/* Tổng quan */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <span className="text-sm font-medium text-slate-700">Tổng quan</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 text-xs border-b border-slate-100">
              <th className="text-left px-4 py-2.5">Kênh bán</th>
              <th className="text-right px-4 py-2.5">Doanh thu</th>
              <th className="text-right px-4 py-2.5">% DT</th>
              <th className="text-right px-4 py-2.5">Số đơn</th>
              <th className="text-right px-4 py-2.5">Đơn mới</th>
              <th className="text-right px-4 py-2.5">Đang ship</th>
              <th className="text-right px-4 py-2.5">Hoàn/Hủy</th>
            </tr>
          </thead>
          <tbody>
            {/* Tổng */}
            <tr className="border-b border-slate-50 font-medium text-slate-700">
              <td className="px-4 py-2.5">Tổng</td>
              <td className="text-right px-4 py-2.5">{totalRevenue.toLocaleString("vi-VN")}đ</td>
              <td className="text-right px-4 py-2.5 text-slate-400">100%</td>
              <td className="text-right px-4 py-2.5">{totalOrders}</td>
              <td className="text-right px-4 py-2.5">{(data?.shopee.newOrders ?? 0) + (data?.tiktok.newOrders ?? 0)}</td>
              <td className="text-right px-4 py-2.5">{(data?.shopee.shipping ?? 0) + (data?.tiktok.shipping ?? 0)}</td>
              <td className="text-right px-4 py-2.5">{(data?.shopee.cancelled ?? 0) + (data?.tiktok.cancelled ?? 0)}</td>
            </tr>
            {/* Shopee */}
            {filterChannel !== "tiktok" && (
            <tr className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1.5"><span className="text-orange-500">🛍</span> Shopee</span></td>
              <td className="text-right px-4 py-2.5 text-slate-700">{effectiveRevenue(visibleShopee).toLocaleString("vi-VN")}đ</td>
              <td className="text-right px-4 py-2.5 text-slate-400">{totalRevenue ? Math.round(effectiveRevenue(visibleShopee) / totalRevenue * 100) : 0}%</td>
              <td className="text-right px-4 py-2.5">{effectiveTotal(visibleShopee)}</td>
              <td className="text-right px-4 py-2.5 text-blue-600">{visibleShopee.newOrders}</td>
              <td className="text-right px-4 py-2.5">{visibleShopee.shipping}</td>
              <td className="text-right px-4 py-2.5 text-red-500">{visibleShopee.cancelled}</td>
            </tr>
            )}
            {/* TikTok */}
            {filterChannel !== "shopee" && (
            <tr className="hover:bg-slate-50">
              <td className="px-4 py-2.5"><span className="inline-flex items-center gap-1.5"><span>🎵</span> TikTok</span></td>
              <td className="text-right px-4 py-2.5 text-slate-700">{effectiveRevenue(visibleTiktok).toLocaleString("vi-VN")}đ</td>
              <td className="text-right px-4 py-2.5 text-slate-400">{totalRevenue ? Math.round(effectiveRevenue(visibleTiktok) / totalRevenue * 100) : 0}%</td>
              <td className="text-right px-4 py-2.5">{effectiveTotal(visibleTiktok)}</td>
              <td className="text-right px-4 py-2.5 text-blue-600">{visibleTiktok.newOrders}</td>
              <td className="text-right px-4 py-2.5">{visibleTiktok.shipping}</td>
              <td className="text-right px-4 py-2.5 text-red-500">{visibleTiktok.cancelled}</td>
            </tr>
            )}
          </tbody>
        </table>
        {loading && <div className="h-1 bg-blue-100 animate-pulse" />}
      </div>

      {/* Biểu đồ doanh thu */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="text-sm font-medium text-slate-700 mb-4">Doanh thu theo thời gian</div>
        {data && (
          <div className="flex items-end gap-1 h-40">
            {data.chart.map((d) => {
              const total = d.shopee + d.tiktok;
              const shopeeH = total ? (d.shopee / maxBar) * 100 : 0;
              const tiktokH = total ? (d.tiktok / maxBar) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  <div className="absolute bottom-full mb-1 bg-slate-800 text-white text-xs rounded px-2 py-1 hidden group-hover:block whitespace-nowrap z-10">
                    <div>{d.date.slice(5)}</div>
                    <div className="text-orange-300">Shopee: {fmt(d.shopee)}đ ({d.shopeeOrders} đơn)</div>
                    <div className="text-slate-300">TikTok: {fmt(d.tiktok)}đ ({d.tiktokOrders} đơn)</div>
                  </div>
                  <div className="w-full flex flex-col justify-end" style={{ height: "120px" }}>
                    <div className="w-full bg-slate-800 rounded-t-sm" style={{ height: `${tiktokH}%` }} />
                    <div className="w-full bg-orange-400 rounded-t-sm" style={{ height: `${shopeeH}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{d.date.slice(5)}</div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-orange-400 rounded-sm inline-block" /> Shopee</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-slate-800 rounded-sm inline-block" /> TikTok</span>
        </div>
      </div>

      {/* Danh sách đơn */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Đơn hàng gần đây</span>
          <div className="flex gap-2 flex-wrap">
            {/* Filter kênh */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {(["all","shopee","tiktok"] as const).map((ch) => (
                <button key={ch} onClick={() => setFilterChannel(ch)}
                  className={`px-3 py-1.5 ${filterChannel === ch ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                  {ch === "all" ? "Tất cả" : ch === "shopee" ? "🛍 Shopee" : "🎵 TikTok"}
                </button>
              ))}
            </div>
            {/* Filter trạng thái */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {([
                ["all","Tất cả"],["shipping","Đang ship"],["new","Mới"],["done","Xong"],["cancelled","Hủy/Hoàn"]
              ] as const).map(([s,l]) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 ${filterStatus === s ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left px-4 py-2.5">Kênh</th>
                <th className="text-left px-4 py-2.5">Mã đơn</th>
                <th className="text-left px-4 py-2.5">Khách hàng</th>
                <th className="text-left px-4 py-2.5">Ngày</th>
                <th className="text-right px-4 py-2.5">Doanh thu</th>
                <th className="text-left px-4 py-2.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? [])
                .filter(o => filterChannel === "all" || (filterChannel === "shopee" ? o.saleChannel === 42 : o.saleChannel === 48))
                .filter(o => {
                  if (filterStatus === "all") return true;
                  if (filterStatus === "new") return [1,2].includes(o.status);
                  if (filterStatus === "shipping") return [5,6,56,57,58,59].includes(o.status);
                  if (filterStatus === "done") return [3,4].includes(o.status);
                  if (filterStatus === "cancelled") return [7,8,9,10,54,55].includes(o.status);
                  return true;
                })
                .map((o) => (
                <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-2">
                    {o.saleChannel === 42
                      ? <span className="text-orange-500 text-xs font-medium">Shopee</span>
                      : <span className="text-slate-700 text-xs font-medium">TikTok</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-500 font-mono">{o.appOrderId}</td>
                  <td className="px-4 py-2 text-slate-700">{o.customerName}</td>
                  <td className="px-4 py-2 text-slate-500 text-xs">{fmtDate(o.createdAt)}</td>
                  <td className="px-4 py-2 text-right text-slate-700">{o.revenue.toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-2"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {!loading && (data?.recentOrders ?? []).length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">Không có đơn hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  // Nhanh.vn order status codes
  if ([1, 2].includes(status)) return <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Mới</span>;
  if ([3, 4].includes(status)) return <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Hoàn thành</span>;
  if ([5, 6].includes(status)) return <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Đang ship</span>;
  if ([7, 8, 9, 10].includes(status)) return <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Hủy</span>;
  if ([54, 55].includes(status)) return <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">Hoàn hàng</span>;
  return <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{status}</span>;
}
