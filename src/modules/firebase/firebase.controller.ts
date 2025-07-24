// src/firebase/firebase.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('notifications')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('send')
  async sendNotification(@Body() payload: { deviceToken: string; title: string; body: string }) {
    const { deviceToken, title, body } = payload;
    return this.firebaseService.sendNotification(deviceToken, title, body);
  }
   @Post('register')
  async registerUser(
    @Body() payload: { userToken: string; adminToken: string; userName: string },
  ) {
    const { userToken, adminToken, userName } = payload;

    // 1. Notify user of successful registration
    const userMessage = {
      deviceToken: userToken,
      title: 'Registration Successful',
      body: `Hello ${userName}, you have successfully registered!`,
    };
    await this.firebaseService.sendNotification(
      userMessage.deviceToken,
      userMessage.title,
      userMessage.body,
    );

    const adminMessage = {
      deviceToken: adminToken,
      title: 'New User Registered',
      body: `${userName} has successfully registered.`,
    };
    await this.firebaseService.sendNotification(
      adminMessage.deviceToken,
      adminMessage.title,
      adminMessage.body,
    );

    return { message: 'Registration notifications sent.' };
  }
}
