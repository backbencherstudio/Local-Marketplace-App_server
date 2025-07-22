import { PartialType } from '@nestjs/swagger';
import { CreateAdminHomeDto } from './create-admin_home.dto';

export class UpdateAdminHomeDto extends PartialType(CreateAdminHomeDto) {}
