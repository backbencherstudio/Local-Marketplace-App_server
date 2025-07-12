import { Module } from '@nestjs/common';
import { UserManagementService } from './user_management.service';
import { UserManagementController } from './user_management.controller';

@Module({
  controllers: [UserManagementController],
  providers: [UserManagementService],
})
export class UserManagementModule {}
