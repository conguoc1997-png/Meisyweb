export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { genMaDoiTra } from "@/lib/utils";

export async function GET() {
  try {
    // Tạo cột ngayGui nếu chưa có
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "DoiTra" ADD COLUMN IF NOT EXISTS "ngayGui" TIMESTAMPTZ`
    ).catch(() => {});

    // One-time cleanup: xoá backfill ngayGui cũ (chỉ chạy 1 lần)
    const cleaned = await prisma.appSettings.findUnique({ where: { key: "doi_tra_nguygui_cleaned_v1" } });
    if (!cleaned) {
      await prisma.$executeRawUnsafe(`UPDATE "DoiTra" SET "ngayGui" = NULL WHERE "ngayGui" IS NOT NULL`).catch(() => {});
      await prisma.appSettings.upsert({
        where: { key: "doi_tra_nguygui_cleaned_v1" },
        update: { value: new Date().toISOString() },
        create: { key: "doi_tra_nguygui_cleaned_v1", value: new Date().toISOString() },
      });
    }

    const records = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT *, "ngayGui" FROM "DoiTra" ORDER BY "createdAt" DESC`
    );
    return NextResponse.json(records);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Tự động tính phí ship
    let phiShip = Number(body.phiShip) || 0;
    if (body.loaiVanDe === "doi_size" && !body.phiShipThuCong) {
      phiShip = 30000;
    }

    const record = await prisma.doiTra.create({
      data: {
        maDoiTra:      genMaDoiTra(),
        sdtThangTruoc: body.sdtThangTruoc || null,
        sdtHienTai:    body.sdtHienTai    || null,
        tenKhach:      body.tenKhach,
        diaChi:        body.diaChi        || null,
        skuHienTai:    body.skuHienTai    || null,
        skuDoiSang:    body.skuDoiSang    || null,
        giaTriHang:    Number(body.giaTriHang) || 0,
        loaiVanDe:     body.loaiVanDe,
        ghiChu:        body.ghiChu        || null,
        phiShip,
        soChieuShip:   Number(body.soChieuShip) || 2,
        nguon:         body.nguon         || null,
        maVanDon:      body.maVanDon      || null,
        trangThai:     "cho_xu_ly",
        nguoiXuLy:     body.nguoiXuLy     || null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Lỗi server";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
