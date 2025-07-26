import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { FcmNotificationService } from '../fcm_notification/fcm_notification.service';

@Module({
  controllers: [FirebaseController],
  providers: [FirebaseService, FcmNotificationService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
