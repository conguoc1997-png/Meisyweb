export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Không có file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });

    if (!rows.length) return NextResponse.json({ error: "File trống" }, { status: 400 });

    const headers = Object.keys(rows[0]);

    // Tìm cột SKU và Giá xuất
    const colSKU = headers.find(h =>
      h.toLowerCase().includes("sku") || h.toLowerCase().includes("mã")
    ) ?? headers[0];

    const colGiaXuat = headers.find(h =>
      h.toLowerCase().includes("xuất") || h.toLowerCase().includes("xuat") || h.toLowerCase().includes("export")
    ) ?? headers[headers.length - 1];

    const colGiaTP = headers.find(h =>
      h.toLowerCase().includes("thành phẩm") || h.toLowerCase().includes("thanh pham")
    ) ?? null;

    // Lấy SKU hiện có trong DB
    const existing = await prisma.sanPham.findMany({ select: { sku: true, id: true } });
    const existingMap = new Map(existing.map(e => [e.sku.trim(), e.id]));

    const preview = rows
      .map((row, idx) => {
        const sku = String(row[colSKU] ?? "").trim();
        if (!sku) return null;

        // Parse giá xuất — bỏ qua #N/A
        const rawGia = String(row[colGiaXuat] ?? "").replace(",", ".");
        const giaXuat = rawGia.includes("#") || rawGia === "" ? null : Number(rawGia);

        const rawTP = colGiaTP ? String(row[colGiaTP] ?? "").replace(",", ".") : null;
        const giaTP = rawTP && !rawTP.includes("#") ? Number(rawTP) : null;

        return {
          rowIndex: idx,
          sku,
          giaNhap: giaXuat,      // Giá xuất → giaNhap
          giaBan: giaTP ?? 0,    // Giá thành phẩm → giaBan (tham khảo)
          coGia: giaXuat !== null,
          isNew: !existingMap.has(sku),
          existingId: existingMap.get(sku) ?? null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ preview, colSKU, colGiaXuat });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
