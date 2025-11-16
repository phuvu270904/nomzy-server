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
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { FeedbackResponseDto } from './dto/feedback-response.dto';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Roles(Role.USER)
  @Post('restaurant/:restaurantId')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new feedback for a restaurant' })
  @ApiParam({
    name: 'restaurantId',
    type: Number,
    description: 'ID of the restaurant',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback successfully created',
    type: FeedbackResponseDto,
  })
  create(
    @Req() req,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.create(
      req.user.id,
      restaurantId,
      createFeedbackDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all feedbacks (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Returns all feedbacks',
    type: [FeedbackResponseDto],
  })
  findAll(): Promise<FeedbackResponseDto[]> {
    return this.feedbacksService.findAll();
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all feedbacks for a specific restaurant' })
  @ApiParam({
    name: 'restaurantId',
    type: Number,
    description: 'ID of the restaurant',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns feedbacks for a restaurant',
    type: [FeedbackResponseDto],
  })
  findByRestaurant(
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
  ): Promise<FeedbackResponseDto[]> {
    return this.feedbacksService.findByRestaurant(restaurantId);
  }

  @Get('user')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all feedbacks created by the current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns user feedbacks',
    type: [FeedbackResponseDto],
  })
  findByUser(@Req() req): Promise<FeedbackResponseDto[]> {
    return this.feedbacksService.findByUser(req.user.id);
  }

  @Get('currentRestaurant')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all feedbacks for the current restaurant user' })
  @ApiResponse({
    status: 200,
    description: 'Returns feedbacks for the current restaurant',
    type: [FeedbackResponseDto],
  })
  findByCurrentRestaurant(@Req() req): Promise<FeedbackResponseDto[]> {
    return this.feedbacksService.findByRestaurant(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific feedback by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({
    status: 200,
    description: 'Returns a feedback',
    type: FeedbackResponseDto,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<FeedbackResponseDto> {
    return this.feedbacksService.findOne(id);
  }

  @Roles(Role.USER)
  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a feedback' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({
    status: 200,
    description: 'Feedback updated successfully',
    type: FeedbackResponseDto,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    return this.feedbacksService.update(id, req.user.id, updateFeedbackDto);
  }

  @Roles(Role.USER, Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a feedback' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the feedback' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<void> {
    return this.feedbacksService.remove(id, req.user.id);
  }
}
