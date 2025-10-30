import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationMessageEntity, MessageStatus } from './entities/conversation-message.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(ConversationEntity)
    private conversationRepository: Repository<ConversationEntity>,
    @InjectRepository(ConversationMessageEntity)
    private messageRepository: Repository<ConversationMessageEntity>,
  ) {}

  async createConversation(createConversationDto: CreateConversationDto): Promise<ConversationEntity> {
    const { user1Id, user2Id } = createConversationDto;

    if (user1Id === user2Id) {
      throw new BadRequestException('Cannot create conversation with yourself');
    }

    // Check if conversation already exists between these two users
    const existingConversation = await this.findConversationByUsers(user1Id, user2Id);
    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationRepository.create({
      user1Id,
      user2Id,
    });

    return await this.conversationRepository.save(conversation);
  }

  async findConversationByUsers(user1Id: number, user2Id: number): Promise<ConversationEntity | null> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where(
        '(conversation.user1Id = :user1Id AND conversation.user2Id = :user2Id) OR (conversation.user1Id = :user2Id AND conversation.user2Id = :user1Id)',
        { user1Id, user2Id },
      )
      .getOne();

    return conversation;
  }

  async findConversationById(conversationId: number): Promise<ConversationEntity> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${conversationId} not found`);
    }

    return conversation;
  }

  async getUserConversations(userId: number): Promise<ConversationEntity[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
      .orderBy('conversation.lastMessageAt', 'DESC')
      .getMany();

    return conversations;
  }

  async sendMessage(sendMessageDto: SendMessageDto, senderId: number): Promise<ConversationMessageEntity> {
    const { conversationId, message } = sendMessageDto;

    // Verify conversation exists and user is part of it
    const conversation = await this.findConversationById(conversationId);
    if (conversation.user1Id !== senderId && conversation.user2Id !== senderId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    // Create message
    const newMessage = this.messageRepository.create({
      conversationId,
      senderId,
      message,
      status: MessageStatus.SENT,
    });

    const savedMessage = await this.messageRepository.save(newMessage);

    // Update conversation's last message
    await this.conversationRepository.update(conversationId, {
      lastMessageAt: new Date(),
      lastMessageText: message,
    });

    // Return message with sender info
    const messageWithSender = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender'],
    });

    if (!messageWithSender) {
      throw new NotFoundException('Message not found after save');
    }

    return messageWithSender;
  }

  async getConversationMessages(
    conversationId: number,
    userId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<ConversationMessageEntity[]> {
    // Verify user is part of the conversation
    const conversation = await this.findConversationById(conversationId);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['sender'],
    });

    return messages.reverse(); // Return in chronological order
  }

  async markMessagesAsRead(conversationId: number, userId: number): Promise<void> {
    // Verify user is part of the conversation
    const conversation = await this.findConversationById(conversationId);
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    // Mark all messages from the other user as read
    await this.messageRepository
      .createQueryBuilder()
      .update(ConversationMessageEntity)
      .set({ isRead: true, status: MessageStatus.READ })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();
  }

  async getUnreadCount(userId: number): Promise<number> {
    // Get all conversations for this user
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.user1Id = :userId OR conversation.user2Id = :userId', { userId })
      .getMany();

    const conversationIds = conversations.map((c) => c.id);

    if (conversationIds.length === 0) {
      return 0;
    }

    // Count unread messages
    const count = await this.messageRepository
      .createQueryBuilder('message')
      .where('message.conversationId IN (:...conversationIds)', { conversationIds })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .getCount();

    return count;
  }

  async deleteConversation(conversationId: number, userId: number): Promise<void> {
    const conversation = await this.findConversationById(conversationId);
    
    // Verify user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new BadRequestException('You are not part of this conversation');
    }

    await this.conversationRepository.delete(conversationId);
  }
}
