import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from './user_management.controller';
import { UserManagementService } from './user_management.service';

describe('UserManagementController', () => {
  let controller: UserManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [UserManagementService],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
