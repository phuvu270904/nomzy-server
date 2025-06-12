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
import { UserNotificationSettingsService } from './user-notification-settings.service';
import { CreateUserNotificationSettingDto } from './dto/create-user-notification-setting.dto';
import { UpdateUserNotificationSettingDto } from './dto/update-user-notification-setting.dto';
import { UserNotificationSettingEntity } from './entities/user-notification-setting.entity';
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
@ApiTags('User Notification Settings')
@Controller('user-notification-settings')
export class UserNotificationSettingsController {
  constructor(
    private readonly userNotificationSettingsService: UserNotificationSettingsService,
  ) {}

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all user notification settings' })
  @ApiResponse({
    status: 200,
    description: 'Return all user notification settings',
    type: [UserNotificationSettingEntity],
  })
  @Get()
  async findAll(): Promise<UserNotificationSettingEntity[]> {
    return this.userNotificationSettingsService.findAll();
  }

  @ApiOperation({ summary: 'Get notification settings for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Return notification settings for the current user',
    type: UserNotificationSettingEntity,
  })
  @Get('my-settings')
  async findMySettings(@Request() req): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.findByUserIdOrCreate(
      req.user.id,
    );
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a user notification setting by ID' })
  @ApiParam({
    name: 'id',
    description: 'User Notification Setting ID',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the user notification setting',
    type: UserNotificationSettingEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'User notification setting not found',
  })
  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Get notification settings for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the user notification setting',
    type: UserNotificationSettingEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'User notification setting not found',
  })
  @Get('user/:userId')
  async findByUserId(
    @Param('userId') userId: number,
  ): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.findByUserIdOrCreate(userId);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user notification setting' })
  @ApiBody({ type: CreateUserNotificationSettingDto })
  @ApiResponse({
    status: 201,
    description: 'The user notification setting has been successfully created',
    type: UserNotificationSettingEntity,
  })
  @Post()
  async create(
    @Body() createUserNotificationSettingDto: CreateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.create(
      createUserNotificationSettingDto,
    );
  }

  @ApiOperation({ summary: 'Update notification settings for current user' })
  @ApiBody({ type: UpdateUserNotificationSettingDto })
  @ApiResponse({
    status: 200,
    description:
      'The user notification settings have been successfully updated',
    type: UserNotificationSettingEntity,
  })
  @Put('my-settings')
  async updateMySettings(
    @Request() req,
    @Body() updateUserNotificationSettingDto: UpdateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.updateByUserId(
      req.user.id,
      updateUserNotificationSettingDto,
    );
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a user notification setting by ID' })
  @ApiParam({
    name: 'id',
    description: 'User Notification Setting ID',
    type: 'number',
  })
  @ApiBody({ type: UpdateUserNotificationSettingDto })
  @ApiResponse({
    status: 200,
    description: 'The user notification setting has been successfully updated',
    type: UserNotificationSettingEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'User notification setting not found',
  })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserNotificationSettingDto: UpdateUserNotificationSettingDto,
  ): Promise<UserNotificationSettingEntity> {
    return this.userNotificationSettingsService.update(
      id,
      updateUserNotificationSettingDto,
    );
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user notification setting' })
  @ApiParam({
    name: 'id',
    description: 'User Notification Setting ID',
    type: 'number',
  })
  @ApiResponse({
    status: 204,
    description: 'The user notification setting has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'User notification setting not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.userNotificationSettingsService.remove(id);
  }
}
