-- CreateTable
CREATE TABLE "fcm_notifications" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,
    "device_token" TEXT,
    "device_type" TEXT,
    "title" TEXT,
    "body" TEXT,
    "data" JSONB,
    "status" TEXT,
    "is_read" BOOLEAN DEFAULT false,

    CONSTRAINT "fcm_notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fcm_notifications" ADD CONSTRAINT "fcm_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
