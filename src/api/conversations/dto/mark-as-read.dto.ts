import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class MarkAsReadDto {
  @ApiProperty({
    description: 'ID of the conversation to mark messages as read',
    example: 1,
    type: 'number',
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  conversationId: number;
}
