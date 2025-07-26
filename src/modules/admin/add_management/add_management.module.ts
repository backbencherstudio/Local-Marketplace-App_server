import { Module } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { AddManagementController } from './add_management.controller';
import { FirebaseService } from 'src/modules/firebase/firebase.service';

@Module({
  controllers: [AddManagementController],
  providers: [AddManagementService, FirebaseService],
})
export class AddManagementModule {}
