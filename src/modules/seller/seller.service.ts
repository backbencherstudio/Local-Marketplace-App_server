import { Injectable } from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import appConfig from 'src/config/app.config';
import { SojebStorage } from 'src/common/lib/Disk/SojebStorage';
import { CreatePostDto } from './dto/create-post-dto';
@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) { }

  async createPost(createSellerDto: CreatePostDto, files: Express.Multer.File[]) {
    try {
      const post = await this.prisma.services.create({
        data: {
          title: createSellerDto.title,
          description: createSellerDto.description,
          thumbnail: createSellerDto.thumbnail,
          tags: Array.isArray(createSellerDto.tags) ? createSellerDto.tags : [createSellerDto.tags],
          price: createSellerDto.price,
          user_id: createSellerDto.userId,
          category_id: createSellerDto.categoryId,
          expires_at: createSellerDto.expiresAt,
          location: createSellerDto.location,
          allow_chat_only: createSellerDto.allow_chat_only,
          show_chat_info: createSellerDto.show_chat_info,
        },
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

            const fileUrl = SojebStorage.url(storagePath);
            console.log('File URL:', fileUrl);
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

      return { post: updatedPost};

    } catch (error) {
      console.error('Error during post creation: ', error);
      throw new Error('Failed to create post: ' + error.message);
    }
  }




  findAll() {
    return `This action returns all seller`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seller`;
  }

  update(id: number, updateSellerDto: UpdateSellerDto) {
    return `This action updates a #${id} seller`;
  }

  remove(id: number) {
    return `This action removes a #${id} seller`;
  }
}
