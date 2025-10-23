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
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedResponse } from './dto/pagination-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';

@ApiBearerAuth('access-token')
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({ summary: 'Get all products with optional pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starting from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Return all products (paginated if query params provided)',
  })
  @Get()
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<ProductEntity[] | PaginatedResponse<ProductEntity>> {
    // If pagination parameters are provided, return paginated results
    if (paginationQuery.page || paginationQuery.limit) {
      return this.productsService.findAllPaginated(paginationQuery);
    }
    // Otherwise, return all products (backward compatibility)
    return this.productsService.findAll();
  }

  @ApiOperation({ summary: 'Get products with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starting from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Return paginated products with metadata',
  })
  @Get('paginated')
  async findAllPaginated(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<ProductEntity>> {
    return this.productsService.findAllPaginated(paginationQuery);
  }

  @Roles(Role.OWNER)
  @ApiOperation({ summary: "Get all products of the current authenticated owner's restaurant" })
  @ApiResponse({ status: 200, description: "Return all products belonging to the current user" })
  @Get('me')
  async findAllByCurrentUser(@Request() req): Promise<ProductEntity[]> {
    return this.productsService.findAllByRestaurant(req.user.id);
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the product',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ProductEntity> {
    return this.productsService.findOne(id);
  }

  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created',
  })
  @Post()
  async create(
    @Request() req,
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.create(req.user.id, createProductDto);
  }

  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully updated',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.update(req.user.id, id, updateProductDto);
  }

  @Roles(Role.OWNER)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'The product has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id') id: number): Promise<void> {
    return this.productsService.remove(req.user.id, id);
  }
}
