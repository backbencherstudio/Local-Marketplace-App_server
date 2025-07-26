import { IsOptional, IsString } from 'class-validator';

export class CreateFcmNotificationDto {

    @IsString()
    userId: string;

    @IsString()
    deviceToken: string;

    @IsString()
    title: string;

    @IsString()
    body: string;

    @IsOptional()
    @IsString()
    data: any;

    @IsString()
    status: string; 

    @IsOptional()
    @IsString()
    deviceType: string; 
}
