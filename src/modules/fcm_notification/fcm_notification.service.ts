import { Injectable } from '@nestjs/common';
import { CreateFcmNotificationDto } from './dto/create-fcm_notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // Improved createNotification method
  async createNotification(createFcmNotificationDto: CreateFcmNotificationDto) {
    try {
      // Step 1: Check if the user exists before creating the notification
      const user = await this.prisma.user.findUnique({
        where: { id: createFcmNotificationDto.userId },
      });

      if (!user) {
        throw new Error(`User with ID ${createFcmNotificationDto.userId} does not exist`);
      }

      // Step 2: Proceed with creating the FCM notification
      return await this.prisma.fCM_notification.create({
        data: {
          user_id: createFcmNotificationDto.userId, // Foreign key to user
          device_token: createFcmNotificationDto.deviceToken, // Device token for notification
          title: createFcmNotificationDto.title, // Title of the notification
          body: createFcmNotificationDto.body, // Body content of the notification
          data: createFcmNotificationDto.data, // Optional additional data (JSON)
          status: createFcmNotificationDto.status, // Status (e.g., sent, failed)
          device_type: createFcmNotificationDto.deviceType, // Device type (e.g., android, ios)
        },
      });
    } catch (error) {
      // Step 3: Handle any errors that occurred during the process
      throw new Error(`Failed to create FCM notification: ${error.message}`);
    }
  }

// notification.service.ts

async getUserNotifications(userId: string) {
  return await this.prisma.fCM_notification.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: 'desc',  // Return notifications ordered by creation date
    },
  });
}


}
