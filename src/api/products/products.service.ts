import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import {
  PaginatedResponse,
  PaginationMeta,
} from './dto/pagination-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<ProductEntity[]> {
    return this.productRepository.find({
      relations: ['category'],
    });
  }

  async findAllPaginated(
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponse<ProductEntity>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepository.findAndCount({
      relations: ['category'],
      skip,
      take: limit,
      order: {
        id: 'DESC', // Order by most recent first
      },
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    return {
      data,
      meta,
    };
  }

  async findAllByRestaurant(restaurantId: number): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: { restaurantId },
      relations: ['category'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(
    restaurantId: number,
    createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    const newProduct = {
      ...createProductDto,
      restaurantId: restaurantId,
    };
    return this.productRepository.save(newProduct);
  }

  async update(
    restaurantId: number,
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const productFound = await this.productRepository.findOneOrFail({
      where: { id, restaurantId },
      relations: ['category'],
    });
    if (!productFound) {
      throw new NotFoundException(
        `Product with ID ${id} of your restaurant not found`,
      );
    }
    await this.productRepository.update(id, updateProductDto);
    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(restaurantId: number, id: number): Promise<void> {
    const productFound = await this.productRepository.findOne({
      where: { id, restaurantId },
    });
    if (!productFound) {
      throw new NotFoundException(
        `Product with ID ${id} of your restaurant not found`,
      );
    }
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}
