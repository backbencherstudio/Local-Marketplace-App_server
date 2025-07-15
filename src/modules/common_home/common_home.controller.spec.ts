import { Test, TestingModule } from '@nestjs/testing';
import { CommonHomeController } from './common_home.controller';
import { CommonHomeService } from './common_home.service';

describe('CommonHomeController', () => {
  let controller: CommonHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonHomeController],
      providers: [CommonHomeService],
    }).compile();

    controller = module.get<CommonHomeController>(CommonHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
