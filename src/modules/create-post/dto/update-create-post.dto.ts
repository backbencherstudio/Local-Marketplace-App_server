// update-post.dto.ts
import { IsOptional, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Transform } from "class-transformer";
import { ExpiresAt, SalaryType, ServiceType } from "@prisma/client";

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    type: ServiceType;

    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    price: string;

    @IsOptional()
    @IsString()
    tags?: string[];

    @IsOptional()
    @IsString()
    categoryId: string;

    @IsOptional()
    @IsString()
    thumbnail: string;

    @IsOptional()
    @IsString()
    location: string;

    @IsOptional()
    @IsString()
    expiresAt: ExpiresAt;

    @IsOptional()
    @IsString()
    salary_range: string;

    @IsOptional()
    @IsString()
    salaryType: SalaryType;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    allow_chat_only: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true')
    @IsBoolean()
    show_chat_info: boolean;
}