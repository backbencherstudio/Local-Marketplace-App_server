-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('Profile', 'Services', 'Jobs', 'For_sale', 'Help', 'Gigs', 'Community');

-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "type" "ConversationType";
