import { IsOptional, IsString } from "class-validator";

export class CreateCategoryDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug: string;



  @IsString()
  parent_id?: string;
}
