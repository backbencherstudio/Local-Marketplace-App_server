import { Test, TestingModule } from '@nestjs/testing';
import { FcmNotificationService } from './fcm_notification.service';

describe('FcmNotificationService', () => {
  let service: FcmNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmNotificationService],
    }).compile();

    service = module.get<FcmNotificationService>(FcmNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
