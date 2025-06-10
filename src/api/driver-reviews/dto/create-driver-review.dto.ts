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

export class CreateDriverReviewDto {
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
    description: 'Review text for the driver',
    example:
      'Very professional and delivered the food quickly and in great condition.',
  })
  @IsString()
  @IsNotEmpty()
  review: string;

  @ApiProperty({
    description: 'Whether the review should be posted anonymously',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
