-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "stressLevel" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "visitorId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "highlights" TEXT,
    "transcript" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("visitorId","date")
);

-- CreateTable
CREATE TABLE "CompanionUsage" (
    "visitorId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "calls" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CompanionUsage_pkey" PRIMARY KEY ("visitorId","day")
);

-- CreateIndex
CREATE INDEX "CheckIn_visitorId_createdAt_idx" ON "CheckIn"("visitorId", "createdAt");
