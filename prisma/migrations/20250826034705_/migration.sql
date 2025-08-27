/*
  Warnings:

  - A unique constraint covering the columns `[user_id,service_id]` on the table `favorites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "favorites_user_id_service_id_key" ON "favorites"("user_id", "service_id");
