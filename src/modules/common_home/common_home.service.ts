import { Injectable } from '@nestjs/common';
import { CreateCommonHomeDto } from './dto/create-common_home.dto';
import { UpdateCommonHomeDto } from './dto/update-common_home.dto';

@Injectable()
export class CommonHomeService {
  create(createCommonHomeDto: CreateCommonHomeDto) {
    return 'This action adds a new commonHome';
  }

  findAll() {
    return `This action returns all commonHome`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commonHome`;
  }

  update(id: number, updateCommonHomeDto: UpdateCommonHomeDto) {
    return `This action updates a #${id} commonHome`;
  }

  remove(id: number) {
    return `This action removes a #${id} commonHome`;
  }
}
