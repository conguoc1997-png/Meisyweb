export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

function extractSheetId(url: string): { id: string; gid: string } | null {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const gidMatch = url.match(/[#&?]gid=(\d+)/);
  if (!idMatch) return null;
  return { id: idMatch[1], gid: gidMatch?.[1] ?? "0" };
}

// CSV parser xử lý quoted fields (kể cả dấu phẩy và xuống dòng trong quotes)
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
      current.push(field.trim());
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      current.push(field.trim());
      records.push(current);
      current = [];
      field = "";
    } else {
      field += ch;
    }
  }
  current.push(field.trim());
  if (current.some(f => f)) records.push(current);
  return records;
}

// Parse số kiểu Việt: "156.461,5" hoặc "156461,5" → 156461.5
function parseVnNum(s: string): number {
  const cleaned = s.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    const parsed = extractSheetId(url);
    if (!parsed) return NextResponse.json({ error: "Link không hợp lệ" }, { status: 400 });

    const csvUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv&gid=${parsed.gid}`;
    const res = await fetch(csvUrl, { redirect: "follow" });
    if (!res.ok) return NextResponse.json({ error: "Không tải được file" }, { status: 400 });

    const text = await res.text();
    const rows = parseCSV(text);

    // Tìm header row (chứa "SKU" hoặc "STT")
    let headerIdx = rows.findIndex(r =>
      r.some(c => c.toLowerCase().includes("sku") || c.toLowerCase() === "stt")
    );
    if (headerIdx < 0) headerIdx = 0;

    // Tìm index cột theo header
    const headers = rows[headerIdx].map(h => h.toLowerCase().replace(/\s+/g, " ").trim());
    const colSku  = headers.findIndex(h => h.includes("sku"));
    const colXuat = headers.findIndex(h => h.includes("xuất") || h.includes("xuat"));

    // Fallback: cột B=1 (SKU), cột I=8 (Giá xuất)
    const iSku  = colSku  >= 0 ? colSku  : 1;
    const iXuat = colXuat >= 0 ? colXuat : 8;

    const products: { sku: string; giaNhap: number; giaThanh: number }[] = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const r = rows[i];
      const sku     = r[iSku]?.replace(/^"|"$/g, "").trim();
      const giaXuat = parseVnNum(r[iXuat] ?? "");
      if (!sku || isNaN(giaXuat) || giaXuat <= 0) continue;
      products.push({ sku, giaNhap: giaXuat, giaThanh: giaXuat });
    }

    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Lỗi xử lý file" }, { status: 500 });
  }
}
