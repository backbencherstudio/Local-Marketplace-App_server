import { Test, TestingModule } from '@nestjs/testing';
import { AdminHomeService } from './admin_home.service';

describe('AdminHomeService', () => {
  let service: AdminHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminHomeService],
    }).compile();

    service = module.get<AdminHomeService>(AdminHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
