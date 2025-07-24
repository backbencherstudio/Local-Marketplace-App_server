import { Module } from '@nestjs/common';
import { AdminHomeService } from './admin_home.service';
import { AdminHomeController } from './admin_home.controller';

@Module({
  controllers: [AdminHomeController],
  providers: [AdminHomeService],
})
export class AdminHomeModule {}
