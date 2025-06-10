import { ApiProperty } from '@nestjs/swagger';

export class DriverReviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 4 })
  driverId: number;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'Excellent service, very prompt delivery!' })
  review: string;

  @ApiProperty({ example: false })
  isAnonymous: boolean;

  @ApiProperty({
    example: {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  })
  user?: {
    id: number;
    name: string;
    email: string;
  };

  @ApiProperty({
    example: {
      id: 4,
      name: 'Driver Name',
    },
  })
  driver?: {
    id: number;
    name: string;
  };

  @ApiProperty({ example: '2025-06-07T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-06-07T10:35:00.000Z' })
  updatedAt: Date;
}
