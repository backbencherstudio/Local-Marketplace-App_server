import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AdminHomeService } from './admin_home.service';
import { CreateAdminHomeDto } from './dto/create-admin_home.dto';
import { UpdateAdminHomeDto } from './dto/update-admin_home.dto';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin-home')
export class AdminHomeController {
  constructor(private readonly adminHomeService: AdminHomeService) { }


  @Get()
  getTotalUsers() {
    return this.adminHomeService.getTotalUsers();
  }
  @Get('total-active-posts')
  getTotalActivePosts() {
    return this.adminHomeService.getTotalActivePosts();
  }
  @Get('total-inactive-posts')
  getTotalInactivePosts() {
    return this.adminHomeService.getTotalInactivePosts();
  }
  @Get('total-reports')
  getTotalReports() {
    return this.adminHomeService.getTotalReports();
  }
  @Get('popular-categories')
  getPopularCategories() {
    return this.adminHomeService.getPopularCategories();
  }
  @Get('popular-locations')
  getPopularLocations() {
    return this.adminHomeService.getpopularLocations();
  }
      @Get('status-by-category')
  async getAdsStatusByCategory() {
    const data = await this.adminHomeService.getAdsStatus();
    return data;
  }
    @Get(':year')
  async getUserActivity(@Param('year') year: number) {
    const activity = await this.adminHomeService.getUserActivityByYear(year);
    return activity;
  }


}
