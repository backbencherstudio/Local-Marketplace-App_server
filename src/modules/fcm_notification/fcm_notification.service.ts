import { Injectable } from '@nestjs/common';
import { CreateFcmNotificationDto } from './dto/create-fcm_notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FcmNotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(createFcmNotificationDto: CreateFcmNotificationDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: createFcmNotificationDto.userId },
      });

      if (!user) {
        throw new Error(`User with ID ${createFcmNotificationDto.userId} does not exist`);
      }

      return await this.prisma.fCM_notification.create({
        data: {
          user_id: createFcmNotificationDto.userId, 
          device_token: createFcmNotificationDto.deviceToken, 
          title: createFcmNotificationDto.title, 
          body: createFcmNotificationDto.body, 
          data: createFcmNotificationDto.data,
          status: createFcmNotificationDto.status, 
          device_type: createFcmNotificationDto.deviceType, 
        },
      });
    } catch (error) {
      throw new Error(`Failed to create FCM notification: ${error.message}`);
    }
  }


async getUserNotifications(userId: string) {
  return await this.prisma.fCM_notification.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: 'desc',  
    },
  });
}


}
