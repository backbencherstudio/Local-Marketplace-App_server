import { Controller, Post, Body } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('notifications')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('send')
  async sendNotification(@Body() payload: { deviceToken: string; title: string; body: string; userId: string; deviceType: string }) {
    const { deviceToken, title, body, userId, deviceType } = payload;

    return this.firebaseService.sendNotification(userId, deviceToken, title, body, deviceType);
  }

  // @Post('register')
  // async registerUser(
  //   @Body() payload: { userToken: string; adminToken: string; userName: string; userId: string; userDeviceType: string },
  // ) {
  //   const { userToken, adminToken, userName, userId, userDeviceType } = payload;

  //   const userMessage = {
  //     deviceToken: userToken,
  //     title: 'Registration Successful',
  //     body: `Hello ${userName}, you have successfully registered!`,
  //   };
  //   await this.firebaseService.sendNotification(
  //     userId,  
  //     userMessage.deviceToken,
  //     userMessage.title,
  //     userMessage.body,
  //     userDeviceType,
  //   );

  //   const adminMessage = {
  //     deviceToken: adminToken,
  //     title: 'New User Registered',
  //     body: `${userName} has successfully registered.`,
  //   };
  //   await this.firebaseService.sendNotification(
  //     'admin',  
  //     adminMessage.deviceToken,
  //     adminMessage.title,
  //     adminMessage.body,
  //     'web',
  //   );

  //   return { message: 'Registration notifications sent.' };
  // }
}
