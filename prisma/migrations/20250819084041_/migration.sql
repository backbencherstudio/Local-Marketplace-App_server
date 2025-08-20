/*
  Warnings:

  - A unique constraint covering the columns `[post_id]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "post_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "conversations_post_id_key" ON "conversations"("post_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
