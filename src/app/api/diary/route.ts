import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readVisitorId, withVisitor } from "@/lib/visitor";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const visitorId = readVisitorId(request);
  const date = request.nextUrl.searchParams.get("date");

  if (date) {
    if (!DATE_RE.test(date)) {
      return withVisitor(
        NextResponse.json({ error: "Bad date" }, { status: 400 }),
        visitorId,
      );
    }
    const entry = await prisma.diaryEntry.findUnique({
      where: { visitorId_date: { visitorId, date } },
    });
    return withVisitor(NextResponse.json(entry), visitorId);
  }

  const entries = await prisma.diaryEntry.findMany({
    where: { visitorId },
    orderBy: { date: "desc" },
    take: 30,
  });
  return withVisitor(NextResponse.json(entries), visitorId);
}

export async function PUT(request: NextRequest) {
  const visitorId = readVisitorId(request);
  const { date, mode, content, mood, highlights, transcript } =
    (await request.json()) as {
      date?: string;
      mode?: string;
      content?: string;
      mood?: string | null;
      highlights?: string[] | null;
      transcript?: unknown;
    };

  if (!date || !DATE_RE.test(date)) {
    return withVisitor(
      NextResponse.json({ error: "Bad date" }, { status: 400 }),
      visitorId,
    );
  }
  if (mode !== "solo" && mode !== "companion") {
    return withVisitor(
      NextResponse.json({ error: "Bad mode" }, { status: 400 }),
      visitorId,
    );
  }

  const data = {
    mode,
    content: content ?? "",
    mood: mood ?? null,
    highlights: highlights ? JSON.stringify(highlights) : null,
    transcript: transcript ? JSON.stringify(transcript) : null,
  };

  const entry = await prisma.diaryEntry.upsert({
    where: { visitorId_date: { visitorId, date } },
    create: { visitorId, date, ...data },
    update: data,
  });

  return withVisitor(NextResponse.json(entry), visitorId);
}

export async function DELETE(request: NextRequest) {
  const visitorId = readVisitorId(request);
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !DATE_RE.test(date)) {
    return withVisitor(
      NextResponse.json({ error: "Bad date" }, { status: 400 }),
      visitorId,
    );
  }

  await prisma.diaryEntry.deleteMany({ where: { visitorId, date } });
  return withVisitor(NextResponse.json({ ok: true }), visitorId);
}
