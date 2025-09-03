/*
  Warnings:

  - You are about to drop the column `message` on the `Chat` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ShapeType" AS ENUM ('RECT', 'CIRCLE', 'LINE', 'FREEHAND', 'TEXT');

-- AlterTable
ALTER TABLE "public"."Chat" DROP COLUMN "message";

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" SERIAL NOT NULL,
    "type" "public"."ShapeType" NOT NULL,
    "startX" DOUBLE PRECISION NOT NULL,
    "startY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "points" JSONB,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
