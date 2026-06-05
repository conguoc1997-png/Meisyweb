export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── Helpers ─────────────────────────────────────────────────────────────────

function extractSheetId(url: string): { id: string; gid: string } | null {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  if (!idMatch) return null;
  return { id: idMatch[1], gid: gidMatch?.[1] ?? "0" };
}

function parseCSV(text: string): string[][] {
  const records: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (ch === '"') {
      if (inQuotes && next === '"') { field += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      current.push(field.trim()); field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      current.push(field.trim());
      records.push(current);
      current = []; field = "";
    } else {
      field += ch;
    }
  }
  current.push(field.trim());
  if (current.some(f => f)) records.push(current);
  return records;
}

function parseNum(s: string): number {
  // Xử lý số kiểu VN: "1.234.567" hoặc "1,234,567" hoặc "1234567"
  const cleaned = s.replace(/\s/g, "").replace(/[.,](?=\d{3})/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// ── POST /api/koc/import-sheet ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json() as { url: string };
    const parsed = extractSheetId(url);
    if (!parsed) {
      return NextResponse.json({ error: "Link không hợp lệ. Vui lòng dùng link Google Sheets công khai." }, { status: 400 });
    }

    // Tải CSV từ Google Sheets
    const csvUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv&gid=${parsed.gid}`;
    const res = await fetch(csvUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({
        error: "Không tải được sheet. Kiểm tra sheet đã chia sẻ 'Anyone with the link' chưa.",
      }, { status: 400 });
    }

    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return NextResponse.json({ error: "Sheet trống hoặc không đọc được" }, { status: 400 });

    // Tìm header row
    let headerIdx = rows.findIndex(r =>
      r.some(c => {
        const lc = c.toLowerCase();
        return lc.includes("tên kênh") || lc.includes("ten kenh") || lc.includes("kenh") ||
               lc.includes("creator") || lc.includes("koc") || lc.includes("name") || lc.includes("channel");
      })
    );
    if (headerIdx < 0) headerIdx = 0;

    const headers = rows[headerIdx].map(h => h.toLowerCase().replace(/\s+/g, " ").trim());

    const findCol = (keywords: string[]) =>
      headers.findIndex(h => keywords.some(kw => h.includes(kw)));

    const colTen     = findCol(["tên koc", "ten koc", "tên kênh", "ten kenh", "kênh", "kenh", "creator", "tên", "ten", "name", "channel"]);
    const colCast    = findCol(["cast", "giá cast", "gia cast", "phí cast", "phi cast"]);
    const colLink    = findCol(["link", "url", "tiktok"]);
    const colView    = findCol(["view/tháng", "view/thang", "lượt xem", "luot xem", "view", "xem"]);
    const colOrder   = findCol(["đơn hàng", "don hang", "đơn", "order"]);
    const colRevenue = findCol(["doanh thu", "revenue", "doanh"]);

    // Cột I = index 8 = SĐT, Cột J = index 9 = ĐCHI (cố định theo vị trí)
    const colSdt    = 8;  // Cột I
    const colDiaChi = 9;  // Cột J

    if (colTen < 0) {
      return NextResponse.json({
        error: `Không tìm thấy cột tên kênh/KOC. Các cột đọc được: ${headers.join(" | ")}`,
      }, { status: 400 });
    }

    // Lấy KOC & booking từ DB
    const kocs = await prisma.kOC.findMany();
    const bookings = await prisma.kOCBooking.findMany({
      where: { trangThai: { in: ["dang_chay", "ket_thuc"] } },
      include: { koc: true, sanPham: true },
      orderBy: { createdAt: "desc" },
    });

    // Tạo preview
    const preview = rows.slice(headerIdx + 1).map((r, idx) => {
      const kocName    = r[colTen]?.trim() ?? "";
      const giaCast    = colCast    >= 0 ? parseNum(r[colCast]    ?? "") : 0;
      const linkProfile = colLink   >= 0 ? (r[colLink]?.trim()   ?? "") : "";
      const luotXem    = colView    >= 0 ? parseNum(r[colView]    ?? "") : 0;
      const donHang    = colOrder   >= 0 ? parseNum(r[colOrder]   ?? "") : 0;
      const doanhThu   = colRevenue >= 0 ? parseNum(r[colRevenue] ?? "") : 0;
      const sdt        = r[colSdt]?.trim()    || null;
      const diaChi     = r[colDiaChi]?.trim() || null;

      if (!kocName) return null;

      const matchedKoc = kocs.find(k => norm(k.ten) === norm(kocName))
        ?? kocs.find(k => norm(kocName).includes(norm(k.ten)) || norm(k.ten).includes(norm(kocName)));

      const matchedBooking = matchedKoc
        ? bookings.find(b => b.kocId === matchedKoc.id) ?? null
        : null;

      return {
        rowIndex: idx,
        kocName,
        giaCast,
        linkProfile,
        kocId:      matchedKoc?.id     ?? null,
        kocTen:     matchedKoc?.ten    ?? null,
        bookingId:  matchedBooking?.id ?? null,
        bookingSP:  matchedBooking?.sanPham?.ten ?? null,
        luotXem,
        donHang,
        doanhThu,
        sdt,
        diaChi,
        matched: !!matchedKoc && !!matchedBooking,
      };
    }).filter(Boolean);

    return NextResponse.json({
      preview,
      columns: {
        colTen:     headers[colTen],
        colView:    colView    >= 0 ? headers[colView]    : null,
        colOrder:   colOrder   >= 0 ? headers[colOrder]   : null,
        colRevenue: colRevenue >= 0 ? headers[colRevenue] : null,
      },
      totalRows: preview.length,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
