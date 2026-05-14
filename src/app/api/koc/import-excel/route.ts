export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

// POST /api/koc/import-excel
// Body: FormData với field "file" là file Excel
// Trả về preview: mỗi dòng gồm { row, kocName, koc, booking, luotXem, donHang, doanhThu, matched }
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Không có file" }, { status: 400 });

    // Đọc file
    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (rows.length === 0) return NextResponse.json({ error: "File trống hoặc không đọc được" }, { status: 400 });

    // Phát hiện tên cột tự động (case-insensitive, flexible)
    const headers = Object.keys(rows[0]);

    const findCol = (keywords: string[]) =>
      headers.find(h => keywords.some(kw => h.toLowerCase().includes(kw.toLowerCase()))) ?? null;

    const colTen     = findCol(["tên kênh", "ten kenh", "kênh", "kenh", "creator", "tên", "ten", "name", "channel"]);
    const colView    = findCol(["lượt xem", "luot xem", "view", "xem"]);
    const colOrder   = findCol(["đơn hàng", "don hang", "đơn", "order"]);
    const colRevenue = findCol(["doanh thu", "revenue", "doanh"]);

    if (!colTen) return NextResponse.json({ error: `Không tìm thấy cột tên kênh. Các cột hiện có: ${headers.join(", ")}` }, { status: 400 });

    // Lấy toàn bộ KOC + booking đang chạy
    const kocs = await prisma.kOC.findMany();
    const bookings = await prisma.kOCBooking.findMany({
      where: { trangThai: { in: ["dang_chay", "ket_thuc"] } },
      include: { koc: true, sanPham: true },
      orderBy: { createdAt: "desc" },
    });

    // Normalize tên để so sánh
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

    const preview = rows.map((row, idx) => {
      const kocName  = String(row[colTen!] ?? "").trim();
      const luotXem  = colView    ? Number(String(row[colView]).replace(/[^0-9.]/g, ""))    || 0 : 0;
      const donHang  = colOrder   ? Number(String(row[colOrder]).replace(/[^0-9.]/g, ""))   || 0 : 0;
      const doanhThu = colRevenue ? Number(String(row[colRevenue]).replace(/[^0-9.]/g, "")) || 0 : 0;

      // Match KOC
      const matchedKoc = kocs.find(k => norm(k.ten) === norm(kocName))
        ?? kocs.find(k => norm(kocName).includes(norm(k.ten)) || norm(k.ten).includes(norm(kocName)));

      // Tìm booking gần nhất của KOC này
      const matchedBooking = matchedKoc
        ? bookings.find(b => b.kocId === matchedKoc.id) ?? null
        : null;

      return {
        rowIndex: idx,
        kocName,
        kocId:      matchedKoc?.id     ?? null,
        kocTen:     matchedKoc?.ten    ?? null,
        bookingId:  matchedBooking?.id ?? null,
        bookingSP:  matchedBooking?.sanPham?.ten ?? null,
        luotXem,
        donHang,
        doanhThu,
        matched: !!matchedKoc && !!matchedBooking,
      };
    }).filter(r => r.kocName !== "");

    return NextResponse.json({ preview, columns: { colTen, colView, colOrder, colRevenue } });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
