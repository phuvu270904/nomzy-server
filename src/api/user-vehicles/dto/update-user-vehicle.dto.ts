import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '../entities/user-vehicle.entity';

export class UpdateUserVehicleDto {
  @ApiProperty({ 
    example: VehicleType.CAR,
    enum: VehicleType,
    description: 'Type of vehicle',
    required: false
  })
  @IsEnum(VehicleType)
  @IsOptional()
  type?: VehicleType;

  @ApiProperty({ 
    example: 'ABC-1234',
    description: 'Vehicle registration number',
    required: false
  })
  @IsString()
  @IsOptional()
  regNumber?: string;

  @ApiProperty({ 
    example: 'DL123456',
    description: 'Driver license number',
    required: false
  })
  @IsString()
  @IsOptional()
  license?: string;
}
