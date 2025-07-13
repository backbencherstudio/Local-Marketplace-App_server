import { Injectable } from '@nestjs/common';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';

@Injectable()
export class AddManagementService {
  create(createAddManagementDto: CreateAddManagementDto) {
    return 'This action adds a new addManagement';
  }

  findAll() {
    return `This action returns all addManagement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} addManagement`;
  }

  update(id: number, updateAddManagementDto: UpdateAddManagementDto) {
    return `This action updates a #${id} addManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} addManagement`;
  }
}
