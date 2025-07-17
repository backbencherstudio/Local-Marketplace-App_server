import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommonHomeService } from './common_home.service';
import { CreateCommonHomeDto } from './dto/create-common_home.dto';
import { UpdateCommonHomeDto } from './dto/update-common_home.dto';

@Controller('common-home')
export class CommonHomeController {
  constructor(private readonly commonHomeService: CommonHomeService) {}

  @Post()
  create(@Body() createCommonHomeDto: CreateCommonHomeDto) {
    return this.commonHomeService.create(createCommonHomeDto);
  }

  @Get()
  findAll() {
    return this.commonHomeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commonHomeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommonHomeDto: UpdateCommonHomeDto) {
    return this.commonHomeService.update(+id, updateCommonHomeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commonHomeService.remove(+id);
  }
}
