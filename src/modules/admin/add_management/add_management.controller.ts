import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddManagementService } from './add_management.service';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';

@Controller('add-management')
export class AddManagementController {
  constructor(private readonly addManagementService: AddManagementService) {}

  @Post()
  create(@Body() createAddManagementDto: CreateAddManagementDto) {
    return this.addManagementService.create(createAddManagementDto);
  }

  @Get()
  findAll() {
    return this.addManagementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addManagementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddManagementDto: UpdateAddManagementDto) {
    return this.addManagementService.update(+id, updateAddManagementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addManagementService.remove(+id);
  }
}
