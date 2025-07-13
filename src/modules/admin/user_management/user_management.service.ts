import { Injectable } from '@nestjs/common';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { map } from 'rxjs';

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
      status: true,
    },
  });

  if (users.length === 0) {
    return {
      message: "success",
      data: [{
        user_id: null,
        email: null,
        username: null,
        name: null,
        phone_number: 'No phone number provided',
        city: 'No city provided',
        state: 'No state provided',
        country: 'No country provided',
        zip_code: 'No zip code provided',
        status: 'No status provided',
        created_at: null,
        updated_at: null
      }]
    };
  }

  const formattedUsers = users.map(user => ({
    ...user,
    created_at: user.created_at ? user.created_at.toISOString() : null,
    updated_at: user.updated_at ? user.updated_at.toISOString() : null,
    user_id: user.id,
    phone_number: user.phone_number || 'No phone number provided',
    address: user.address || 'No address provided',
    city: user.city || 'No city provided',
    state: user.state || 'No state provided',
    country: user.country || 'No country provided',
    zip_code: user.zip_code || 'No zip code provided',
    experience: user.experience ? user.experience.join(', ') : 'No experience provided'
  }));

  return {
    message: "success",
    data: formattedUsers
  };
}


async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        about: true,
        name: true,
        phone_number: true,
        city: true,
        state: true,
        country: true,
        zip_code: true,
        created_at: true,
        updated_at: true,
        status: true,
      },
    });

    if (!user) {
      return {
        message: "User not found",
        data: null
      };
    }

    return {
      message: "success",
      data: {
        ...user,
        created_at: user.created_at ? user.created_at.toISOString() : null,
        updated_at: user.updated_at ? user.updated_at.toISOString() : null,
        phone_number: user.phone_number || 'No phone number provided',
        city: user.city || 'No city provided',
        state: user.state || 'No state provided',
        country: user.country || 'No country provided',
        zip_code: user.zip_code || 'No zip code provided',
        bio: user.about || 'No bio provided',
      }
    };
  }

  update(id: number, updateUserManagementDto: UpdateUserManagementDto) {
    return `This action updates a #${id} userManagement`;
  }

  remove(id: number) {
    return `This action removes a #${id} userManagement`;
  }
}
