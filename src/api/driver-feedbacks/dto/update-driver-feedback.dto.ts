import { PartialType } from '@nestjs/swagger';
import { CreateDriverFeedbackDto } from './create-driver-feedback.dto';

export class UpdateDriverFeedbackDto extends PartialType(
  CreateDriverFeedbackDto,
) {}
