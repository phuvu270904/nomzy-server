import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    description: 'The answer to the question',
    example:
      'You can track your order by going to the Orders section in your profile.',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;
}
