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
  return isNaN(n) ? null : n;
}

// ── POST /api/kho/update-sheet ────────────────────────────────────────────────
// { url }   → preview
// { rows }  → confirm

export type SheetPreviewRow = {
  rowIndex: number;
  skuSheet: string;
  tenSheet: string | null;
  giaBanSheet: number | null;
  existingId: string | null;
  existingSku: string | null;
  existingTen: string | null;
  oldGiaBan: number | null;
  matched: boolean;
};

type ConfirmRow = {
  existingId: string;
  newTen: string | null;
  newGiaBan: number | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; rows?: ConfirmRow[] };

    // ── CONFIRM ──
    if (body.rows) {
      const toUpdate = body.rows.filter(r => r.existingId);
      let updated = 0;
      for (const r of toUpdate) {
        await prisma.sanPham.update({
          where: { id: r.existingId },
          data: {
            ...(r.newTen    !== null && r.newTen    !== undefined ? { ten:    r.newTen    } : {}),
            ...(r.newGiaBan !== null && r.newGiaBan !== undefined ? { giaBan: r.newGiaBan } : {}),
          },
        });
        updated++;
      }
      return NextResponse.json({ updated });
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
    if (rows.length < 2) return NextResponse.json({ error: "Sheet trống" }, { status: 400 });

    // Tìm header row
    let headerIdx = rows.findIndex(r =>
      r.some(c => {
        const lc = c.toLowerCase();
        return lc.includes("sku") || lc.includes("tên") || lc.includes("ten") ||
               lc.includes("sản phẩm") || lc.includes("san pham") || lc.includes("giá") || lc.includes("gia");
      })
    );
    if (headerIdx < 0) headerIdx = 0;

    const headers = rows[headerIdx].map(h => h.toLowerCase().replace(/\s+/g, " ").trim());

    // Tìm cột SKU
    const colSku = headers.findIndex(h =>
      ["sku", "mã sp", "ma sp", "mã", "ma"].some(kw => h === kw || h.includes(kw))
    );
    // Tìm cột Tên
    const colTen = headers.findIndex(h =>
      ["tên sản phẩm", "ten san pham", "tên sp", "ten sp", "tên", "ten", "sản phẩm", "san pham", "name", "product"].some(kw => h === kw || h.includes(kw))
    );
    // Tìm cột Giá bán
    const colGiaBan = headers.findIndex(h =>
      ["giá bán", "gia ban", "giá", "gia", "price", "selling price", "giá niêm yết"].some(kw => h === kw || h.includes(kw))
    );

    if (colSku < 0 && colTen < 0) {
      return NextResponse.json({ error: `Không tìm thấy cột SKU hoặc Tên. Cột hiện có: ${headers.join(" | ")}` }, { status: 400 });
    }

    // Lấy tất cả sản phẩm từ DB
    const allSP = await prisma.sanPham.findMany();

    const preview: SheetPreviewRow[] = rows.slice(headerIdx + 1).map((r, idx) => {
      const skuSheet  = colSku  >= 0 ? r[colSku]?.trim()  ?? "" : "";
      const tenSheet  = colTen  >= 0 ? r[colTen]?.trim()  ?? "" : null;
      const giaBanRaw = colGiaBan >= 0 ? r[colGiaBan]?.trim() ?? "" : "";
      const giaBanSheet = parsePrice(giaBanRaw);

      // Bỏ qua dòng trống
      if (!skuSheet && !tenSheet) return null;
      // Bỏ qua nếu không có dữ liệu cần cập nhật
      if (!tenSheet && giaBanSheet === null) return null;

      // Match theo SKU trước, rồi theo tên
      const matched =
        (skuSheet ? allSP.find(sp => norm(sp.sku) === norm(skuSheet)) : null) ??
        (tenSheet ? allSP.find(sp => norm(sp.ten) === norm(tenSheet)) : null) ??
        (tenSheet ? allSP.find(sp => norm(sp.ten).includes(norm(tenSheet)) || norm(tenSheet).includes(norm(sp.ten))) : null) ??
        null;

      return {
        rowIndex: idx,
        skuSheet,
        tenSheet: tenSheet || null,
        giaBanSheet,
        existingId:  matched?.id    ?? null,
        existingSku: matched?.sku   ?? null,
        existingTen: matched?.ten   ?? null,
        oldGiaBan:   matched?.giaBan ?? null,
        matched: !!matched,
      };
    }).filter((r): r is SheetPreviewRow => r !== null);

    return NextResponse.json({ preview, total: preview.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
