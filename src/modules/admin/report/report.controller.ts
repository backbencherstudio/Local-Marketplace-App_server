import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateReportTypeDto } from './dto/create-report-type.dto';
import { CreateReportCategoryDto } from './dto/create-report-category.dto';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  createReportType(@Body() createReportTypeDto: CreateReportTypeDto) {
    return this.reportService.createReportType(createReportTypeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('category')
  createReportCategory(@Body() createReportCategoryDto: CreateReportCategoryDto) {
    return this.reportService.createReportCategory(createReportCategoryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('report-types')
  getAllReportTypes() {
    return this.reportService.getAllReportTypes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('report-categories')
  getAllReportCategories() {
    return this.reportService.getAllReportCategories();
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-report/:serviceId')
  createReport(
    @Body() createReportDto: CreateReportDto,
    @Param('serviceId') serviceId: string,
    @Req() req: any
  ) {
    const userID = req.user?.userId;

    if (!userID) {
      return { message: 'User not authenticated' };
    }

    console.log(`Creating report for service ID: ${serviceId} by user ID: ${userID}`);
    return this.reportService.createReport(createReportDto, req, serviceId);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('all-reports')
  getAllReports() {
    return this.reportService.getAllReports();
  }

  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('report/:id')
  getReportById(@Param('id') id: string) {
    return this.reportService.getReportById(id);
  }


}
