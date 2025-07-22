import { Test, TestingModule } from '@nestjs/testing';
import { AdminHomeController } from './admin_home.controller';
import { AdminHomeService } from './admin_home.service';

describe('AdminHomeController', () => {
  let controller: AdminHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHomeController],
      providers: [AdminHomeService],
    }).compile();

    controller = module.get<AdminHomeController>(AdminHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
