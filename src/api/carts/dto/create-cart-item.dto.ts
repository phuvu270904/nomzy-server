import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCartItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({
    description: 'Product quantity',
    example: 2,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}
