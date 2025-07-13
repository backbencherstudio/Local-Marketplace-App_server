import { Test, TestingModule } from '@nestjs/testing';
import { AddManagementController } from './add_management.controller';
import { AddManagementService } from './add_management.service';

describe('AddManagementController', () => {
  let controller: AddManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddManagementController],
      providers: [AddManagementService],
    }).compile();

    controller = module.get<AddManagementController>(AddManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
