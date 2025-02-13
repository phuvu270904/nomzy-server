import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts() {
    return this.productService.getProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') _id: string) {
    return this.productService.getProduct(_id);
  }

  @Post()
  async createProduct(@Body() body: any) {
    return this.productService.createProduct(body);
  }

  @Put(':id')
  async updateProduct(@Param('id') _id: string, @Body() body: any) {
    return this.productService.updateProduct(_id, body);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') _id: string) {
    return this.productService.deleteProduct(_id);
  }
}
