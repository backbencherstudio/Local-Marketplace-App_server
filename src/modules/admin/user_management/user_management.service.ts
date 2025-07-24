import { Injectable } from '@nestjs/common';
import { CreateUserManagementDto } from './dto/create-user_management.dto';
import { UpdateUserManagementDto } from './dto/update-user_management.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { map } from 'rxjs';
import { Suspended } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';
@Injectable()
export class UserManagementService {

  constructor(private readonly prisma: PrismaService, private mailService: MailService) { }
  create(createUserManagementDto: CreateUserManagementDto) {
    return 'This action adds a new userManagement';
  }
  async findAllUsers(userType?: string, status?: number, country?: string, state?: string, city?: string) {
    const filterCondition: any = {};

    // Applying filters based on userType
    if (userType) {
      filterCondition.type = userType;
    }

    if (status) {
      filterCondition.status = status;
    }
    if (country) {
      filterCondition.country = country;
    }
    if (state) {
      filterCondition.state = state;
    }
    if (city) {
      filterCondition.city = city;
    }

  
    filterCondition.type = { not: 'admin' };
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
      let noUsersMessage = 'No users found';
      if (userType === 'Seller') {
        noUsersMessage = 'No sellers found';
      } else if (userType === 'Buyer') {
        noUsersMessage = 'No buyers found';
      }

      if (users) {
        
      }

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
        messageDetail: noUsersMessage,
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
        suspendedUntil = new Date(currentDate);
        suspendedUntil.setDate(suspendedUntil.getDate() + 7);
        break;
      case Suspended.One_Month:
        suspendedUntil = new Date(currentDate);
        suspendedUntil.setMonth(suspendedUntil.getMonth() + 1);
        break;
      case Suspended.Three_Months:
        suspendedUntil = new Date(currentDate);
// Assuming suspendedUntil is a Date object
suspendedUntil.setMinutes(suspendedUntil.getMinutes() + 5);

        break;
    }
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) {
      return {
        message: "User not found",
        data: null,
      };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        status: 0,
        suspended_at: currentDate,
        suspended_until: suspendedUntil,
      },
    });

    await this.prisma.services.updateMany({
      where: { user_id: id },
      data: {
        status: 'pause',
        is_paused: true,
        paused_reason: 'As the user is suspended, all their services are paused.',
      },
    });

    if (!user) {
      return {
        message: "User not found",
        data: null,
      };
    }

    await this.mailService.userSuspendedNotification({
      email: user.email,
      name: user.name || 'User',
    });

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

    await this.prisma.services.updateMany({
      where: { user_id: id },
      data: {
        status: 'active',
        is_paused: false,
        paused_reason: null,
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

