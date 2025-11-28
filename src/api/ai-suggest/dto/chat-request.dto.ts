import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, ValidateNested, IsString, IsIn, MinLength, MaxLength, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @ApiProperty({
    description: 'The role of the message sender',
    enum: ['user', 'assistant', 'system'],
    example: 'user',
    enumName: 'MessageRole'
  })
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'The content/text of the message',
    example: 'Hello, can you help me with recipe suggestions?',
    type: 'string',
    minLength: 1,
    maxLength: 10000
  })
  @IsString()
  @MinLength(1, { message: 'Message content cannot be empty' })
  @MaxLength(10000, { message: 'Message content cannot exceed 10000 characters' })
  content: string;

  @ApiProperty({
    description: 'Optional reasoning details from AI responses',
    required: false,
    example: null,
    nullable: true
  })
  @IsOptional()
  reasoning_details?: any;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'Array of messages forming the conversation',
    type: [MessageDto],
    minItems: 1,
    example: [
      {
        role: 'user',
        content: 'What are some healthy breakfast options?'
      }
    ]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one message is required' })
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @ApiProperty({
    description: 'Whether to enable detailed reasoning in AI responses',
    required: false,
    default: false,
    example: true
  })
  @IsOptional()
  @IsBoolean()
  enableReasoning?: boolean;
}
