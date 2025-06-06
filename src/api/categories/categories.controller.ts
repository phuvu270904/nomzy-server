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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
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
@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Return all categories',
  })
  @Get()
  async findAll(): Promise<CategoryEntity[]> {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the category',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<CategoryEntity> {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Get products of a specific category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Return the category',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get(':id/products')
  async findOneProducts(@Param('id') id: number): Promise<CategoryEntity> {
    return this.categoriesService.findOneProducts(id);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({
    status: 201,
    description: 'The category has been successfully created',
    type: CategoryEntity,
  })
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({
    status: 200,
    description: 'The category has been successfully updated',
    type: CategoryEntity,
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category ID', type: 'number' })
  @ApiResponse({
    status: 204,
    description: 'The category has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
