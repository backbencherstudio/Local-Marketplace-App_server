import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';
import { CreateCategoryDto } from './dto/create-category-dto';

@Controller('add-management')
export class AddManagementController {
  constructor(private readonly addManagementService: AddManagementService) { }

  // category management endpoints
  @Get()
  findAll() {
    return this.addManagementService.getAllCategories();
  }
  @Get('parents')
  getParentCategories() {
    return this.addManagementService.getAllparent();
  }
  @Get('categories/:id')
  getCategoriesByParentId(@Param('id') parentId: string) {
    return this.addManagementService.getCategoriesByParentId(parentId);
  }
  @Post('category')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.addManagementService.createCategory(createCategoryDto);
  }


  // add management endpoints
  @Get('all-posts')
  getAllPosts() {
    return this.addManagementService.getAllPosts();
  }

}
