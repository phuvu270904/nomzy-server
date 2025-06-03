import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

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
}
