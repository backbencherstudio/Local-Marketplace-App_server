import { Injectable } from '@nestjs/common';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { map } from 'rxjs';
import { Suspended } from '@prisma/client';

@Injectable()
export class UserManagementService {

  constructor(private readonly prisma: PrismaService) {}
  create(createUserManagementDto: CreateUserManagementDto) {
    return 'This action adds a new userManagement';
  }

async findAllUsers(userType?: string) {
    // If userType is provided, filter by it
    const filterCondition = userType ? { type: userType } : {};

    const users = await this.prisma.user.findMany({
      where: filterCondition,
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
        type: true, 
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
        }],
      };
    }

    const formattedUsers = users.map(user => ({
      ...user,
      user_id: user.id,
      created_at: user.created_at ? user.created_at.toISOString() : null,
      updated_at: user.updated_at ? user.updated_at.toISOString() : null,
      phone_number: user.phone_number || 'No phone number provided',
      address: user.address || 'No address provided',
      city: user.city || 'No city provided',
      state: user.state || 'No state provided',
      country: user.country || 'No country provided',
      zip_code: user.zip_code || 'No zip code provided',
      experience: user.experience ? user.experience.join(', ') : 'No experience provided',
      type: user.type || 'No type provided',
    }));

    return {
      message: "success",
      data: formattedUsers,
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
async suspendUser(id: string, suspensionType: Suspended) {
  let suspendedUntil: Date | null = null;
  const currentDate = new Date();

  switch (suspensionType) {
    case Suspended.Until_i_Decide:
      suspendedUntil = null; 
      break;
    case Suspended.One_Week:
      suspendedUntil = new Date(currentDate.setDate(currentDate.getDate() + 7)); 
      break;
    case Suspended.One_Month:
      suspendedUntil = new Date(currentDate.setMonth(currentDate.getMonth() + 1)); 
      break;
    case Suspended.Three_Months:
      suspendedUntil = new Date(currentDate.setMonth(currentDate.getMonth() + 3)); 
      break;
  }

  const user = await this.prisma.user.update({
    where: { id },
    data: {
      status: 0, 
      suspended_at: currentDate, 
      suspended_until: suspendedUntil, 
    },
  });

  if (!user) {
    return {
      message: "User not found",
      data: null,
    };
  }

  return {
    message: "User suspended successfully",
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
      suspended_at: user.suspended_at ? user.suspended_at.toISOString() : null,
      suspended_until: user.suspended_until ? user.suspended_until.toISOString() : null,
    }
  };
}
async activeUser(id: string) {
  const user = await this.prisma.user.update({
    where: { id },
    data: {
      status: 1, 
      suspended_at: null, 
      suspended_until: null, 
    },
  });

  if (!user) {
    return {
      message: "User not found",
      data: null,
    };
  }

  return {
    message: "User activated successfully",
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
}