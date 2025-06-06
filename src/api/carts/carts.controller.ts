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
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartEntity } from './entities/cart.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/roles/role.enum';

@Roles(Role.USER)
@ApiTags('Carts')
@ApiBearerAuth('access-token')
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiOperation({ summary: 'Get current user cart' })
  @ApiResponse({
    status: 200,
    description: "Returns the user's cart with items",
    type: CartEntity,
  })
  @Get()
  async getCart(@Request() req): Promise<CartEntity> {
    return this.cartsService.getCart(req.user.id);
  }

  @ApiOperation({ summary: 'Add an item to cart' })
  @ApiBody({ type: CreateCartItemDto })
  @ApiResponse({
    status: 201,
    description: 'The item has been added to cart',
    type: CartEntity,
  })
  @Post('items')
  async addItemToCart(
    @Request() req,
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<CartEntity> {
    return this.cartsService.addItemToCart(req.user.id, createCartItemDto);
  }

  @ApiOperation({ summary: 'Update a cart item' })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: 'number' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({
    status: 200,
    description: 'The cart item has been updated',
    type: CartEntity,
  })
  @Put('items/:id')
  async updateCartItem(
    @Request() req,
    @Param('id') id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartEntity> {
    return this.cartsService.updateCartItem(
      req.user.id,
      +id,
      updateCartItemDto,
    );
  }

  @ApiOperation({ summary: 'Remove a cart item' })
  @ApiParam({ name: 'id', description: 'Cart item ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'The cart item has been removed',
    type: CartEntity,
  })
  @Delete('items/:id')
  async removeCartItem(
    @Request() req,
    @Param('id') id: number,
  ): Promise<CartEntity> {
    return this.cartsService.removeCartItem(req.user.id, +id);
  }

  @ApiOperation({ summary: 'Clear cart (remove all items)' })
  @ApiResponse({
    status: 200,
    description: 'The cart has been cleared',
    type: CartEntity,
  })
  @Delete('clear')
  async clearCart(@Request() req): Promise<CartEntity> {
    return this.cartsService.clearCart(req.user.id);
  }
}
