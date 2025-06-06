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
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OfferEntity } from './entities/offer.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @ApiOperation({ summary: 'Get all offers' })
  @ApiResponse({
    status: 200,
    description: 'Return all offers',
    type: [OfferEntity],
  })
  @Get()
  async findAll(): Promise<OfferEntity[]> {
    return this.offersService.findAll();
  }

  @ApiOperation({ summary: 'Get all active offers' })
  @ApiResponse({
    status: 200,
    description: 'Return all active offers',
    type: [OfferEntity],
  })
  @Get('active')
  async findActive(): Promise<OfferEntity[]> {
    return this.offersService.findActive();
  }

  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the offer',
    type: OfferEntity,
  })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<OfferEntity> {
    return this.offersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiBody({ type: CreateOfferDto })
  @ApiResponse({
    status: 201,
    description: 'The offer has been successfully created',
    type: OfferEntity,
  })
  @Post()
  async create(@Body() createOfferDto: CreateOfferDto): Promise<OfferEntity> {
    return this.offersService.create(createOfferDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiBody({ type: UpdateOfferDto })
  @ApiResponse({
    status: 200,
    description: 'The offer has been successfully updated',
    type: OfferEntity,
  })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<OfferEntity> {
    return this.offersService.update(id, updateOfferDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({ name: 'id', description: 'Offer ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'The offer has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.offersService.remove(id);
  }
}
