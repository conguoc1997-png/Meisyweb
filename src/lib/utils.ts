export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function genMaDoiTra(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `DT${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${Math.floor(Math.random() * 100)}`;
}

// chiPhi: chi phí shop bỏ ra để xử lý 1 case (tiền gửi hàng đổi cho khách)
export const LOAI_VAN_DE: Record<string, { label: string; color: string; phiShop: boolean; chiPhi: number }> = {
  doi_size:     { label: "Đổi size",     color: "bg-blue-100 text-blue-700",     phiShop: false, chiPhi: 25000 },
  gui_nham:     { label: "Gửi nhầm",     color: "bg-purple-100 text-purple-700", phiShop: true,  chiPhi: 25000 },
  hang_loi:     { label: "Hàng lỗi",     color: "bg-red-100 text-red-700",       phiShop: true,  chiPhi: 25000 },
  don_hang_loi: { label: "Đơn hàng lỗi", color: "bg-orange-100 text-orange-700", phiShop: true,  chiPhi: 25000 },
  khac:         { label: "Khác",          color: "bg-slate-100 text-slate-600",  phiShop: false, chiPhi: 0     },
};

export const TRANG_THAI_DOI_TRA: Record<string, { label: string; color: string }> = {
  cho_xu_ly: { label: "Chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  dang_xu_ly: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700" },
  da_gui:     { label: "Đã gửi",     color: "bg-indigo-100 text-indigo-700" },
  hoan_thanh: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
};

export const LOI_BU: Record<string, { label: string; color: string }> = {
  giao_nham:  { label: "Giao nhầm hàng", color: "bg-purple-100 text-purple-700" },
  hang_loi:   { label: "Hàng lỗi",       color: "bg-red-100 text-red-700"       },
  thieu_hang: { label: "Thiếu hàng",     color: "bg-orange-100 text-orange-700" },
  don_huy:    { label: "Đơn bị huỷ",     color: "bg-slate-100 text-slate-600"   },
  khac:       { label: "Khác",           color: "bg-gray-100 text-gray-600"     },
};

export const TRANG_THAI_BU: Record<string, { label: string; color: string }> = {
  cho_bu: { label: "Chờ bù", color: "bg-amber-100 text-amber-700" },
  da_bu:  { label: "Đã bù",  color: "bg-green-100 text-green-700" },
};

export const KENH_FEEDBACK: Record<string, { label: string; color: string }> = {
  shopee: { label: "Shopee", color: "bg-orange-100 text-orange-700" },
  tiktok: { label: "TikTok", color: "bg-slate-900 text-white" },
  khac:   { label: "Khác",   color: "bg-slate-100 text-slate-600" },
};

export const LOAI_FEEDBACK: Record<string, { label: string; color: string; icon: string }> = {
  chat_lieu:   { label: "Chất liệu",     color: "bg-orange-100 text-orange-700",  icon: "🧵" },
  size_form:   { label: "Size / Form",   color: "bg-blue-100 text-blue-700",      icon: "📐" },
  mau_sac:     { label: "Màu sắc",       color: "bg-pink-100 text-pink-700",      icon: "🎨" },
  dong_goi:    { label: "Đóng gói",      color: "bg-yellow-100 text-yellow-700",  icon: "📦" },
  van_chuyen:  { label: "Vận chuyển",    color: "bg-indigo-100 text-indigo-700",  icon: "🚚" },
  dich_vu:     { label: "Dịch vụ",       color: "bg-teal-100 text-teal-700",      icon: "💬" },
  khac:        { label: "Khác",          color: "bg-slate-100 text-slate-600",    icon: "📝" },
};

export const PLATFORM_LABEL: Record<string, string> = {
  shopee: "Shopee",
  tiktok: "TikTok",
  instagram: "Instagram",
  facebook: "Facebook",
  khac: "Khác",
};

export const TRANG_THAI_BOOKING: Record<string, string> = {
  dang_chay: "Đang chạy",
  ket_thuc: "Kết thúc",
  huy: "Huỷ",
};
