import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VehicleType } from '../entities/user-vehicle.entity';

export class CreateUserVehicleDto {
  @ApiProperty({ 
    example: VehicleType.MOTORCYCLE,
    enum: VehicleType,
    description: 'Type of vehicle'
  })
  @IsEnum(VehicleType)
  @IsNotEmpty()
  type: VehicleType;

  @ApiProperty({ 
    example: 'Honda CBR',
    description: 'Vehicle name'
  })
  @IsString()
  @IsNotEmpty()
  vehName: string;

  @ApiProperty({ 
    example: 'ABC-1234',
    description: 'Vehicle registration number'
  })
  @IsString()
  @IsNotEmpty()
  regNumber: string;

  @ApiProperty({ 
    example: 'DL123456',
    description: 'Driver license number'
  })
  @IsString()
  @IsNotEmpty()
  license: string;
}
