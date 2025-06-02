import { IsOptional, IsString, IsNumber, IsUrl, IsBoolean, IsDate, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOfferDto {
  @ApiPropertyOptional({
    description: 'Offer title',
    example: 'Extended Summer Sale',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Discount percentage',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Offer image URL',
    example: 'https://example.com/images/extended-summer-sale.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Extended sale with 20% off on all summer products',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Offer start date',
    example: '2025-06-01T00:00:00Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Offer end date',
    example: '2025-09-30T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether the offer is active',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
