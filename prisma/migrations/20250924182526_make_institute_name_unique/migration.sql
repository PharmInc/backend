/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Institute` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Institute_name_key" ON "public"."Institute"("name");
