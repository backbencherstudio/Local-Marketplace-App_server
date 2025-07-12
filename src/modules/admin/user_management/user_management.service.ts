import { Injectable } from '@nestjs/common';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserManagementService {

  constructor(private readonly prisma: PrismaService) {}
  create(createUserManagementDto: CreateUserManagementDto) {
    return 'This action adds a new userManagement';
  }

  async findAllUsers() {
     const users = await this.prisma.user.findMany({
       select: {
          id: true,
          email: true,
          username: true,
          name: true,
          phone_number: true,
          address: true,
          experience: true,
          city: true,
          state: true,
          country: true,
          zip_code: true,
          created_at: true,
          updated_at: true,
       }
    });
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} userManagement`;
  }

  update(id: number, updateUserManagementDto: UpdateUserManagementDto) {
    return `This action updates a #${id} userManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} userManagement`;
  }
}
