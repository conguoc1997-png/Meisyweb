export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── helpers ──────────────────────────────────────────────────────────────────

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
    const ch = text[i], next = text[i + 1];
    if (ch === '"') { if (inQuotes && next === '"') { field += '"'; i++; } else inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { current.push(field.trim()); field = ""; }
    else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      current.push(field.trim()); records.push(current); current = []; field = "";
    } else { field += ch; }
  }
  current.push(field.trim());
  if (current.some(f => f)) records.push(current);
  return records;
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

function parsePrice(s: string): number | null {
  if (!s) return null;
  const n = Number(s.replace(/[^\d.]/g, ""));
  return isNaN(n) || n === 0 ? null : n;
}

// Tạo SKU từ tên (lấy chữ hoa + số)
function slugSKU(ten: string): string {
  return ten.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) || "SP" + Date.now();
}

// ── Cột cố định ──
const COL_TEN    = 1; // cột B
const COL_GIABAN = 8; // cột I

// ── Types ────────────────────────────────────────────────────────────────────

export type SheetPreviewRow = {
  rowIndex: number;
  ten: string;
  giaBan: number | null;
  existingId:  string | null;
  existingSku: string | null;
  oldGiaBan:   number | null;
  isNew: boolean;   // true = chưa có trong DB → sẽ tạo mới
};

type ConfirmRow = {
  ten: string;
  giaBan: number | null;
  existingId: string | null; // null = tạo mới
};

// ── POST /api/kho/update-sheet ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; rows?: ConfirmRow[] };

    // ── CONFIRM ──
    if (body.rows) {
      const toInsert = body.rows.filter(r => !r.existingId);
      const toUpdate = body.rows.filter(r => !!r.existingId);

      // Thêm mới: 1 query duy nhất
      let inserted = 0;
      if (toInsert.length > 0) {
        const result = await prisma.sanPham.createMany({
          data: toInsert.map(r => ({
            ten:     r.ten,
            sku:     slugSKU(r.ten),
            giaBan:  r.giaBan ?? 0,
            giaNhap: 0,
            tonKho:  0,
            nguon:   "shopee",
          })),
          skipDuplicates: true,
        });
        inserted = result.count;
      }

      // Cập nhật: gom vào 1 transaction
      let updated = 0;
      if (toUpdate.length > 0) {
        await prisma.$transaction(
          toUpdate.map(r =>
            prisma.sanPham.update({
              where: { id: r.existingId! },
              data: {
                ten: r.ten,
                ...(r.giaBan !== null ? { giaBan: r.giaBan } : {}),
              },
            })
          )
        );
        updated = toUpdate.length;
      }

      return NextResponse.json({ updated, inserted });
    }

    // ── PREVIEW ──
    if (!body.url) return NextResponse.json({ error: "Thiếu URL" }, { status: 400 });

    const parsed = extractSheetId(body.url);
    if (!parsed) return NextResponse.json({ error: "Link Google Sheets không hợp lệ" }, { status: 400 });

    const csvUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv&gid=${parsed.gid}`;
    const res = await fetch(csvUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json({ error: "Không tải được sheet. Kiểm tra quyền 'Anyone with the link'." }, { status: 400 });

    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 1) return NextResponse.json({ error: "Sheet trống" }, { status: 400 });

    // Bỏ qua dòng header (dòng đầu tiên có chữ "tên" hoặc "giá" hoặc "sản phẩm")
    let startIdx = 0;
    const firstRow = rows[0].join(" ").toLowerCase();
    if (firstRow.includes("tên") || firstRow.includes("ten") || firstRow.includes("giá") ||
        firstRow.includes("gia") || firstRow.includes("sản phẩm") || firstRow.includes("san pham")) {
      startIdx = 1;
    }

    // Lấy tất cả sản phẩm hiện có
    const allSP = await prisma.sanPham.findMany();

    const preview: SheetPreviewRow[] = rows.slice(startIdx).map((r, idx) => {
      const ten    = r[COL_TEN]?.trim()    ?? "";
      const giaBan = parsePrice(r[COL_GIABAN]?.trim() ?? "");

      if (!ten) return null; // bỏ dòng trống

      // Khớp theo tên
      const matched =
        allSP.find(sp => norm(sp.ten) === norm(ten)) ??
        allSP.find(sp => norm(sp.ten).includes(norm(ten)) || norm(ten).includes(norm(sp.ten))) ??
        null;

      return {
        rowIndex: startIdx + idx,
        ten,
        giaBan,
        existingId:  matched?.id    ?? null,
        existingSku: matched?.sku   ?? null,
        oldGiaBan:   matched?.giaBan ?? null,
        isNew: !matched,
      };
    }).filter((r): r is SheetPreviewRow => r !== null);

    return NextResponse.json({ preview, total: preview.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
