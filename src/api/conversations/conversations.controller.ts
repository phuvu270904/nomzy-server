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
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('conversations')
@ApiBearerAuth('access-token')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req,
  ) {
    return await this.conversationsService.createConversation(createConversationDto);
  }

  @Get()
  async getUserConversations(@Request() req) {
    const userId = req.user.id;
    return await this.conversationsService.getUserConversations(userId);
  }

  @Get(':id')
  async getConversation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return await this.conversationsService.findConversationById(id);
  }

  @Get(':id/messages')
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
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    const userId = req.user.id;
    return await this.conversationsService.sendMessage(sendMessageDto, userId);
  }

  @Post(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    await this.conversationsService.markMessagesAsRead(id, userId);
    return { message: 'Messages marked as read' };
  }

  @Get('unread/count')
  async getUnreadCount(@Request() req) {
    const userId = req.user.id;
    const count = await this.conversationsService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Delete(':id')
  async deleteConversation(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userId = req.user.id;
    await this.conversationsService.deleteConversation(id, userId);
    return { message: 'Conversation deleted successfully' };
  }
}
