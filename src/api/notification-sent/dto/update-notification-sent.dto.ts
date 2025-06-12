import { PartialType } from '@nestjs/swagger';
import { CreateNotificationSentDto } from './create-notification-sent.dto';

export class UpdateNotificationSentDto extends PartialType(
  CreateNotificationSentDto,
) {}
