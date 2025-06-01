import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
} from '@nestjs/common';
import { UserNotificationsService } from './user-notifications.service';
import { CreateUserNotificationDto } from './dto/create-user-notification.dto';
import { UpdateUserNotificationDto } from './dto/update-user-notification.dto';
import { UserNotificationEntity } from './entities/user-notification.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('User Notifications')
@Controller('user-notifications')
export class UserNotificationsController {
  constructor(
    private readonly userNotificationsService: UserNotificationsService,
  ) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all user notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return all user notifications',
    type: [UserNotificationEntity],
  })
  @Get()
  async findAll(): Promise<UserNotificationEntity[]> {
    return this.userNotificationsService.findAll();
  }

  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return all notifications for the current user',
    type: [UserNotificationEntity],
  })
  @Get('my-notifications')
  async findMyNotifications(@Request() req): Promise<UserNotificationEntity[]> {
    return this.userNotificationsService.findByUserId(req.user.id);
  }

  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  @Put('mark-all-read')
  async markAllAsRead(@Request() req): Promise<{ message: string }> {
    await this.userNotificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @ApiOperation({ summary: 'Get a user notification by ID' })
  @ApiParam({ name: 'id', description: 'User Notification ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user notification',
    type: UserNotificationEntity,
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserNotificationEntity> {
    return this.userNotificationsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user notification' })
  @ApiBody({ type: CreateUserNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'The user notification has been successfully created',
    type: UserNotificationEntity,
  })
  @Post()
  async create(
    @Body() createUserNotificationDto: CreateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    return this.userNotificationsService.create(createUserNotificationDto);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiParam({ name: 'id', description: 'User Notification ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been marked as read',
    type: UserNotificationEntity,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Put(':id/mark-read')
  async markAsRead(@Param('id') id: number): Promise<UserNotificationEntity> {
    return this.userNotificationsService.markAsRead(id);
  }

  @ApiOperation({ summary: 'Update a user notification' })
  @ApiParam({ name: 'id', description: 'User Notification ID', type: 'number' })
  @ApiBody({ type: UpdateUserNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'The user notification has been successfully updated',
    type: UserNotificationEntity,
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserNotificationDto: UpdateUserNotificationDto,
  ): Promise<UserNotificationEntity> {
    return this.userNotificationsService.update(id, updateUserNotificationDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user notification' })
  @ApiParam({ name: 'id', description: 'User Notification ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'The user notification has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'User notification not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.userNotificationsService.remove(id);
  }
}
