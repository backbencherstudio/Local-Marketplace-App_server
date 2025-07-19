import { IsOptional, IsString } from "class-validator";

export class CreateReportDto {
    @IsString()
    report_type: string;
    @IsString()
    report_category: string;
    @IsString()
    reason?: string;

}
