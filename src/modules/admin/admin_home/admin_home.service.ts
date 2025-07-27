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
  async getTotalPosts() {
    const totalPosts = await this.prisma.services.count();
    return {
      message: 'Total posts fetched successfully',
      totalPosts: totalPosts,
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
  async getTotalApprovedPosts() {
    const totalApprovedPosts = await this.prisma.services.count({
      where: {
        status: 'active',
        is_accepted: true,
      },
    });
    return {
      message: 'Total approved posts fetched successfully',
      totalApprovedPosts: totalApprovedPosts,
    };
  }
  // async getPopularCategories() {
  //   const popularCategories = await this.prisma.category.findMany({
  //     where: {
  //       Services: {
  //         some: {
  //           status: 'active',
  //         },
  //       },
  //     },
  //     select: {
  //       id: true,
  //       parent_name: true,
  //       _count: {
  //         select: { Services: true },
  //       },
  //     },
  //     orderBy: {
  //       Services: {
  //         _count: 'desc',
  //       },
  //     },
  //     take: 5,
  //   });

  //   return {
  //     message: 'Popular categories fetched successfully',
  //     popularCategories: popularCategories,
  //   };
  // }


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




  async getPopularPosts() {
    // 1. Get top 3 most-used categories
    const topCategories = await this.prisma.services.groupBy({
      by: ['category_id'],
      _count: {
        category_id: true,
      },
      orderBy: {
        _count: {
          category_id: 'desc',
        },
      },
      take: 3,
    });

    const topCategoryIds = topCategories.map((c) => c.category_id);

    // 2. Get posts from those top categories
    const popularPosts = await this.prisma.services.findMany({
      where: {
        category_id: {
          in: topCategoryIds,
        },
      },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        category: {
          select: {
            parent_name: true,
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        location: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    return {
      message: 'Popular posts based on trending categories fetched successfully',
      popularPosts,
    };
  }
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
      take: 5,
    });

    return {
      message: 'Popular locations fetched successfully',
      popularLocations: popularLocations,
    };
  }
}