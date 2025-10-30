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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationEntity } from './entities/notification.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({
    status: 200,
    description: 'Return all notifications',
    type: [NotificationEntity],
  })
  @Get()
  async findAll(@Request() req): Promise<NotificationEntity[]> {
    return this.notificationsService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the notification',
    type: NotificationEntity,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<NotificationEntity> {
    return this.notificationsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully created',
    type: NotificationEntity,
  })
  @Post()
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'number' })
  @ApiBody({ type: UpdateNotificationDto })
  @ApiResponse({
    status: 200,
    description: 'The notification has been successfully updated',
    type: NotificationEntity,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'id', description: 'Notification ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'The notification has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
