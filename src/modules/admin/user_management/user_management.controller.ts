import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, Put } from '@nestjs/common';
import { UserManagementService } from './user_management.service';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';
import { Suspended } from '@prisma/client';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) { }


  @Get()
  async findAll(
    @Query('userType') userType: string,
    @Query('status') status: number,
    @Query('country') country: string,
    @Query('state') state: string,
    @Query('city') city: string
  ) {
    return this.userManagementService.findAllUsers(userType, status, country, state, city);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id);
  }

  @Put('suspend/:id')
  async suspendUser(
    @Param('id') id: string,
    @Body() suspensionData: { suspensionType: Suspended }
  ) {
    if (!Object.values(Suspended).includes(suspensionData.suspensionType)) {
      throw new HttpException('Invalid suspension type', HttpStatus.BAD_REQUEST);
    }
    const result = await this.userManagementService.suspendUser(id, suspensionData.suspensionType);
    if (result.message === 'User not found') {
      throw new HttpException(result.message, HttpStatus.NOT_FOUND);
    }

    return result;
  }

  @Put('active/:id')
  async activeUser(@Param('id') id: string) {
    const result = await this.userManagementService.activeUser(id);
    if (result.message === 'User not found') {
      throw new HttpException(result.message, HttpStatus.NOT_FOUND);
    }

    return result;
  }

}
