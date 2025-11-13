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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserVehiclesService } from './user-vehicles.service';
import { CreateUserVehicleDto } from './dto/create-user-vehicle.dto';
import { UpdateUserVehicleDto } from './dto/update-user-vehicle.dto';
import { UserVehicleEntity } from './entities/user-vehicle.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiTags('User Vehicles')
@Roles(Role.DRIVER)
@Controller('user-vehicles')
@ApiBearerAuth('access-token')
export class UserVehiclesController {
  constructor(private readonly userVehiclesService: UserVehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new vehicle for the driver' })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
    type: UserVehicleEntity,
  })
  create(@Req() req, @Body() createUserVehicleDto: CreateUserVehicleDto) {
    return this.userVehiclesService.create(req.user.id, createUserVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all vehicles for the current driver' })
  @ApiResponse({
    status: 200,
    description: 'List of all driver vehicles',
    type: [UserVehicleEntity],
  })
  findAll(@Req() req) {
    return this.userVehiclesService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific vehicle by ID' })
  @ApiResponse({
    status: 200,
    description: 'The vehicle details',
    type: UserVehicleEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.userVehiclesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
    type: UserVehicleEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserVehicleDto: UpdateUserVehicleDto,
  ) {
    return this.userVehiclesService.update(
      req.user.id,
      id,
      updateUserVehicleDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Vehicle not found',
  })
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.userVehiclesService.remove(req.user.id, id);
  }
}
