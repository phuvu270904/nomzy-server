import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AiSuggestService } from './ai-suggest.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatWithContextDto } from './dto/chat-with-context.dto';
import { AiChatResponseDto } from './dto/ai-response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('AI Suggest')
@Controller('ai-suggest')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized - Invalid or missing token' })
export class AiSuggestController {
  constructor(private readonly aiSuggestService: AiSuggestService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with AI assistant',
    description: 'Send a conversation to the AI assistant and get a response. Supports reasoning mode for detailed analysis of the AI\'s thought process.'
  })
  @ApiBody({
    type: ChatRequestDto,
    description: 'Chat request with messages and optional reasoning configuration'
  })
  @ApiOkResponse({
    description: 'AI response generated successfully',
    type: AiChatResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid request data or malformed messages' })
  @ApiInternalServerErrorResponse({ description: 'AI service error or communication failure' })
  async chat(@Body() chatRequestDto: ChatRequestDto) {
    return this.aiSuggestService.chat(chatRequestDto);
  }

  @Post('chat-with-context')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chat with AI using conversation context',
    description: 'Send a conversation with full context history to the AI assistant. This endpoint is optimized for maintaining conversation continuity.'
  })
  @ApiBody({
    type: ChatWithContextDto,
    description: 'Chat request with full conversation context including message history'
  })
  @ApiOkResponse({
    description: 'AI response generated successfully with context awareness',
    type: AiChatResponseDto
  })
  @ApiBadRequestResponse({ description: 'Invalid request data or malformed conversation context' })
  @ApiInternalServerErrorResponse({ description: 'AI service error or communication failure' })
  async chatWithContext(@Body() chatWithContextDto: ChatWithContextDto) {
    return this.aiSuggestService.chatWithContext(chatWithContextDto.messages);
  }
}
