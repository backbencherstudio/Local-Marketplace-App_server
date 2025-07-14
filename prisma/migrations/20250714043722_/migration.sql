-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('Services', 'Jobs', 'For_sale', 'Help', 'Gigs', 'Community');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "type" "ServiceType";
