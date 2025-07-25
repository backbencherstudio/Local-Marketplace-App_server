import { PartialType } from '@nestjs/swagger';
import { CreateFcmNotificationDto } from './create-fcm_notification.dto';

export class UpdateFcmNotificationDto extends PartialType(CreateFcmNotificationDto) {}
