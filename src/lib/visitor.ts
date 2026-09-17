import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE = "anchor_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Anchor has no accounts; this anonymous id is what keeps one visitor's
 *  entries out of another's. Generated on first request, stored httpOnly. */
export function readVisitorId(request: NextRequest) {
  return request.cookies.get(COOKIE)?.value ?? crypto.randomUUID();
}

export function withVisitor<T extends NextResponse>(response: T, visitorId: string) {
  response.cookies.set(COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return response;
}

const DAILY_LIMIT = Number(process.env.COMPANION_DAILY_LIMIT ?? 25);

/**
 * The deployment's API key is shared by everyone who opens the link, so each
 * visitor gets a daily allowance rather than the whole budget.
 */
export async function consumeCompanionCall(visitorId: string) {
  const day = new Date().toISOString().slice(0, 10);

  const usage = await prisma.companionUsage.upsert({
    where: { visitorId_day: { visitorId, day } },
    create: { visitorId, day, calls: 1 },
    update: { calls: { increment: 1 } },
  });

  return {
    allowed: usage.calls <= DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - usage.calls),
  };
}
