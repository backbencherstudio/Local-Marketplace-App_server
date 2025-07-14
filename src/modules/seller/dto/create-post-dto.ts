import { ExpiresAt, SalaryType } from "@prisma/client";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";


export class CreatePostDto {

    @IsString()
    title: string;

    @IsString()
    description: string;

    @IsString()
    price: string;

    @IsString()
    userId: string;

    @IsString()
    tags?: string[];

    @IsString()
    categoryId: string;
    
    @IsOptional()
    @IsString()
    thumbnail: string;

    @IsString()
    location: string;

    @IsString()
    expiresAt: ExpiresAt;

    @IsOptional()
    @IsString()
    salary_range: string;

    @IsOptional()
    @IsString()
    salaryType: SalaryType;

  @Transform(({ value }) => value === 'true')  // Convert "true"/"false" strings to booleans
  @IsBoolean()
  allow_chat_only: boolean;

  @Transform(({ value }) => value === 'true')  // Convert "true"/"false" strings to booleans
  @IsBoolean()
  show_chat_info: boolean;
}