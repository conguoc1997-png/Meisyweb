export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const kocs = await prisma.kOC.findMany({
      include: { bookings: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(kocs);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const koc = await prisma.kOC.create({
      data: {
        ten: body.ten,
        platform: body.platform,
        follower: Number(body.follower) || 0,
        giaCast: Number(body.giaCast) || 0,
        linkProfile: body.linkProfile || null,
        sdt: body.sdt || null,
        email: body.email || null,
        ghiChu: body.ghiChu || null,
      },
    });
    return NextResponse.json(koc, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
