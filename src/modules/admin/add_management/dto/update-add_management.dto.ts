import { PartialType } from '@nestjs/swagger';
import { CreateAddManagementDto } from './create-add_management.dto';

export class UpdateAddManagementDto extends PartialType(CreateAddManagementDto) {}
