import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { 
  ApiBearerAuth, 
  ApiQuery, 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BulkDeleteUsersDto } from './dto/bulkDeleteUsers.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ 
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system. Admin access required.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          phone_number: '0949394939',
          role: 'user',
          gender: 'male',
          avatar: 'https://example.com/avatar.jpg',
          isFullyRegistered: true,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-11-29T10:30:00Z',
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane.smith@gmail.com',
          phone_number: '0938123456',
          role: 'driver',
          gender: 'female',
          avatar: 'https://example.com/avatar2.jpg',
          isFullyRegistered: true,
          createdAt: '2025-02-10T08:20:00Z',
          updatedAt: '2025-11-28T14:15:00Z',
        }
      ]
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @ApiOperation({ 
    summary: 'Get users by role',
    description: 'Retrieve all users filtered by their role (user, admin, owner, driver). Admin access required.'
  })
  @ApiQuery({ 
    name: 'role', 
    enum: Role, 
    required: true,
    description: 'User role to filter by',
    example: 'user'
  })
  @ApiResponse({
    status: 200,
    description: 'List of users with specified role retrieved successfully',
    schema: {
      example: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          phone_number: '0949394939',
          role: 'user',
          gender: 'male',
          avatar: 'https://example.com/avatar.jpg',
          isFullyRegistered: true,
          createdAt: '2025-01-15T10:30:00Z',
          updatedAt: '2025-11-29T10:30:00Z',
        }
      ]
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid role provided'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Get('by-role')
  async findByRole(@Query('role') role: Role): Promise<UserEntity[]> {
    return this.usersService.findByRole(role);
  }

  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve detailed information about a specific user by their ID. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'User found and retrieved successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        phone_number: '0949394939',
        role: 'user',
        gender: 'male',
        avatar: 'https://example.com/avatar.jpg',
        isFullyRegistered: true,
        addresses: [],
        createdAt: '2025-01-15T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserEntity | null> {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ 
    summary: 'Create new user',
    description: 'Create a new user account. Admin access required. Password will not be returned in response.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        id: 1,
        name: 'John',
        email: 'john.doe@gmail.com',
        phone_number: '0949394939',
        role: 'user',
        isFullyRegistered: false,
        createdAt: '2025-11-29T10:30:00Z',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data or email already exists'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @ApiOperation({ 
    summary: 'Update user',
    description: 'Update user information by ID. Admin access required. All fields are optional.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID to update',
    example: 1
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe Updated',
        email: 'john.doe@gmail.com',
        phone_number: '0938123456',
        avatar: 'https://example.com/new-avatar.jpg',
        address: '123 Main St',
        city: 'New York',
        country: 'NY',
        role: 'user',
        updatedAt: '2025-11-29T10:30:00Z',
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserDto | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ 
    summary: 'Delete user',
    description: 'Delete a user by ID. Admin access required. This action cannot be undone.'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'User ID to delete',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @ApiOperation({ 
    summary: 'Bulk delete users',
    description: 'Delete multiple users by their IDs in a single operation. Admin access required. This action cannot be undone.'
  })
  @ApiBody({ type: BulkDeleteUsersDto })
  @ApiResponse({
    status: 200,
    description: 'Users deleted successfully',
    schema: {
      example: {
        deleted: 3,
        message: '3 users deleted successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid user IDs provided'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required'
  })
  @Roles(Role.ADMIN)
  @Post('bulk-delete')
  async bulkDelete(@Body() bulkDeleteUsersDto: BulkDeleteUsersDto): Promise<{ deleted: number }> {
    return this.usersService.bulkDelete(bulkDeleteUsersDto.ids);
  }
}
