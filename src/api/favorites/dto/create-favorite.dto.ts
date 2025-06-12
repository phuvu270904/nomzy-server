import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({
    description: 'The ID of the restaurant to be added to favorites',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  restaurantId: number;
}
