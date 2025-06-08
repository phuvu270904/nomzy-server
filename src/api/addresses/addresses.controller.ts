import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressEntity } from './entities/address.entity';

@ApiTags('Addresses')
@Controller('addresses')
@ApiBearerAuth('access-token')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  @ApiResponse({
    status: 201,
    description: 'Address created successfully',
    type: AddressEntity,
  })
  create(@Req() req, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(req.user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for the current user' })
  @ApiResponse({
    status: 200,
    description: 'List of all user addresses',
    type: [AddressEntity],
  })
  findAll(@Req() req) {
    return this.addressesService.findAll(req.user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default address for the current user' })
  @ApiResponse({
    status: 200,
    description: 'The default address',
    type: AddressEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'No addresses found for this user',
  })
  getDefaultAddress(@Req() req) {
    return this.addressesService.getDefaultAddress(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific address by ID' })
  @ApiResponse({
    status: 200,
    description: 'The address details',
    type: AddressEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
    type: AddressEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(req.user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({
    status: 200,
    description: 'Address deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete the only address',
  })
  @ApiResponse({
    status: 404,
    description: 'Address not found',
  })
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.addressesService.remove(req.user.id, id);
  }
}
