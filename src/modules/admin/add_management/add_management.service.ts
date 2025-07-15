import { Injectable } from '@nestjs/common';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';
import { CreateCategoryDto } from './dto/create-category-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class AddManagementService {
  constructor(private readonly prisma: PrismaService) { }


  //category management methods
  async createCategory(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        title: createCategoryDto.title,
        slug: createCategoryDto.slug,
        parent_id: createCategoryDto.parent_id,
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


  async getAllPosts() {
    const posts = await this.prisma.services.findMany({
     select: {
        id: true,
        title: true,
        thumbnail: true,
        category: {
          select: {
            parent_name: true,
          }},
          user:{
            select:{
              username: true,
            }
          },
          location: true,
          status: true,
     }
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
      message:"All posts fetched successfully",
      data: formattedPosts,
    };
  }


}
