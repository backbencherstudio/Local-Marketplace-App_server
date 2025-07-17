import { Module } from '@nestjs/common';
import { CommonHomeService } from './common_home.service';
import { CommonHomeController } from './common_home.controller';

@Module({
  controllers: [CommonHomeController],
  providers: [CommonHomeService],
})
export class CommonHomeModule {}
