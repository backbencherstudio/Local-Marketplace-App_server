/*
  Warnings:

  - You are about to drop the column `attachment_id` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_attachment_id_fkey";

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "message_id" TEXT;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "attachment_id",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
