import { Module } from '@nestjs/common';
import { FcmNotificationService } from './fcm_notification.service';
import { FcmNotificationController } from './fcm_notification.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [FcmNotificationController],
  providers: [FcmNotificationService, PrismaService, FirebaseService],
  exports: [FcmNotificationService],
})
export class FcmNotificationModule {}
 