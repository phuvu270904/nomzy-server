import { ApiProperty } from '@nestjs/swagger';

export class AiMessageDto {
  @ApiProperty({
    description: 'The role of the AI response',
    enum: ['assistant'],
    example: 'assistant'
  })
  role: 'assistant';

  @ApiProperty({
    description: 'The AI-generated response content',
    example: 'Hello! I\'d be happy to help you with recipe suggestions. What type of cuisine or dietary preferences do you have?'
  })
  content: string;

  @ApiProperty({
    description: 'Detailed reasoning information when reasoning mode is enabled',
    required: false,
    nullable: true,
    example: {
      reasoning: 'The user is asking for help with recipes, so I should ask about their preferences to provide personalized suggestions.',
      confidence: 0.95
    }
  })
  reasoning_details?: any;
}

export class UsageDto {
  @ApiProperty({
    description: 'Number of tokens in the prompt/input',
    example: 25
  })
  prompt_tokens: number;

  @ApiProperty({
    description: 'Number of tokens in the AI completion/response',
    example: 30
  })
  completion_tokens: number;

  @ApiProperty({
    description: 'Total number of tokens used (prompt + completion)',
    example: 55
  })
  total_tokens: number;
}

export class AiChatResponseDto {
  @ApiProperty({
    description: 'The AI assistant\'s message response',
    type: AiMessageDto
  })
  message: AiMessageDto;

  @ApiProperty({
    description: 'Token usage information for billing and monitoring',
    type: UsageDto
  })
  usage: UsageDto;

  @ApiProperty({
    description: 'The AI model used for generating the response',
    example: 'openai/gpt-4o-2024-11-20'
  })
  model: string;
}

export class AiErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message describing what went wrong',
    example: 'Invalid message format or AI service unavailable'
  })
  message: string;

  @ApiProperty({
    description: 'Error type classification',
    example: 'Bad Request'
  })
  error: string;
}