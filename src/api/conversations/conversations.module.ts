import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';
import { ConversationEntity } from './entities/conversation.entity';
import { ConversationMessageEntity } from './entities/conversation-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversationEntity, ConversationMessageEntity]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsGateway],
  exports: [ConversationsService, ConversationsGateway],
})
export class ConversationsModule {}
