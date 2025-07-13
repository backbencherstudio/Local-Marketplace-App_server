import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserManagementService } from './user_management.service';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}


  @Get()
  findAll() {
    return this.userManagementService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id);
  }

}
