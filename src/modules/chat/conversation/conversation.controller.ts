import {
  Req,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';

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

  // for user-specific conversations
  @ApiOperation({ summary: 'Get all conversations for a user' })
  @Get('user')  
  async findAllForUser(@Req() req: any) {
    const userId = req.user.userId; 
    try {
      const conversations = await this.conversationService.findAllByUserId(userId);
      return conversations;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
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

  @ApiOperation({ summary: 'Get a conversation by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const conversation = await this.conversationService.findOne(id);
      return conversation;
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
