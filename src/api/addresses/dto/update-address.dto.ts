import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({ example: 'Main Street 123', required: false })
  @IsString()
  @IsOptional()
  streetAddress?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'USA', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({ example: 'Home', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({
    example: 40.7128,
    required: false,
    description: 'Latitude coordinate',
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -74.006,
    required: false,
    description: 'Longitude coordinate',
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
