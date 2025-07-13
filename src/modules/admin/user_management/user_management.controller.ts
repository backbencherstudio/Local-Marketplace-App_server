import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserManagementService } from './user_management.service';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';

@Controller('user-management')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  create(@Body() createUserManagementDto: CreateUserManagementDto) {
    return this.userManagementService.create(createUserManagementDto);
  }

  @Get()
  findAll() {
    return this.userManagementService.findAllUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserManagementDto: UpdateUserManagementDto) {
    return this.userManagementService.update(+id, updateUserManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userManagementService.remove(+id);
  }
}
