import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchRestaurantDto {
  @ApiProperty({
    description: 'Search query for restaurant name or product name',
    example: 'pizza',
    required: false,
  })
  @IsOptional()
  @IsString()
  query?: string;
}
