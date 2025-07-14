import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, UseGuards } from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { CreatePostDto } from './dto/create-post-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';



@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-post')
  @UseInterceptors(FilesInterceptor('thumbnail', 10, { 
    storage: memoryStorage(),
  }))  
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
   return this.sellerService.createPost(createPostDto, files , req);
  }
}
