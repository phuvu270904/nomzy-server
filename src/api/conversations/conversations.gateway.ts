import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationMessageEntity } from './entities/conversation-message.entity';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/conversations',
})
export class ConversationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ConversationsGateway.name);
  private connectedUsers = new Map<number, string>(); // userId -> socketId
  private userSockets = new Map<string, number>(); // socketId -> userId

  constructor(private readonly conversationsService: ConversationsService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract user info from handshake query
      const userId = parseInt(client.handshake.query.userId as string);
      const userRole = client.handshake.query.role as string;

      if (!userId) {
        this.logger.warn('Connection rejected: No userId provided');
        client.disconnect();
        return;
      }

      client.user = { id: userId, role: userRole || 'user', email: '' };
      this.connectedUsers.set(userId, client.id);
      this.userSockets.set(client.id, userId);

      // Join user's personal room
      await client.join(`user_${userId}`);

      // Join all conversation rooms for this user
      const conversations = await this.conversationsService.getUserConversations(userId);
      for (const conversation of conversations) {
        await client.join(`conversation_${conversation.id}`);
      }

      this.logger.log(`User ${userId} connected to conversations gateway`);

      // Emit online status to all conversations
      for (const conversation of conversations) {
        this.server.to(`conversation_${conversation.id}`).emit('user-online', {
          userId,
          conversationId: conversation.id,
        });
      }
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      const userId = client.user.id;

      // Emit offline status to all conversations
      const conversations = await this.conversationsService.getUserConversations(userId);
      for (const conversation of conversations) {
        this.server.to(`conversation_${conversation.id}`).emit('user-offline', {
          userId,
          conversationId: conversation.id,
        });
      }

      this.connectedUsers.delete(userId);
      this.userSockets.delete(client.id);
      this.logger.log(`User ${userId} disconnected from conversations gateway`);
    }
  }

  // Join a specific conversation room
  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    try {
      const conversation = await this.conversationsService.findConversationById(data.conversationId);
      
      // Verify user is part of this conversation
      if (conversation.user1Id !== client.user!.id && conversation.user2Id !== client.user!.id) {
        client.emit('error', { message: 'You are not part of this conversation' });
        return;
      }

      const roomName = `conversation_${data.conversationId}`;
      await client.join(roomName);

      this.logger.log(`User ${client.user!.id} joined conversation ${data.conversationId}`);

      client.emit('joined-conversation', {
        conversationId: data.conversationId,
        conversation,
      });
    } catch (error) {
      this.logger.error('Error joining conversation:', error);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  // Send a message
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number; message: string },
  ) {
    try {
      const message = await this.conversationsService.sendMessage(
        {
          conversationId: data.conversationId,
          message: data.message,
        },
        client.user!.id,
      );

      // Broadcast message to conversation room
      const roomName = `conversation_${data.conversationId}`;
      this.server.to(roomName).emit('new-message', {
        message,
        conversationId: data.conversationId,
      });

      this.logger.log(
        `User ${client.user!.id} sent message in conversation ${data.conversationId}`,
      );

      // Send confirmation to sender
      client.emit('message-sent', { message });
    } catch (error) {
      this.logger.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // User is typing
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number; isTyping: boolean },
  ) {
    try {
      const conversation = await this.conversationsService.findConversationById(data.conversationId);
      
      // Verify user is part of this conversation
      if (conversation.user1Id !== client.user!.id && conversation.user2Id !== client.user!.id) {
        return;
      }

      // Broadcast typing status to conversation room (except sender)
      const roomName = `conversation_${data.conversationId}`;
      client.to(roomName).emit('user-typing', {
        userId: client.user!.id,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
      });
    } catch (error) {
      this.logger.error('Error broadcasting typing status:', error);
    }
  }

  // Mark messages as read
  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number },
  ) {
    try {
      await this.conversationsService.markMessagesAsRead(
        data.conversationId,
        client.user!.id,
      );

      // Notify the other user that messages were read
      const roomName = `conversation_${data.conversationId}`;
      this.server.to(roomName).emit('messages-read', {
        conversationId: data.conversationId,
        readBy: client.user!.id,
        readAt: new Date(),
      });

      this.logger.log(
        `User ${client.user!.id} marked messages as read in conversation ${data.conversationId}`,
      );
    } catch (error) {
      this.logger.error('Error marking messages as read:', error);
      client.emit('error', { message: 'Failed to mark messages as read' });
    }
  }

  // Get conversation messages
  @SubscribeMessage('get-messages')
  async handleGetMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: number; limit?: number; offset?: number },
  ) {
    try {
      const messages = await this.conversationsService.getConversationMessages(
        data.conversationId,
        client.user!.id,
        data.limit,
        data.offset,
      );

      client.emit('messages-loaded', {
        conversationId: data.conversationId,
        messages,
      });
    } catch (error) {
      this.logger.error('Error getting messages:', error);
      client.emit('error', { message: 'Failed to load messages' });
    }
  }

  // Get user's conversations
  @SubscribeMessage('get-conversations')
  async handleGetConversations(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      const conversations = await this.conversationsService.getUserConversations(client.user!.id);

      client.emit('conversations-loaded', { conversations });
    } catch (error) {
      this.logger.error('Error getting conversations:', error);
      client.emit('error', { message: 'Failed to load conversations' });
    }
  }

  // Create or get conversation with another user
  @SubscribeMessage('start-conversation')
  async handleStartConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { otherUserId: number },
  ) {
    try {
      const conversation = await this.conversationsService.createConversation({
        user1Id: client.user!.id,
        user2Id: data.otherUserId,
      });

      // Join the conversation room
      const roomName = `conversation_${conversation.id}`;
      await client.join(roomName);

      // If the other user is online, have them join the room too
      const otherUserSocketId = this.connectedUsers.get(data.otherUserId);
      if (otherUserSocketId) {
        const serverSockets = this.server.sockets as unknown as Map<string, Socket>;
        const otherUserSocket = serverSockets.get(otherUserSocketId);
        if (otherUserSocket) {
          await otherUserSocket.join(roomName);
        }
      }

      client.emit('conversation-started', { conversation });

      this.logger.log(
        `User ${client.user!.id} started conversation with user ${data.otherUserId}`,
      );
    } catch (error) {
      this.logger.error('Error starting conversation:', error);
      client.emit('error', { message: 'Failed to start conversation' });
    }
  }

  // Check if user is online
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  // Notify user about new message (can be called from service)
  async notifyNewMessage(message: ConversationMessageEntity, conversationId: number) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized yet');
      return;
    }

    const roomName = `conversation_${conversationId}`;
    this.server.to(roomName).emit('new-message', {
      message,
      conversationId,
    });
  }
}
