import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDriverReviewDto } from './create-driver-review.dto';

export class UpdateDriverReviewDto extends PartialType(CreateDriverReviewDto) {}
