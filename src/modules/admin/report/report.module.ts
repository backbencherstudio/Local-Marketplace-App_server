import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ReportController],
  providers: [ReportService, JwtService],
})
export class ReportModule {}
