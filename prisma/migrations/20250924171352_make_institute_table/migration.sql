/*
  Warnings:

  - You are about to drop the column `specialty` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."InstituteRoles" AS ENUM ('HOSPITAL', 'CLINIC', 'LAB', 'PHARMACY');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "specialty";

-- CreateTable
CREATE TABLE "public"."Institute" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "role" "public"."InstituteRoles" NOT NULL DEFAULT 'HOSPITAL',
    "affiliatedUniversity" TEXT,
    "yearEstablished" INTEGER,
    "ownership" TEXT,

    CONSTRAINT "Institute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Specialty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instituteId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Specialty" ADD CONSTRAINT "Specialty_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "public"."Institute"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Specialty" ADD CONSTRAINT "Specialty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
