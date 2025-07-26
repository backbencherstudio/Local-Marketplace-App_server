import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category, ServiceStatus } from '@prisma/client';
import { FirebaseService } from 'src/modules/firebase/firebase.service';

@Injectable()
export class AddManagementService {
  constructor(private readonly prisma: PrismaService , private readonly firebaseService:FirebaseService) { }


  //category management methods
  async createCategory(createCategoryDto: CreateCategoryDto) {

    const existingCategory = await this.prisma.category.findUnique({
      where: { id: createCategoryDto.parent_id },
      select: { id: true , title: true},
    });
    if (!existingCategory) {
      return {
        message: 'Parent category not found', 
    }   };
    
    if (existingCategory.title !== null || existingCategory.title !== undefined) {
      return {
        message: 'This is not a parent category, you cannot create a subcategory under it',
      };

    }
    const category = await this.prisma.category.create({
      data: {
        title: createCategoryDto.title,
        slug: createCategoryDto.slug,
        parent_id: existingCategory.id,
        parent_name: existingCategory.title,
      },
    });
    return category;
  }
  async getAllparent() {
    const parentCategories = await this.prisma.category.findMany({
      where: {
        parent_id: null, // Assuming parent categories have no parent_id
      },
    });
    return parentCategories;
  }
  async getCategoriesByParentId(parentId: string): Promise<Category[]> {
    try {
      const categories = await this.prisma.category.findMany({
        where: {
          parent_id: parentId,
        },
      });

      return categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }
  async getAllCategories() {
    const categories = await this.prisma.category.findMany();
    return categories;
  }
  async deleteCategory(id: string) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { id: id },
    });
    await this.prisma.category.delete({
      where: { id: id },
    });
    return {
      message: 'Category deleted successfully',
      data: existingCategory,
    };
  }


  // add management methods
  async getAllPosts(filters: {
    status?: ServiceStatus;
    category?: string;
    country?: string;
    state?: string;
    city?: string;
  }): Promise<{ message: string; data: any[] }> {
    const { status, category, country, state, city } = filters;

    const filterConditions = {
      status: status ? { equals: status } : undefined,
      category: category ? { parent_name: { equals: category } } : undefined,
      location: {
        country: country ? { equals: country } : undefined,
        state: state ? { equals: state } : undefined,
        city: city ? { equals: city } : undefined,
      },
    };

    const cleanFilters = Object.keys(filterConditions).reduce((acc, key) => {
      const value = filterConditions[key];
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});

    const posts = await this.prisma.services.findMany({
      where: {
        ...cleanFilters,
        status: { not: 'pending' },
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
        status: true,
      },
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      thumbnail: post.thumbnail,
      category: post.category.parent_name,
      username: post.user.username,
      location: post.location,
      status: post.status,
    }));

    return {
      message: "All posts fetched successfully",
      data: formattedPosts,
    };
  }
  async getAllpendingPosts() {
    const posts = await this.prisma.services.findMany({
      where: {
        status: 'pending',
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
    });

    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      thumbnail: post.thumbnail,
      category: post.category.parent_name,
      username: post.user.username,
      location: post.location,
    }));

    return {
      message: "All pending posts fetched successfully",
      data: formattedPosts,
    };

  }
  async getOnePost(id: string) {
    const post = await this.prisma.services.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        category: {
          select: {
            parent_name: true,
          },
        },
        user: {
          select: {
            username: true,
            id: true,
            country: true,
            state: true,
            city: true,
          },
        },
        location: true,
        thumbnail: true,
        expires_date: true,
        status: true,
        tags: true,

      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const formattedPost = {
      id: post.id,
      thumbnail: post.thumbnail,
      title: post.title,
      description: post.description,
      price: post.price,
      category: post.category.parent_name,
      posted_by: post.user.username,
      poster_id: post.user.id,
      location: post.location,
      expiresAt: post.expires_date,
      tags: post.tags,
      status: post.status,
    };

    return formattedPost;
  }
  async approvePost(id: string, req: any) {
    const user = req.user.userId
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user,
        type: 'admin',
      },
    });


    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    if (currentUser.type !== 'admin') {
      return {
        success: false,
        message: 'Only admins can pause posts',
      };
    }

    const post = await this.prisma.services.findFirst({
      where: {
        id: id,
        AND: [
          { status: 'pause' },
          { status: 'pending' }
        ],
      },
    });
    if (!post) {
      return {
        success: false,
        message: 'No service available with the status pending or pause. Post not found.',
      };
    }

    const updatepost = await this.prisma.services.update({
      where: { id: id },
      data: {
        status: 'active',
        is_accepted: true,
        rejected_at: null,
        rejected_reason: null,
        is_paused: false,
        paused_reason: null,
        paused_at: null,
      },
    });

    return {
      message: 'Post has been active successfully',
      data: updatepost,
    };
  }
  async pausePost(id: string, reason: string, req: any) {
    const userId = req.user.userId;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    if (currentUser.type !== 'admin') {
      return {
        success: false,
        message: 'Only admins can pause posts',
      };
    }
    const post = await this.prisma.services.findFirst({
      where: {
        id: id,
        status: 'active',
      },
    });
    if (!post) {
      return {
        success: false,
        message: 'No service available with the status "active". Post not found.',
      };
    }
    const updatedPost = await this.prisma.services.update({
      where: { id },
      data: {
        is_paused: true,
        paused_at: new Date(),
        paused_reason: reason,
        status: 'pause',
      },
    });

    return {
      success: true,
      message: 'Post has been paused successfully',
      data: updatedPost,
    };
  }
  async rejectPost(id: string, reason: string, req: any) {
    const userId = req.user.userId;
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!currentUser) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    if (currentUser.type !== 'admin') {
      return {
        success: false,
        message: 'Only admins can pause posts',
      };
    }
    const post = await this.prisma.services.findFirst({
      where: {
        id: id,
        status: 'pending',
      },
    });
    if (!post) {
      return {
        success: false,
        message: 'No service available with the status pending. Post not found.',
      };
    }
    const updatedPost = await this.prisma.services.update({
      where: { id },
      data: {
        is_accepted: false,
        rejected_at: new Date(),
        rejected_reason: reason,
        status: 'rejected',
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: post.user_id },
      select: {
        id: true,
        email: true,
        name: true,
        device_token: true,
        device_type: true,
      },
    });

    const admin = await this.prisma.user.findFirst({
      where: { type: 'admin' },
    });

    // Send notification to the user about the rejection
    
    await this.firebaseService.sendNotification(
      user.id,
      user.device_token,
      'Post Rejected',
      `Your post "${post.title}" has been rejected. Reason: ${reason}`,
      user.device_type,
    );
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    await this.firebaseService.sendNotification(
      admin.id,
      admin.device_token,
      'Post Rejected',
      `The post "${post.title}" has been succesfully rejected `,
      admin.device_type,
    );
  

    return {
      success: true,
      message: 'Post has been rejected successfully',
      data: updatedPost,
    };
  }
}
