import { IsArray, IsBoolean, IsOptional, ValidateNested, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageDto {
  @IsString()
  @IsIn(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @IsString()
  content: string;

  @IsOptional()
  reasoning_details?: any;
}

export class ChatRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsBoolean()
  enableReasoning?: boolean;
}
