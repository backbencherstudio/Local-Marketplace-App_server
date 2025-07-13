-- CreateEnum
CREATE TYPE "Suspended" AS ENUM ('Until_i_Decide', 'One_Week', 'One_Month', 'Three_Months');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "suspended_at" TIMESTAMP(3),
ADD COLUMN     "suspended_until" TIMESTAMP(3);
