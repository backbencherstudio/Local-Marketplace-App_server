import { IsOptional, IsString } from "class-validator";


export class CreateReportCategoryDto {
  @IsString()
  name: string;
}