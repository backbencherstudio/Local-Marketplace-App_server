import { Test, TestingModule } from '@nestjs/testing';
import { FcmNotificationController } from './fcm_notification.controller';
import { FcmNotificationService } from './fcm_notification.service';

describe('FcmNotificationController', () => {
  let controller: FcmNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FcmNotificationController],
      providers: [FcmNotificationService],
    }).compile();

    controller = module.get<FcmNotificationController>(FcmNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
