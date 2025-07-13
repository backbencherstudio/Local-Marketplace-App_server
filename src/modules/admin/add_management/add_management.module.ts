import { Module } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { AddManagementController } from './add_management.controller';

@Module({
  controllers: [AddManagementController],
  providers: [AddManagementService],
})
export class AddManagementModule {}
