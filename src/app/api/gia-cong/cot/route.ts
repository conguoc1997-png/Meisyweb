export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "gia_cong_cot";

const DEFAULT_COLS = [
  { key: "cat_so_do", label: "CẮT + SƠ ĐỒ", nhom: "" },
  { key: "may",       label: "MAY",           nhom: "" },
  { key: "giat",      label: "GIẶT",          nhom: "" },
  { key: "gia_cong",  label: "GIA CÔNG",      nhom: "" },
  { key: "cat",       label: "CẮT",           nhom: "" },
  { key: "cuc",       label: "CÚC",           nhom: "PHU_LIEU" },
  { key: "khoa",      label: "KHOÁ",          nhom: "PHU_LIEU" },
  { key: "lot",       label: "LÓT",           nhom: "PHU_LIEU" },
  { key: "dinh_tan",  label: "ĐINH TÁN",      nhom: "PHU_LIEU" },
  { key: "vien",      label: "VIỀN",          nhom: "PHU_LIEU" },
  { key: "tui_bong",  label: "TÚI BÓNG",      nhom: "PHU_LIEU" },
  { key: "mac",       label: "MÁC",           nhom: "PHU_LIEU" },
];

async function getSetting(): Promise<object[]> {
  try {
    const row = await prisma.appSettings.findUnique({ where: { key: SETTING_KEY } });
    return row ? JSON.parse(row.value) : DEFAULT_COLS;
  } catch {
    // Bảng AppSettings chưa tồn tại → trả default
    return DEFAULT_COLS;
  }
}

async function setSetting(cols: object[]): Promise<void> {
  try {
    await prisma.appSettings.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(cols) },
      create: { key: SETTING_KEY, value: JSON.stringify(cols) },
    });
  } catch {
    // Fallback: tạo bảng rồi thử lại
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_AppSettings" (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    await prisma.$executeRawUnsafe(
      `INSERT INTO "_AppSettings"(key,value) VALUES($1,$2)
       ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`,
      SETTING_KEY, JSON.stringify(cols)
    );
  }
}

export async function GET() {
  return NextResponse.json(await getSetting());
}

export async function PUT(req: NextRequest) {
  const cols = await req.json();
  await setSetting(cols);
  return NextResponse.json({ ok: true });
}
