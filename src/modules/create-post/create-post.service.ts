import { CreatePostDto } from './dto/create-create-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import appConfig from 'src/config/app.config';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { UpdatePostDto } from './dto/update-create-post.dto';
@Injectable()
export class CreatePostService {
   constructor(private readonly prisma: PrismaService, private jwtService: JwtService,) { }
  async createPost(createSellerDto: CreatePostDto, files: Express.Multer.File[], req: any) {
    try {
      const validServiceTypes = ['Services', 'Jobs', 'For_sale', 'Gigs', 'Community', 'Help'];
      let expiresDate: Date | null = null;
      const userId = req.user.userId;
      const categoryId = createSellerDto.categoryId;

      const chekUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
      });

      const checkCategory = await this.prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, title: true, parent_id: true, parent_name: true },
      });

      if (!checkCategory) {
        return { message: 'Category not found' };
      }

      if (!validServiceTypes.includes(createSellerDto.type)) {
        return { message: 'Invalid service type' };
      }

      if (checkCategory.parent_name !== createSellerDto.type) {
        return { message: `The selected category's parent must be of type '${createSellerDto.type}'` };
      }

      if (!chekUser) {
        throw new Error('User not found');
      }

      if (chekUser.type === 'buyer') {
        if (createSellerDto.type !== 'Jobs' && createSellerDto.type !== 'Help') {
          return { message: 'Buyers can only create Jobs or Help services' };
        }
      } else if (chekUser.type === 'seller') {
        if (createSellerDto.type === 'Help') {
          return { message: 'Sellers cannot create Help services' };
        }
      } else {
        return { message: 'Invalid user type' };
      }

      if (createSellerDto.expiresAt) {
        const now = new Date();
        switch (createSellerDto.expiresAt) {
          case 'days_7':
            expiresDate = new Date(now.setDate(now.getDate() + 7));
            break;
          case 'days_14':
            expiresDate = new Date(now.setDate(now.getDate() + 14));
            break;
          case 'days_30':
            expiresDate = new Date(now.setDate(now.getDate() + 30));
            break;
          default:
            return { message: 'Invalid date value. Please try with a valid date (days_7, days_14, or days_30)' };
        }
      }

      const postData: any = {
        type: createSellerDto.type,
        title: createSellerDto.title,
        description: createSellerDto.description,
        location: createSellerDto.location,
        category_id: checkCategory.id,
        user_id: chekUser.id,
        tags: createSellerDto.tags ? (Array.isArray(createSellerDto.tags) ? createSellerDto.tags : [createSellerDto.tags]) : [],
        expires_at: createSellerDto.expiresAt,
        expires_date: expiresDate,
        allow_chat_only: createSellerDto.allow_chat_only,
        show_chat_info: createSellerDto.show_chat_info,
      };

      switch (createSellerDto.type) {
        case 'Services':
          postData.price = createSellerDto.price;
          postData.tags = Array.isArray(createSellerDto.tags) ? createSellerDto.tags : [createSellerDto.tags];
          break;
        case 'Jobs':
          postData.salary_range = createSellerDto.salary_range;
          postData.salary_type = createSellerDto.salaryType;
          break;
        case 'For_sale':
        case 'Gigs':
          postData.price = createSellerDto.price;
          postData.tags = Array.isArray(createSellerDto.tags) ? createSellerDto.tags : [createSellerDto.tags];
          break;
        case 'Community':
          break;
        case 'Help':
          postData.price = createSellerDto.price;
          break;
        default:
          throw new Error("Unknown service type");
      }

      const post = await this.prisma.services.create({
        data: postData,
      });

      const fileUrls = [];
      if (files && files.length > 0) {
        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
          const file = files[fileIndex];
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileName = `${randomName}${file.originalname}`;
          const storagePath = `${appConfig().storageUrl.image}/${fileName}`;
          try {
            await SojebStorage.put(storagePath, file.buffer);
            fileUrls.push(storagePath);
          } catch (error) {
            console.error(`Failed to upload file ${fileName}: `, error);
            throw new Error('File upload failed: ' + error.message);
          }
        }
      }

      const updatedPost = await this.prisma.services.update({
        where: { id: post.id },
        data: {
          thumbnail: fileUrls[0],
        },
      });

      return { post: updatedPost };
    } catch (error) {
      console.error('Error during post creation: ', error);
      throw new Error('Failed to create post: ' + error.message);
    }
  }
  async getAllPosts(userId: string, page: number = 0, pageSize: number = 10, status?: string) {
    try {
      let whereCondition: any = { user_id: userId };

      if (status) {
        whereCondition.status = status;
      }

      const posts = await this.prisma.services.findMany({
        where: whereCondition,
        select: {
          id: true,
          type: true,
          title: true,
          thumbnail: true,
          location: true,
          status: true,
          price: true,
          created_at: true,
          is_accepted: true,
          rejected_at: true,
          rejected_reason: true,
          is_reported: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              title: true,
              parent_id: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: page * pageSize,
        take: pageSize,
      });

      if (posts.length === 0) {
        return { message: 'No posts found for this user' };
      }

      const formattedPosts = posts.map(post => ({
        id: post.id,
        type: post.type,
        title: post.title,
        thumbnail: post.thumbnail,
        location: post.location,
        status: post.status,
        price: post.price,
        post_status: post.status,
        created_at: post.created_at,
        is_accepted: post.is_accepted,
        is_reported: post.is_reported,
        rejected_at: post.rejected_at,
        rejected_reason: post.rejected_reason,
        user_id: post.user.id,
        user_name: post.user.name,
        user_email: post.user.email,
        category_id: post.category.id,
        category_title: post.category.title,
        category_parent_id: post.category.parent_id || null,
      }));

      return formattedPosts;
    } catch (error) {
      console.error(`Error fetching posts for userId ${userId}:`, error);
      throw new Error(`Failed to fetch posts for userId ${userId}`);
    }
  }
  async updatePost(updateDto: UpdatePostDto, files: Express.Multer.File[], req: any, serviceId: string) {
    try {
      const validServiceTypes = ['Services', 'Jobs', 'For_sale', 'Gigs', 'Community', 'Help'];
      let expiresDate: Date | null = null;
      const userId = req.user.userId;
      const categoryId = updateDto.categoryId;

      if (!serviceId) {
        throw new Error('Service ID is required for the update');
      }

      const chekUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
      });

      const checkCategory = await this.prisma.category.findUnique({
        where: { id: categoryId },
        select: { id: true, title: true, parent_id: true, parent_name: true },
      });

      if (!checkCategory) {
        return { message: 'Category not found' };
      }

      if (!validServiceTypes.includes(updateDto.type)) {
        return { message: 'Invalid service type' };
      }

      if (checkCategory.parent_name !== updateDto.type) {
        return { message: `The selected category's parent must be of type '${updateDto.type}'` };
      }

      if (!chekUser) {
        throw new Error('User not found');
      }

      if (chekUser.type === 'buyer') {
        if (updateDto.type !== 'Jobs' && updateDto.type !== 'Help') {
          return { message: 'Buyers can only create Jobs or Help services' };
        }
      } else if (chekUser.type === 'seller') {
        if (updateDto.type === 'Help') {
          return { message: 'Sellers cannot create Help services' };
        }
      } else {
        return { message: 'Invalid user type' };
      }

      const post = await this.prisma.services.findUnique({
        where: { id: serviceId, user_id: userId },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      if (
        updateDto.expiresAt !== undefined &&
        updateDto.expiresAt !== post.expires_at
      ) {
        return { message: 'You cannot update the expiration date. Please delete this post and repost it.' };
      }

      if (
        updateDto.allow_chat_only !== undefined &&
        updateDto.allow_chat_only !== post.allow_chat_only
      ) {
        return { message: 'You cannot update the "allow chat only" field. Please delete this post and repost it.' };
      }

      if (
        updateDto.show_chat_info !== undefined &&
        updateDto.show_chat_info !== post.show_chat_info
      ) {
        return { message: 'You cannot update the "show chat info" field. Please delete this post and repost it.' };
      }

      // Calculate the expiration date if it's provided
      // if (updateDto.expiresAt) {
      //   const now = new Date();
      //   switch (updateDto.expiresAt) {
      //     case 'days_7':
      //       expiresDate = new Date(now.setDate(now.getDate() + 7));
      //       break;
      //     case 'days_14':
      //       expiresDate = new Date(now.setDate(now.getDate() + 14));
      //       break;
      //     case 'days_30':
      //       expiresDate = new Date(now.setDate(now.getDate() + 30));
      //       break;
      //     default:
      //       expiresDate = null;
      //       break;
      //   }
      // }

      const postData: any = {
        type: updateDto.type,
        title: updateDto.title,
        description: updateDto.description,
        location: updateDto.location,
        category_id: checkCategory.id,
        tags: updateDto.tags ? (Array.isArray(updateDto.tags) ? updateDto.tags : [updateDto.tags]) : [],
        user_id: chekUser.id,
        expires_at: updateDto.expiresAt,
        expires_date: expiresDate,
        allow_chat_only: updateDto.allow_chat_only,
        show_chat_info: updateDto.show_chat_info,
      };

      switch (updateDto.type) {
        case 'Services':
          postData.price = updateDto.price;
          postData.tags = Array.isArray(updateDto.tags) ? updateDto.tags : [updateDto.tags];
          break;
        case 'Jobs':
          postData.salary_range = updateDto.salary_range;
          postData.salary_type = updateDto.salaryType;
          break;
        case 'For_sale':
        case 'Gigs':
          postData.price = updateDto.price;
          postData.tags = Array.isArray(updateDto.tags) ? updateDto.tags : [updateDto.tags];
          break;
        case 'Community':
          break;
        case 'Help':
          break;
        default:
          throw new Error("Unknown service type");
      }

      const updatedPost = await this.prisma.services.update({
        data: postData,
        where: { id: serviceId, user_id: userId },
      });

      const fileUrls = [];
      if (files && files.length > 0) {
        if (updatedPost.thumbnail) {
          try {
            const existingThumbnail = updatedPost.thumbnail;
            await SojebStorage.delete(existingThumbnail);
            console.log(`Deleted old thumbnail: ${existingThumbnail}`);
          } catch (error) {
            console.error(`Error deleting old image: ${updatedPost.thumbnail}`, error);
          }
        }

        for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
          const file = files[fileIndex];
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          const fileName = `${randomName}${file.originalname}`;
          const storagePath = `${appConfig().storageUrl.image}/${fileName}`;
          try {
            await SojebStorage.put(storagePath, file.buffer);
            fileUrls.push(storagePath);
          } catch (error) {
            console.error(`Failed to upload file ${fileName}: `, error);
            throw new Error('File upload failed: ' + error.message);
          }
        }
      }

      const finalUpdatedPost = await this.prisma.services.update({
        where: { id: updatedPost.id },
        data: {
          thumbnail: fileUrls[0],
        },
      });

      return { post: finalUpdatedPost };
    } catch (error) {
      console.error('Error during post update: ', error);
      throw new Error('Failed to update post: ' + error.message);
    }
  }
  async getPostById(postId: string, userId: any) {
    try {
      const post = await this.prisma.services.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              title: true,
              parent_id: true,
            },
          },
        },
      });

      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    } catch (error) {
      console.error(`Error fetching post with ID ${postId}:`, error);
      throw new Error(`Failed to fetch post with ID ${postId}`);
    }
  }
  async deletePost(postId: string, req: any) {
    try {
      const userId = req.user.userId;

      const chekUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
      });

      if (!chekUser) {
        throw new Error('User not found');
      }

      const post = await this.prisma.services.findUnique({
        where: { id: postId, user_id: userId },
      });

      if (!post) {
        throw new Error('Service not found');
      }

      if (post.user_id !== userId) {
        throw new Error('You are not authorized to delete this service');
      }

      await this.prisma.services.delete({
        where: { id: postId },
      });

      return { message: 'Service deleted successfully' };
    } catch (error) {
      console.error('Error during post deletion: ', error);
      throw new Error('Failed to delete post: ' + error.message);
    }
  }
}
