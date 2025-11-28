import { ApiProperty } from '@nestjs/swagger';

class MessageSenderDto {
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

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Conversation ID',
    example: 1
  })
  conversationId: number;

  @ApiProperty({
    description: 'Sender user ID',
    example: 1
  })
  senderId: number;

  @ApiProperty({
    description: 'Message sender details',
    type: MessageSenderDto
  })
  sender: MessageSenderDto;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?'
  })
  message: string;

  @ApiProperty({
    description: 'Message status',
    enum: ['sent', 'delivered', 'read'],
    example: 'sent'
  })
  status: 'sent' | 'delivered' | 'read';

  @ApiProperty({
    description: 'Whether the message has been read',
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Message creation timestamp',
    example: '2023-12-01T10:00:00Z'
  })
  createdAt: Date;
}

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'Total number of unread messages',
    example: 5
  })
  unreadCount: number;
}

export class MessageSuccessResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Messages marked as read'
  })
  message: string;
}