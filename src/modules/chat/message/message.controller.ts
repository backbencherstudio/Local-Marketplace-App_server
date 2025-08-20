import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import appConfig from 'src/config/app.config';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiBearerAuth()
@ApiTags('Message')
@UseGuards(JwtAuthGuard)
@Controller('chat/message')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly messageGateway: MessageGateway,
  ) { }

  // @ApiOperation({ summary: 'Send message' })
  // @Post()
  // async create(
  //   @Req() req: Request,
  //   @Body() createMessageDto: CreateMessageDto,
  // ) {
  //   const user_id = req.user.userId;
  //   const message = await this.messageService.create(user_id, createMessageDto);
  //   if (message.success) {
  //     const messageData = {
  //       message: {
  //         id: message.data.id,
  //         message_id: message.data.id,
  //         body_text: message.data.message,
  //         from: message.data.sender_id,
  //         conversation_id: message.data.conversation_id,
  //         created_at: message.data.created_at,
  //       },
  //     };
  //     this.messageGateway.server
  //       .to(message.data.conversation_id)
  //       .emit('message', {
  //         from: message.data.sender_id,
  //         data: messageData,
  //       });
  //     return {
  //       success: message.success,
  //       message: message.message,
  //     };
  //   } else {
  //     return {
  //       success: message.success,
  //       message: message.message,
  //     };
  //   }
  // }


  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }], {
      storage: diskStorage({
        destination: appConfig().storageUrl.rootUrl + appConfig().storageUrl.attachment,
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${file.originalname.replace(/\s+/g, '-')}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Req() req: Request,
    @Body() createMessageDto: CreateMessageDto,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ) {
    const user_id = req.user.userId;

    if (!files?.attachments?.length && !createMessageDto.message) {
      throw new BadRequestException('Message empty');
    }

    // Process attachments
    const attachments = files?.attachments?.map(file => ({
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
      file: file.filename,
    }));



    const result = await this.messageService.create(
      user_id,
      createMessageDto,
      attachments,
    );

    if (result.success) {
      // Emit real-time event
      this.messageGateway.server
        .to(result.data?.receiver_id)
        .emit('new_message', result.data);

      return {
        success: true,
        data: result.data,
      };
    }

    throw new BadRequestException(result.error)


    // return {
    //   success: false,
    //   message: result.message,
    // };
  }

  // @ApiOperation({ summary: 'Get all messages' })
  // @Get()
  // async findAll(
  //   @Req() req: Request,
  //   @Query()
  //   query: { conversation_id: string; limit?: number; cursor?: string },
  // ) {
  //   const user_id = req.user.userId;
  //   const conversation_id = query.conversation_id as string;
  //   const limit = Number(query.limit);
  //   const cursor = query.cursor as string;
  //   try {
  //     const messages = await this.messageService.findAll({
  //       user_id,
  //       conversation_id,
  //       limit,
  //       cursor,
  //     });
  //     return messages;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }
}
