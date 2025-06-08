import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Main Street 123' })
  @IsString()
  @IsNotEmpty()
  streetAddress: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '10001', required: false })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ example: 'NY', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: false, default: false })
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
  @IsOptional()
  longitude?: number;
}
