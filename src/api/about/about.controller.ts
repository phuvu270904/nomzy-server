import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { AboutService } from './about.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantAboutEntity } from './entities/restaurant-about.entity';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Restaurant About')
@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Post()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create or update restaurant information' })
  async create(
    @Req() req,
    @Body() createAboutDto: CreateAboutDto,
  ): Promise<RestaurantAboutEntity> {
    return this.aboutService.create(req.user.id, createAboutDto);
  }

  @Get()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Get restaurant information' })
  async findOwnerAbout(@Req() req): Promise<RestaurantAboutEntity> {
    return this.aboutService.findOne(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant information by ID' })
  async findOne(@Param('id') id: number): Promise<RestaurantAboutEntity> {
    // For public access (no authentication required)
    const restaurantId = id;
    return this.aboutService.findOne(restaurantId);
  }

  @Patch()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update restaurant information' })
  async update(
    @Req() req,
    @Body() updateAboutDto: UpdateAboutDto,
  ): Promise<RestaurantAboutEntity> {
    return this.aboutService.update(req.user.id, updateAboutDto);
  }

  @Delete()
  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Delete restaurant information' })
  async remove(@Req() req): Promise<void> {
    return this.aboutService.remove(req.user.id);
  }
}
