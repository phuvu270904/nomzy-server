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
import { DriverFeedbacksService } from './driver-feedbacks.service';
import { CreateDriverFeedbackDto } from './dto/create-driver-feedback.dto';
import { UpdateDriverFeedbackDto } from './dto/update-driver-feedback.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { DriverFeedbackResponseDto } from './dto/driver-feedback-response.dto';

@ApiTags('Driver Feedbacks')
@Controller('driver-feedbacks')
export class DriverFeedbacksController {
  constructor(
    private readonly driverFeedbacksService: DriverFeedbacksService,
  ) {}

  @Roles(Role.USER)
  @Post('driver/:driverId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new feedback for a driver' })
  @ApiParam({
    name: 'driverId',
    type: Number,
    description: 'ID of the driver',
  })
  @ApiResponse({
    status: 201,
    description: 'Driver feedback successfully created',
    type: DriverFeedbackResponseDto,
  })
  create(
    @Req() req,
    @Param('driverId', ParseIntPipe) driverId: number,
    @Body() createDriverFeedbackDto: CreateDriverFeedbackDto,
  ): Promise<DriverFeedbackResponseDto> {
    return this.driverFeedbacksService.create(
      req.user.id,
      driverId,
      createDriverFeedbackDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all driver feedbacks (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all driver feedbacks',
    type: [DriverFeedbackResponseDto],
  })
  findAll(): Promise<DriverFeedbackResponseDto[]> {
    return this.driverFeedbacksService.findAll();
  }

  @Get('driver/:driverId')
  @ApiOperation({ summary: 'Get all feedbacks for a specific driver' })
  @ApiParam({
    name: 'driverId',
    type: Number,
    description: 'ID of the driver',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns feedbacks for a driver',
    type: [DriverFeedbackResponseDto],
  })
  findByDriver(
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<DriverFeedbackResponseDto[]> {
    return this.driverFeedbacksService.findByDriver(driverId);
  }

  @Get('user')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all feedbacks created by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user feedbacks',
    type: [DriverFeedbackResponseDto],
  })
  findByUser(@Req() req): Promise<DriverFeedbackResponseDto[]> {
    return this.driverFeedbacksService.findByUser(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific driver feedback by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({
    status: 200,
    description: 'Returns a driver feedback',
    type: DriverFeedbackResponseDto,
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DriverFeedbackResponseDto> {
    return this.driverFeedbacksService.findOne(id);
  }

  @Roles(Role.USER)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a driver feedback' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({
    status: 200,
    description: 'Driver feedback updated successfully',
    type: DriverFeedbackResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateDriverFeedbackDto: UpdateDriverFeedbackDto,
  ): Promise<DriverFeedbackResponseDto> {
    return this.driverFeedbacksService.update(
      id,
      req.user.id,
      updateDriverFeedbackDto,
    );
  }

  @Roles(Role.USER, Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a driver feedback' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({
    status: 200,
    description: 'Driver feedback deleted successfully',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<void> {
    return this.driverFeedbacksService.remove(id, req.user.id);
  }
}
