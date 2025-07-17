-- AlterTable
ALTER TABLE "services" ADD COLUMN     "is_paused" BOOLEAN DEFAULT false,
ADD COLUMN     "paused_at" TIMESTAMP(3),
ADD COLUMN     "paused_reason" TEXT;
