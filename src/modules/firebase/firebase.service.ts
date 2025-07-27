import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FcmNotificationService } from 'src/modules/fcm_notification/fcm_notification.service';
import { use } from 'passport';

@Injectable()
export class FirebaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: FcmNotificationService
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        // credential: admin.credential.cert('D:/BBS WORKING PROJECTS/Local-Marketplace-App_efren/firebase-secret/firebase-secret.json'),
        credential: admin.credential.cert('C:/BBS Project/Local-Marketplace-App_server/firebase-secret/firebase-secret.json'),
      });
    } else {
      console.log('Firebase already initialized');
    }
  }
  async sendNotification(
    userId: string,
    deviceToken: string,
    title: string,
    body: string,
    deviceType: string
  ) {
    console.log(`Sending notification to device token: ${deviceToken}`);

    if (!userId || !deviceToken || !title || !body || !deviceType) {
      throw new Error('User ID, device token, title, body, and deviceType are required to send a notification');
    }

    const message: admin.messaging.Message = {
      token: deviceToken,
      notification: {
        title: title,
        body: body,
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
      webpush: {
        headers: {
          'Urgency': 'high',
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);

      await this.notificationService.createNotification({
        userId,
        deviceToken,
        title,
        body,
        data: {},
        status: 'sent',
        deviceType,
      });

      return { success: true, message: 'Notification sent and logged successfully' };
    } catch (error) {
      console.error('Error sending notification:', error);

      await this.notificationService.createNotification({
        userId,
        deviceToken,
        title,
        body,
        data: {},
        status: 'failed',
        deviceType,
      });

      return { success: false, message: 'Failed to send notification', error: error.message };
    }
  }

}
