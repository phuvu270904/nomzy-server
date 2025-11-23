import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FaqType } from '../entities/faq.entity';

export class SubmitQuestionDto {
  @ApiProperty({
    description: 'The question to be submitted',
    example: 'How do I track my order?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    enum: FaqType,
    description: 'The type of FAQ (user or driver)',
    example: FaqType.USER,
  })
  @IsNotEmpty()
  @IsString()
  type: FaqType;
}
