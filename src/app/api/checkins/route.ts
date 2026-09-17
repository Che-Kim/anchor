import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readVisitorId, withVisitor } from "@/lib/visitor";

export async function GET(request: NextRequest) {
  const visitorId = readVisitorId(request);

  const checkIns = await prisma.checkIn.findMany({
    where: { visitorId },
    orderBy: { createdAt: "desc" },
    take: 14,
  });

  return withVisitor(NextResponse.json(checkIns), visitorId);
}

export async function POST(request: NextRequest) {
  const visitorId = readVisitorId(request);
  const { mood, stressLevel, note } = (await request.json()) as {
    mood?: string;
    stressLevel?: number;
    note?: string;
  };

  if (!mood) {
    return withVisitor(
      NextResponse.json({ error: "Mood is required" }, { status: 400 }),
      visitorId,
    );
  }
  if (typeof stressLevel !== "number" || stressLevel < 1 || stressLevel > 5) {
    return withVisitor(
      NextResponse.json(
        { error: "Stress level must be between 1 and 5" },
        { status: 400 },
      ),
      visitorId,
    );
  }

  const checkIn = await prisma.checkIn.create({
    data: { visitorId, mood, stressLevel, note: note?.trim() || null },
  });

  return withVisitor(NextResponse.json(checkIn, { status: 201 }), visitorId);
}
