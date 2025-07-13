import { IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug: string;


  @IsOptional()
  @IsString()
  parent_id?: string;
}
