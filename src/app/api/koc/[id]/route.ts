export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const koc = await prisma.kOC.update({
      where: { id },
      data: {
        ...(body.ten         !== undefined && { ten:         body.ten }),
        ...(body.platform    !== undefined && { platform:    body.platform }),
        ...(body.follower    !== undefined && { follower:    Number(body.follower) || 0 }),
        ...(body.giaCast     !== undefined && { giaCast:     Number(body.giaCast)  || 0 }),
        ...(body.linkProfile !== undefined && { linkProfile: body.linkProfile || null }),
        ...(body.sdt         !== undefined && { sdt:         body.sdt         || null }),
        ...(body.email       !== undefined && { email:       body.email       || null }),
        ...(body.diaChi      !== undefined && { diaChi:      body.diaChi      || null }),
        ...(body.ghiChu           !== undefined && { ghiChu:           body.ghiChu      || null }),
        ...(body.trangThaiHopTac  !== undefined && { trangThaiHopTac:  body.trangThaiHopTac }),
      },
    });
    return NextResponse.json(koc);
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Lỗi server" }, { status: 500 });
  }
}
