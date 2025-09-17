/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Auth` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Auth` table. All the data in the column will be lost.
  - You are about to drop the column `authId` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `gender` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialty` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."AuthRoles" AS ENUM ('USER', 'INSTITUTE');

-- CreateEnum
CREATE TYPE "public"."UserRoles" AS ENUM ('DOCTOR', 'NURSE');

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_authId_fkey";

-- DropIndex
DROP INDEX "public"."User_authId_key";

-- AlterTable
ALTER TABLE "public"."Auth" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "public"."AuthRoles" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "authId",
ADD COLUMN     "about" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "specialty" TEXT NOT NULL,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRoles" NOT NULL DEFAULT 'DOCTOR';

-- DropEnum
DROP TYPE "public"."Role";
