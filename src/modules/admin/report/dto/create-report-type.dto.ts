import { IsOptional, IsString } from "class-validator";

export class CreateReportTypeDto {
    @IsString()
    name: string;
}