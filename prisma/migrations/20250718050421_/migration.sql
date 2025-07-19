-- AlterTable
ALTER TABLE "services" ADD COLUMN     "is_reported" INTEGER DEFAULT 0,
ADD COLUMN     "reported_at" TIMESTAMP(3);
