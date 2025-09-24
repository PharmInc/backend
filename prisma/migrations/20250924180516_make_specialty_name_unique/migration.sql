/*
  Warnings:

  - You are about to drop the column `instituteId` on the `Specialty` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Specialty` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Specialty` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Specialty" DROP CONSTRAINT "Specialty_instituteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Specialty" DROP CONSTRAINT "Specialty_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Specialty" DROP COLUMN "instituteId",
DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "public"."_InstituteSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstituteSpecialties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_UserSpecialties" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserSpecialties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstituteSpecialties_B_index" ON "public"."_InstituteSpecialties"("B");

-- CreateIndex
CREATE INDEX "_UserSpecialties_B_index" ON "public"."_UserSpecialties"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_name_key" ON "public"."Specialty"("name");

-- AddForeignKey
ALTER TABLE "public"."_InstituteSpecialties" ADD CONSTRAINT "_InstituteSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Institute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_InstituteSpecialties" ADD CONSTRAINT "_InstituteSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserSpecialties" ADD CONSTRAINT "_UserSpecialties_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Specialty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserSpecialties" ADD CONSTRAINT "_UserSpecialties_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
