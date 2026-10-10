-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('HAPPY', 'ANGRY', 'SAD', 'JEALOUS', 'NEUTRAL');

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mood" "Mood" NOT NULL DEFAULT 'NEUTRAL',
    "affection" INTEGER NOT NULL DEFAULT 50,
    "anger" INTEGER NOT NULL DEFAULT 0,
    "jealousy" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFact" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserFact_key_key" ON "UserFact"("key");
