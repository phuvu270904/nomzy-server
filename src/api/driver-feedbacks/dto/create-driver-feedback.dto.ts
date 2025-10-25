import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateDriverFeedbackDto {
  @ApiProperty({
    description: 'Rating for the driver between 1-5',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: 'Feedback text for the driver',
    example:
      'Very professional and delivered the food quickly and in great condition.',
  })
  @IsString()
  @IsOptional()
  feedback?: string;

  @ApiProperty({
    description: 'Whether the feedback should be posted anonymously',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
