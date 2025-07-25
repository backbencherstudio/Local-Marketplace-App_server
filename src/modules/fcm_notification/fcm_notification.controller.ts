import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FcmNotificationService } from './fcm_notification.service';
import { CreateFcmNotificationDto } from './dto/create-fcm_notification.dto';
import { UpdateFcmNotificationDto } from './dto/update-fcm_notification.dto';

@Controller('fcm-notification')
export class FcmNotificationController {
  constructor(private readonly fcmNotificationService: FcmNotificationService) {}
  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    const notifications = await this.fcmNotificationService.getUserNotifications(userId);
    return { notifications };
  }

}
