import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          status: 1,
          type: {
            not: 'user',
          },
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          type: true,
        },
      });
      const usersWithFullName = users.map((user) => ({
        id: user.id,
        email: user.email,
        full_name: `${user.first_name} ${user.last_name}`,
        type: user.type,
      }));

      return {
        success: true,
        data: usersWithFullName,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
