import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @ApiProperty()
  name?: string;

  @IsNotEmpty()
  @ApiProperty()
  first_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  last_name?: string;

  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsEnum(['buyer', 'seller'], {
    message: 'type must be either buyer or seller',
  })
  @ApiProperty({
    type: String,
    enum: ['buyer', 'seller'],
    example: 'buyer',
  })
  type?: string;
}
