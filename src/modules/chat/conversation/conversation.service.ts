import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CategoryBasedConversationDto, CreateConversationDto, OneOnOneConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { Category, PrismaClient } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { SojebStorage } from '../../../common/lib/Disk/SojebStorage';
import { DateHelper } from '../../../common/helper/date.helper';
import { MessageGateway } from '../message/message.gateway';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private readonly messageGateway: MessageGateway,
  ) { }

  async create(createConversationDto: CreateConversationDto) {
    try {
      const data: any = {};

      if (createConversationDto.creator_id) {
        data.creator_id = createConversationDto.creator_id;
      }
      if (createConversationDto.participant_id) {
        data.participant_id = createConversationDto.participant_id;
      }
      if (createConversationDto.type) {
        data.type = createConversationDto.type;
      }

      // check if conversation exists
      let conversation = await this.prisma.conversation.findFirst({
        select: {
          id: true,
          creator_id: true,
          participant_id: true,
          created_at: true,
          updated_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          type: true,
          messages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            select: {
              id: true,
              message: true,
              created_at: true,
            },
          },
        },
        where: {
          // Check if the conversation exists with matching creator_id or participant_id
          AND: [
            {
              OR: [
                {
                  creator_id: data.creator_id,
                  participant_id: data.participant_id,
                },
                {
                  creator_id: data.participant_id,
                  participant_id: data.creator_id,
                },
              ],
            },
            {
              type: createConversationDto.type, // Ensure the conversation type matches the type provided in DTO
            },
          ],
        },
      });

      if (conversation) {
        return {
          success: false,
          message: 'Conversation already exists',
          data: conversation,
        };
      }

      conversation = await this.prisma.conversation.create({
        select: {
          id: true,
          creator_id: true,
          participant_id: true,
          created_at: true,
          updated_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          type: true,
          messages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            select: {
              id: true,
              message: true,
              created_at: true,
            },
          },
        },
        data: {
          ...data,
        },
      });

      // add image url
      if (conversation.creator.avatar) {
        conversation.creator['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.creator.avatar,
        );
      }
      if (conversation.participant.avatar) {
        conversation.participant['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.participant.avatar,
        );
      }

      // trigger socket event
      this.messageGateway.server.to(data.creator_id).emit('conversation', {
        from: data.creator_id,
        data: conversation,
      });
      this.messageGateway.server.to(data.participant_id).emit('conversation', {
        from: data.participant_id,
        data: conversation,
      });

      return {
        success: true,
        message: 'Conversation created successfully',
        data: conversation,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async oneOnOne(oneOnOneConversationDto: OneOnOneConversationDto) {
    const data: any = {};

    if (oneOnOneConversationDto.creator_id) {
      data.creator_id = oneOnOneConversationDto.creator_id;
    }
    if (oneOnOneConversationDto.participant_id) {
      data.participant_id = oneOnOneConversationDto.participant_id;
    }

    const participant = await this.prisma.user.findUnique({
      where: {
        id: data.participant_id,
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }


    // check if conversation exists
    let conversation = await this.prisma.conversation.findFirst({
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        creator: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
          },
        },
      },
      where: {
        // Check if the conversation exists with matching creator_id or participant_id
        AND: [
          {
            OR: [
              {
                creator_id: data.creator_id,
                participant_id: data.participant_id,
              },
              {
                creator_id: data.participant_id,
                participant_id: data.creator_id,
              },
            ],
          },
          {
            conversation_type: 'general', // Ensure the conversation type matches the type provided in DTO
          },
        ],
      },
    });



    if (conversation) {

      if (conversation.creator.avatar) {
        conversation.creator['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.creator.avatar,
        );
      }

      if (conversation.participant.avatar) {
        conversation.participant['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.participant.avatar,
        );
      }
      return {
        success: false,
        message: 'Conversation already exists',
        data: conversation,
      };
    }

    // create a new one on one conversation
    conversation = await this.prisma.conversation.create({
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        creator: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
          },
        },
      },
      data: {
        creator_id: data.creator_id,
        participant_id: data.participant_id,
        conversation_type: 'general',
      },
    });
    // add image url
    if (conversation.creator.avatar) {
      conversation.creator['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.creator.avatar,
      );
    }

    if (conversation.participant.avatar) {
      conversation.participant['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.participant.avatar,
      );
    }

    // trigger socket event
    this.messageGateway.server.to(data.creator_id).emit('conversation', {
      from: data.creator_id,
      data: conversation,
    });
    this.messageGateway.server.to(data.participant_id).emit('conversation', {
      from: data.participant_id,
      data: conversation,
    });

    return {
      success: true,
      message: 'Conversation created successfully',
      data: conversation,
    };
  }

  async adResponses(categoryBasedConversationDto: CategoryBasedConversationDto) {
    const data: any = {};

    if (categoryBasedConversationDto.creator_id) {
      data.creator_id = categoryBasedConversationDto.creator_id;
    }

    if (categoryBasedConversationDto.participant_id) {
      // check participant exist or not
      const participant = await this.prisma.user.findUnique({
        where: {
          id: categoryBasedConversationDto.participant_id,
        },
      });
      if (!participant) {
        throw new NotFoundException('Participant not found');
      }
      data.participant_id = categoryBasedConversationDto.participant_id;
    }

    if (categoryBasedConversationDto.post_id) {
      // check post exist or not
      const post = await this.prisma.services.findUnique({
        where: {
          id: categoryBasedConversationDto.post_id,
        },
        select: {
          id: true,
          type: true,
        }
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      data.post_id = categoryBasedConversationDto.post_id;
      data.type = post.type;
    }

    // check if conversation exists
    let conversation = await this.prisma.conversation.findFirst({
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        type: true,
        creator: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
          },
        },
      },
      where: {
        // Check if the conversation exists with matching creator_id or participant_id
        AND: [
          {
            OR: [
              {
                creator_id: data.creator_id,
                participant_id: data.participant_id,
              },
              {
                creator_id: data.participant_id,
                participant_id: data.creator_id,
              },
            ],
          },
          {
            conversation_type: 'ad_responses', // Ensure the conversation type matches the type provided in DTO
          },
          {
            type: data.type,
          },
          {
            post_id: data.post_id,
          },
        ],
      },
    });


    if (conversation) {
      if (conversation.creator.avatar) {
        conversation.creator['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.creator.avatar,
        );
      }

      if (conversation.participant.avatar) {
        conversation.participant['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.participant.avatar,
        );
      }
      return {
        success: false,
        message: 'Conversation already exists',
        data: conversation,
      };
    }

    // create a new one on one conversation
    conversation = await this.prisma.conversation.create({
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        type: true,
        creator: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            first_name: true,
            last_name: true,
            avatar: true,
            availability: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
          },
        },
      },
      data: {
        creator_id: data.creator_id,
        participant_id: data.participant_id,
        conversation_type: 'ad_responses',
        type: data.type,
        post_id: data.post_id,
      },
    });


    // add image url
    if (conversation.creator.avatar) {
      conversation.creator['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.creator.avatar,
      );
    }

    if (conversation.participant.avatar) {
      conversation.participant['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.participant.avatar,
      );
    }

    // trigger socket event
    this.messageGateway.server.to(data.creator_id).emit('conversation', {
      from: data.creator_id,
      data: conversation,
    });
    this.messageGateway.server.to(data.participant_id).emit('conversation', {
      from: data.participant_id,
      data: conversation,
    });

    return {
      success: true,
      message: 'Conversation created successfully',
      data: conversation,
    };
  }

  async getMetadata(userId) {
    const generals = await this.prisma.conversation.count({
      where: {
        conversation_type: 'general',
        OR: [
          {
            creator_id: userId,
            blocked_by_creator: false,
          },
          {
            participant_id: userId,
            blocked_by_participant: false,
          },
        ]
      }
    })

    const adResponses = await this.prisma.conversation.count({
      where: {
        conversation_type: 'ad_responses',
        OR: [
          {
            creator_id: userId,
          },
          {
            participant_id: userId,
          },
        ]
      }
    })

    return {
      success: true,
      message: "Meta data fetched successfully",
      data: {
        generals,
        adResponses,
      }
    }
  }

  async getServicesMetadata(userId) {
    const metadata = await this.prisma.conversation.groupBy({
      by: ['type'],
      where: {
        conversation_type: 'ad_responses',
        OR: [
          {
            creator_id: userId,
            blocked_by_creator: false,
          },
          {
            participant_id: userId,
            blocked_by_participant: false,
          },
        ]
      },
      _count: true,
      orderBy: {
        _max: {
          updated_at: 'desc', // Order by the most recent created conversation
        },
      }
    })


    return {
      success: true,
      message: "Meta data fetched successfully",
      data: metadata,
    }

  }


  async findAllGeneral(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        conversation_type: 'general',
        OR: [
          {
            blocked_by_creator: false,
            creator_id: userId,
          },
          {
            participant_id: userId,
            blocked_by_participant: false,
          },
        ]
      },
      orderBy: {
        updated_at: 'desc', // Order by the most recent updated conversation
      },
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        type: true,
        blocked_by_creator: true,
        blocked_by_participant: true,
        post: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
            is_read: true,
          },
        },
      },
    })


    conversations.forEach((conversation) => {
      if (conversation.creator.avatar) {
        conversation.creator['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.creator.avatar,
        );
      }

      if (conversation.participant.avatar) {
        conversation.participant['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.participant.avatar,
        );
      }
    })


    return {
      success: true,
      message: "General conversations fetched successfully",
      data: conversations,
    }
  }

  async findServicesConversations(userId: string, type: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          conversation_type: 'ad_responses',
          type: type as any,
          OR: [
            {
              creator_id: userId,
              blocked_by_creator: false,
            },
            {
              participant_id: userId,
              blocked_by_participant: false,
            },
          ]
        },
        orderBy: {
          updated_at: 'desc', // Order by the most recent updated conversation
        },
        select: {
          id: true,
          creator_id: true,
          participant_id: true,
          created_at: true,
          updated_at: true,
          type: true,
          blocked_by_creator: true,
          blocked_by_participant: true,
          post: {
            select: {
              id: true,
              title: true,
              type: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
              availability: true,
              last_availability_at: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              avatar: true,
              availability: true,
              last_availability_at: true,
            },
          },
          conversation_type: true,
          last_message: {
            select: {
              id: true,
              message: true,
              created_at: true,
              sender_id: true,
              is_read: true,
            },
          },
        },
      })

      if (!conversations) {
        return {
          success: true,
          message: "No conversations found",
          data: [],
        }
      }



      conversations.forEach((conversation) => {
        if (conversation.creator.avatar) {
          conversation.creator['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.creator.avatar,
          );
        }

        if (conversation.participant.avatar) {
          conversation.participant['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.participant.avatar,
          );
        }
      })


      return {
        success: true,
        message: "Ad responses conversations fetched successfully",
        data: conversations,
      }
    } catch (error) {
      throw new BadRequestException("Type not found")
    }
  }


  // blocked users by me
  async findAllBlockedUsers(userId: string) {
    const blockedUsers = await this.prisma.conversation.findMany({
      where: {
        OR: [
          {
            creator_id: userId,
            blocked_by_creator: true,
          },
          {
            participant_id: userId,
            blocked_by_participant: true,
          },
        ]
      },
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        type: true,
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        conversation_type: true,
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
          },
        },
      },
    })


    blockedUsers.forEach((conversation) => {
      if (conversation.creator.avatar) {
        conversation.creator['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.creator.avatar,
        );
      }

      if (conversation.participant.avatar) {
        conversation.participant['avatar_url'] = SojebStorage.url(
          appConfig().storageUrl.avatar + conversation.participant.avatar,
        );
      }
    })


    return {
      success: true,
      message: "Blocked users fetched successfully",
      data: blockedUsers,
    }
  }

  async blockConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.creator_id === userId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { blocked_by_creator: true },
      });
    } else if (conversation.participant_id === userId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { blocked_by_participant: true },
      });
    } else {
      throw new ForbiddenException('You are not authorized to block this conversation');
    }

    this.messageGateway.server.to(conversation.creator_id === userId ? conversation.participant_id : conversation.creator_id).emit('blocked_conversation', {
      from: userId,
      conversationId: conversationId,
    });

    return {
      success: true,
      message: 'Conversation blocked successfully',
    };
  }

  async unblockConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.creator_id === userId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { blocked_by_creator: false },
      });
    } else if (conversation.participant_id === userId) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: { blocked_by_participant: false },
      });
    } else {
      throw new ForbiddenException('You are not authorized to unblock this conversation');
    }

    this.messageGateway.server.to(conversation.creator_id === userId ? conversation.participant_id : conversation.creator_id).emit('unblocked_conversation', {
      from: userId,
      conversationId: conversationId,
    });

    return {
      success: true,
      message: 'Conversation unblocked successfully',
    };
  }

  // find all conversation for a specific user
  async findAllByUserId(userId: string, type?: string) {
    try {
      const conversations = await this.prisma.conversation.findMany({
        where: {
          type: type as any || undefined,
          OR: [
            { creator_id: userId },
            { participant_id: userId },
          ],
        },
        orderBy: {
          updated_at: 'desc', // Order by the most recent updated conversation
        },
        select: {
          id: true,
          creator_id: true,
          participant_id: true,
          created_at: true,
          updated_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          type: true,
          messages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            select: {
              id: true,
              message: true,
              created_at: true,
            },
          },
        },
      });

      // Add image URLs for avatars
      for (const conversation of conversations) {
        if (conversation.creator.avatar) {
          conversation.creator['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.creator.avatar,
          );
        }
        if (conversation.participant.avatar) {
          conversation.participant['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.participant.avatar,
          );
        }
        if (userId === conversation.participant_id) {
          const tempCreator = conversation.creator;
          const tempParticipant = conversation.participant;
          conversation.participant = tempCreator;
          conversation.creator = tempParticipant;
        }
      }

      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // find all conversation for a specific user
  async findConversationsCountByType(userId: string) {
    try {
      // Group by type and count conversations for each type
      const conversationCountByType = await this.prisma.conversation.groupBy({
        by: ['type'], // Group by 'type' column
        where: {
          OR: [
            { creator_id: userId }, // Match conversations where the user is the creator
            { participant_id: userId }, // Or the participant
          ],
        },
        _count: {
          id: true, // Count the number of conversations (count by 'id')
        },
      });

      // Map the result to the desired structure
      const result = conversationCountByType.map(item => ({
        type: item.type,
        count: item._count.id, // Access the count value
      }));

      return {
        success: true,
        data: result, // Return the result with the type and count
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll() {
    try {
      const conversations = await this.prisma.conversation.findMany({
        orderBy: {
          updated_at: 'desc',
        },
        select: {
          id: true,
          creator_id: true,
          participant_id: true,
          created_at: true,
          updated_at: true,
          creator: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          participant: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          messages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            select: {
              id: true,
              message: true,
              created_at: true,
            },
          },
        },
      });

      // add image url
      for (const conversation of conversations) {
        if (conversation.creator.avatar) {
          conversation.creator['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.creator.avatar,
          );
        }
        if (conversation.participant.avatar) {
          conversation.participant['avatar_url'] = SojebStorage.url(
            appConfig().storageUrl.avatar + conversation.participant.avatar,
          );
        }
      }

      return {
        success: true,
        data: conversations,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findOne(conversationId: string, userId: string) {
    // is user part of conversation or not
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
        OR: [
          { creator_id: userId },
          { participant_id: userId },
        ]
      },
      select: {
        id: true,
        creator_id: true,
        participant_id: true,
        created_at: true,
        updated_at: true,
        type: true,
        blocked_by_creator: true,
        blocked_by_participant: true,
        post: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        participant: {
          select: {
            id: true,
            name: true,
            avatar: true,
            availability: true,
            last_availability_at: true,
          },
        },
        last_message: {
          select: {
            id: true,
            message: true,
            created_at: true,
            sender_id: true,
            is_read: true,
            attachments: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }

    // add image url
    if (conversation.creator.avatar) {
      conversation.creator['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.creator.avatar,
      );
    }
    if (conversation.participant.avatar) {
      conversation.participant['avatar_url'] = SojebStorage.url(
        appConfig().storageUrl.avatar + conversation.participant.avatar,
      );
    }

    return {
      success: true,
      message: 'Conversation details fetched successfully',
      data: conversation,
    }


  }


  async findMessages(
    conversationId: string, 
    userId: string, 
    page: number = 1, 
    limit: number = 50
  ) {
    // Validate pagination parameters
    const pageNumber = Math.max(1, page);
    const pageSize = Math.max(1, Math.min(limit, 100)); // Limit to 100 messages per page
    const skip = (pageNumber - 1) * pageSize;
  
    // Check if user is part of conversation
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
        OR: [
          { creator_id: userId },
          { participant_id: userId },
        ]
      },
      select: {
        id: true
      }
    });
  
    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
  

    // Get total message count for pagination
    const totalMessages = await this.prisma.message.count({
      where: {
        conversation_id: conversationId,
        deleted_at: null, // Only count non-deleted messages
      },
    });
  
    // Get paginated messages
    const messages = await this.prisma.message.findMany({
      where: {
        conversation_id: conversationId,
        deleted_at: null, // Only include non-deleted messages
      },
      select: {
        id: true,
        message: true,
        created_at: true,
        sender_id: true,
        is_read: true,
        attachments: {
          select: {
            id: true,
            file: true,
            file_alt: true,
          }
        },
      },
      orderBy: {
        created_at: 'desc', // Chronological order (oldest first)
      },
      skip: skip,
      take: pageSize,
    });
  
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalMessages / pageSize);
  
    return {
      success: true,
      message: 'Messages fetched successfully',
      data: {
        messages: messages,
        pagination: {
          current_page: pageNumber,
          page_size: pageSize,
          total_items: totalMessages,
          total_pages: totalPages,
          has_next: pageNumber < totalPages,
          has_prev: pageNumber > 1,
        }
      },
    };
  }

  // async findOne(id: string) {
  //   try {
  //     const conversation = await this.prisma.conversation.findUnique({
  //       where: { id },
  //       select: {
  //         id: true,
  //         creator_id: true,
  //         participant_id: true,
  //         created_at: true,
  //         updated_at: true,
  //         creator: {
  //           select: {
  //             id: true,
  //             name: true,
  //             avatar: true,
  //           },
  //         },
  //         participant: {
  //           select: {
  //             id: true,
  //             name: true,
  //             avatar: true,
  //           },
  //         },
  //       },
  //     });

  //     // add image url
  //     if (conversation.creator.avatar) {
  //       conversation.creator['avatar_url'] = SojebStorage.url(
  //         appConfig().storageUrl.avatar + conversation.creator.avatar,
  //       );
  //     }

  //     return {
  //       success: true,
  //       data: conversation,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  async update(id: string, updateConversationDto: UpdateConversationDto) {
    try {
      const data = {};
      if (updateConversationDto.creator_id) {
        data['creator_id'] = updateConversationDto.creator_id;
      }
      if (updateConversationDto.participant_id) {
        data['participant_id'] = updateConversationDto.participant_id;
      }

      await this.prisma.conversation.update({
        where: { id },
        data: {
          ...data,
          updated_at: DateHelper.now(),
        },
      });

      return {
        success: true,
        message: 'Conversation updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.conversation.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Conversation deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  // async markConversationAsRead(conversationId: string, userId: string) {
  //   try {
  //     await this.prisma.message.updateMany({
  //       where: {
  //         conversation_id: conversationId,
  //         receiver_id: userId,
  //         is_read: false,
  //       },
  //       data: {
  //         is_read: true,
  //       },
  //     });

  //     return {
  //       success: true,
  //       message: "Conversation marked as read",
  //       // data: {
  //       //   conversation_id: conversationId,
  //       //   user_id: userId,
  //       // }
  //     }

  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Error marking conversation as read",
  //     }
  //   }
  // }


  // async blockConversation(id: string, userId: string) {
  //   try {
  //     const conversation = await this.prisma.conversation.findFirst({
  //       where: {
  //         id,
  //         OR: [{ creator_id: userId }, { participant_id: userId }],
  //       },
  //     });

  //     if (!conversation) return { success: false, message: 'Conversation not found' };

  //     const isCreator = conversation.creator_id === userId;

  //     await this.prisma.conversation.update({
  //       where: { id },
  //       data: isCreator
  //         ? { blocked_by_creator: true }
  //         : { blocked_by_participant: true },
  //     });

  //     // await this.messageGateway.server.to(
  //     //   isCreator ? conversation.participant_id : conversation.creator_id
  //     // ).emit('conversation-blocked', {
  //     //   conversation_id: id,
  //     //   by: userId,
  //     // });

  //     await this.messageGateway.server.to(
  //       conversation.creator_id
  //     ).emit('conversation-blocked', {
  //       conversation_id: id,
  //       by: userId,
  //     });

  //     await this.messageGateway.server.to(
  //       conversation.participant_id
  //     ).emit('conversation-blocked', {
  //       conversation_id: id,
  //       by: userId,
  //     });

  //     return { success: true, message: 'User blocked successfully' };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Failed to block user",
  //     }
  //   }
  // }

  // async unblockConversation(id: string, userId: string) {
  //   try {
  //     const conversation = await this.prisma.conversation.findFirst({
  //       where: {
  //         id,
  //         OR: [{ creator_id: userId }, { participant_id: userId }],
  //       },
  //     });

  //     if (!conversation) return { success: false, message: 'Conversation not found' };

  //     const isCreator = conversation.creator_id === userId;

  //     await this.prisma.conversation.update({
  //       where: { id },
  //       data: isCreator
  //         ? { blocked_by_creator: false }
  //         : { blocked_by_participant: false },
  //     });

  //     // await this.messageGateway.server.to(
  //     //   isCreator ? conversation.participant_id : conversation.creator_id
  //     // ).emit('conversation-unblocked', {
  //     //   conversation_id: id,
  //     //   by: userId,
  //     // });

  //     // trigger socket event for creator and participant
  //     await this.messageGateway.server.to(
  //       conversation.creator_id
  //     ).emit('conversation-unblocked', {
  //       conversation_id: id,
  //       by: userId,
  //     });

  //     await this.messageGateway.server.to(
  //       conversation.participant_id
  //     ).emit('conversation-unblocked', {
  //       conversation_id: id,
  //       by: userId,
  //     });




  //     return { success: true, message: 'User unblocked successfully' };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Failed to unblock user",
  //     }
  //   }
  // }

  // async softDeleteConversation(id: string, userId: string) {
  //   try {
  //     const conversation = await this.prisma.conversation.findFirst({
  //       where: {
  //         id,
  //         OR: [{ creator_id: userId }, { participant_id: userId }],
  //       },
  //     });

  //     if (!conversation) return { success: false, message: 'Conversation not found' };

  //     const isCreator = conversation.creator_id === userId;

  //     await this.prisma.conversation.update({
  //       where: { id },
  //       data: isCreator
  //         ? { deleted_by_creator: new Date() }
  //         : { deleted_by_participant: new Date() },
  //     });

  //     await this.messageGateway.server.to(userId).emit('conversation-soft-deleted', {
  //       conversation_id: id,
  //       by: userId,
  //     });


  //     // await this.messageGateway.server.to(
  //     //   conversation.creator_id
  //     // ).emit('conversation-soft-deleted', {
  //     //   conversation_id: id,
  //     //   by: userId,
  //     // });

  //     // await this.messageGateway.server.to(
  //     //   conversation.participant_id
  //     // ).emit('conversation-soft-deleted', {
  //     //   conversation_id: id,
  //     //   by: userId,
  //     // });

  //     return {
  //       success: true,
  //       message: 'Conversation deleted for current user',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: "Failed to delete conversation",
  //     }
  //   }
  // }

}
