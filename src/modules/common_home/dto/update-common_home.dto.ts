import { PartialType } from '@nestjs/swagger';
import { CreateCommonHomeDto } from './create-common_home.dto';

export class UpdateCommonHomeDto extends PartialType(CreateCommonHomeDto) {}
