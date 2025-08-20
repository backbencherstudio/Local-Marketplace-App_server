import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ConversationType } from '@prisma/client';  // Importing the enum from Prisma

export class CreateConversationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The id of the creator',
  })
  creator_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The id of the participant',
  })
  participant_id: string;

  @IsNotEmpty()
  @IsEnum(ConversationType)  
  @ApiProperty({
    description: 'The type of conversation (Services | Jobs | For_sale | Help | Gigs | Community | Profile)',
  })
  type: ConversationType;
}

export class OneOnOneConversationDto {
  
  creator_id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The id of the participant',
  })
  participant_id: string;

}

export class CategoryBasedConversationDto {
  creator_id?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The id of the participant',
  })
  participant_id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The id of the post',
  })
  post_id: string;
}
