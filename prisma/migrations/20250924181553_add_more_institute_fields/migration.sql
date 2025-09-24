/*
  Warnings:

  - Added the required column `contactEmail` to the `Institute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactNumber` to the `Institute` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Institute" ADD COLUMN     "about" TEXT,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactNumber" TEXT NOT NULL,
ADD COLUMN     "headline" TEXT;
