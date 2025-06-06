import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Product quantity',
    example: 3,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;
}
