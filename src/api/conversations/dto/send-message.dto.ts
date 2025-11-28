import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MinLength, MaxLength, IsPositive } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'ID of the conversation to send the message to',
    example: 1,
    type: 'number',
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  conversationId: number;

  @ApiProperty({
    description: 'The message content to send',
    example: 'Hello, how are you?',
    type: 'string',
    minLength: 1,
    maxLength: 1000
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;
}
