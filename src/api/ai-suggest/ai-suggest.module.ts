import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiSuggestController } from './ai-suggest.controller';
import { AiSuggestService } from './ai-suggest.service';

@Module({
  imports: [ConfigModule],
  controllers: [AiSuggestController],
  providers: [AiSuggestService],
  exports: [AiSuggestService],
})
export class AiSuggestModule {}
