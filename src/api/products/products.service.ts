import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
