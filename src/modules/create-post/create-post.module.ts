import { Module } from '@nestjs/common';
import { CreatePostService } from './create-post.service';
import { CreatePostController } from './create-post.controller';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CreatePostController],
  providers: [CreatePostService, JwtService],
})
export class CreatePostModule {}
