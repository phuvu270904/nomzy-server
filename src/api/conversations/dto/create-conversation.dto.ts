import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID of the first user in the conversation',
    example: 1,
    type: 'number',
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  user1Id: number;

  @ApiProperty({
    description: 'ID of the second user in the conversation',
    example: 2,
    type: 'number',
    minimum: 1
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  user2Id: number;
}
