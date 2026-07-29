export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "gia_cong_cot";

const DEFAULT_COLS = [
  { key: "cat_so_do", label: "CẮT + SƠ ĐỒ", nhom: "" },
  { key: "may",       label: "MAY",           nhom: "" },
  { key: "giat",      label: "GIẶT",          nhom: "" },
  { key: "gia_cong",  label: "GIA CÔNG",      nhom: "" },
  { key: "cuc",       label: "CÚC",           nhom: "PHU_LIEU" },
  { key: "khoa",      label: "KHOÁ",          nhom: "PHU_LIEU" },
  { key: "lot",       label: "LÓT",           nhom: "PHU_LIEU" },
  { key: "dinh_tan",  label: "ĐINH TÁN",      nhom: "PHU_LIEU" },
  { key: "vien",      label: "VIỀN",          nhom: "PHU_LIEU" },
  { key: "tui_bong",  label: "TÚI BÓNG",      nhom: "PHU_LIEU" },
  { key: "mac",       label: "MÁC",           nhom: "PHU_LIEU" },
];

export async function GET() {
  const row = await prisma.appSettings.findUnique({ where: { key: SETTING_KEY } });
  const cols = row ? JSON.parse(row.value) : DEFAULT_COLS;
  return NextResponse.json(cols);
}

export async function PUT(req: NextRequest) {
  const cols = await req.json();
  await prisma.appSettings.upsert({
    where: { key: SETTING_KEY },
    update: { value: JSON.stringify(cols) },
    create: { key: SETTING_KEY, value: JSON.stringify(cols) },
  });
  return NextResponse.json({ ok: true });
}
