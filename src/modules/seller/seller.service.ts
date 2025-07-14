import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import appConfig from 'src/config/app.config';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { CreatePostDto } from './dto/create-post-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService, private jwtService: JwtService,) { }

  async createPost(createSellerDto: CreatePostDto, files: Express.Multer.File[], req: any) {
    try {


      const validServiceTypes = ['Services', 'Jobs', 'For_sale', 'Gigs', 'Community', 'Help'];
      let expiresDate: Date | null = null;
      const userId = req.user.userId;
      const chekUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, type: true },
      });


      if (!chekUser) {
        throw new Error('User not found');
      }
      if (!validServiceTypes.includes(createSellerDto.type)) {
        return { message: 'Invalid service type' };
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
            expiresDate = null;
            break;
        }
      }
      const postData: any = {
        type: createSellerDto.type,
        title: createSellerDto.title,
        description: createSellerDto.description,
        location: createSellerDto.location,
        category_id: createSellerDto.categoryId,
        user_id: chekUser.id,
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
}
