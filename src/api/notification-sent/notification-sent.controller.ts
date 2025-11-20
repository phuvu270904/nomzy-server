import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { NotificationSentService } from './notification-sent.service';
import { CreateNotificationSentDto } from './dto/create-notification-sent.dto';
import { UpdateNotificationSentDto } from './dto/update-notification-sent.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { NotificationSentEntity } from './entities/notification-sent.entity';

@ApiBearerAuth('access-token')
@ApiTags('Notification Sent')
@Controller('notification-sent')
@Roles(Role.ADMIN)
export class NotificationSentController {
  constructor(
    private readonly notificationSentService: NotificationSentService,
  ) {}

  @ApiOperation({ summary: 'Send a new notification to users' })
  @ApiBody({ type: CreateNotificationSentDto })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully sent',
    type: NotificationSentEntity,
  })
  @Post()
  async create(
    @Request() req,
    @Body() createNotificationSentDto: CreateNotificationSentDto,
  ) {
    return this.notificationSentService.create(
      createNotificationSentDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Get all notification sending records' })
  @ApiResponse({
    status: 200,
    description: 'Return all notification sending records',
    type: [NotificationSentEntity],
  })
  @Get()
  async findAll() {
    return this.notificationSentService.findAll();
  }

  @ApiOperation({ summary: 'Get a notification sending record by ID' })
  @ApiParam({ name: 'id', description: 'Notification Sent ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the notification sending record',
    type: NotificationSentEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification sending record not found',
  })
  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.notificationSentService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a notification sending record' })
  @ApiParam({ name: 'id', description: 'Notification Sent ID', type: 'number' })
  @ApiBody({ type: UpdateNotificationSentDto })
  @ApiResponse({
    status: 200,
    description:
      'The notification sending record has been successfully updated',
    type: NotificationSentEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification sending record not found',
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateNotificationSentDto: UpdateNotificationSentDto,
  ) {
    return this.notificationSentService.update(id, updateNotificationSentDto);
  }

  @ApiOperation({ summary: 'Delete a notification sending record' })
  @ApiParam({ name: 'id', description: 'Notification Sent ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description:
      'The notification sending record has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification sending record not found',
  })
  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.notificationSentService.remove(id);
  }
}
