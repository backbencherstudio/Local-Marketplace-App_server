import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [SellerController],
  providers: [SellerService , JwtService],
})
export class SellerModule {}
