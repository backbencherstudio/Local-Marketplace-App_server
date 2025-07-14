/*
  Warnings:

  - The `status` column on the `services` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('pending', 'active', 'pause', 'rejected');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "is_accepted" BOOLEAN DEFAULT false,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_reason" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ServiceStatus" DEFAULT 'pending';
