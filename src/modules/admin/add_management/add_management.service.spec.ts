import { Test, TestingModule } from '@nestjs/testing';
import { AddManagementService } from './add_management.service';

describe('AddManagementService', () => {
  let service: AddManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AddManagementService],
    }).compile();

    service = module.get<AddManagementService>(AddManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
