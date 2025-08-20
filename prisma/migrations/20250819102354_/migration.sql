/*
  Warnings:

  - You are about to drop the column `category_id` on the `conversations` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_category_id_fkey";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "category_id";
