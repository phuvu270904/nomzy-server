import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty({
    description: 'The question for this FAQ',
    example: 'How do I place an order?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The answer to the FAQ question',
    example:
      'You can place an order by selecting products and adding them to your cart, then proceeding to checkout.',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({
    description: 'Whether the FAQ is active or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'The sort order for the FAQ (lower numbers appear first)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
