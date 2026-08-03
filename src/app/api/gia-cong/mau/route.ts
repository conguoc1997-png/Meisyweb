export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KEY = "gia_cong_mau";

const DEFAULT_MAUS = [
  { ten: "TRẮNG", vietTat: "TRG" }, { ten: "ĐEN", vietTat: "DN" },
  { ten: "ĐEN THAN", vietTat: "DTHAN" }, { ten: "XÁM", vietTat: "XAM" },
  { ten: "KHÓI", vietTat: "KHOI" }, { ten: "ĐỎ", vietTat: "DO" },
  { ten: "CAM", vietTat: "CAM" }, { ten: "VÀNG", vietTat: "VANG" },
  { ten: "VÀNG CHANH", vietTat: "VCHANH" }, { ten: "XANH NHẠT", vietTat: "XN" },
  { ten: "XANH ĐẬM", vietTat: "XDAM" }, { ten: "XANH ĐEN", vietTat: "XDEN" },
  { ten: "XANH NAVY", vietTat: "NAVY" }, { ten: "XANH BABY", vietTat: "XBABY" },
  { ten: "XANH MUỐI TIÊU", vietTat: "MUOITIEU" }, { ten: "TÍM", vietTat: "TIM" },
  { ten: "HỒNG", vietTat: "HONG" }, { ten: "NÂU", vietTat: "NAU" },
  { ten: "BÒ", vietTat: "BO" }, { ten: "KEM", vietTat: "KEM" },
  { ten: "NUDE", vietTat: "NUDE" }, { ten: "BE", vietTat: "BE" },
  { ten: "KAKI", vietTat: "KAKI" }, { ten: "CHẤM", vietTat: "CHAM" },
  { ten: "2 VIỀN", vietTat: "2VIEN" }, { ten: "LỤA XANH ĐẬM", vietTat: "LTUAXDAM" },
  { ten: "LỤA XANH NHẠT", vietTat: "LTUAXN" },
];

export async function GET() {
  const row = await prisma.appSettings.findUnique({ where: { key: KEY } });
  const data = row ? JSON.parse(row.value) : DEFAULT_MAUS;
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  await prisma.appSettings.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(data) },
    create: { key: KEY, value: JSON.stringify(data) },
  });
  return NextResponse.json({ ok: true });
}
