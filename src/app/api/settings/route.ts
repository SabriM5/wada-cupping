import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
  return NextResponse.json({
    hours: settings?.cancellationNoticeHours || 24,
    penalty: settings?.cancellationPenaltyPercent || 20
  });
}