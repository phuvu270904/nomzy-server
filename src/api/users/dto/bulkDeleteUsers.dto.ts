import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteUsersDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Array of user IDs to be deleted',
    type: [Number],
    required: true,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one user ID must be provided' })
  @IsNumber({}, { each: true, message: 'Each ID must be a number' })
  ids: number[];
}