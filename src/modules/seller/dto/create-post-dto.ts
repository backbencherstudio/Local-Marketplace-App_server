import { ExpiresAt, SalaryType, ServiceType } from "@prisma/client";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";


export class CreatePostDto {
    @IsString()
    type:ServiceType;

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

  @Transform(({ value }) => value === 'true') 
  @IsBoolean()
  allow_chat_only: boolean;

  @Transform(({ value }) => value === 'true')  
  @IsBoolean()
  show_chat_info: boolean;
}