import { ApiProperty } from '@nestjs/swagger';

class RestaurantDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Restaurant Name' })
  name: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar?: string;
}

export class FavoriteResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  restaurantId: number;

  @ApiProperty()
  restaurant: RestaurantDto;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
}
