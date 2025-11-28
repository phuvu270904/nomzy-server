import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageDto } from './chat-request.dto';

export class ChatWithContextDto {
  @ApiProperty({
    description: 'Array of messages forming the full conversation context',
    type: [MessageDto],
    minItems: 1,
    example: [
      {
        role: 'system',
        content: 'You are a helpful food and nutrition assistant.'
      },
      {
        role: 'user',
        content: 'What are some healthy breakfast options?'
      },
      {
        role: 'assistant',
        content: 'Here are some healthy breakfast options: oatmeal with fruits, Greek yogurt with berries, whole grain toast with avocado...'
      },
      {
        role: 'user',
        content: 'What about lunch ideas that complement those breakfast choices?'
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message is required' })
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];
}
