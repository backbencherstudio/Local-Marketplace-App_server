import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';
import { CreateCategoryDto } from './dto/create-category-dto';
import { ServiceStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';

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

  @Post('bulk-create')
  async bulkCreate() {
    return this.addManagementService.bulkCreateCommunityCategories();
  }

  @Delete('category/:id')
  deleteCategory(@Param('id') id: string) {
    return this.addManagementService.deleteCategory(id);
  }


  // add management endpoints
  @Get('all-posts')
  async getAllPosts(@Query() filters: {
    status?: ServiceStatus;
    category?: string;
    country?: string;
    state?: string;
    city?: string;
  }) {
    return this.addManagementService.getAllPosts(filters);
  }

  @Get('pending-posts')
  getPendingPosts() {
    return this.addManagementService.getAllpendingPosts();
  }

  @Get('view-post/:id')
  async getPostById(@Param('id') id: string) {
    return this.addManagementService.getOnePost(id);
  }


  @Patch('pause/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async pausePost(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.addManagementService.pausePost(id, reason, req);
  }

  @Patch('active/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async active(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.addManagementService.approvePost(id, req);
  }

  @Patch('reject/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)

  async rejectPost(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return this.addManagementService.rejectPost(id, reason, req);
  }

}
