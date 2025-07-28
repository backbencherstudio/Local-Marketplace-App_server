import { Injectable } from '@nestjs/common';
import { CreateAdminHomeDto } from './dto/create-admin_home.dto';
import { UpdateAdminHomeDto } from './dto/update-admin_home.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminHomeService {
  constructor(private readonly prisma: PrismaService) { }
  async getTotalUsers() {
    const totalUsers = await this.prisma.user.count();
    return {
      mesesage: 'Total users fetched successfully',
      totalUsers: totalUsers,
    };
  }
  async getTotalActivePosts() {
    const totalActivePosts = await this.prisma.services.count({
      where: {
        status: 'active',
      },
    });
    return {
      message: 'Total active posts fetched successfully',
      totalActivePosts: totalActivePosts,
    };
  }
  async getTotalInactivePosts() {
    const totalInactivePosts = await this.prisma.services.count({
      where: {
        status: 'pending'
      },
    });
    return {
      message: 'Total inactive posts fetched successfully',
      totalInactivePosts: totalInactivePosts,
    };
  }
  async getTotalReports() {
    return this.prisma.report.count().then(totalReports => {
      return {
        message: 'Total reports fetched successfully',
        totalReports: totalReports,
      };
    });
  }
  async getPopularCategories() {
    const allCategories = ["Services", "Job", "For Sale", "Gigs", "Help", "Community"];

    const categories = await this.prisma.category.findMany({
      where: {
        Services: {
          some: {
            status: 'active',
          },
        },
      },
      select: {
        parent_name: true,
        _count: {
          select: { Services: true },
        },
      },
      orderBy: {
        Services: {
          _count: 'desc',
        },
      },
    });

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.parent_name] = cat._count.Services;
      return acc;
    }, {} as Record<string, number>);

    const mergedCategories = allCategories.map((name) => ({
      name,
      count: categoryMap[name] || 0,
    }));

    const total = mergedCategories.reduce((sum, cat) => sum + cat.count, 0);

    const popularCategories = mergedCategories.map((cat) => ({
      name: cat.name,
      count: cat.count,
      percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
    }));

    return {
      message: 'Popular categories fetched successfully',
      popularCategories,
    };
  }
  // user activity chart
  async getUserActivityByYear(year: number) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const result = [];

    for (const month of months) {
      const monthIndex = months.indexOf(month) + 1;

      const startDate = new Date(`${year}-${monthIndex.toString().padStart(2, '0')}-01T00:00:00.000Z`);

      const nextMonthIndex = monthIndex === 12 ? 1 : monthIndex + 1; // If December, next month will be January (1)
      const endDate = new Date(`${year}-${nextMonthIndex.toString().padStart(2, '0')}-01T00:00:00.000Z`);



      const usersInMonth = await this.prisma.user.count({
        where: {
          created_at: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      result.push({
        month,
        users: usersInMonth || 0,
      });
    }

    return result;
  }
  //ads status
  async getAdsStatus() {
    const getAllparentCategories = await this.prisma.category.findMany({
      where: {
        parent_id: null,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const categoriesOfServices = await this.prisma.services.findMany({
      select: {
        category_id: true,
        status: true,
        category: {
          select: {
            parent_name: true,
            parent_id: true,
          },
        },
      },
    });

    const statusCounts = {};

    categoriesOfServices.forEach((service) => {
      const parentId = service.category.parent_id;
      const status = service.status;

      if (!statusCounts[parentId]) {
        statusCounts[parentId] = {
          parent_name: service.category.parent_name,
          active: 0,
          pending: 0,
          rejected: 0,
        };
      }

      if (statusCounts[parentId][status] !== undefined) {
        statusCounts[parentId][status]++;
      }
    });

    const adsStatus = getAllparentCategories.map((category) => {
      const categoryId = category.id;
      const statusData = statusCounts[categoryId] || { active: 0, pending: 0, rejected: 0 };

      return {
        title: category.title,
        active: statusData.active,
        pending: statusData.pending,
        rejected: statusData.rejected,
      };
    });

    return {
      message: 'Ads status fetched successfully',
      data: adsStatus,
    };
  }
  //get popular locations 
  async getpopularLocations() {
    const popularLocations = await this.prisma.services.groupBy({
      by: ['location'],
      _count: {
        location: true,
      },
      where: {
        status: 'active',
      },
      orderBy: {
        _count: {
          location: 'desc',
        },
      },

    });

    const result = popularLocations.map(location => ({
      location: location.location,
      servicesCount: location._count.location,
    }));

    return {
      message: 'Popular locations fetched successfully',
      popularLocations: result,
    };
  }

}