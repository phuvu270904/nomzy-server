import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiSuggestService } from './ai-suggest.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatWithContextDto } from './dto/chat-with-context.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('ai-suggest')
@ApiBearerAuth('access-token')
export class AiSuggestController {
  constructor(private readonly aiSuggestService: AiSuggestService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() chatRequestDto: ChatRequestDto) {
    return this.aiSuggestService.chat(chatRequestDto);
  }

  @Post('chat-with-context')
  @HttpCode(HttpStatus.OK)
  async chatWithContext(@Body() chatWithContextDto: ChatWithContextDto) {
    return this.aiSuggestService.chatWithContext(chatWithContextDto.messages);
  }
}
