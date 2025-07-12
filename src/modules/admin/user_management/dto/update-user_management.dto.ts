import { PartialType } from '@nestjs/swagger';
import { CreateUserManagementDto } from './create-user_management.dto';

export class UpdateUserManagementDto extends PartialType(CreateUserManagementDto) {}
