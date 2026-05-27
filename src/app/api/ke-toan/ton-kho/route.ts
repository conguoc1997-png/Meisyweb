export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const loai = searchParams.get("loai");
  const nhom = searchParams.get("nhom");

  const items = await prisma.tonKhoVatTu.findMany({
    where: {
      vatTu: {
        active: true,
        ...(loai && { loai }),
        ...(nhom && { nhom }),
      },
    },
    include: { vatTu: true },
    orderBy: [
      { vatTu: { loai: "asc" } },
      { vatTu: { nhom: "asc" } },
      { vatTu: { ten: "asc" } },
    ],
  });
  return NextResponse.json(items);
}
