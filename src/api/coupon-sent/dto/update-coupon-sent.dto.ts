import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCouponSentDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsOptional()
  claimedCount?: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @IsOptional()
  usedCount?: number;
}
