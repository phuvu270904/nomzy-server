import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUrl, IsBoolean, IsDate, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Offer title',
    example: 'Summer Sale',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Discount percentage',
    example: 15.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent: number;

  @ApiPropertyOptional({
    description: 'Offer image URL',
    example: 'https://example.com/images/summer-sale.jpg',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Get 15.5% off on all summer products',
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
    example: '2025-08-31T23:59:59Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether the offer is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
