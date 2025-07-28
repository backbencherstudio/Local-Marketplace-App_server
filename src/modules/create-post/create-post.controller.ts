import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFiles, UseInterceptors, Req, UseGuards, Query, Put } from '@nestjs/common';
import { CreatePostService } from './create-post.service';

import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-create-post.dto';
import { UpdatePostDto } from './dto/update-create-post.dto';
import { get } from 'http';

@Controller('create-post')
export class CreatePostController {
  constructor(private readonly createPostService: CreatePostService) {}

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
      return this.createPostService.createPost(createPostDto, files, req);
    }

    @Get('all-posts')
    async getAllPostss() {
      return this.createPostService.getAllposts();
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('allPosts')
    async getAllPosts(
      @Req() req: any,
      @Query('page') page: number = 0,
      @Query('pageSize') pageSize: number = 10,
      @Query('status') status?: string
    ) {
      const userId = req.user.userId;
      return await this.createPostService.getAllPosts(userId, page, pageSize, status);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @UseInterceptors(FilesInterceptor('thumbnail')) 
    async updateService(
      @Param('id') serviceId: string,
      @Body() updatePostDto: UpdatePostDto,
      @UploadedFiles() files: Express.Multer.File[],
      @Req() req: any,
    ) {
      const userId = req.user.userId;
      return this.createPostService.updatePost(updatePostDto, files, req, serviceId);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('post/:id')
    async getPostById(
      @Param('id') id: string,
      @Req() req: any,
    ) {
      const userId = req.user.userId;
      return this.createPostService.getPostById(id, userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:categoryId')
    async getPostsByCategoryId(
      @Param('categoryId') categoryId: string,
      @Query('page') page: number = 0,
      @Query('pageSize') pageSize: number = 10
    ) {
      return this.createPostService.getPostsByCategoryId(categoryId, page, pageSize);
    }
 
}
