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
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BulkDeleteUsersDto } from './dto/bulkDeleteUsers.dto';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Get()
  async findAll(): Promise<UserEntity[]> {
    return this.usersService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get('by-role')
  @ApiQuery({ name: 'role', enum: Role, required: true })
  async findByRole(@Query('role') role: Role): Promise<UserEntity[]> {
    return this.usersService.findByRole(role);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<UserEntity | null> {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserDto | null> {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Post('bulk-delete')
  async bulkDelete(@Body() bulkDeleteUsersDto: BulkDeleteUsersDto): Promise<{ deleted: number }> {
    return this.usersService.bulkDelete(bulkDeleteUsersDto.ids);
  }
}
