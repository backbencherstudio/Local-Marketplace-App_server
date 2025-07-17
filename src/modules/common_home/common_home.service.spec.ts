import { Test, TestingModule } from '@nestjs/testing';
import { CommonHomeService } from './common_home.service';

describe('CommonHomeService', () => {
  let service: CommonHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonHomeService],
    }).compile();

    service = module.get<CommonHomeService>(CommonHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
