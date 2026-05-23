export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ── helpers (dùng lại từ import-sheet) ─────────────────────────────────────

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

// ── POST /api/koc/update-contacts ──────────────────────────────────────────
// Body: { url: string }  → trả preview
// Body: { rows: [{kocId, sdt, diaChi}] } → xác nhận cập nhật

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { url?: string; rows?: { kocId: string; sdt: string | null; diaChi: string | null }[] };

    // ── CHẾ ĐỘ XÁC NHẬN (confirm) ──
    if (body.rows) {
      const toUpdate = body.rows.filter(r => r.kocId);
      await Promise.all(toUpdate.map(r =>
        prisma.kOC.update({
          where: { id: r.kocId },
          data: {
            ...(r.sdt    !== undefined ? { sdt:    r.sdt    || null } : {}),
            ...(r.diaChi !== undefined ? { diaChi: r.diaChi || null } : {}),
          },
        })
      ));
      return NextResponse.json({ updated: toUpdate.length });
    }

    // ── CHẾ ĐỘ PREVIEW ──
    if (!body.url) return NextResponse.json({ error: "Thiếu URL" }, { status: 400 });

    const parsed = extractSheetId(body.url);
    if (!parsed) return NextResponse.json({ error: "Link Google Sheets không hợp lệ" }, { status: 400 });

    const csvUrl = `https://docs.google.com/spreadsheets/d/${parsed.id}/export?format=csv&gid=${parsed.gid}`;
    const res = await fetch(csvUrl, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return NextResponse.json({ error: "Không tải được sheet. Kiểm tra quyền chia sẻ 'Anyone with the link'." }, { status: 400 });

    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 2) return NextResponse.json({ error: "Sheet trống" }, { status: 400 });

    // Tìm header row
    let headerIdx = rows.findIndex(r =>
      r.some(c => {
        const lc = c.toLowerCase();
        return lc.includes("tên kênh") || lc.includes("ten kenh") || lc.includes("kênh") ||
               lc.includes("creator") || lc.includes("koc") || lc.includes("name");
      })
    );
    if (headerIdx < 0) headerIdx = 0;

    const headers = rows[headerIdx].map(h => h.toLowerCase().replace(/\s+/g, " ").trim());

    // Tìm cột tên KOC
    const colTen = headers.findIndex(h =>
      ["tên kênh", "ten kenh", "kênh", "kenh", "creator", "tên", "ten", "name", "channel"].some(kw => h.includes(kw))
    );
    if (colTen < 0) return NextResponse.json({ error: `Không tìm thấy cột tên. Cột hiện có: ${headers.join(" | ")}` }, { status: 400 });

    // Cột I = 8 = SĐT, cột J = 9 = ĐCHI (cố định theo vị trí)
    const COL_SDT    = 8;
    const COL_DIACHI = 9;

    // Lấy tất cả KOC từ DB
    const kocs = await prisma.kOC.findMany();

    const preview = rows.slice(headerIdx + 1).map((r, idx) => {
      const kocName = r[colTen]?.trim() ?? "";
      if (!kocName) return null;

      const newSdt    = r[COL_SDT]?.trim()    || null;
      const newDiaChi = r[COL_DIACHI]?.trim() || null;

      // Bỏ qua dòng không có dữ liệu mới
      if (!newSdt && !newDiaChi) return null;

      // Match KOC
      const matched = kocs.find(k => norm(k.ten) === norm(kocName))
        ?? kocs.find(k => norm(kocName).includes(norm(k.ten)) || norm(k.ten).includes(norm(kocName)));

      return {
        rowIndex: idx,
        kocName,
        kocId:      matched?.id     ?? null,
        kocTen:     matched?.ten    ?? null,
        oldSdt:     matched?.sdt    ?? null,
        oldDiaChi:  matched?.diaChi ?? null,
        newSdt,
        newDiaChi,
        matched: !!matched,
      };
    }).filter(Boolean);

    return NextResponse.json({ preview, total: preview.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
