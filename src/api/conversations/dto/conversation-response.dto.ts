import { ApiProperty } from '@nestjs/swagger';

class UserSummaryDto {
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe'
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john@example.com'
  })
  email: string;
}

export class ConversationResponseDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'ID of the first user in the conversation',
    example: 1
  })
  user1Id: number;

  @ApiProperty({
    description: 'ID of the second user in the conversation',
    example: 2
  })
  user2Id: number;

  @ApiProperty({
    description: 'First user details',
    type: UserSummaryDto
  })
  user1: UserSummaryDto;

  @ApiProperty({
    description: 'Second user details',
    type: UserSummaryDto
  })
  user2: UserSummaryDto;

  @ApiProperty({
    description: 'Timestamp of the last message in the conversation',
    example: '2023-12-01T10:00:00Z',
    nullable: true
  })
  lastMessageAt: Date | null;

  @ApiProperty({
    description: 'Content of the last message',
    example: 'Hello, how are you?',
    nullable: true
  })
  lastMessageText: string | null;

  @ApiProperty({
    description: 'Conversation creation timestamp',
    example: '2023-11-01T10:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Conversation last update timestamp',
    example: '2023-12-01T10:00:00Z'
  })
  updatedAt: Date;
}