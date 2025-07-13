import { Injectable } from '@nestjs/common';
import { CreateAddManagementDto } from './dto/create-add_management.dto';
import { UpdateAddManagementDto } from './dto/update-add_management.dto';
import { CreateCategoryDto } from './dto/create-category-dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Category } from '@prisma/client';

@Injectable()
export class AddManagementService {
  constructor(private readonly prisma: PrismaService) { }

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
}
