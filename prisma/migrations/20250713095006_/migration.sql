/*
  Warnings:

  - You are about to drop the column `body` on the `services` table. All the data in the column will be lost.
  - The `expires_at` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('Monthly', 'Yearly');

-- CreateEnum
CREATE TYPE "ExpiresAt" AS ENUM ('days_7', 'days_14', 'days_30');

-- AlterTable
ALTER TABLE "services" DROP COLUMN "body",
ADD COLUMN     "allow_chat_only" BOOLEAN,
ADD COLUMN     "salary_range" TEXT,
ADD COLUMN     "salary_type" "SalaryType" DEFAULT 'Monthly',
ADD COLUMN     "show_chat_info" BOOLEAN,
ADD COLUMN     "tags" TEXT[],
DROP COLUMN "expires_at",
ADD COLUMN     "expires_at" "ExpiresAt";
