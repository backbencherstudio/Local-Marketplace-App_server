import { Module } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { AddManagementController } from './add_management.controller';
import { MailModule } from 'src/mail/mail.module';
import { FirebaseModule } from 'src/modules/firebase/firebase.module';

@Module({
  imports: [MailModule,FirebaseModule], // Import MailModule if needed for email notifications
  controllers: [AddManagementController],
  providers: [AddManagementService],
})
export class AddManagementModule {}
 