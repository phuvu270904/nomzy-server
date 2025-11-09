import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { DriverReviewsService } from './driver-reviews.service';
import { CreateDriverReviewDto } from './dto/create-driver-review.dto';
import { UpdateDriverReviewDto } from './dto/update-driver-review.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { DriverReviewResponseDto } from './dto/driver-review-response.dto';

@ApiTags('Driver Reviews')
@Controller('driver-reviews')
export class DriverReviewsController {
  constructor(private readonly driverReviewsService: DriverReviewsService) {}

  @Roles(Role.USER)
  @Post('driver/:driverId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new review for a driver' })
  @ApiParam({
    name: 'driverId',
    type: Number,
    description: 'ID of the driver',
  })
  @ApiResponse({
    status: 201,
    description: 'Driver review successfully created',
    type: DriverReviewResponseDto,
  })
  create(
    @Req() req,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() createDriverReviewDto: CreateDriverReviewDto,
  ): Promise<DriverReviewResponseDto> {
    return this.driverReviewsService.create(
      req.user.id,
      driverId,
      createDriverReviewDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all driver reviews (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all driver reviews',
    type: [DriverReviewResponseDto],
  })
  findAll(): Promise<DriverReviewResponseDto[]> {
    return this.driverReviewsService.findAll();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get all reviews for a specific driver' })
  @ApiParam({
    name: 'driverId',
    type: Number,
    description: 'ID of the driver',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns reviews for a driver',
    type: [DriverReviewResponseDto],
  })
  findByDriver(
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<DriverReviewResponseDto[]> {
    return this.driverReviewsService.findByDriver(driverId);
  }

  @Get('user')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all reviews created by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user reviews',
    type: [DriverReviewResponseDto],
  })
  findByUser(@Req() req): Promise<DriverReviewResponseDto[]> {
    return this.driverReviewsService.findByUser(req.user.id);
  }

  @Get('byUser')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all reviews created by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user reviews',
    type: [DriverReviewResponseDto],
  })
  findByUserCreated(@Req() req): Promise<DriverReviewResponseDto[]> {
    return this.driverReviewsService.findByUserCreated(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific driver review by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the review' })
  @ApiResponse({
    status: 200,
    description: 'Returns a driver review',
    type: DriverReviewResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverReviewResponseDto> {
    return this.driverReviewsService.findOne(id);
  }

  @Roles(Role.USER)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a driver review' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the review' })
  @ApiResponse({
    status: 200,
    description: 'Driver review updated successfully',
    type: DriverReviewResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateDriverReviewDto: UpdateDriverReviewDto,
  ): Promise<DriverReviewResponseDto> {
    return this.driverReviewsService.update(
      id,
      req.user.id,
      updateDriverReviewDto,
    );
  }

  @Roles(Role.USER, Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a driver review' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the review' })
  @ApiResponse({
    status: 200,
    description: 'Driver review deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<void> {
    return this.driverReviewsService.remove(id, req.user.id);
  }
}
