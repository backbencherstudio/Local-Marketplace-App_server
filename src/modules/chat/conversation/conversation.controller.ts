import {
  Req,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Controller,
  Query,
  BadRequestException,
  Patch,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CategoryBasedConversationDto, CreateConversationDto, OneOnOneConversationDto } from './dto/create-conversation.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Request } from 'express';
@ApiBearerAuth()
@ApiTags('Conversation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat/conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  @ApiOperation({ summary: 'Create conversation' })
  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    try {
      const conversation = await this.conversationService.create(createConversationDto);
      return conversation;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Create general conversation' })
  @Post('general')
  async general(@Body() oneOnOneConversationDto: OneOnOneConversationDto, @Req() req: Request) {
      oneOnOneConversationDto.creator_id = req.user.userId;
      return await this.conversationService.oneOnOne(oneOnOneConversationDto);
  }

  @ApiOperation({ summary: 'Create ad response conversation' })
  @Post('ad-responses')
  async adResponses(@Body() categoryBasedConversationDto: CategoryBasedConversationDto, @Req() req: Request) {
      categoryBasedConversationDto.creator_id = req.user.userId;
      return await this.conversationService.adResponses(categoryBasedConversationDto);
  }


  @ApiOperation({ summary: 'Get all ad response conversations metadata' })
  @Get("metadata")
  async getMetadata(@Req() req: Request) {
      return await this.conversationService.getMetadata(req?.user?.userId);
  }

  @ApiOperation({ summary: 'Get all ad response conversations metadata' })
  @Get("ad-responses/metadata")
  async getServicesMetadata(@Req() req: Request) {
      return await this.conversationService.getServicesMetadata(req?.user?.userId);
  }

  @ApiOperation({ summary: 'Get all general conversations' })
  @Get('general')
  async findAllGeneral(@Req() req: Request) {
      return await this.conversationService.findAllGeneral(req?.user?.userId);
  }

  @ApiOperation({ summary: 'Get all ad response conversations' })
  @Get('ad-responses/:type')
  async findAllAdResponses(@Req() req: Request, @Param('type') type: string) {
      if (!type) {
        throw new BadRequestException("Type is required")
      }
      return await this.conversationService.findServicesConversations(req?.user?.userId, type);
  }

  // GET all blocked users blocked by me
  @ApiOperation({ summary: 'Get all blocked users' })
  @Get('blocked-users')
  async findAllBlockedUsers(@Req() req: Request) {
      return await this.conversationService.findAllBlockedUsers(req?.user?.userId);
  }

  // block the conversation
  @ApiOperation({ summary: 'Block a conversation' })
  @Patch('block/:id')
  async block(@Param('id') id: string, @Req() req: Request) {
      return await this.conversationService.blockConversation(id, req?.user?.userId);
  }

  // unblock the conversation
  @ApiOperation({ summary: 'Unblock a conversation' })
  @Patch('unblock/:id')
  async unblock(@Param('id') id: string, @Req() req: Request) {
      return await this.conversationService.unblockConversation(id, req?.user?.userId);
  }


  // for user-specific conversations with optional type filter
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @Get('user')
  async findAllForUser(
    @Req() req: any,
    @Query('type') type: string, 
  ) {
    const userId = req.user.userId;
    try {
      const conversations = await this.conversationService.findAllByUserId(userId, type);
      return conversations;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Get Ad response count' })
  @Get('user/add-response')
  async findAllForAddResponseUser(@Req() req: any) {
    const userId = req.user.userId;
    try {
      const conversations = await this.conversationService.findConversationsCountByType(userId);
      return conversations;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  @ApiOperation({ summary: 'Get messages' })
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Req() req: Request,
  ) {
    const userId = req.user.userId;
    try {
      const messages = await this.conversationService.findMessages(
        id,
        userId,
        page,
        limit,
      );
      return messages;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }






  // @Patch(':id/block')
  // async block(@Param('id') id: string, @Req() req: Request) {
  //  try {
  //   const userId = req.user.userId;
  //   return await this.conversationService.blockConversation(id, userId);
  //  } catch (error) {
  //   return {
  //     success: false,
  //     message: "Failed to block conversation"
  //   }
  //  }
  // }

  // @Patch(':id/unblock')
  // async unblock(@Param('id') id: string, @Req() req: Request) {
  //  try {
  //   const userId = req.user.userId;
  //   return await this.conversationService.unblockConversation(id, userId);
  //  } catch (error) {
  //   return {
  //     success: false,
  //     message: "Failed to unblock conversation"
  //   }
  //  }
  // }

  // @Delete(':id/soft-delete')
  // async softDelete(@Param('id') id: string, @Req() req: Request) {
  //  try {
  //   const userId = req.user.userId;
  //   return await this.conversationService.softDeleteConversation(id, userId);
  //  } catch (error) {
  //   return {
  //     success: false,
  //     message: "Failed to soft delete conversation"
  //   }
  //  }
  // }


  // @Patch(':id/read')
  // async markAsRead(
  //   @Param('id') conversationId: string,
  //   @Req() req: Request, // Replace with your decorator to get auth user
  // ) {
  //   try {
  //     const userId = req?.user?.userId; // Replace with your decorator to get auth user
  //     const conversation = await this.conversationService.markConversationAsRead(
  //       conversationId,
  //       userId,
  //     );
  //     return conversation;
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  @ApiOperation({ summary: 'Get a conversation by id' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
      return await this.conversationService.findOne(id, req?.user?.userId);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all conversations' })
  @Get()
  async findAll() {
    try {
      const conversations = await this.conversationService.findAll();
      return conversations;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a conversation' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const conversation = await this.conversationService.remove(id);
      return conversation;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
