import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatRequestDto } from './dto/chat-request.dto';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: any;
}

@Injectable()
export class AiSuggestService {
  private readonly openRouterApiKey: string;
  private readonly openRouterModel: string;

  constructor(private configService: ConfigService) {
    this.openRouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    this.openRouterModel = this.configService.get<string>('OPENROUTER_AI_MODEL') || '';
  }

  async chat(chatRequestDto: ChatRequestDto) {
    const { messages, enableReasoning = false } = chatRequestDto;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages: messages,
          ...(enableReasoning && { reasoning: { enabled: true } }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.error?.message || 'Failed to get response from AI',
          response.status,
        );
      }

      const result = await response.json();
      return {
        message: result.choices[0].message,
        usage: result.usage,
        model: result.model,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to communicate with AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async chatWithContext(messages: Message[]) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.openRouterModel,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new HttpException(
          errorData.error?.message || 'Failed to get response from AI',
          response.status,
        );
      }

      const result = await response.json();
      return {
        message: result.choices[0].message,
        usage: result.usage,
        model: result.model,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to communicate with AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
