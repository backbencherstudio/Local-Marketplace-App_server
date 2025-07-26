import * as admin from 'firebase-admin';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  constructor() {
    // Check if Firebase is already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert('C:\\BBS Project\\Local-Marketplace-App_server\\firebase-secret\\firebase-secret.json'),
      });
    } else {
      console.log('Firebase already initialized');
    }
  }

  // Send a push notification
  // async sendNotification(deviceToken: string, title: string, body: string) {
  //   console.log(`Sending notification to device token: ${deviceToken}`);

  //   if (!deviceToken || !title || !body) {
  //     throw new Error('Device token, title, and body are required to send a notification');
  //   }
    
  //   const message = {
  //     token: deviceToken,
  //     notification: {
  //       title: title,
  //       body: body,
  //     },
  //   };

  //   try {
  //     await admin.messaging().send(message);
  //     console.log('Notification sent successfully');
  //   } catch (error) {
  //     console.error('Error sending notification:', error);
  //   }
  // }

async sendNotification(deviceToken: string, title: string, body: string) {
  console.log(`Sending notification to device token: ${deviceToken}`);

  if (!deviceToken || !title || !body) {
    throw new Error('Device token, title, and body are required to send a notification');
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
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
}
