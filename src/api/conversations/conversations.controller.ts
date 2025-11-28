import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationResponseDto } from './dto/conversation-response.dto';
import { 
  MessageResponseDto, 
  UnreadCountResponseDto, 
  MessageSuccessResponseDto 
} from './dto/message-response.dto';

@ApiTags('Conversations')
@Controller('conversations')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new conversation',
    description: 'Creates a new conversation between two users. If a conversation already exists between the users, the existing one is returned.'
  })
  @ApiBody({ 
    type: CreateConversationDto,
    description: 'Conversation creation data containing user IDs'
  })
  @ApiCreatedResponse({ 
    description: 'Conversation created successfully',
    type: ConversationResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req,
  ) {
    return await this.conversationsService.createConversation(createConversationDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get user conversations',
    description: 'Retrieves all conversations for the authenticated user, ordered by last message timestamp.'
  })
  @ApiOkResponse({ 
    description: 'List of user conversations retrieved successfully',
    type: [ConversationResponseDto]
  })
  async getUserConversations(@Request() req) {
    const userId = req.user.id;
    return await this.conversationsService.getUserConversations(userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get conversation by ID',
    description: 'Retrieves a specific conversation by its ID including user details.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number',
    description: 'Conversation ID',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Conversation retrieved successfully',
    type: ConversationResponseDto
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid conversation ID format' })
  async getConversation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.conversationsService.findConversationById(id);
  }

  @Get(':id/messages')
  @ApiOperation({ 
    summary: 'Get conversation messages',
    description: 'Retrieves paginated messages for a specific conversation.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number',
    description: 'Conversation ID',
    example: 1
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: 'number',
    description: 'Maximum number of messages to retrieve (default: 50)',
    example: 20
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: 'number',
    description: 'Number of messages to skip for pagination (default: 0)',
    example: 0
  })
  @ApiOkResponse({ 
    description: 'Messages retrieved successfully',
    type: [MessageResponseDto]
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiBadRequestResponse({ description: 'Invalid conversation ID or query parameters' })
  @ApiForbiddenResponse({ description: 'User is not a participant in this conversation' })
  async getConversationMessages(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;

    return await this.conversationsService.getConversationMessages(
      id,
      userId,
      limitNum,
      offsetNum,
    );
  }

  @Post('messages')
  @ApiOperation({ 
    summary: 'Send a message',
    description: 'Sends a new message in a conversation. The sender is determined from the authenticated user.'
  })
  @ApiBody({ 
    type: SendMessageDto,
    description: 'Message data containing conversation ID and message content'
  })
  @ApiCreatedResponse({ 
    description: 'Message sent successfully',
    type: MessageResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiForbiddenResponse({ description: 'User is not a participant in this conversation' })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    const userId = req.user.id;
    return await this.conversationsService.sendMessage(sendMessageDto, userId);
  }

  @Post(':id/read')
  @ApiOperation({ 
    summary: 'Mark messages as read',
    description: 'Marks all unread messages in a conversation as read for the authenticated user.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number',
    description: 'Conversation ID',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Messages marked as read successfully',
    type: MessageSuccessResponseDto
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiForbiddenResponse({ description: 'User is not a participant in this conversation' })
  @ApiBadRequestResponse({ description: 'Invalid conversation ID format' })
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    await this.conversationsService.markMessagesAsRead(id, userId);
    return { message: 'Messages marked as read' };
  }

  @Get('unread/count')
  @ApiOperation({ 
    summary: 'Get unread messages count',
    description: 'Retrieves the total count of unread messages across all conversations for the authenticated user.'
  })
  @ApiOkResponse({ 
    description: 'Unread count retrieved successfully',
    type: UnreadCountResponseDto
  })
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.conversationsService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete conversation',
    description: 'Deletes a conversation and all its associated messages. Only participants can delete the conversation.'
  })
  @ApiParam({ 
    name: 'id', 
    type: 'number',
    description: 'Conversation ID',
    example: 1
  })
  @ApiOkResponse({ 
    description: 'Conversation deleted successfully',
    type: MessageSuccessResponseDto
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  @ApiForbiddenResponse({ description: 'User is not a participant in this conversation' })
  @ApiBadRequestResponse({ description: 'Invalid conversation ID format' })
  async deleteConversation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    await this.conversationsService.deleteConversation(id, userId);
    return { message: 'Conversation deleted successfully' };
  }
}
